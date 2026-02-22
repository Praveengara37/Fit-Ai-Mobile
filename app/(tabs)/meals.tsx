import DailySummaryCard from '@/components/meals/DailySummaryCard';
import MealCard from '@/components/meals/MealCard';
import { EmptyState } from '@/components/ui/EmptyState';
import FAB from '@/components/ui/FAB';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getMealsForDate, getTodayMeals } from '@/lib/meals';
import { DailyMeals, Meal } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

function toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
    const today = new Date();
    return toDateString(date) === toDateString(today);
}

export default function MealsTab() {
    const [date, setDate] = useState(new Date());
    const [dailyData, setDailyData] = useState<DailyMeals | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const meals = dailyData?.meals ?? [];
    const totals = dailyData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const fetchMeals = useCallback(async (d: Date) => {
        try {
            if (isToday(d)) {
                const data = await getTodayMeals();
                setDailyData(data);
            } else {
                const data = await getMealsForDate(toDateString(d));
                setDailyData(data);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Refresh on tab focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchMeals(date);
        }, [date]),
    );

    const changeDate = (delta: number) => {
        Haptics.selectionAsync();
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + delta);
        setDate(newDate);
        setLoading(true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMeals(date);
    };

    const getMealForType = (type: string): Meal | undefined =>
        meals.find((m) => m.mealType === type);

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.pageTitle}>Meals</Text>

                {/* Date selector */}
                <View style={styles.dateRow}>
                    <Pressable onPress={() => changeDate(-1)} style={styles.dateArrow}>
                        <Ionicons name="chevron-back" size={22} color={Colors.purple} />
                    </Pressable>
                    <View style={styles.dateCenter}>
                        <Text style={styles.dateLabel}>
                            {isToday(date) ? 'Today' : formatDate(date)}
                        </Text>
                        {isToday(date) && <Text style={styles.dateSubLabel}>{formatDate(date)}</Text>}
                    </View>
                    <Pressable onPress={() => changeDate(1)} style={styles.dateArrow}>
                        <Ionicons name="chevron-forward" size={22} color={Colors.purple} />
                    </Pressable>
                </View>

                {/* Meal cards */}
                {meals.length === 0 && !loading ? (
                    <EmptyState
                        icon="🍽️"
                        title="No Meals Logged"
                        message={"No meals logged for this day.\nTap + to start tracking!"}
                        actionLabel="Log Meal"
                        onAction={() => router.push('/meals/log' as any)}
                    />
                ) : (
                    <>
                        {MEAL_TYPES.map((type) => {
                            const meal = getMealForType(type);
                            return (
                                <MealCard
                                    key={type}
                                    mealType={type}
                                    meal={meal}
                                    onLog={() => router.push(`/meals/log?type=${type}` as any)}
                                    onView={meal ? () => router.push(`/meals/${meal.id}` as any) : undefined}
                                />
                            );
                        })}
                        <DailySummaryCard totals={totals} goals={dailyData?.goals} />
                    </>
                )}
            </ScrollView>

            <FAB onPress={() => router.push('/meals/log' as any)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.purple,
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateArrow: {
        padding: 4,
    },
    dateCenter: {
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
    },
    dateSubLabel: {
        fontSize: 12,
        color: Colors.gray[400],
        marginTop: 2,
    },
});
