using System;

namespace CarWashBooking.Api.Models
{
    public class OtpRequest
    {
        public int Id { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime Expiry { get; set; }
        public bool IsUsed { get; set; }
    }
}
