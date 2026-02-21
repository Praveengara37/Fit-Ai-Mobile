import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { getProfile } from '@/lib/profile';
import { Profile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileView() {
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                router.replace('/profile/setup');
            } else {
                Alert.alert('Error', 'Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.purple} />
            </SafeAreaView>
        );
    }

    if (!profile) return null;

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'Not set';
        try {
            return isoString.split('T')[0];
        } catch {
            return isoString;
        }
    };

    const formatEnum = (value: string | undefined) => {
        if (!value) return 'Not set';
        return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Full Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-outline" size={20} color={Colors.purple} />
                        <Text style={styles.cardTitle}>User Information</Text>
                    </View>
                    <DetailRow label="Name" value={user?.fullName} />
                    <DetailRow label="Email" value={user?.email} />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="body-outline" size={20} color={Colors.purple} />
                        <Text style={styles.cardTitle}>Body Metrics</Text>
                    </View>
                    <DetailRow label="Gender" value={formatEnum(profile.gender)} />
                    <DetailRow label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                    <DetailRow label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : 'Not set'} />
                    <DetailRow label="Current Weight" value={profile.currentWeightKg ? `${profile.currentWeightKg} kg` : 'Not set'} />
                    <DetailRow label="Target Weight" value={profile.targetWeightKg ? `${profile.targetWeightKg} kg` : 'Not set'} />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="fitness-outline" size={20} color={Colors.purple} />
                        <Text style={styles.cardTitle}>Fitness & Diet</Text>
                    </View>
                    <DetailRow label="Goal" value={formatEnum(profile.fitnessGoal)} />
                    <DetailRow label="Activity Level" value={formatEnum(profile.activityLevel)} />
                    <DetailRow label="Dietary Preference" value={formatEnum(profile.dietaryPreference)} />
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Edit Profile"
                        onPress={() => router.push('/profile/edit')}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Change Password"
                        onPress={() => router.push('/profile/change-password')}
                        variant="outline"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
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
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 12,
    },
    cardTitle: { fontSize: 18, color: Colors.purple, fontWeight: '600', marginLeft: 8 },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    detailLabel: { fontSize: 14, color: Colors.gray[300] },
    detailValue: { fontSize: 14, color: Colors.foreground, fontWeight: '500', textAlign: 'right' },
    actions: { marginTop: 16, gap: 12 },
    actionButton: { marginBottom: 12 },
});
