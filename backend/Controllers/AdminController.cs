using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarWashBooking.Api.Data;
using CarWashBooking.Api.Models;

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

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .OrderBy(b => b.Date)
                .Select(b => new
                {
                    b.Id,
                    Date = b.Date.ToString("yyyy-MM-dd"),
                    FullDateTime = b.Date,
                    b.Status,
                    Service = b.Service != null ? b.Service.Name : "Unknown",
                    b.VehicleDetails,
                    b.Notes,
                    CustomerName = !string.IsNullOrEmpty(b.CustomerName) ? b.CustomerName : (b.User != null ? b.User.Name : "Customer"),
                    CustomerPhone = !string.IsNullOrEmpty(b.CustomerPhone) ? b.CustomerPhone : (b.User != null ? b.User.Phone : string.Empty)
                })
                .ToListAsync();

            return Ok(bookings);
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
                    CustomerName = !string.IsNullOrEmpty(b.CustomerName) ? b.CustomerName : (b.User != null ? b.User.Name : "Customer"),
                    CustomerPhone = !string.IsNullOrEmpty(b.CustomerPhone) ? b.CustomerPhone : (b.User != null ? b.User.Phone : string.Empty)
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

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var today = DateTime.Today;

            var totalBookings = await _context.Bookings.CountAsync();
            var todayBookings = await _context.Bookings.CountAsync(b => b.Date.Date == today);

            var totalRevenue = await _context.Bookings
                .Include(b => b.Service)
                .Where(b => b.Status == "Completed")
                .SumAsync(b => b.Service != null ? b.Service.Price : 0);

            var pendingApprovals = await _context.Bookings.CountAsync(b => b.Status == "Pending");

            return Ok(new DashboardStatsDto
            {
                TotalBookings = totalBookings,
                TodayBookings = todayBookings,
                TotalRevenue = totalRevenue,
                PendingApprovals = pendingApprovals
            });
        }

        // Service Management
        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.Services.ToListAsync();
            return Ok(services);
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] Service service)
        {
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return Ok(service);
        }

        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] Service service)
        {
            if (id != service.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(service).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Services.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(service);
        }

        [HttpDelete("services/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Service deleted successfully" });
        }
    }

    public class DashboardStatsDto
    {
        public int TotalBookings { get; set; }
        public int TodayBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingApprovals { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
