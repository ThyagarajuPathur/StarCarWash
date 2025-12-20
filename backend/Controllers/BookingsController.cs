using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using CarWashBooking.Api.Data;
using CarWashBooking.Api.Models;

namespace CarWashBooking.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("available-dates")]
        public async Task<IActionResult> GetAvailableDates([FromQuery] DateTime? from, [FromQuery] int days = 14)
        {
            var startDate = from ?? DateTime.Today;
            var endDate = startDate.AddDays(days);

            var bookedDates = await _context.Bookings
                .Where(b => b.Date >= startDate && b.Date < endDate && b.Status == "Confirmed")
                .Select(b => b.Date.Date)
                .ToListAsync();

            var availability = new List<object>();
            for (int i = 0; i < days; i++)
            {
                var date = startDate.AddDays(i);
                availability.Add(new
                {
                    date = date.ToString("yyyy-MM-dd"),
                    isAvailable = !bookedDates.Contains(date)
                });
            }

            return Ok(availability);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto request)
        {
            // 1. Check availability
            var isBooked = await _context.Bookings.AnyAsync(b => b.Date.Date == request.Date.Date && b.Status == "Confirmed");
            if (isBooked)
            {
                return Conflict(new { message = "DATE_FULLY_BOOKED" });
            }

            // 2. Get User ID from Claims
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value; // "sub" claim
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // 3. Create Booking
            var booking = new Booking
            {
                Date = request.Date,
                ServiceId = request.ServiceId,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                VehicleDetails = request.VehicleDetails,
                Notes = request.Notes,
                Status = "Confirmed", // Direct confirmation
                UserId = userId
            };

            _context.Bookings.Add(booking);

            // 4. Update User Profile if Phone is missing (Optional but good UX)
            var user = await _context.Users.FindAsync(userId);
            if (user != null && string.IsNullOrEmpty(user.Phone))
            {
                user.Phone = request.CustomerPhone;
                // user.Name = request.CustomerName; // Maybe update name too if empty
            }

            await _context.SaveChangesAsync();

            return Ok(new { bookingId = booking.Id, status = "Confirmed", message = "Booking confirmed successfully." });
        }
    }

    public class BookingRequestDto
    {
        public int ServiceId { get; set; }
        public DateTime Date { get; set; }
        [Required]
        public string CustomerName { get; set; } = string.Empty;
        [Required]
        public string CustomerPhone { get; set; } = string.Empty;
        [Required]
        public string VehicleDetails { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
