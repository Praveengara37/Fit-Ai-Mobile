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

// ── Nutrition Goals Types ──

export interface NutritionGoals {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
}

// ── Recommendations Types ──

export interface Recommendations {
    bmr: number;
    tdee: number;
    recommendedCalories: number;
    explanation: string;
    macros: {
        protein: { grams: number; percentage: number };
        carbs: { grams: number; percentage: number };
        fat: { grams: number; percentage: number };
    };
}

// ── Meal History Types ──

export interface MealHistoryDay {
    date: string;
    meals: Meal[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface MealStats {
    period: 'week' | 'month';
    totalCalories: number;
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
    daysTracked: number;
    daysOnTrack: number;
    dailyBreakdown: Array<{
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}

// ── Photo Analysis Types ──

export interface DetectedFood {
    detectedName: string;
    confidence: 'high' | 'medium' | 'low';
    estimatedNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        servingSize: string;
    };
    databaseMatch: {
        foodId: string;
        foodName: string;
        nutrition: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            servingSize: string;
        };
        matchConfidence: number;
    } | null;
    notes?: string;
}

export interface PhotoAnalysisResult {
    analysisId: string;
    detectedFoods: DetectedFood[];
    totalEstimated: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    overallConfidence: 'high' | 'medium' | 'low';
    photoQuality: 'good' | 'fair' | 'poor';
    warnings: string[];
    disclaimers: string[];
}
