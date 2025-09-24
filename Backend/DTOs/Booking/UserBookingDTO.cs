using System;

namespace Backend.DTOs.Booking
{
    public class UserBookingDTO
    {
        public int bookingId { get; set; }
        public string date { get; set; }
        public string timeSlot { get; set; }
        public string resourceName { get; set; }
    }
}