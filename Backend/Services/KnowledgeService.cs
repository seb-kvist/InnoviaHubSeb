using System.Text;

namespace Backend.Services
{
    /// Enkel, filbaserad RAG‑hjälptjänst som läser .MD filer från Backend/Knowledge och returnerar svar baserat på nyckelord 
    /// som kan skickas med till modellen som kontext.
    public class KnowledgeService
    {
        private readonly string _knowledgeRoot;

        public KnowledgeService()
        {
            // Hittar sökväg till "Backend/Knowledge" oavsett var dotnet körs ifrån. Detta gör att .md-filerna alltid kan hittas utan behöva extra konfig.
            var cwd = Directory.GetCurrentDirectory();
            var backendPath = Directory.Exists(Path.Combine(cwd, "Backend")) ? Path.Combine(cwd, "Backend") : cwd;
            _knowledgeRoot = Path.Combine(backendPath, "Knowledge");
            Directory.CreateDirectory(_knowledgeRoot);
        }

        // Enkel sökning: letar efter hela frågesträngen (case-insensitive) i varje .md-fil. Beräknar poäng = antal förekomster av strängen.
        // Returnerar toppträffar
        public IEnumerable<(string file, string snippet, int score)> Search(string query, int maxResults = 3)
        {
            var results = new List<(string file, string snippet, int score)>();
            if (string.IsNullOrWhiteSpace(query)) return results;

            var queryLower = query.ToLowerInvariant();

            foreach (var file in Directory.EnumerateFiles(_knowledgeRoot, "*.md", SearchOption.AllDirectories))
            {
                var text = File.ReadAllText(file);
                var lower = text.ToLowerInvariant();
                var score = CountOccurrences(lower, queryLower);
                if (score <= 0) continue;

                var snippet = ExtractSnippet(text, queryLower);
                results.Add((Path.GetFileName(file), snippet, score));
            }

            return results
                .OrderByDescending(r => r.score)
                .ThenBy(r => r.file)
                .Take(maxResults);
        }

        //Bygger ihop ovan träffar till en sammanhängande text som vår ChatbotService sedan kan skicka som KONTEXT: till modellen.
        public static string BuildContext(IEnumerable<(string file, string snippet, int score)> hits)
        {
            var sb = new StringBuilder();
            foreach (var (file, snippet, _) in hits)
            {
                sb.AppendLine($"[FILE: {file}]\n{snippet}\n");
            }
            return sb.ToString();
        }


        // Räknar hur många gånger en term förekommer i texten
        private static int CountOccurrences(string haystack, string needle)
        {
            var count = 0; var index = 0;
            while ((index = haystack.IndexOf(needle, index, StringComparison.Ordinal)) >= 0)
            {
                count++; index += needle.Length;
            }
            return count;
        }

        // Tar fram ett kort textutdrag runt första träffen på söktermen och ger modellen lite kontext utan att skicka hela filen.
        private static string ExtractSnippet(string text, string focusTerm, int window = 280)
        {
            var i = text.ToLowerInvariant().IndexOf(focusTerm.ToLowerInvariant(), StringComparison.Ordinal);
            if (i < 0) return text.Length <= window ? text : text.Substring(0, window) + "…";
            var start = Math.Max(0, i - window / 2);
            var len = Math.Min(window, text.Length - start);
            return text.Substring(start, len);
        }
    }
}


