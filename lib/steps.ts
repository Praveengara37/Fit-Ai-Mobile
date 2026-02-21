import { DailySteps, StepsHistory, StepsStats } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const LOCAL_STEPS_PREFIX = 'fitai_local_steps_';

/**
 * Creates an ISO date string in YYYY-MM-DD format based on local time.
 */
export const getLocalDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Logs steps to the backend. Resolves instantly by storing locally if offline.
 */
export const logSteps = async (date: string, steps: number): Promise<DailySteps | null> => {
    try {
        await saveStepsLocally(date, steps);

        const response = await api.post('/api/steps/log', {
            date,
            steps,
        });

        return response.data?.data?.steps || null;
    } catch (error: any) {
        console.log(`[logSteps] Network error or syncing issue. Steps saved locally for ${date}: ${steps}`);
        console.log('Error details:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches today's consolidated steps from the backend.
 */
export const getTodaySteps = async (): Promise<DailySteps | null> => {
    try {
        const response = await api.get('/api/steps/today');
        return response.data?.data?.steps || null;
    } catch (error: any) {
        console.error('[getTodaySteps] Failed to fetch today steps:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches the user's step history over a specified date range.
 */
export const getStepsHistory = async (startDate: string, endDate: string): Promise<StepsHistory | null> => {
    try {
        const response = await api.get('/api/steps/history', {
            params: { startDate, endDate }
        });
        return response.data?.data || null;
    } catch (error: any) {
        console.error('[getStepsHistory] Failed to get step history:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches aggregated step statistics over a generic period context.
 */
export const getStepsStats = async (period: 'week' | 'month' | 'year'): Promise<StepsStats | null> => {
    try {
        const response = await api.get('/api/steps/stats', {
            params: { period }
        });
        return response.data?.data?.stats || null;
    } catch (error: any) {
        console.error('[getStepsStats] Failed to get step statistics:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Offline Sync Support: Save latest step count locally for an explicit date.
 */
export const saveStepsLocally = async (date: string, steps: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(`${LOCAL_STEPS_PREFIX}${date}`, String(steps));
    } catch (error) {
        console.error('[saveStepsLocally] Failed to write local steps:', error);
    }
};

/**
 * Offline Sync Support: Read latest step count from local cache for an explicit date.
 */
export const getLocalSteps = async (date: string): Promise<number> => {
    try {
        const value = await AsyncStorage.getItem(`${LOCAL_STEPS_PREFIX}${date}`);
        return value ? parseInt(value, 10) : 0;
    } catch (error) {
        console.error('[getLocalSteps] Failed to read local steps:', error);
        return 0;
    }
};
