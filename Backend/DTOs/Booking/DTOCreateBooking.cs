using System;

namespace Backend.DTOs.Booking;

public class DTOCreateBooking
{
    public DateTime Date { get; set; }
    public required string TimeSlot { get; set; }
    public int ResourceTypeId { get; set; }
    public required string UserId { get; set; }
}
