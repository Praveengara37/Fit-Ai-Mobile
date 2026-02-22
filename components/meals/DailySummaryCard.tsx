import ProgressBar from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailySummaryCardProps {
    totals: { calories: number; protein: number; carbs: number; fat: number };
    goals?: { calories: number; protein: number; carbs: number; fat: number };
}

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export default function DailySummaryCard({ totals, goals }: DailySummaryCardProps) {
    const g = goals ?? DEFAULT_GOALS;
    const remaining = g.calories - totals.calories;
    const pct = g.calories > 0 ? (totals.calories / g.calories) * 100 : 0;

    return (
        <View style={styles.card}>
            <Text style={styles.header}>📊 Daily Summary</Text>

            <View style={styles.calRow}>
                <Text style={styles.calValue}>
                    {totals.calories.toLocaleString()}{' '}
                    <Text style={styles.calGoal}>/ {g.calories.toLocaleString()} cal</Text>
                </Text>
            </View>

            <ProgressBar progress={pct} color={pct > 100 ? Colors.error : Colors.success} height={8} />

            <Text style={[styles.remaining, remaining < 0 && { color: Colors.error }]}>
                {remaining >= 0
                    ? `${remaining.toLocaleString()} cal remaining`
                    : `${Math.abs(remaining).toLocaleString()} cal over goal`}
            </Text>

            <View style={styles.macroRow}>
                <MacroChip label="Protein" value={totals.protein} unit="g" color={Colors.cyan} />
                <MacroChip label="Carbs" value={totals.carbs} unit="g" color={Colors.warning} />
                <MacroChip label="Fat" value={totals.fat} unit="g" color={Colors.purple} />
            </View>
        </View>
    );
}

function MacroChip({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
    return (
        <View style={[styles.chip, { borderColor: color }]}>
            <Text style={[styles.chipValue, { color }]}>{Math.round(value)}{unit}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
        </View>
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
    header: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 12,
    },
    calRow: {
        marginBottom: 8,
    },
    calValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.foreground,
    },
    calGoal: {
        fontSize: 14,
        fontWeight: '400',
        color: Colors.gray[300],
    },
    remaining: {
        fontSize: 13,
        color: Colors.success,
        marginTop: 6,
        marginBottom: 14,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    chip: {
        flex: 1,
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    chipValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    chipLabel: {
        fontSize: 11,
        color: Colors.gray[400],
        marginTop: 2,
    },
});
