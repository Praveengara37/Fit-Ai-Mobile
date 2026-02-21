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
