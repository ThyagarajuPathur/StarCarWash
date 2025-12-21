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

export interface Service {
    id: number;
    name: string;
    type: string;
    price: number;
}

export const getAdminServices = async () => {
    const response = await client.get<Service[]>('/admin/services');
    return response.data;
};

export const createService = async (service: Omit<Service, 'id'>) => {
    const response = await client.post<Service>('/admin/services', service);
    return response.data;
};

export const updateService = async (id: number, service: Service) => {
    const response = await client.put<Service>(`/admin/services/${id}`, service);
    return response.data;
};

export const deleteService = async (id: number) => {
    const response = await client.delete<{ message: string }>(`/admin/services/${id}`);
    return response.data;
};
