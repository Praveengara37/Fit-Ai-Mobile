import { Profile, Recommendations } from '@/types';
import api from './api';

export const getRecommendations = async (): Promise<Recommendations | null> => {
    try {
        const response = await api.get('/api/profile/recommendations');
        return response.data?.data ?? null;
    } catch (error: any) {
        console.error('[getRecommendations]', error.response?.data || error.message);
        throw error;
    }
};

export const getProfile = async (): Promise<Profile> => {
    const response = await api.get('/api/profile/me');

    // Backend returns { success: true, data: { user: {...}, profile: {...} } }
    // If profile is explicitly null, user hasn't set it up yet. Mock a 404.
    if (response.data?.data && response.data.data.profile === null) {
        throw { response: { status: 404 } };
    }

    return response.data?.data?.profile || response.data.data;
};

export const createProfile = async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.post('/api/profile/setup', data);
    return response.data?.data?.profile || response.data.data;
};

export const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.patch('/api/profile/update', data);
    return response.data?.data?.profile || response.data.data;
};

export const changePassword = async (data: any): Promise<void> => {
    await api.post('/api/auth/change-password', data);
};
