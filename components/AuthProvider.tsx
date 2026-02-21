import { logout as authLogout, isAuthenticated } from '@/lib/auth';
import { getUser } from '@/lib/storage';
import { User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasProfile: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const authenticated = await isAuthenticated();
        if (authenticated) {
            const userData = await getUser();
            setUser(userData);
            try {
                // Check if profile exists
                const { getProfile } = await import('@/lib/profile');
                await getProfile();
                setHasProfile(true);
            } catch (error) {
                setHasProfile(false);
            }
        }
        setIsLoading(false);
    };

    const logout = async () => {
        await authLogout();
        setUser(null);
        setHasProfile(false);
    };

    const refreshUser = async () => {
        const userData = await getUser();
        setUser(userData);
        try {
            const { getProfile } = await import('@/lib/profile');
            await getProfile();
            setHasProfile(true);
        } catch (error) {
            setHasProfile(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, hasProfile, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
