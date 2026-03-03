import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getNutritionGoals, setNutritionGoals } from '@/lib/goals';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NutritionGoalsScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [calories, setCalories] = useState('2000');
    const [protein, setProtein] = useState('150');
    const [carbs, setCarbs] = useState('250');
    const [fat, setFat] = useState('65');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setError(null);
            const goals = await getNutritionGoals();
            if (goals) {
                setCalories(String(goals.dailyCalories));
                setProtein(String(goals.dailyProtein));
                setCarbs(String(goals.dailyCarbs));
                setFat(String(goals.dailyFat));
            }
        } catch {
            setError('Failed to load nutrition goals');
        } finally {
            setLoading(false);
        }
    };

    const calculatedCalories = Math.round(
        (Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9
    );

    const targetCals = Number(calories) || 0;
    const diff = Math.abs(calculatedCalories - targetCals);
    const percentDiff = targetCals > 0 ? (diff / targetCals) * 100 : 0;
    const hasMismatch = percentDiff > 10;

    const proteinPct = targetCals > 0 ? Math.round(((Number(protein) || 0) * 4 / targetCals) * 100) : 0;
    const carbsPct = targetCals > 0 ? Math.round(((Number(carbs) || 0) * 4 / targetCals) * 100) : 0;
    const fatPct = targetCals > 0 ? Math.round(((Number(fat) || 0) * 9 / targetCals) * 100) : 0;

    const handleSave = async () => {
        if (!calories || Number(calories) < 500) {
            Alert.alert('Error', 'Calorie goal must be at least 500');
            return;
        }

        if (hasMismatch) {
            Alert.alert(
                'Macro Mismatch',
                `Your macros add up to ${calculatedCalories} cal but your goal is ${targetCals} cal. Save anyway?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save Anyway', onPress: doSave },
                ]
            );
            return;
        }

        doSave();
    };

    const doSave = async () => {
        setSaving(true);
        try {
            await setNutritionGoals({
                dailyCalories: Number(calories),
                dailyProtein: Number(protein),
                dailyCarbs: Number(carbs),
                dailyFat: Number(fat),
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Nutrition goals updated!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Error', 'Failed to save nutrition goals');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nutrition Goals</Text>
                    <View style={{ width: 24 }} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nutrition Goals</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ErrorState message={error} onRetry={fetchGoals} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Nutrition Goals</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Calorie Goal */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Daily Calorie Goal</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                value={calories}
                                onChangeText={setCalories}
                                keyboardType="numeric"
                                placeholder="2000"
                                placeholderTextColor={Colors.gray[400]}
                            />
                            <Text style={styles.inputUnit}>calories</Text>
                        </View>
                    </View>

                    {/* Macros */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Macronutrients</Text>

                        <MacroInput label="Protein" value={protein} onChange={setProtein} pct={proteinPct} />
                        <MacroInput label="Carbs" value={carbs} onChange={setCarbs} pct={carbsPct} />
                        <MacroInput label="Fat" value={fat} onChange={setFat} pct={fatPct} />

                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, hasMismatch && { color: Colors.warning }]}>
                                Macro total: {calculatedCalories} cal
                            </Text>
                            {!hasMismatch && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                            {hasMismatch && (
                                <Text style={styles.warningText}>⚠️ Mismatch</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Button title="Save Goals" onPress={handleSave} loading={saving} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function MacroInput({
    label,
    value,
    onChange,
    pct,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    pct: number;
}) {
    return (
        <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>{label}</Text>
            <View style={styles.macroInputWrap}>
                <TextInput
                    style={styles.macroInput}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.gray[400]}
                />
                <Text style={styles.macroUnit}>g ({pct}%)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.foreground },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 10,
        padding: 14,
        color: Colors.foreground,
        fontSize: 20,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputUnit: { color: Colors.gray[400], fontSize: 14 },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    macroLabel: { fontSize: 15, color: Colors.foreground, fontWeight: '500' },
    macroInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    macroInput: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 10,
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: '600',
        width: 80,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    macroUnit: { color: Colors.gray[400], fontSize: 13, width: 60 },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 14,
        marginTop: 4,
    },
    totalLabel: { fontSize: 14, color: Colors.foreground, fontWeight: '500' },
    checkmark: { color: Colors.success, fontSize: 18 },
    warningText: { color: Colors.warning, fontSize: 13, fontWeight: '600' },
    footer: { marginTop: 8 },
});
