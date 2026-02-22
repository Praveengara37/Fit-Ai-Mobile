import { DailyMeals, Food, LogMealData, Meal, MealFood } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// ── API Functions ──

export async function searchFoods(query: string, maxResults = 10): Promise<Food[]> {
    const response = await api.get('/api/foods/search', {
        params: { query, maxResults },
    });
    return response.data?.data?.foods ?? response.data?.data ?? [];
}

export async function getFoodById(foodId: string): Promise<Food | null> {
    const response = await api.get(`/api/foods/${foodId}`);
    return response.data?.data ?? null;
}

export async function getTodayMeals(): Promise<DailyMeals | null> {
    try {
        const response = await api.get('/api/meals/today');
        return response.data?.data ?? null;
    } catch (error: any) {
        console.error('[getTodayMeals]', error.response?.data || error.message);
        return null;
    }
}

export async function getMealsForDate(date: string): Promise<DailyMeals | null> {
    try {
        const response = await api.get('/api/meals/history', {
            params: { startDate: date, endDate: date },
        });
        const data = response.data?.data;
        // The history endpoint may return differently; normalise
        if (data?.meals) return data;
        if (Array.isArray(data) && data.length > 0) return data[0];
        return null;
    } catch (error: any) {
        console.error('[getMealsForDate]', error.response?.data || error.message);
        return null;
    }
}

export async function logMeal(data: LogMealData): Promise<Meal | null> {
    // Save locally first (offline-first)
    await saveMealLocally(data);

    try {
        const response = await api.post('/api/meals/log', data);
        return response.data?.data ?? null;
    } catch (error: any) {
        console.error('[logMeal] Network error – queued for sync', error.message);
        await queueMealSync(data);
        throw error;
    }
}

export async function deleteMeal(mealId: string): Promise<void> {
    await api.delete(`/api/meals/${mealId}`);
}

// ── Recent Foods (AsyncStorage) ──

const RECENT_FOODS_KEY = 'recent_foods';

export async function getRecentFoods(): Promise<Food[]> {
    try {
        const raw = await AsyncStorage.getItem(RECENT_FOODS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveRecentFoods(foods: MealFood[]): Promise<void> {
    try {
        const existing = await getRecentFoods();
        // Convert MealFood → Food-like, de-dupe by name, keep last 10
        const newEntries: Food[] = foods.map((f) => ({
            foodId: f.foodId || f.foodName.toLowerCase().replace(/\s+/g, '-'),
            name: f.foodName,
            brandName: f.brandName,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            servingSize: f.servingSize,
            servingUnit: f.servingUnit,
        }));
        const merged = [...newEntries, ...existing];
        const unique = merged.filter(
            (item, idx, arr) => arr.findIndex((x) => x.name === item.name) === idx,
        );
        await AsyncStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(unique.slice(0, 10)));
    } catch (error) {
        console.error('[saveRecentFoods]', error);
    }
}

// ── Offline Sync Queue ──

const SYNC_QUEUE_KEY = 'meal_sync_queue';
const LOCAL_MEALS_PREFIX = 'fitai_local_meals_';

async function saveMealLocally(meal: LogMealData): Promise<void> {
    try {
        const key = `${LOCAL_MEALS_PREFIX}${meal.date}`;
        const raw = await AsyncStorage.getItem(key);
        const meals: LogMealData[] = raw ? JSON.parse(raw) : [];
        meals.push(meal);
        await AsyncStorage.setItem(key, JSON.stringify(meals));
    } catch (error) {
        console.error('[saveMealLocally]', error);
    }
}

async function queueMealSync(meal: LogMealData): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
        const queue: LogMealData[] = raw ? JSON.parse(raw) : [];
        queue.push(meal);
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('[queueMealSync]', error);
    }
}

export async function processSyncQueue(): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
        if (!raw) return;

        const queue: LogMealData[] = JSON.parse(raw);
        const failed: LogMealData[] = [];

        for (const meal of queue) {
            try {
                await api.post('/api/meals/log', meal);
            } catch {
                failed.push(meal);
            }
        }

        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failed));
    } catch (error) {
        console.error('[processSyncQueue]', error);
    }
}
