import { Colors } from '@/constants/Colors';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export default function Button({ title, onPress, loading, disabled }: ButtonProps) {
    return (
        <Pressable
            style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.purple,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
