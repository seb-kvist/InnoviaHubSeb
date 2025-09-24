using System;

namespace Backend.Models;

public class ResourceType
{
    public int Id { get; set; }
    public required string ResourceTypeName { get; set; } //ex kontor

    //Relations
    public ICollection<Resource> Resources { get; set; } = new List<Resource>();
}
