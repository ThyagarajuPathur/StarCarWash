using System.ComponentModel.DataAnnotations;

namespace CarWashBooking.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Phone { get; set; }

        public string? Email { get; set; }
        
        public string Role { get; set; } = "Customer"; // Customer, Admin
    }
}
