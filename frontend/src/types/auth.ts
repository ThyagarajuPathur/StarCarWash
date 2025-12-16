export interface User {
    userId: string;
    name?: string;
    phone: string;
    role?: 'user' | 'admin'; // Assuming role might be needed, though not explicitly detailed in response, admin check is via JWT usually.
}

export interface AuthResponse {
    token: string;
    expiresAt: string;
    userId: string;
    name?: string;
    phone: string;
}
