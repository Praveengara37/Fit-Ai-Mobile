export interface User {
    id: string;
    email: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
}

export interface Profile {
    id: string;
    userId: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    heightCm?: number;
    currentWeightKg?: number;
    targetWeightKg?: number;
    fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'get_fit';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    dietaryPreference?: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'halal';
    createdAt: string;
    updatedAt: string;
}

export interface DailySteps {
    id?: string;
    date: string;
    steps: number;
    distanceKm?: number;
    caloriesBurned?: number;
    goalSteps?: number;
    goalProgress?: number;
    goalReached?: boolean;
}

export interface StepsHistory {
    history: DailySteps[];
    totalDays: number;
    totalSteps: number;
    averageSteps: number;
}

export interface StepsStats {
    period: 'week' | 'month' | 'year';
    totalSteps: number;
    averageSteps: number;
    totalDistanceKm: number;
    totalCalories: number;
    bestDay: { date: string; steps: number };
    currentStreak: number;
    daysWithActivity: number;
    goalReachedDays: number;
}

// ── Meal Tracking Types ──

export interface Food {
    foodId: string;
    name: string;
    brandName?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
}

export interface MealFood {
    foodId?: string;
    foodName: string;
    brandName?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface Meal {
    id: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    foods: MealFood[];
    createdAt: string;
}

export interface DailyMeals {
    date: string;
    meals: Meal[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    goals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    remaining: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface LogMealData {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string;
    foods: MealFood[];
    notes?: string;
}
