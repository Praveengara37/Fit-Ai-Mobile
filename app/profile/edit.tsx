import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import Input from '@/components/ui/Input';
import Picker from '@/components/ui/Picker';
import { Colors } from '@/constants/Colors';
import { getProfile, updateProfile } from '@/lib/profile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileEdit() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();

                // Parse date out of ISO string
                let parsedDate = '';
                if (data.dateOfBirth) {
                    parsedDate = data.dateOfBirth.split('T')[0];
                }

                setForm({
                    gender: data.gender || '',
                    dateOfBirth: parsedDate,
                    heightCm: data.heightCm ? String(data.heightCm) : '',
                    currentWeightKg: data.currentWeightKg ? String(data.currentWeightKg) : '',
                    targetWeightKg: data.targetWeightKg ? String(data.targetWeightKg) : '',
                    fitnessGoal: data.fitnessGoal || '',
                    activityLevel: data.activityLevel || '',
                    dietaryPreference: data.dietaryPreference || 'none',
                });
            } catch (error) {
                Alert.alert('Error', 'Failed to load profile data');
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!form.gender || !form.heightCm || !form.currentWeightKg || !form.fitnessGoal || !form.activityLevel) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            // Re-create ISO Date string
            let isoDateOfBirth: string | undefined = undefined;
            if (form.dateOfBirth && form.dateOfBirth.length === 10) {
                isoDateOfBirth = `${form.dateOfBirth}T00:00:00.000Z`;
            }

            await updateProfile({
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
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.replace('/profile/view') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: Colors.foreground }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formSection}>
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
                        <Input
                            label="Height (cm) *"
                            value={form.heightCm}
                            onChangeText={(val) => handleChange('heightCm', val)}
                            keyboardType="numeric"
                        />
                        <Input
                            label="Current Weight (kg) *"
                            value={form.currentWeightKg}
                            onChangeText={(val) => handleChange('currentWeightKg', val)}
                            keyboardType="numeric"
                        />
                        <Input
                            label="Target Weight (kg)"
                            value={form.targetWeightKg}
                            onChangeText={(val) => handleChange('targetWeightKg', val)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formSection}>
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
                        <Button title="Save Changes" onPress={handleSubmit} loading={saving} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.foreground },
    scrollContent: { padding: 20, paddingBottom: 40 },
    formSection: { marginBottom: 24 },
    footer: { marginTop: 16 },
});
