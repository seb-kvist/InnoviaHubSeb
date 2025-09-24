using System;

namespace Backend.DTOs.Users;
//DTO som hämtar användare och dess info
public class DTOUserProfile
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; } //Kanske om vi vill kunna filtrera användare som vi sa.
}
