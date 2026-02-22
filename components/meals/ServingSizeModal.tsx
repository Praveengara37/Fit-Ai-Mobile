import { Colors } from '@/constants/Colors';
import { Food, MealFood } from '@/types';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface ServingSizeModalProps {
    visible: boolean;
    food: Food | null;
    onClose: () => void;
    onConfirm: (mealFood: MealFood) => void;
}

export default function ServingSizeModal({ visible, food, onClose, onConfirm }: ServingSizeModalProps) {
    const [servingText, setServingText] = useState('');

    React.useEffect(() => {
        if (food) setServingText(String(food.servingSize));
    }, [food]);

    if (!food) return null;

    const serving = parseFloat(servingText) || 0;
    const ratio = food.servingSize > 0 ? serving / food.servingSize : 0;
    const adjCalories = Math.round(food.calories * ratio);
    const adjProtein = Math.round(food.protein * ratio * 10) / 10;
    const adjCarbs = Math.round(food.carbs * ratio * 10) / 10;
    const adjFat = Math.round(food.fat * ratio * 10) / 10;

    const handleConfirm = () => {
        onConfirm({
            foodId: food.foodId,
            foodName: food.name,
            brandName: food.brandName,
            servingSize: serving,
            servingUnit: food.servingUnit,
            calories: adjCalories,
            protein: adjProtein,
            carbs: adjCarbs,
            fat: adjFat,
        });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Pressable style={styles.sheet} onPress={() => { }}>
                        <View style={styles.handle} />
                        <Text style={styles.title} numberOfLines={1}>{food.name}</Text>
                        {food.brandName ? <Text style={styles.brand}>{food.brandName}</Text> : null}

                        <Text style={styles.label}>Serving Size</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={servingText}
                                onChangeText={setServingText}
                                keyboardType="numeric"
                                selectTextOnFocus
                                placeholderTextColor={Colors.gray[400]}
                            />
                            <Text style={styles.unit}>{food.servingUnit}</Text>
                        </View>

                        {/* Live nutrition preview */}
                        <View style={styles.nutritionGrid}>
                            <NutritionItem label="Calories" value={`${adjCalories}`} color={Colors.purple} />
                            <NutritionItem label="Protein" value={`${adjProtein}g`} color={Colors.cyan} />
                            <NutritionItem label="Carbs" value={`${adjCarbs}g`} color={Colors.warning} />
                            <NutritionItem label="Fat" value={`${adjFat}g`} color={Colors.purple} />
                        </View>

                        <View style={styles.buttons}>
                            <Pressable style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.confirmBtn, serving <= 0 && { opacity: 0.4 }]}
                                onPress={handleConfirm}
                                disabled={serving <= 0}
                            >
                                <Text style={styles.confirmText}>Add to Meal</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}

function NutritionItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={styles.nutItem}>
            <Text style={[styles.nutValue, { color }]}>{value}</Text>
            <Text style={styles.nutLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.gray[400],
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.foreground,
    },
    brand: {
        fontSize: 13,
        color: Colors.gray[400],
        marginTop: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[300],
        marginTop: 20,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 14,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.foreground,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    unit: {
        fontSize: 16,
        color: Colors.gray[300],
        fontWeight: '600',
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 8,
    },
    nutItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderRadius: 10,
        paddingVertical: 12,
    },
    nutValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    nutLabel: {
        fontSize: 11,
        color: Colors.gray[400],
        marginTop: 2,
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelText: {
        color: Colors.gray[300],
        fontWeight: '600',
        fontSize: 15,
    },
    confirmBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.purple,
        alignItems: 'center',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
