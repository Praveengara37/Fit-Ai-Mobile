import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
    const { user, hasProfile, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/login');
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Logo width={50} height={50} />
                    <Text style={styles.pageTitle}>Profile</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{user?.fullName}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionLabel}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <QuickAction
                        icon="restaurant-outline"
                        label="Meal History"
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/meals/history' as any);
                        }}
                    />
                    <QuickAction
                        icon="bar-chart-outline"
                        label="Analytics"
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/meals/analytics' as any);
                        }}
                    />
                    <QuickAction
                        icon="bulb-outline"
                        label="Advice"
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/settings/recommendations' as any);
                        }}
                        color={Colors.cyan}
                    />
                </View>

                <View style={styles.actions}>
                    {hasProfile ? (
                        <Button
                            title="View Full Profile"
                            onPress={() => router.push('/profile/view')}
                            style={styles.actionButton}
                        />
                    ) : (
                        <Button
                            title="Complete Setup"
                            onPress={() => router.push('/profile/setup')}
                            style={styles.actionButton}
                        />
                    )}
                    <Button
                        title="⚙️  Settings"
                        onPress={() => router.push('/settings' as any)}
                        variant="outline"
                        style={styles.actionButton}
                    />
                    <Button title="Logout" onPress={handleLogout} variant="outline" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function QuickAction({
    icon,
    label,
    onPress,
    color,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}) {
    return (
        <Pressable style={styles.quickAction} onPress={onPress}>
            <View style={[styles.quickIconCircle, { backgroundColor: (color || Colors.purple) + '20' }]}>
                <Ionicons name={icon} size={22} color={color || Colors.purple} />
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.purple,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    label: { fontSize: 12, color: Colors.gray[400], marginBottom: 4 },
    value: { fontSize: 18, color: Colors.foreground, fontWeight: '600' },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 20,
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    quickAction: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    quickIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickLabel: {
        fontSize: 12,
        color: Colors.foreground,
        fontWeight: '500',
    },
    actions: { marginTop: 'auto', gap: 12 },
    actionButton: { marginBottom: 0 },
});
