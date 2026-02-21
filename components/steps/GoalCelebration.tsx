import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface GoalCelebrationProps {
    visible: boolean;
    onHide: () => void;
}

export default function GoalCelebration({ visible, onHide }: GoalCelebrationProps) {
    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <ConfettiCannon
                    count={200}
                    origin={{ x: -10, y: 0 }}
                    fadeOut={true}
                    fallSpeed={3000}
                />

                <View style={styles.card}>
                    <Text style={styles.emoji}>🎉</Text>
                    <Text style={styles.title}>Goal Reached!</Text>
                    <Text style={styles.description}>
                        You walked 10,000 steps today! Keep up the amazing work!
                    </Text>

                    <Button
                        title="Awesome!"
                        onPress={onHide}
                        style={styles.button}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.purple,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: Colors.gray[300],
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        width: '100%',
    }
});
