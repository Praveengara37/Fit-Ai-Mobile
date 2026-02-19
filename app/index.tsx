import { useAuth } from '@/components/AuthProvider';
import Logo from '@/components/ui/Logo';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/(tabs)');
            } else {
                router.replace('/login');
            }
        }
    }, [isLoading, isAuthenticated]);

    return (
        <View style={styles.container}>
            <Logo />
            <ActivityIndicator size="large" color={Colors.purple} style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
    loader: { marginTop: 20 },
});
