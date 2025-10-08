using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services
{
    // Hanterar kontakt med OpenAI och kombinerar svar med RAG via KnowledgeService. Används för att ge app-specifika svar till Innovia Hub.
    public class ChatbotService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly KnowledgeService _knowledge;

        public ChatbotService(IHttpClientFactory httpClientFactory, KnowledgeService knowledge)
        {
            _httpClientFactory = httpClientFactory;
            _knowledge = knowledge;
        }

        // Skickar en fråga till OpenAI. Läser relevant kontext från KnowledgeService (RAG) och lägger till den i prompten. Om ingen kontext hittas skickas bara användarens fråga.
        public async Task<string> AskAsync(string userMessage, string? systemPrompt = null)
        {
            var http = _httpClientFactory.CreateClient("openai");

            // Söker upp relaterad info från knowledge-filerna
            var hits = _knowledge.Search(userMessage, maxResults: 5);
            var context = KnowledgeService.BuildContext(hits) ?? string.Empty;

            //Standard-prompt som styr hur chatbotten ska bete sig
            var guidance = systemPrompt ??
                "Du är Innovia AI för Innovia Hub - en glad, vänlig och hjälpsam assistent.\n" +
                "Svara kort på svenska, med positiv ton.\n" +
                "- Du får ENDAST svara på frågor som rör Innovia Hub (appens navigation, bokningar, sidor, roller m.m.).\n" +
                "- Om frågan INTE rör Innovia Hub: svara artigt att du bara hjälper till med Innovia Hub och be om en app-relaterad fråga.\n" +
                "- Om frågan rör Innovia Hub: använd KONTEXT och ge konkreta klick-steg med sidnamn (Resources, Profile, Admin).\n" +
                "- Om app-specifik information saknas i KONTEXT: säg kort att du inte vet istället för att gissa.\n" +
                "Avsluta ibland, men inte alltid, med en kort följdfråga i samma ton. Växla mellan bara svar och svar + följdfråga, så konversationen känns naturlig.";

            // Skapar payload till OpenAI beroende på om kontext finns
            var payload = new
            {
                model = "gpt-4o-mini",
                messages = string.IsNullOrWhiteSpace(context)

                    //Om Ingen kontext finns
                    ? new object[]
                    {
                        new { role = "system", content = guidance },
                        new { role = "user", content = userMessage }
                    }

                    // Om Kontext finns
                    : new object[]
                    {
                        new { role = "system", content = guidance },
                        new { role = "system", content = "KONTEXT:\n" + context },
                        new { role = "user", content = userMessage }
                    }
            };

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var response = await http.PostAsync("v1/chat/completions", content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return $"OpenAI error: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {responseString}";
            }

            try
            {
                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;
                var choice = root.GetProperty("choices")[0];
                var message = choice.GetProperty("message").GetProperty("content").GetString();
                return message ?? string.Empty;
            }
            catch
            {
                return responseString;
            }
        }
    }
}


