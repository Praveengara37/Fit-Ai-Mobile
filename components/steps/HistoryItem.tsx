import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HistoryItemProps {
    date: string;
    steps: number;
    goalSteps?: number;
    label?: string; // Optional custom label like "Today" or "Yesterday"
}

export default function HistoryItem({ date, steps, goalSteps = 10000, label }: HistoryItemProps) {
    const isGoalReached = steps >= goalSteps;
    const isZero = steps === 0;

    // Parse formatting natively
    const displayLabel = label || new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const progressPerc = Math.min((steps / goalSteps) * 100, 100);

    return (
        <View style={[styles.container, isZero && styles.zeroState]}>
            <View style={styles.header}>
                <Text style={[styles.dateText, isZero && styles.zeroText]}>{displayLabel}</Text>
                <View style={styles.statsRow}>
                    <Text style={[styles.stepsText, isZero && styles.zeroText]}>
                        {steps.toLocaleString()}
                    </Text>
                    {isGoalReached && (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.checkIcon} />
                    )}
                </View>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progressPerc}%` },
                        isGoalReached && { backgroundColor: Colors.success }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    zeroState: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: Colors.foreground,
        fontWeight: '500',
    },
    stepsText: {
        fontSize: 16,
        color: Colors.foreground,
        fontWeight: 'bold',
    },
    zeroText: {
        color: Colors.gray[400],
    },
    checkIcon: {
        marginLeft: 6,
    },
    progressTrack: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.purple,
        borderRadius: 4,
    }
});
