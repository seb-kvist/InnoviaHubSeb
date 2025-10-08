using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly ChatbotService _chatbotService;

        public ChatbotController(ChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        // Enkla request/response‑typer för chat‑API:t
        public record AskRequest(string question);
        public record AskResponse(string answer);

        // POST /api/chatbot/ask – tar emot en fråga och returnerar svar
        [HttpPost("ask")]
        public async Task<ActionResult<AskResponse>> Ask([FromBody] AskRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.question))
            {
                return BadRequest(new { error = "Question is required" });
            }

            var answer = await _chatbotService.AskAsync(req.question);
            return Ok(new AskResponse(answer));
        }
    }
}


