import client from './client';
import type { AuthResponse } from '../types/auth';

export const googleLogin = async (token: string) => {
    const response = await client.post<AuthResponse>('/auth/google-login', { token });
    return response.data;
};
