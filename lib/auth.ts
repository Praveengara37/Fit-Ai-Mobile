import api from './api';
import { clearAll, getToken, saveToken, saveUser } from './storage';

export async function login(email: string, password: string) {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.success) {
        const { user, token } = response.data.data;
        await saveToken(token);
        await saveUser(user);
        return { success: true, user };
    }
    throw new Error('Login failed');
}

export async function register(email: string, password: string, fullName: string) {
    const response = await api.post('/api/auth/register', { email, password, fullName });
    if (response.data.success) {
        const { user, token } = response.data.data;
        await saveToken(token);
        await saveUser(user);
        return { success: true, user };
    }
    throw new Error('Registration failed');
}

export async function logout() {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        // Continue anyway
    }
    await clearAll();
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return !!token;
}
