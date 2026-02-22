import { Colors } from '@/constants/Colors';
import { MealFood } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AddedFoodItemProps {
    food: MealFood;
    onRemove: () => void;
    onEdit: () => void;
}

export default function AddedFoodItem({ food, onRemove, onEdit }: AddedFoodItemProps) {
    return (
        <View style={styles.row}>
            <Pressable style={styles.info} onPress={onEdit}>
                <Text style={styles.name} numberOfLines={1}>{food.foodName}</Text>
                <Text style={styles.meta}>
                    {food.servingSize}{food.servingUnit} • {Math.round(food.calories)} cal
                </Text>
            </Pressable>
            <Pressable style={styles.removeBtn} onPress={onRemove}>
                <Ionicons name="close-circle" size={22} color={Colors.error} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
    },
    meta: {
        fontSize: 12,
        color: Colors.gray[300],
        marginTop: 2,
    },
    removeBtn: {
        padding: 4,
    },
});
