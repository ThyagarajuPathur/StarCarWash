import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { googleLogin as apiGoogleLogin } from '../api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const loginWithGoogle = async (credential: string) => {
        const data: AuthResponse = await apiGoogleLogin(credential);
        localStorage.setItem('token', data.token);

        // We can decode the token if needed, but the response already gives us user info
        const userData: User = {
            userId: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: 'user' // Default to user, backend can enforce admin if needed
        };

        // If backend sends specific role inside token, we might parse it, but for now simplistic approach
        // Or if data.role is available (we didn't add it to AuthResponse but we could)

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
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, googleLogin: loginWithGoogle, logout }}>
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
