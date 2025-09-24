using System;
using Backend.DTOs.Auth;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using API;


namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly JwtToken _jwtToken;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, JwtToken jwtToken)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtToken = jwtToken;

    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DTORegisterRequest model)
    {
        if (model == null)
        {
            return BadRequest(new { message = "Invalid request" });
        }
        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "Email is already taken" });
        }

        var user = new User { UserName = model.Name, Email = model.Email };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = "User registered successfully" });
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] DTOLoginRequest model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);


        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return Unauthorized(new { Message = "Invalid credentials" });


        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
        if (!signInResult.Succeeded) return Unauthorized(new { Message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        var Token = _jwtToken.GenerateJwtToken(user, role);
        return Ok(new { Message = "Login successful", user.Id, user.Email, user.UserName, Token,role });
    }
    
}
