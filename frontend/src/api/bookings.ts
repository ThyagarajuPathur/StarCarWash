import client from './client';

export interface AvailableDate {
    date: string;
    isAvailable: boolean;
}

export interface BookingRequest {
    serviceId: number;
    date: string;
    customerName: string;
    customerPhone: string;
    vehicleDetails: string;
    notes?: string;
}

export interface BookingResponse {
    bookingId: string;
    message: string;
}

export interface BookingConfirmation {
    bookingId: string;
    status: string;
    message: string;
}

export const getAvailableDates = async (from: string, days: number = 14) => {
    const response = await client.get<AvailableDate[]>('/bookings/available-dates', {
        params: { from, days },
    });
    return response.data;
};

export const requestBookingOtp = async (data: BookingRequest) => {
    const response = await client.post<BookingResponse>('/bookings/request-otp', data);
    return response.data;
};

export const confirmBooking = async (bookingId: string, otp: string) => {
    const response = await client.post<BookingConfirmation>('/bookings/confirm', { bookingId, otp });
    return response.data;
};
