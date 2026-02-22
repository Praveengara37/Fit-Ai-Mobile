import { Colors } from '@/constants/Colors';
import { Food } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface FoodResultProps {
    food: Food;
    onAdd: () => void;
}

export default function FoodResult({ food, onAdd }: FoodResultProps) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
                {food.brandName ? (
                    <Text style={styles.brand} numberOfLines={1}>{food.brandName}</Text>
                ) : null}
                <Text style={styles.meta}>
                    {Math.round(food.calories)} cal  •  {Math.round(food.protein)}g protein
                </Text>
                <Text style={styles.serving}>
                    Serving: {food.servingSize}{food.servingUnit}
                </Text>
            </View>
            <Pressable style={styles.addBtn} onPress={onAdd}>
                <Ionicons name="add-circle" size={32} color={Colors.purple} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.foreground,
    },
    brand: {
        fontSize: 12,
        color: Colors.gray[400],
    },
    meta: {
        fontSize: 13,
        color: Colors.cyan,
        marginTop: 2,
    },
    serving: {
        fontSize: 12,
        color: Colors.gray[400],
    },
    addBtn: {
        padding: 4,
    },
});
