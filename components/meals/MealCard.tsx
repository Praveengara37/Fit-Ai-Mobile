import { Colors } from '@/constants/Colors';
import { Meal } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MEAL_LABELS: Record<string, string> = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snack',
};

interface MealCardProps {
    mealType: string;
    meal?: Meal;
    onLog: () => void;
    onView?: () => void;
}

export default function MealCard({ mealType, meal, onLog, onView }: MealCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Empty state – prompt to log
    if (!meal) {
        return (
            <Pressable style={styles.card} onPress={onLog}>
                <View style={styles.emptyRow}>
                    <Text style={styles.emptyIcon}>＋</Text>
                    <Text style={styles.emptyText}>Log {MEAL_LABELS[mealType] ?? mealType}</Text>
                </View>
            </Pressable>
        );
    }

    const timeStr = meal.createdAt
        ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <Pressable style={styles.card} onPress={() => setExpanded(!expanded)}>
            {/* Header row */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.mealLabel}>{MEAL_LABELS[mealType] ?? mealType}</Text>
                    {timeStr ? <Text style={styles.time}>{timeStr}</Text> : null}
                </View>
                <Text style={styles.calories}>{meal.totalCalories} cal</Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.gray[400]}
                    style={{ marginLeft: 8 }}
                />
            </View>

            {/* Food list preview (always show first 2) */}
            {!expanded &&
                meal.foods.slice(0, 2).map((f, idx) => (
                    <Text key={idx} style={styles.foodPreview}>
                        • {f.foodName}{f.servingSize ? ` (${f.servingSize}${f.servingUnit})` : ''}
                    </Text>
                ))}

            {/* Expanded detail */}
            {expanded && (
                <View style={styles.expandedSection}>
                    {meal.foods.map((f, idx) => (
                        <View key={idx} style={styles.foodDetail}>
                            <Text style={styles.foodName}>{f.foodName}</Text>
                            <Text style={styles.foodServing}>
                                {f.servingSize}{f.servingUnit} • {Math.round(f.calories)} cal
                            </Text>
                            <Text style={styles.foodMacros}>
                                P: {Math.round(f.protein)}g  C: {Math.round(f.carbs)}g  F: {Math.round(f.fat)}g
                            </Text>
                        </View>
                    ))}

                    {onView && (
                        <Pressable style={styles.viewButton} onPress={onView}>
                            <Text style={styles.viewButtonText}>View Details</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
    },
    time: {
        fontSize: 12,
        color: Colors.gray[400],
        marginTop: 2,
    },
    calories: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.purple,
    },
    emptyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
    },
    emptyIcon: {
        fontSize: 18,
        color: Colors.purple,
        marginRight: 8,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.gray[300],
        fontWeight: '600',
    },
    foodPreview: {
        fontSize: 13,
        color: Colors.gray[300],
        marginTop: 6,
        marginLeft: 4,
    },
    expandedSection: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
        gap: 10,
    },
    foodDetail: {
        gap: 2,
    },
    foodName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
    },
    foodServing: {
        fontSize: 12,
        color: Colors.gray[300],
    },
    foodMacros: {
        fontSize: 12,
        color: Colors.gray[400],
    },
    viewButton: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.purple,
    },
});
