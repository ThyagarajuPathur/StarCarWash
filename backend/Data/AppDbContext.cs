using Microsoft.EntityFrameworkCore;
using CarWashBooking.Api.Models;

namespace CarWashBooking.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<OtpRequest> OtpRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Services
            modelBuilder.Entity<Service>().HasData(
                new Service { Id = 1, Name = "Interior Wash", Type = "Interior", Price = 500 },
                new Service { Id = 2, Name = "Exterior Wash", Type = "Exterior", Price = 300 },
                new Service { Id = 3, Name = "Full Wash", Type = "Full", Price = 750 }
            );
        }
    }
}
