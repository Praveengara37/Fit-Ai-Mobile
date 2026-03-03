import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getRecommendations } from '@/lib/profile';
import { Recommendations } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecommendationsScreen() {
    const [data, setData] = useState<Recommendations | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setError(null);
            setLoading(true);
            const result = await getRecommendations();
            setData(result);
        } catch (err: any) {
            if (err.response?.status === 400 || err.response?.status === 404) {
                setError('Please complete your profile first to get recommendations.');
            } else {
                setError('Failed to load recommendations');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Recommendations</Text>
                    <View style={{ width: 24 }} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error || !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Recommendations</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ErrorState
                    message={error || 'No recommendations available.'}
                    onRetry={fetchRecommendations}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Recommendations</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Metrics Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="analytics-outline" size={20} color={Colors.purple} />
                        <Text style={styles.cardTitle}>Your Metrics</Text>
                    </View>
                    <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>{Math.round(data.bmr)}</Text>
                            <Text style={styles.metricLabel}>BMR cal/day</Text>
                        </View>
                        <View style={styles.metricDivider} />
                        <View style={styles.metricItem}>
                            <Text style={styles.metricValue}>{Math.round(data.tdee)}</Text>
                            <Text style={styles.metricLabel}>TDEE cal/day</Text>
                        </View>
                    </View>
                </View>

                {/* Recommendation Card */}
                <View style={[styles.card, styles.primaryCard]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.cyan} />
                        <Text style={[styles.cardTitle, { color: Colors.cyan }]}>Recommendation</Text>
                    </View>
                    <Text style={styles.recCalories}>
                        {Math.round(data.recommendedCalories)} calories/day
                    </Text>
                    {data.explanation && (
                        <Text style={styles.recExplanation}>{data.explanation}</Text>
                    )}

                    {data.macros && (
                        <View style={styles.macrosList}>
                            <Text style={styles.macrosSectionTitle}>Recommended Macros</Text>
                            <MacroRow
                                label="Protein"
                                grams={data.macros.protein?.grams ?? 0}
                                pct={data.macros.protein?.percentage ?? 0}
                                color={Colors.cyan}
                            />
                            <MacroRow
                                label="Carbs"
                                grams={data.macros.carbs?.grams ?? 0}
                                pct={data.macros.carbs?.percentage ?? 0}
                                color={Colors.warning}
                            />
                            <MacroRow
                                label="Fat"
                                grams={data.macros.fat?.grams ?? 0}
                                pct={data.macros.fat?.percentage ?? 0}
                                color={Colors.purple}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Apply These Goals"
                        onPress={() => router.push('/settings/nutrition-goals' as any)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MacroRow({ label, grams, pct, color }: { label: string; grams: number; pct: number; color: string }) {
    return (
        <View style={styles.macroRow}>
            <View style={[styles.macroDot, { backgroundColor: color }]} />
            <Text style={styles.macroLabel}>{label}</Text>
            <Text style={styles.macroValue}>{Math.round(grams)}g ({Math.round(pct)}%)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.foreground },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    primaryCard: {
        borderColor: Colors.cyan,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.purple,
    },
    metricLabel: {
        fontSize: 13,
        color: Colors.gray[300],
        marginTop: 4,
    },
    metricDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
    },
    recCalories: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.cyan,
        textAlign: 'center',
        marginBottom: 12,
    },
    recExplanation: {
        fontSize: 14,
        color: Colors.gray[300],
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 16,
    },
    macrosList: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 16,
    },
    macrosSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 12,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    macroLabel: {
        flex: 1,
        fontSize: 15,
        color: Colors.foreground,
    },
    macroValue: {
        fontSize: 15,
        color: Colors.gray[300],
        fontWeight: '500',
    },
    footer: { marginTop: 8 },
});
