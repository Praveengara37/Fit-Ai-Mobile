import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { getProfile, updateProfile } from '@/lib/profile';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESETS = [5000, 7500, 10000, 12500, 15000];

export default function StepGoalsScreen() {
    const [goal, setGoal] = useState(10000);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadGoal = async () => {
            try {
                const profile = await getProfile();
                // If stored in profile, use it; otherwise use default
                if ((profile as any).dailyStepGoal) {
                    setGoal((profile as any).dailyStepGoal);
                }
            } catch {
                // Use default
            } finally {
                setLoading(false);
            }
        };
        loadGoal();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({ dailyStepGoal: goal } as any);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Step goal updated!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Error', 'Failed to update step goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Daily Step Goal</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Current Goal Display */}
                <View style={styles.goalDisplay}>
                    <Text style={styles.goalValue}>{goal.toLocaleString()}</Text>
                    <Text style={styles.goalUnit}>steps per day</Text>
                </View>

                {/* Slider */}
                <View style={styles.sliderCard}>
                    <Slider
                        minimumValue={1000}
                        maximumValue={50000}
                        step={500}
                        value={goal}
                        onValueChange={(val) => {
                            setGoal(val);
                            Haptics.selectionAsync();
                        }}
                        minimumTrackTintColor={Colors.purple}
                        maximumTrackTintColor={Colors.card}
                        thumbTintColor={Colors.purple}
                        style={styles.slider}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>1k</Text>
                        <Text style={styles.sliderLabel}>50k</Text>
                    </View>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetsCard}>
                    <Text style={styles.sectionTitle}>Quick Presets</Text>
                    <View style={styles.presetsGrid}>
                        {PRESETS.map((p) => (
                            <Pressable
                                key={p}
                                style={[styles.presetBtn, goal === p && styles.presetBtnActive]}
                                onPress={() => {
                                    setGoal(p);
                                    Haptics.selectionAsync();
                                }}
                            >
                                <Text style={[styles.presetText, goal === p && styles.presetTextActive]}>
                                    {p.toLocaleString()}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button title="Save Goal" onPress={handleSave} loading={saving} />
                </View>
            </ScrollView>
        </SafeAreaView>
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
    goalDisplay: {
        alignItems: 'center',
        marginVertical: 30,
    },
    goalValue: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.purple,
    },
    goalUnit: {
        fontSize: 16,
        color: Colors.gray[300],
        marginTop: 4,
    },
    sliderCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    sliderLabel: { color: Colors.gray[400], fontSize: 12 },
    presetsCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 16,
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    presetBtn: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    presetBtnActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: Colors.purple,
    },
    presetText: { color: Colors.gray[300], fontWeight: '600', fontSize: 14 },
    presetTextActive: { color: Colors.purple },
    footer: { marginTop: 16 },
});
