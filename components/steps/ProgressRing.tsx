import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
    progress,
    size = 200,
    strokeWidth = 15,
    children
}: ProgressRingProps) {
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    // Clamp between 0-100 to prevent layout blowouts
    const safeProgress = Math.min(Math.max(progress, 0), 100);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: safeProgress,
            bounciness: 10,
            useNativeDriver: true,
        }).start();
    }, [safeProgress, animatedValue]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={[{ width: size, height: size }, styles.container]}>
            <View style={styles.svgWrapper}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={Colors.purple} stopOpacity="1" />
                            <Stop offset="1" stopColor={Colors.cyan} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    {/* Background Circle */}
                    <Circle
                        stroke={Colors.border}
                        fill="none"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    {/* Foreground Animated Circle */}
                    <AnimatedCircle
                        stroke="url(#grad)"
                        fill="none"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                </Svg>
            </View>
            <View style={[StyleSheet.absoluteFillObject, styles.content]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgWrapper: {
        position: 'absolute',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
