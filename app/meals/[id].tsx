import { Colors } from '@/constants/Colors';
import { deleteMeal, getTodayMeals } from '@/lib/meals';
import { Meal } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEAL_LABELS: Record<string, string> = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snack',
};

export default function MealDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [meal, setMeal] = useState<Meal | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadMeal();
    }, [id]);

    const loadMeal = async () => {
        setLoading(true);
        try {
            const data = await getTodayMeals();
            const found = data?.meals?.find((m) => m.id === id);
            setMeal(found ?? null);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Meal', 'Are you sure you want to delete this meal?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (!meal) return;
                    setDeleting(true);
                    try {
                        await deleteMeal(meal.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        router.back();
                    } catch {
                        Alert.alert('Error', 'Failed to delete meal');
                    } finally {
                        setDeleting(false);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator color={Colors.purple} size="large" style={{ marginTop: 100 }} />
            </SafeAreaView>
        );
    }

    if (!meal) {
        return (
            <SafeAreaView style={styles.container}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🍽️</Text>
                    <Text style={styles.emptyText}>Meal not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const dateStr = meal.createdAt
        ? new Date(meal.createdAt).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        })
        : meal.date;
    const timeStr = meal.createdAt
        ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{MEAL_LABELS[meal.mealType] ?? meal.mealType}</Text>
                    <Text style={styles.headerDate}>{dateStr} {timeStr ? `• ${timeStr}` : ''}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Individual Food Cards */}
                {meal.foods.map((food, idx) => (
                    <View key={idx} style={styles.foodCard}>
                        <Text style={styles.foodName}>{food.foodName}</Text>
                        <Text style={styles.foodServing}>
                            Serving: {food.servingSize} {food.servingUnit}
                        </Text>
                        <View style={styles.macroGrid}>
                            <MacroItem label="Calories" value={`${Math.round(food.calories)}`} color={Colors.purple} />
                            <MacroItem label="Protein" value={`${Math.round(food.protein)}g`} color={Colors.cyan} />
                            <MacroItem label="Carbs" value={`${Math.round(food.carbs)}g`} color={Colors.warning} />
                            <MacroItem label="Fat" value={`${Math.round(food.fat)}g`} color={Colors.purple} />
                        </View>
                    </View>
                ))}

                {/* Meal Total */}
                <View style={styles.totalCard}>
                    <Text style={styles.totalHeader}>Meal Total</Text>
                    <View style={styles.macroGrid}>
                        <MacroItem label="Calories" value={`${meal.totalCalories}`} color={Colors.purple} large />
                        <MacroItem label="Protein" value={`${meal.totalProtein}g`} color={Colors.cyan} large />
                        <MacroItem label="Carbs" value={`${meal.totalCarbs}g`} color={Colors.warning} large />
                        <MacroItem label="Fat" value={`${meal.totalFat}g`} color={Colors.purple} large />
                    </View>
                </View>

                {/* Actions */}
                <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                    {deleting ? (
                        <ActivityIndicator color={Colors.error} />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={18} color={Colors.error} />
                            <Text style={styles.deleteText}>Delete Meal</Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function MacroItem({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
    return (
        <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color }, large && { fontSize: 20 }]}>{value}</Text>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.foreground,
    },
    headerDate: {
        fontSize: 13,
        color: Colors.gray[400],
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    foodCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
    },
    foodServing: {
        fontSize: 13,
        color: Colors.gray[300],
        marginTop: 4,
        marginBottom: 12,
    },
    macroGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    macroItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderRadius: 8,
        paddingVertical: 8,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    macroLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        marginTop: 2,
    },
    totalCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.purple,
    },
    totalHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 12,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.error,
        gap: 8,
    },
    deleteText: {
        color: Colors.error,
        fontWeight: '600',
        fontSize: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.gray[400],
    },
});
