import { NutritionGoals } from '@/types';
import api from './api';

export async function getNutritionGoals(): Promise<NutritionGoals | null> {
    try {
        const response = await api.get('/api/nutrition/goals');
        return response.data?.data?.goals ?? response.data?.data ?? null;
    } catch (error: any) {
        console.error('[getNutritionGoals]', error.response?.data || error.message);
        throw error;
    }
}

export async function setNutritionGoals(goals: NutritionGoals): Promise<NutritionGoals> {
    const response = await api.post('/api/nutrition/goals', goals);
    return response.data?.data?.goals ?? response.data?.data ?? goals;
}
