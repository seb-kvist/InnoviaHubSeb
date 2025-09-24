using System;
using Backend.DTOs.Booking;
using Backend.Models;

namespace Backend.Interfaces.IRepositories;

public interface IBookingRepository
{
    Task<Booking> AddBookingAsync(DTOCreateBooking booking);
    Task<IEnumerable<Booking>> GetBookingByDate(DateTime date);
    Task<List<Resource>> GetAvailableResourcesAsync(int resourceId, DateTime date, string timeSlot);
    Task <bool>DeleteBooking(int bookingId);
}
