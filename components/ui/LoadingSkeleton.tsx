import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function LoadingSkeleton() {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            {/* Top Graphic Area Skeleton */}
            <Animated.View style={[styles.skeletonCircle, { opacity: pulseAnim }]} />

            {/* Cards Skeleton Area */}
            <View style={styles.cardsRow}>
                <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]} />
            </View>

            {/* List Area Skeleton */}
            <Animated.View style={[styles.skeletonRowFull, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.skeletonRowFull, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.skeletonRowFull, { opacity: pulseAnim }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        paddingTop: 40,
    },
    skeletonCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        marginBottom: 40,
    },
    cardsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    skeletonCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        height: 100,
        width: '47%',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.1)',
    },
    skeletonRowFull: {
        height: 60,
        width: '100%',
        backgroundColor: Colors.card,
        borderRadius: 12,
        marginTop: 12,
    },
});
