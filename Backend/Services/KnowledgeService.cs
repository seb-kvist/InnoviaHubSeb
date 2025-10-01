using System.Text;

namespace Backend.Services
{
    /// <summary>
    /// Enkel, filbaserad RAG‑hjälptjänst.
    /// Läser markdown-filer från Backend/Knowledge och returnerar enkla
    /// utdrag baserat på nyckelord som kan skickas med till modellen som kontext.
    /// </summary>
    public class KnowledgeService
    {
        private readonly string _knowledgeRoot;

        public KnowledgeService()
        {
            // Hitta en stabil sökväg till "Backend/Knowledge" oavsett om dotnet
            // körs från projektroten eller direkt i Backend‑katalogen.
            // Detta gör att vi kan lägga .md‑filerna där och läsa dem utan extra konfig.
            var cwd = Directory.GetCurrentDirectory();
            var backendPath = Directory.Exists(Path.Combine(cwd, "Backend")) ? Path.Combine(cwd, "Backend") : cwd;
            _knowledgeRoot = Path.Combine(backendPath, "Knowledge");
            Directory.CreateDirectory(_knowledgeRoot);
        }

        /// <summary>
        /// Skannar alla .md‑filer och räknar en enkel poäng baserat på
        /// termfrekvens för sökfrågan. Returnerar topp N träffar med
        /// ett utdrag som kan användas för att grunda svaret.
        /// </summary>
        public IEnumerable<(string file, string snippet, int score)> Search(string query, int maxResults = 3)
        {
            var results = new List<(string file, string snippet, int score)>();
            if (string.IsNullOrWhiteSpace(query)) return results;

            // Gå igenom alla .md‑filer och beräkna en enkel poäng baserat på
            // hur många gånger termerna förekommer (termfrekvens).
            foreach (var file in Directory.EnumerateFiles(_knowledgeRoot, "*.md", SearchOption.AllDirectories))
            {
                var text = File.ReadAllText(file);
                var lower = text.ToLowerInvariant();
                var terms = Tokenize(query);
                var score = terms.Sum(t => CountOccurrences(lower, t));
                if (score <= 0) continue;

                // Ta ut ett kort utdrag kring första termen för att hålla prompten liten
                var snippet = ExtractSnippet(text, terms.First());
                results.Add((Path.GetFileName(file), snippet, score));
            }

            return results
                .OrderByDescending(r => r.score)
                .ThenBy(r => r.file)
                .Take(maxResults);
        }

        /// <summary>
        /// Bygger en enda sträng med lätta filmarkörer som systemprompten
        /// kan inkludera.
        /// </summary>
        public static string BuildContext(IEnumerable<(string file, string snippet, int score)> hits)
        {
            var sb = new StringBuilder();
            foreach (var (file, snippet, _) in hits)
            {
                sb.AppendLine($"[FILE: {file}]\n{snippet}\n");
            }
            return sb.ToString();
        }

        /// <summary>
        /// Tokeniserar till unika, nedladdade termer. Mycket enkelt men
        /// tillräckligt för en första iteration.
        /// </summary>
        private static IEnumerable<string> Tokenize(string text)
        {
            return text.ToLowerInvariant()
                .Split(new[] { ' ', '\t', '\n', '\r', ',', '.', ';', ':', '!', '?' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(t => t.Length > 2)
                .Distinct();
        }

        /// <summary>
        /// Räknar icke‑överlappande förekomster av en term i en text.
        /// </summary>
        private static int CountOccurrences(string haystack, string needle)
        {
            var count = 0; var index = 0;
            while ((index = haystack.IndexOf(needle, index, StringComparison.Ordinal)) >= 0)
            {
                count++; index += needle.Length;
            }
            return count;
        }

        /// <summary>
        /// Returnerar ett centrerat utdrag runt första förekomsten
        /// av den fokuster men.
        /// </summary>
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


