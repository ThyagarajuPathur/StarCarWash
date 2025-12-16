# Car Wash Booking Backend Walkthrough

I have implemented the backend API for the Car Wash Booking application using .NET 8 Web API and Entity Framework Core with SQLite.

## Implemented Features

### 1. Data Models & Database
- **Models**: `User`, `Booking`, `Service`, `OtpRequest`.
- **Database**: SQLite (`carwash.db`).
- **Seeding**: Initial services (Interior, Exterior, Full) are seeded automatically.

### 2. Authentication (OTP & JWT)
- `POST /api/auth/send-otp`: Generates a mock OTP (fixed as `1234` for demo).
- `POST /api/auth/verify-otp`: Verifies OTP and returns a JWT token.
- **JWT**: Configured with a secret key, issuer, and audience.

### 3. Booking Logic
- `GET /api/bookings/available-dates`: Returns availability for the next 14 days.
- `POST /api/bookings/request-otp`: Checks availability, creates a pending booking, and sends OTP.
- `POST /api/bookings/confirm`: Verifies OTP and confirms the booking.

### 4. User Features
- `GET /api/users/me/bookings`: Returns bookings for the authenticated user.

### 5. Admin Features
- `GET /api/admin/bookings/{date}`: Returns all bookings for a specific date.
- `PATCH /api/admin/bookings/{id}/status`: Updates booking status.

## How to Run

1.  **Navigate to the backend directory**:
    ```bash
    cd /Users/pathurthyagaraju/Coding/Antigravity/carwash/backend
    ```

2.  **Run the application**:
    ```bash
    dotnet run
    ```
    The API will be available at `https://localhost:5001` (or `http://localhost:5000` depending on environment, check console output).

## Testing Endpoints

You can use `curl` or Postman to test the endpoints.

### Example: Send OTP
```bash
curl -X POST https://localhost:5001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890"}'
```

### Example: Verify OTP
```bash
curl -X POST https://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "otp": "1234"}'
```
Use the returned `token` in the `Authorization` header for protected endpoints:
`Authorization: Bearer <your_token>`
