import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

const LABELS: Record<MealType, string> = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner',
    snack: '🍎 Snack',
};

interface MealTypeSelectorProps {
    value: string;
    onChange: (type: string) => void;
}

export default function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {MEAL_TYPES.map((type) => {
                const active = value === type;
                return (
                    <Pressable
                        key={type}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            onChange(type);
                        }}
                    >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                            {LABELS[type]}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 8,
    },
    pill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pillActive: {
        backgroundColor: Colors.purple,
        borderColor: Colors.purple,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[300],
    },
    pillTextActive: {
        color: '#fff',
    },
});
