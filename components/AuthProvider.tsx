import { logout as authLogout, isAuthenticated } from '@/lib/auth';
import { getUser } from '@/lib/storage';
import { User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const authenticated = await isAuthenticated();
        if (authenticated) {
            const userData = await getUser();
            setUser(userData);
        }
        setIsLoading(false);
    };

    const logout = async () => {
        await authLogout();
        setUser(null);
    };

    const refreshUser = async () => {
        const userData = await getUser();
        setUser(userData);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
