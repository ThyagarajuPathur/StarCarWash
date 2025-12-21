import client from './client';
import type { Booking } from './user';

export const getBookingsByDate = async (date: string) => {
    const response = await client.get<Booking[]>(`/admin/bookings/${date}`);
    return response.data;
};

export const updateBookingStatus = async (id: number, status: string) => {
    const response = await client.patch<{ status: string; message: string }>(`/admin/bookings/${id}/status`, { status });
    return response.data;
};

export interface DashboardStats {
    totalBookings: number;
    todayBookings: number;
    totalRevenue: number;
    pendingApprovals: number;
}

export const getDashboardStats = async () => {
    const response = await client.get<DashboardStats>('/admin/stats');
    return response.data;
};
