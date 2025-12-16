import client from './client';

export interface Booking {
    id: string;
    date: string;
    serviceId: number;
    vehicleDetails: string;
    notes?: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
}

export const getMyBookings = async () => {
    const response = await client.get<Booking[]>('/users/me/bookings');
    return response.data;
};
