import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
    keyboardType?: KeyboardTypeOptions;
}

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, error, keyboardType }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.gray[400]}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                />
                {secureTextEntry && (
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.cyan} />
                    </Pressable>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { color: Colors.foreground, fontSize: 14, marginBottom: 8, fontWeight: '500' },
    inputContainer: { position: 'relative' },
    input: {
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        color: Colors.foreground,
        fontSize: 16,
    },
    eyeIcon: { position: 'absolute', right: 16, top: 16 },
    error: { color: Colors.error, fontSize: 12, marginTop: 4 },
});
