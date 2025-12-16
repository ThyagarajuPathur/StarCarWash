# StarCarWash

A comprehensive Car Wash Booking application featuring a React frontend and a .NET Web API backend.

## Project Structure

- **frontend/**: React application built with Vite and TypeScript.
- **backend/**: .NET 8 Web API with Entity Framework Core and SQLite.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or later)
- **.NET SDK** (v8.0)

## Getting Started

### 1. Backend Setup

The backend handles authentication, bookings, and data management.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Restore dependencies:
    ```bash
    dotnet restore
    ```

3.  Run the application:
    ```bash
    dotnet run
    ```

    The API will start at `https://localhost:5001` (or `http://localhost:5000`).
    To view the API documentation (Swagger), navigate to `https://localhost:5001/swagger` in your browser (if enabled in development).

### 2. Frontend Setup

The frontend provides the user interface for booking car washes and managing appointments.

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (default Vite port).

## Features

- **User Authentication**: Secure login and registration using OTP.
- **Booking System**: Check availability and book car wash services.
- **Service Selection**: Choose from various service packages (Interior, Exterior, Full).
- **Admin Dashboard**: Manage bookings and view daily schedules.
- **Responsive Design**: Optimized for both desktop and mobile devices.
