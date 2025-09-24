using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs.Users;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        //GET för api/users - hämta användare
        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DTOUserFilter filter)
        {
            var users = await _userRepository.GetAllUsersAsync(filter);
            return Ok(users);
        }

        //GET för api/users/{id} - hämta specifik användare med id

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        //PUT för api/users/{id} - uppdatera en användare
        [HttpPost("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] DTOUpdateUser dto)
        {
            var user = await _userRepository.UpdateUserAsync(id, dto);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // DELETE för api/users/{id} - ta bort användare
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {   
            var deleted = await _userRepository.DeleteUserAsync(id);
            if (!deleted) return NotFound();
            return Ok(new { message = "User deleted successfully" });
        }
    }
}
