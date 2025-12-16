import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '../api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (phone: string, name?: string) => Promise<void>;
    verifyLogin: (phone: string, otp: string, name?: string) => Promise<void>;
    logout: () => void;
}

// Helper to parse JWT
const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            // Optional: re-verify token validity or just trust local storage for UI state
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (phone: string, name?: string) => {
        await apiSendOtp(phone, name);
    };

    const verifyLogin = async (phone: string, otp: string, name?: string) => {
        const data: AuthResponse = await apiVerifyOtp(phone, otp, name);
        localStorage.setItem('token', data.token);
        const payload = parseJwt(data.token);
        const role = payload ? (payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user') : 'user';

        const userData: User = {
            userId: data.userId,
            name: data.name,
            phone: data.phone,
            role: role === 'Admin' ? 'admin' : 'user' // Normalize role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, verifyLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
