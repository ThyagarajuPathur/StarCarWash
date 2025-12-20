export interface User {
    userId: string;
    name?: string;
    email: string;
    phone?: string;
    role?: 'user' | 'admin';
}

export interface AuthResponse {
    token: string;
    expiresAt: string;
    userId: string;
    name?: string;
    email: string;
    phone?: string;
    role?: 'user' | 'admin';
}
