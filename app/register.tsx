import { useAuth } from '@/components/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/Colors';
import { register } from '@/lib/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshUser } = useAuth();

    const handleRegister = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            Alert.alert('Error', 'Password must contain at least one uppercase letter');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName);
            await refreshUser();
            router.replace('/profile/setup');
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.error?.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Logo width={140} height={140} />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join FitAI today</Text>
                </View>

                <View style={styles.form}>
                    <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="John Doe" />
                    <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
                    <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
                    <Button title="Sign Up" onPress={handleRegister} loading={loading} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Pressable onPress={() => router.replace('/login')}>
                        <Text style={styles.link}>Sign In</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.purple, marginTop: 10 },
    subtitle: { fontSize: 16, color: Colors.gray[300], marginTop: 8 },
    form: { marginBottom: 20 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: Colors.gray[300], fontSize: 14 },
    link: { color: Colors.cyan, fontSize: 14, fontWeight: '600' },
});
