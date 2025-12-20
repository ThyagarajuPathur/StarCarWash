import client from './client';

export interface Booking {
    id: number;
    date: string;
    serviceId?: number;
    service?: string;
    customerName?: string;
    customerPhone?: string;
    vehicleDetails: string;
    notes?: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
}

export const getMyBookings = async () => {
    const response = await client.get<Booking[]>('/users/me/bookings');
    return response.data;
};
