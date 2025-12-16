using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarWashBooking.Api.Data;

namespace CarWashBooking.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("bookings/{date}")]
        public async Task<IActionResult> GetBookingsByDate(DateTime date)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .Where(b => b.Date.Date == date.Date)
                .Select(b => new
                {
                    b.Id,
                    Date = b.Date.ToString("yyyy-MM-dd"),
                    b.Status,
                    Service = b.Service != null ? b.Service.Name : "Unknown",
                    b.VehicleDetails,
                    b.Notes,
                    CustomerName = b.User != null ? b.User.Name : b.CustomerName,
                    CustomerPhone = b.User != null ? b.User.Phone : b.CustomerPhone
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [HttpPatch("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateStatusDto request)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            var allowedStatuses = new[] { "Pending", "Confirmed", "Completed", "Cancelled", "NoShow" };
            if (!allowedStatuses.Contains(request.Status))
            {
                return BadRequest(new { message = "Invalid status." });
            }

            booking.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking status updated successfully." });
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
