using System.Text;

namespace Backend.Services
{
    /// Filbaserad RAG som läser .MD filer från Backend/Knowledge och returnerar svar baserat på nyckelord som kan skickas med till modellen som kontext.
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

        // letar efter hela frågesträngen i varje .md-fil och som sedan beräknar poäng baserat antal förekomster av strängen. Returnerar toppträffar
        public IEnumerable<(string file, string snippet, int score)> Search(string query, int maxResults = 3)
        {
            var results = new List<(string file, string snippet, int score)>();
            if (string.IsNullOrWhiteSpace(query)) return results;

            var queryLower = query.ToLowerInvariant();
            
            // Lägg till relaterade termer för bättre sökning
            var searchTerms = new List<string> { queryLower };
            if (queryLower.Contains("bokn") || queryLower.Contains("boka"))
            {
                searchTerms.AddRange(new[] { "boka", "bokning", "resource", "resurs", "kort" });
            }
            if (queryLower.Contains("logg") || queryLower.Contains("inlogg"))
            {
                searchTerms.AddRange(new[] { "login", "logga", "inloggning", "register" });
            }

            foreach (var file in Directory.EnumerateFiles(_knowledgeRoot, "*.md", SearchOption.AllDirectories))
            {
                var text = File.ReadAllText(file);
                var lower = text.ToLowerInvariant();
                var totalScore = 0;
                
                // Beräkna poäng för alla söktermer
                foreach (var term in searchTerms)
                {
                    totalScore += CountOccurrences(lower, term);
                }
                
                if (totalScore <= 0) continue;

                var snippet = ExtractSnippet(text, queryLower);
                results.Add((Path.GetFileName(file), snippet, totalScore));
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


