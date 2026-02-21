import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface StepCounterProps {
    steps: number;
    color?: string;
}

export default function StepCounter({ steps, color = Colors.foreground }: StepCounterProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: steps,
            duration: 500, // UX specified duration
            useNativeDriver: false, // Must be false for text content layout interpolation bounds
        }).start();
    }, [steps, animatedValue]);

    return (
        <View style={styles.container}>
            <View style={styles.iconRow}>
                <Ionicons name="footsteps" size={28} color={color} style={styles.icon} />
            </View>
            <Animated.Text style={[styles.stepsText, { color }]}>
                {animatedValue.interpolate({
                    inputRange: [0, Math.max(steps, 1)],
                    outputRange: [0, Math.max(steps, 1)],
                }).interpolate({
                    inputRange: [0, 9999999],
                    outputRange: ['0', '9999999'],
                })}
            </Animated.Text>
            <Text style={styles.subtitle}>steps today</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    stepsText: {
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
        textShadowColor: 'rgba(168, 85, 247, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray[400],
        marginTop: 4,
        fontWeight: '500',
    },
});
