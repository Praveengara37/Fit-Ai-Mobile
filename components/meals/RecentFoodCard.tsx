import { Colors } from '@/constants/Colors';
import { Food } from '@/types';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface RecentFoodCardProps {
    foods: Food[];
    onQuickAdd: (food: Food) => void;
}

export default function RecentFoodCard({ foods, onQuickAdd }: RecentFoodCardProps) {
    if (foods.length === 0) return null;

    return (
        <View style={styles.section}>
            <Text style={styles.header}>⏱ Recent Foods</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {foods.map((food, idx) => (
                    <Pressable key={idx} style={styles.card} onPress={() => onQuickAdd(food)}>
                        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
                        <Text style={styles.cal}>{Math.round(food.calories)} cal</Text>
                        <Text style={styles.quickAdd}>Quick Add</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 16,
    },
    header: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 10,
    },
    scroll: {
        gap: 10,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 14,
        width: 130,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.foreground,
        textAlign: 'center',
        marginBottom: 4,
    },
    cal: {
        fontSize: 12,
        color: Colors.cyan,
        marginBottom: 8,
    },
    quickAdd: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.purple,
    },
});
