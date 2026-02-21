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
