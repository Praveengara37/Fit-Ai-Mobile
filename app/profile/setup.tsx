import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import Input from '@/components/ui/Input';
import Picker from '@/components/ui/Picker';
import { Colors } from '@/constants/Colors';
import { createProfile } from '@/lib/profile';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSetup() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        gender: '',
        dateOfBirth: '',
        heightCm: '',
        currentWeightKg: '',
        targetWeightKg: '',
        fitnessGoal: '',
        activityLevel: '',
        dietaryPreference: '',
    });

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!form.gender || !form.heightCm || !form.currentWeightKg || !form.fitnessGoal || !form.activityLevel) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Re-create ISO Date string
            let isoDateOfBirth: string | undefined = undefined;
            if (form.dateOfBirth && form.dateOfBirth.length === 10) {
                isoDateOfBirth = `${form.dateOfBirth}T00:00:00.000Z`;
            }

            await createProfile({
                gender: form.gender as any,
                dateOfBirth: isoDateOfBirth,
                heightCm: Number(form.heightCm),
                currentWeightKg: Number(form.currentWeightKg),
                targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : undefined,
                fitnessGoal: form.fitnessGoal as any,
                activityLevel: form.activityLevel as any,
                dietaryPreference: (form.dietaryPreference as any) || 'none',
            });
            await refreshUser();
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to complete profile setup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>Tell us more about yourself to personalize your experience.</Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <Picker
                            label="Gender *"
                            value={form.gender}
                            onChange={(val) => handleChange('gender', val)}
                            options={[
                                { label: 'Male', value: 'male' },
                                { label: 'Female', value: 'female' },
                                { label: 'Other', value: 'other' },
                                { label: 'Prefer not to say', value: 'prefer_not_to_say' },
                            ]}
                        />
                        <DatePicker
                            label="Date of Birth (YYYY-MM-DD)"
                            value={form.dateOfBirth}
                            onChange={(val) => handleChange('dateOfBirth', val)}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Body Metrics</Text>
                        <Input
                            label="Height (cm) *"
                            value={form.heightCm}
                            onChangeText={(val) => handleChange('heightCm', val)}
                            keyboardType="numeric"
                            placeholder="e.g. 175"
                        />
                        <Input
                            label="Current Weight (kg) *"
                            value={form.currentWeightKg}
                            onChangeText={(val) => handleChange('currentWeightKg', val)}
                            keyboardType="numeric"
                            placeholder="e.g. 70"
                        />
                        <Input
                            label="Target Weight (kg)"
                            value={form.targetWeightKg}
                            onChangeText={(val) => handleChange('targetWeightKg', val)}
                            keyboardType="numeric"
                            placeholder="e.g. 65"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Fitness Journey</Text>
                        <Picker
                            label="Fitness Goal *"
                            value={form.fitnessGoal}
                            onChange={(val) => handleChange('fitnessGoal', val)}
                            options={[
                                { label: 'Lose Weight', value: 'lose_weight' },
                                { label: 'Gain Muscle', value: 'gain_muscle' },
                                { label: 'Maintain Weight', value: 'maintain' },
                                { label: 'Get Fit', value: 'get_fit' },
                            ]}
                        />
                        <Picker
                            label="Activity Level *"
                            value={form.activityLevel}
                            onChange={(val) => handleChange('activityLevel', val)}
                            options={[
                                { label: 'Sedentary', value: 'sedentary' },
                                { label: 'Lightly Active', value: 'light' },
                                { label: 'Moderately Active', value: 'moderate' },
                                { label: 'Very Active', value: 'active' },
                                { label: 'Extra Active', value: 'very_active' },
                            ]}
                        />
                        <Picker
                            label="Dietary Preference"
                            value={form.dietaryPreference}
                            onChange={(val) => handleChange('dietaryPreference', val)}
                            options={[
                                { label: 'None', value: 'none' },
                                { label: 'Vegetarian', value: 'vegetarian' },
                                { label: 'Vegan', value: 'vegan' },
                                { label: 'Keto', value: 'keto' },
                                { label: 'Paleo', value: 'paleo' },
                                { label: 'Halal', value: 'halal' },
                            ]}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button title="Complete Setup" onPress={handleSubmit} loading={loading} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.purple, marginBottom: 8 },
    subtitle: { fontSize: 16, color: Colors.gray[300] },
    formSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.foreground, marginBottom: 16 },
    footer: { marginTop: 16 },
});
