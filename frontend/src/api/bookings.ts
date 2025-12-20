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
    bookingId: number;
    status: string;
    message: string;
}

export const getAvailableDates = async (from: string, days: number = 14) => {
    const response = await client.get<AvailableDate[]>('/bookings/available-dates', {
        params: { from, days },
    });
    return response.data;
};

export const createBooking = async (data: BookingRequest) => {
    const response = await client.post<BookingResponse>('/bookings', data);
    return response.data;
};
