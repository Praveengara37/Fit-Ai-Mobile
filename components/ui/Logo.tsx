import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';

export default function Logo({ size = 100 }: { size?: number }) {
    const scaleValue = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [scaleValue]);

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
            {/* SVG Dumbbell */}
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#a855f7" />
                        <Stop offset="0.5" stopColor="#8b5cf6" />
                        <Stop offset="1" stopColor="#7c3aed" />
                    </LinearGradient>
                    <LinearGradient id="cyanGrad" x1="0" y1="0.5" x2="1" y2="0.5">
                        <Stop offset="0" stopColor="#22d3ee" />
                        <Stop offset="1" stopColor="#06b6d4" />
                    </LinearGradient>
                </Defs>

                {/* Left Weight */}
                <Rect x="15" y="35" width="10" height="30" rx="2" fill="url(#purpleGrad)" />
                <Rect x="12" y="32" width="16" height="6" rx="2" fill="#a855f7" opacity="0.8" />
                <Rect x="12" y="62" width="16" height="6" rx="2" fill="#7c3aed" opacity="0.8" />

                {/* Bar */}
                <Rect x="25" y="48" width="50" height="4" rx="2" fill="url(#cyanGrad)" />

                {/* Grip texture (vertical lines) */}
                {[...Array(6)].map((_, i) => (
                    <Line key={i} x1={32 + i * 7} y1="48" x2={32 + i * 7} y2="52" stroke="#06b6d4" strokeWidth="0.5" opacity="0.5" />
                ))}

                {/* Right Weight */}
                <Rect x="75" y="35" width="10" height="30" rx="2" fill="url(#purpleGrad)" />
                <Rect x="72" y="32" width="16" height="6" rx="2" fill="#a855f7" opacity="0.8" />
                <Rect x="72" y="62" width="16" height="6" rx="2" fill="#7c3aed" opacity="0.8" />

                {/* Subtle tech circuit accents */}
                <Circle cx="20" cy="40" r="1.5" fill="#22d3ee" opacity="0.3" />
                <Circle cx="80" cy="40" r="1.5" fill="#22d3ee" opacity="0.3" />
                <Line x1="20" y1="40" x2="25" y2="48" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
                <Line x1="80" y1="40" x2="75" y2="48" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={styles.fitText}>Fit</Text>
                <Text style={styles.aiText}>AI</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    textContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    fitText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#a855f7',
        letterSpacing: -1,
    },
    aiText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#22d3ee',
        letterSpacing: -1,
    },
});
