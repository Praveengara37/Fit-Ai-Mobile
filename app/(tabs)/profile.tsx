import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
    const { user, logout } = useAuth();
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
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{user?.fullName}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
                <Button title="Logout" onPress={handleLogout} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: 20 },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    label: { fontSize: 12, color: Colors.gray[400], marginBottom: 4 },
    value: { fontSize: 18, color: Colors.foreground, fontWeight: '600' },
});
