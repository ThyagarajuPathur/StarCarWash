import client from './client';
import type { AuthResponse } from '../types/auth';

export const googleLogin = async (token: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/google-login', { token });
    return response.data;
};

export const updateProfile = async (data: { name: string; phone: string }) => {
    const response = await client.put<{ message: string; user: any }>('/users/me', data);
    return response.data;
};
