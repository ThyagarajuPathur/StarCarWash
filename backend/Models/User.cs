using System.ComponentModel.DataAnnotations;

namespace CarWashBooking.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        public string Role { get; set; } = "Customer"; // Customer, Admin
    }
}
