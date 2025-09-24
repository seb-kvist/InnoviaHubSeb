using System;

namespace Backend.DTOs.Users;

public class DTOUserFilter
{
    public string? Email { get; set; } //För att kunna filtrera efter epost
    public string? Name { get; set; }// Detta för att filtrera på namn
    public DateTime CreatedAfter { get; set; } //Sätter ett datum och kolla vilka konton som var skapade efter
}
