using System.ComponentModel.DataAnnotations;

namespace CarWashBooking.Api.Models
{
    public class Service
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Type { get; set; } = string.Empty; // Interior, Exterior, Full
        
        public decimal Price { get; set; }
    }
}
