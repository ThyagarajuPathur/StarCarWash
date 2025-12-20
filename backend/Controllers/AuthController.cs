using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarWashBooking.Api.Data;
using CarWashBooking.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CarWashBooking.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequestDto request)
        {
            if (string.IsNullOrEmpty(request.Phone))
                return BadRequest(new { message = "Phone number is required." });

            // Mock OTP generation
            var otp = "1234"; // Fixed for demo/mock
            var expiry = DateTime.UtcNow.AddMinutes(5);

            var otpRequest = new OtpRequest
            {
                Phone = request.Phone,
                Code = otp,
                Expiry = expiry,
                IsUsed = false
            };

            _context.OtpRequests.Add(otpRequest);
            await _context.SaveChangesAsync();

            // In a real app, send SMS here.
            Console.WriteLine($"OTP for {request.Phone}: {otp}");

            return Ok(new { message = "OTP sent successfully." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            var otpRecord = await _context.OtpRequests
                .Where(o => o.Phone == request.Phone && o.Code == request.Otp && !o.IsUsed)
                .OrderByDescending(o => o.Expiry)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.Expiry < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired OTP." });

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            // Find or create user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == request.Phone);
            if (user == null)
            {
                user = new User
                {
                    Phone = request.Phone,
                    Name = request.Name ?? "Customer",
                    Role = "Customer"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                expiresAt = DateTime.UtcNow.AddHours(24),
                userId = user.Id,
                name = user.Name,
                phone = user.Phone,
                role = user.Role
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto request)
        {
            try
            {
                var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.Token);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Name = payload.Name,
                        Email = payload.Email,
                        Role = "Customer"
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    token,
                    expiresAt = DateTime.UtcNow.AddHours(24),
                    userId = user.Id,
                    name = user.Name,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid Google Token", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Email, user.Email ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class OtpRequestDto
    {
        public string Phone { get; set; } = string.Empty;
        public string? Name { get; set; }
    }

    public class VerifyOtpDto
    {
        public string Phone { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string? Name { get; set; }
    }

    public class GoogleLoginDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
