using System;
using System.Text.Json.Serialization;

namespace Backend.Models;

public class Resource
{
    public int Id { get; set; }
    public required string ResourceName { get; set; }// ex kontor 1
    public bool IsBookable { get; set; } = true;// admin kan sätta till false

    //Relations
    public int ResourceTypeId { get; set; }
    public  ResourceType? ResourceType { get; set; }

    [JsonIgnore]
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
