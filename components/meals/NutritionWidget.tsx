import ProgressBar from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface NutritionWidgetProps {
    totals?: { calories: number; protein: number; carbs: number; fat: number };
    goals?: { calories: number; protein: number; carbs: number; fat: number };
    onLogMeal?: () => void;
}

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export default function NutritionWidget({ totals, goals, onLogMeal }: NutritionWidgetProps) {
    const [expanded, setExpanded] = useState(false);
    const g = goals ?? DEFAULT_GOALS;
    const t = totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const calPercent = g.calories > 0 ? (t.calories / g.calories) * 100 : 0;

    const macros = [
        { label: 'Protein', value: t.protein, goal: g.protein, color: Colors.cyan },
        { label: 'Carbs', value: t.carbs, goal: g.carbs, color: Colors.warning },
        { label: 'Fat', value: t.fat, goal: g.fat, color: Colors.purple },
    ];

    if (!totals) {
        return (
            <Pressable style={styles.container} onPress={onLogMeal}>
                <Text style={styles.header}>🍽️ Today's Nutrition</Text>
                <Text style={styles.emptyText}>No meals logged yet today</Text>
                {onLogMeal && (
                    <View style={styles.logButton}>
                        <Text style={styles.logButtonText}>+ Log Meal</Text>
                    </View>
                )}
            </Pressable>
        );
    }

    return (
        <Pressable style={styles.container} onPress={() => setExpanded(!expanded)}>
            <Text style={styles.header}>🍽️ Today's Nutrition</Text>

            {/* Calorie summary */}
            <View style={styles.calRow}>
                <Text style={styles.calValue}>
                    {t.calories.toLocaleString()}
                    <Text style={styles.calGoal}> / {g.calories.toLocaleString()} cal</Text>
                </Text>
                <Text style={styles.calPercent}>{Math.round(calPercent)}%</Text>
            </View>
            <ProgressBar progress={calPercent} color={calPercent > 100 ? Colors.error : Colors.purple} height={10} />

            {/* Expandable macros */}
            {expanded && (
                <View style={styles.macroSection}>
                    {macros.map((m) => {
                        const pct = m.goal > 0 ? (m.value / m.goal) * 100 : 0;
                        return (
                            <View key={m.label} style={styles.macroRow}>
                                <View style={styles.macroLabel}>
                                    <Text style={styles.macroName}>{m.label}</Text>
                                    <Text style={styles.macroValue}>
                                        {Math.round(m.value)}g / {m.goal}g
                                    </Text>
                                </View>
                                <ProgressBar progress={pct} color={m.color} height={6} />
                            </View>
                        );
                    })}
                </View>
            )}

            <Text style={styles.expandHint}>{expanded ? 'Tap to collapse' : 'Tap to see macros'}</Text>

            {onLogMeal && (
                <Pressable style={styles.logButton} onPress={onLogMeal}>
                    <Text style={styles.logButtonText}>+ Log Meal</Text>
                </Pressable>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 14,
    },
    calRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    calValue: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.foreground,
    },
    calGoal: {
        fontSize: 14,
        fontWeight: '400',
        color: Colors.gray[300],
    },
    calPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.purple,
    },
    macroSection: {
        marginTop: 16,
        gap: 12,
    },
    macroRow: {
        gap: 4,
    },
    macroLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    macroName: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.gray[300],
    },
    macroValue: {
        fontSize: 13,
        color: Colors.gray[400],
    },
    expandHint: {
        fontSize: 12,
        color: Colors.gray[400],
        textAlign: 'center',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.gray[400],
        textAlign: 'center',
        marginVertical: 12,
    },
    logButton: {
        marginTop: 14,
        backgroundColor: Colors.purple,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    logButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
