using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarWashBooking.Api.Data;
using System.Security.Claims;

namespace CarWashBooking.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me/bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier); // Mapped to Sub in AuthController
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var bookings = await _context.Bookings
                .Include(b => b.Service)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Date)
                .Select(b => new
                {
                    b.Id,
                    Date = b.Date.ToString("yyyy-MM-dd"),
                    b.Status,
                    b.ServiceId,
                    b.VehicleDetails,
                    b.Notes
                })
                .ToListAsync();

            return Ok(bookings);
        }
    }
}
