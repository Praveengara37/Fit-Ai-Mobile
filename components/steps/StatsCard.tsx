import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
}

export default function StatsCard({ label, value, icon, color = Colors.purple }: StatsCardProps) {
    return (
        <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.value} numberOfLines={1}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        flex: 1,
        marginHorizontal: 4,
        minWidth: 90,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    content: {
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginBottom: 2,
    },
    label: {
        fontSize: 11,
        color: Colors.gray[400],
        fontWeight: '500',
        textTransform: 'uppercase',
    },
});
