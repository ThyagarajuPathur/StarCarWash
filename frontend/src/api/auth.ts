import client from './client';
import type { AuthResponse } from '../types/auth';

export const sendOtp = async (phone: string, name?: string) => {
    const response = await client.post<{ message: string }>('/auth/send-otp', { phone, name });
    return response.data;
};

export const verifyOtp = async (phone: string, otp: string, name?: string) => {
    const response = await client.post<AuthResponse>('/auth/verify-otp', { phone, otp, name });
    return response.data;
};
