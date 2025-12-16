using System;
using System.ComponentModel.DataAnnotations;

namespace CarWashBooking.Api.Models
{
    public class Booking
    {
        public int Id { get; set; }
        
        public DateTime Date { get; set; }
        
        public int ServiceId { get; set; }
        public Service? Service { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled, NoShow
        
        public string VehicleDetails { get; set; } = string.Empty;
        
        public string? Notes { get; set; }
        
        public int? UserId { get; set; }
        public User? User { get; set; }

        // Temporary fields for booking request before user creation/linking
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
    }
}
