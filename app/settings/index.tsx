import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
}

function SettingsItem({ title, subtitle, icon, onPress, color }: SettingsItemProps) {
    return (
        <Pressable style={styles.item} onPress={onPress}>
            <View style={[styles.iconCircle, { backgroundColor: (color || Colors.purple) + '20' }]}>
                <Ionicons name={icon} size={20} color={color || Colors.purple} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
        </Pressable>
    );
}

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>Profile</Text>
                <View style={styles.section}>
                    <SettingsItem
                        title="Edit Profile"
                        subtitle="Height, weight, goals"
                        icon="person-outline"
                        onPress={() => router.push('/profile/edit')}
                    />
                    <SettingsItem
                        title="Change Password"
                        subtitle="Update your password"
                        icon="lock-closed-outline"
                        onPress={() => router.push('/profile/change-password' as any)}
                    />
                </View>

                <Text style={styles.sectionLabel}>Goals</Text>
                <View style={styles.section}>
                    <SettingsItem
                        title="Nutrition Goals"
                        subtitle="Calories & macros targets"
                        icon="restaurant-outline"
                        onPress={() => router.push('/settings/nutrition-goals' as any)}
                    />
                    <SettingsItem
                        title="Step Goals"
                        subtitle="Daily step target"
                        icon="walk-outline"
                        onPress={() => router.push('/settings/step-goals' as any)}
                    />
                    <SettingsItem
                        title="Recommendations"
                        subtitle="AI-powered advice"
                        icon="bulb-outline"
                        onPress={() => router.push('/settings/recommendations' as any)}
                        color={Colors.cyan}
                    />
                </View>

                <Text style={styles.sectionLabel}>Data</Text>
                <View style={styles.section}>
                    <SettingsItem
                        title="Meal History"
                        subtitle="View past meals"
                        icon="time-outline"
                        onPress={() => router.push('/meals/history' as any)}
                    />
                    <SettingsItem
                        title="Nutrition Analytics"
                        subtitle="Charts & trends"
                        icon="bar-chart-outline"
                        onPress={() => router.push('/meals/analytics' as any)}
                    />
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
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
        marginTop: 8,
    },
    section: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: Colors.foreground },
    itemSubtitle: { fontSize: 13, color: Colors.gray[400], marginTop: 2 },
});
