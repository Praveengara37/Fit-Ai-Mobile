import { Colors } from '@/constants/Colors';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    variant?: 'primary' | 'outline';
}

export default function Button({ title, onPress, loading, disabled, style, variant = 'primary' }: ButtonProps) {
    const isOutline = variant === 'outline';

    return (
        <Pressable
            style={[
                styles.button,
                isOutline && styles.buttonOutline,
                (disabled || loading) && styles.buttonDisabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? Colors.purple : "#fff"} />
            ) : (
                <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline]}>{title}</Text>
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
        borderWidth: 1,
        borderColor: Colors.purple,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderColor: Colors.purple,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    buttonTextOutline: { color: Colors.purple },
});
