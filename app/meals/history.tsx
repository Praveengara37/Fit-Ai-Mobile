import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getMealHistory } from '@/lib/meals';
import { MealHistoryDay } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Period = 7 | 14 | 30;

function getDateRange(days: Period) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };
    return { startDate: fmt(start), endDate: fmt(end) };
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export default function MealHistoryScreen() {
    const [period, setPeriod] = useState<Period>(7);
    const [days, setDays] = useState<MealHistoryDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const fetchHistory = useCallback(async (p: Period) => {
        try {
            setError(null);
            const { startDate, endDate } = getDateRange(p);
            const data = await getMealHistory(startDate, endDate);
            setDays(data);
        } catch {
            setError('Failed to load meal history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchHistory(period);
    }, [period]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory(period);
    };

    const toggleExpand = (date: string) => {
        setExpanded((prev) => ({ ...prev, [date]: !prev[date] }));
    };

    const avgCalories = days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + (d.totals?.calories ?? 0), 0) / days.length)
        : 0;

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Meal History</Text>
                    <View style={{ width: 24 }} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error && days.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Meal History</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ErrorState message={error} onRetry={() => { setLoading(true); fetchHistory(period); }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Meal History</Text>
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
                    {([7, 14, 30] as Period[]).map((p) => (
                        <Pressable
                            key={p}
                            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                                {p} Days
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {days.length === 0 ? (
                    <EmptyState
                        icon="📅"
                        title="No Meal History"
                        message={`No meals found in the last ${period} days.\nStart logging meals to see your history!`}
                        actionLabel="Log Meal"
                        onAction={() => router.push('/meals/log' as any)}
                    />
                ) : (
                    <>
                        {days.map((day) => (
                            <Pressable
                                key={day.date}
                                style={styles.dayCard}
                                onPress={() => toggleExpand(day.date)}
                            >
                                <View style={styles.dayHeader}>
                                    <View>
                                        <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                                        <Text style={styles.dayTotals}>
                                            {day.totals?.calories ?? 0} cal | {day.totals?.protein ?? 0}g protein
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={expanded[day.date] ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={Colors.gray[400]}
                                    />
                                </View>

                                {expanded[day.date] && day.meals && (
                                    <View style={styles.mealsList}>
                                        {day.meals.map((meal) => (
                                            <Pressable
                                                key={meal.id}
                                                style={styles.mealRow}
                                                onPress={() => router.push(`/meals/${meal.id}` as any)}
                                            >
                                                <Text style={styles.mealType}>
                                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                                </Text>
                                                <Text style={styles.mealCal}>{meal.totalCalories} cal</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </Pressable>
                        ))}

                        {/* Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>
                                {period}-Day Average
                            </Text>
                            <Text style={styles.summaryValue}>
                                {avgCalories.toLocaleString()} calories / day
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
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
    dayCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayDate: { fontSize: 16, fontWeight: '700', color: Colors.foreground },
    dayTotals: { fontSize: 13, color: Colors.gray[300], marginTop: 4 },
    mealsList: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 12,
        gap: 8,
    },
    mealRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    mealType: { fontSize: 14, color: Colors.foreground, fontWeight: '500' },
    mealCal: { fontSize: 14, color: Colors.purple, fontWeight: '600' },
    summaryCard: {
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.purple,
        alignItems: 'center',
    },
    summaryTitle: { fontSize: 14, color: Colors.gray[300], marginBottom: 4 },
    summaryValue: { fontSize: 20, fontWeight: '700', color: Colors.purple },
});
