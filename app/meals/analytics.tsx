import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/Colors';
import { getMealStats } from '@/lib/meals';
import { MealStats } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
type Period = 'week' | 'month';

export default function MealAnalyticsScreen() {
    const [period, setPeriod] = useState<Period>('week');
    const [stats, setStats] = useState<MealStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (p: Period) => {
        try {
            setError(null);
            const data = await getMealStats(p);
            setStats(data);
        } catch {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchStats(period);
    }, [period]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats(period);
    };

    const chartData = stats?.dailyBreakdown
        ? {
            labels: stats.dailyBreakdown.map((d) => {
                const date = new Date(d.date + 'T00:00:00');
                return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3);
            }),
            datasets: [{ data: stats.dailyBreakdown.map((d) => d.calories || 0) }],
        }
        : null;

    const goalDays = stats?.daysOnTrack ?? 0;
    const trackedDays = stats?.daysTracked ?? 1;
    const goalPercent = Math.round((goalDays / trackedDays) * 100);

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nutrition Analytics</Text>
                    <View style={{ width: 24 }} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error && !stats) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nutrition Analytics</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ErrorState message={error} onRetry={() => { setLoading(true); fetchStats(period); }} />
            </SafeAreaView>
        );
    }

    if (!stats) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nutrition Analytics</Text>
                    <View style={{ width: 24 }} />
                </View>
                <EmptyState
                    icon="📊"
                    title="No Data Yet"
                    message="Log meals for a few days to see your nutrition analytics!"
                    actionLabel="Log Meal"
                    onAction={() => router.push('/meals/log' as any)}
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
                <Text style={styles.headerTitle}>Nutrition Analytics</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Period Selector */}
                <View style={styles.periodRow}>
                    {(['week', 'month'] as Period[]).map((p) => (
                        <Pressable
                            key={p}
                            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                                {p === 'week' ? 'Week' : 'Month'}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Total KPI */}
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>
                        This {period === 'week' ? 'Week' : 'Month'}
                    </Text>
                    <Text style={styles.kpiValue}>
                        {(stats.totalCalories ?? 0).toLocaleString()} calories
                    </Text>
                </View>

                {/* Chart */}
                {chartData && chartData.datasets[0].data.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>Calories Per Day</Text>
                        <BarChart
                            data={chartData}
                            width={screenWidth - 80}
                            height={200}
                            yAxisLabel=""
                            yAxisSuffix=""
                            fromZero
                            chartConfig={{
                                backgroundColor: Colors.card,
                                backgroundGradientFrom: Colors.card,
                                backgroundGradientTo: Colors.card,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
                                labelColor: () => Colors.gray[400],
                                barPercentage: 0.6,
                                propsForBackgroundLines: {
                                    stroke: 'rgba(255,255,255,0.05)',
                                },
                            }}
                            style={{ borderRadius: 12 }}
                        />
                    </View>
                )}

                {/* Daily Averages */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Daily Averages</Text>
                    <View style={styles.avgGrid}>
                        <AvgItem label="Calories" value={`${stats.averageCalories ?? 0}`} color={Colors.purple} />
                        <AvgItem label="Protein" value={`${stats.averageProtein ?? 0}g`} color={Colors.cyan} />
                        <AvgItem label="Carbs" value={`${stats.averageCarbs ?? 0}g`} color={Colors.warning} />
                        <AvgItem label="Fat" value={`${stats.averageFat ?? 0}g`} color={Colors.purple} />
                    </View>
                </View>

                {/* Goal Achievement */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Goal Achievement</Text>
                    <Text style={styles.goalText}>
                        Days on track: {goalDays} / {trackedDays}
                    </Text>
                    <ProgressBar progress={goalPercent} color={Colors.success} />
                    <Text style={styles.goalPercent}>{goalPercent}%</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function AvgItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={styles.avgItem}>
            <Text style={[styles.avgValue, { color }]}>{value}</Text>
            <Text style={styles.avgLabel}>{label}</Text>
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
    periodRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    periodBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    periodBtnActive: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: Colors.purple,
    },
    periodText: { color: Colors.gray[400], fontWeight: '600', fontSize: 14 },
    periodTextActive: { color: Colors.purple },
    kpiCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.purple,
        alignItems: 'center',
    },
    kpiLabel: { fontSize: 14, color: Colors.gray[300], marginBottom: 4 },
    kpiValue: { fontSize: 26, fontWeight: '700', color: Colors.purple },
    chartCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 16,
    },
    avgGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    avgItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        borderRadius: 10,
        paddingVertical: 12,
    },
    avgValue: { fontSize: 18, fontWeight: '700' },
    avgLabel: { fontSize: 11, color: Colors.gray[400], marginTop: 4 },
    goalText: { fontSize: 15, color: Colors.foreground, marginBottom: 12 },
    goalPercent: {
        fontSize: 14,
        color: Colors.success,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 6,
    },
});
