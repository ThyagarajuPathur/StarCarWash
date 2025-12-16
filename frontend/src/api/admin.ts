import client from './client';
import type { Booking } from './user';

export const getBookingsByDate = async (date: string) => {
    const response = await client.get<Booking[]>(`/admin/bookings/${date}`);
    return response.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
    const response = await client.patch<{ status: string; message: string }>(`/admin/bookings/${id}/status`, { status });
    return response.data;
};
