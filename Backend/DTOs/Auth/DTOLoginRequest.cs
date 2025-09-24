using System;

namespace Backend.DTOs.Auth;
/// DTO för att logga in som användare.
public class DTOLoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
