import { Colors } from '@/constants/Colors';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <Pressable style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: Colors.background,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: Colors.gray[300],
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: Colors.purple,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});
