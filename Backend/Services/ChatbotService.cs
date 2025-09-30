using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class ChatbotService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ChatbotService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> AskAsync(string userMessage, string? systemPrompt = null)
        {
            var http = _httpClientFactory.CreateClient("openai");

            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new object[]
                {
                    new { role = "system", content = systemPrompt ?? "You are Innovia AI. Be concise and helpful." },
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


