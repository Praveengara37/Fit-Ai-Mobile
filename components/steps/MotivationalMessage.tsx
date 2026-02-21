import { Colors } from '@/constants/Colors';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MotivationalMessageProps {
    steps: number;
    goalSteps?: number;
}

export default function MotivationalMessage({ steps, goalSteps = 10000 }: MotivationalMessageProps) {
    const message = useMemo(() => {
        if (steps >= goalSteps) return "Goal crushed! Amazing! 🎉";
        if (steps >= goalSteps * 0.8) return "Almost there! You got this! 🎯";
        if (steps >= goalSteps * 0.5) return "You're halfway there! 🔥";
        if (steps >= goalSteps * 0.2) return "Great start! Keep it up 💪";
        return "Let's get moving! 🚶";
    }, [steps, goalSteps]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: `${Colors.purple}20`,
        borderRadius: 20,
        marginVertical: 16,
        alignSelf: 'center',
    },
    text: {
        color: Colors.purple,
        fontWeight: '600',
        fontSize: 16,
    }
});
