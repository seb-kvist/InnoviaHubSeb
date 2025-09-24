using System;

namespace Backend.DTOs.Auth;

/// DTO för att registrera en ny användare. Identity kommer att hasha lösenordet så det aldrig sparas i text
public class DTORegisterRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Name { get; set; }
}
