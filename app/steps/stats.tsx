import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getStepsStats } from '@/lib/steps';
import { StepsStats } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StepsStatsScreen() {
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
    const [stats, setStats] = useState<StepsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getStepsStats(period);
            if (data) setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [period]);

    const TypeSelector = () => (
        <View style={styles.selector}>
            {(['week', 'month', 'year'] as const).map(p => (
                <TouchableOpacity
                    key={p}
                    style={[styles.selectorBtn, period === p && styles.selectorActive]}
                    onPress={() => setPeriod(p)}
                >
                    <Text style={[styles.selectorTxt, period === p && styles.selectorTxtActive]}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Statistics</Text>
                <View style={{ width: 24 }} />
            </View>

            <TypeSelector />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <ErrorState message={error} onRetry={loadStats} />
                ) : stats ? (
                    <View style={styles.metricsGrid}>
                        <View style={styles.metricCard}>
                            <Ionicons name="walk" size={24} color={Colors.purple} style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Total Steps</Text>
                            <Text style={styles.metricVal}>{stats.totalSteps?.toLocaleString() || 0}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Ionicons name="speedometer" size={24} color={Colors.cyan} style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Daily Average</Text>
                            <Text style={styles.metricVal}>{Math.round(stats.averageSteps || 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Ionicons name="flame" size={24} color="#ef4444" style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Kcal Burned</Text>
                            <Text style={styles.metricVal}>{Math.round(stats.totalCalories || 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Ionicons name="map" size={24} color="#3b82f6" style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Distance (km)</Text>
                            <Text style={styles.metricVal}>{(stats.totalDistanceKm || 0).toFixed(2)}</Text>
                        </View>

                        {/* Best stretch and days */}
                        <View style={[styles.metricCard, styles.fullWidth]}>
                            <View style={styles.rowAlign}>
                                <Ionicons name="trophy" size={24} color="#eab308" style={styles.iconTag} />
                                <View>
                                    <Text style={styles.metricLabel}>Best Day</Text>
                                    <Text style={styles.metricVal}>{stats.bestDay?.steps?.toLocaleString() || 0} steps</Text>
                                    <Text style={{ color: Colors.gray[400], fontSize: 12 }}>On {stats.bestDay?.date ? new Date(stats.bestDay.date).toLocaleDateString() : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricCard}>
                            <Ionicons name="flame-outline" size={24} color="#f97316" style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Active Streak</Text>
                            <Text style={styles.metricVal}>{stats.currentStreak || 0} Days</Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Ionicons name="flag" size={24} color={Colors.success} style={styles.iconTag} />
                            <Text style={styles.metricLabel}>Goal Hit</Text>
                            <Text style={styles.metricVal}>{stats.goalReachedDays || 0} Days</Text>
                        </View>
                    </View>
                ) : (
                    <EmptyState
                        icon="📈"
                        title="Not Enough Data"
                        message="Keep tracking for a few more days to see your statistics."
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.foreground },
    selector: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        margin: 20,
        borderRadius: 12,
        padding: 4,
    },
    selectorBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    selectorActive: {
        backgroundColor: Colors.purple,
    },
    selectorTxt: {
        color: Colors.gray[400],
        fontWeight: '600',
    },
    selectorTxtActive: {
        color: '#fff',
    },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        minWidth: '45%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    fullWidth: {
        minWidth: '100%',
    },
    rowAlign: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconTag: {
        marginBottom: 12,
        marginRight: 16,
    },
    metricLabel: {
        color: Colors.gray[400],
        fontSize: 13,
        marginBottom: 4,
    },
    metricVal: {
        color: Colors.foreground,
        fontSize: 22,
        fontWeight: 'bold',
    },
    emptyText: {
        color: Colors.gray[400],
        textAlign: 'center',
        marginTop: 40,
    }
});
