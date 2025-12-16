using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestBookingOtp([FromBody] BookingRequestDto request)
        {
            // Check availability first
            var isBooked = await _context.Bookings.AnyAsync(b => b.Date.Date == request.Date.Date && b.Status == "Confirmed");
            if (isBooked)
            {
                return Conflict(new { message = "DATE_FULLY_BOOKED" });
            }

            var booking = new Booking
            {
                Date = request.Date,
                ServiceId = request.ServiceId,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                VehicleDetails = request.VehicleDetails,
                Notes = request.Notes,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            
            // Generate OTP
            var otp = "1234"; // Mock OTP
            var otpRequest = new OtpRequest
            {
                Phone = request.CustomerPhone,
                Code = otp,
                Expiry = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false
            };
            _context.OtpRequests.Add(otpRequest);

            await _context.SaveChangesAsync();

            // In real app, send SMS
            Console.WriteLine($"Booking OTP for {request.CustomerPhone}: {otp}");

            return Ok(new { bookingId = booking.Id, message = "OTP sent for booking confirmation." });
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmBooking([FromBody] ConfirmBookingDto request)
        {
            var booking = await _context.Bookings.FindAsync(request.BookingId);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.Status == "Confirmed")
                return BadRequest(new { message = "Booking already confirmed." });

            // Verify OTP
            var otpRecord = await _context.OtpRequests
                .Where(o => o.Phone == booking.CustomerPhone && o.Code == request.Otp && !o.IsUsed)
                .OrderByDescending(o => o.Expiry)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.Expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired OTP." });

            // Double check availability (race condition)
            var isBooked = await _context.Bookings.AnyAsync(b => b.Date.Date == booking.Date.Date && b.Status == "Confirmed" && b.Id != booking.Id);
            if (isBooked)
                return Conflict(new { message = "DATE_FULLY_BOOKED" });

            // Mark OTP as used
            otpRecord.IsUsed = true;

            // Confirm booking
            booking.Status = "Confirmed";
            
            // Link to User if exists, or create User
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == booking.CustomerPhone);
            if (user == null)
            {
                user = new User
                {
                    Phone = booking.CustomerPhone!,
                    Name = booking.CustomerName ?? "Customer",
                    Role = "Customer"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Save user to get Id
            }
            booking.UserId = user.Id;

            await _context.SaveChangesAsync();

            return Ok(new { bookingId = booking.Id, status = "Confirmed", message = "Booking confirmed successfully." });
        }
    }

    public class BookingRequestDto
    {
        public int ServiceId { get; set; }
        public DateTime Date { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string VehicleDetails { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ConfirmBookingDto
    {
        public int BookingId { get; set; }
        public string Otp { get; set; } = string.Empty;
    }
}
