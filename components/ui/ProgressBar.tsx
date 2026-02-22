import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0–100
    color?: string;
    height?: number;
    backgroundColor?: string;
    animated?: boolean;
}

export default function ProgressBar({
    progress,
    color = Colors.purple,
    height = 8,
    backgroundColor = 'rgba(168, 85, 247, 0.15)',
    animated = true,
}: ProgressBarProps) {
    const widthAnim = useRef(new Animated.Value(0)).current;
    const clamped = Math.min(Math.max(progress, 0), 100);

    useEffect(() => {
        if (animated) {
            Animated.timing(widthAnim, {
                toValue: clamped,
                duration: 600,
                useNativeDriver: false,
            }).start();
        } else {
            widthAnim.setValue(clamped);
        }
    }, [clamped, animated]);

    return (
        <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
            <Animated.View
                style={[
                    styles.fill,
                    {
                        height,
                        backgroundColor: color,
                        borderRadius: height / 2,
                        width: widthAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
});
