using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

/// Identity-användare. Ärver från IdentityUser vilket ger Id, Email, PasswordHash m.m.
public class User : IdentityUser
{
    public string Name { get; set; } = string.Empty;


    //Relations
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}