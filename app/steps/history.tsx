import HistoryItem from '@/components/steps/HistoryItem';
import WeeklyChart from '@/components/steps/WeeklyChart';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Colors } from '@/constants/Colors';
import { getStepsHistory } from '@/lib/steps';
import { StepsHistory } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StepsHistoryScreen() {
    const [historyData, setHistoryData] = useState<StepsHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            // Map 7 window window 
            const end = new Date();
            const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // Today + 6 previous days

            const data = await getStepsHistory(
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            );

            if (data) {
                setHistoryData(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load stepping history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Steps History</Text>
                    <View style={{ width: 24 }} />
                </View>
                <LoadingSkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Steps History</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ErrorState message={error} onRetry={loadHistory} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Steps History</Text>
                <View style={{ width: 24 }} />
            </View>

            {historyData?.history && historyData.history.length > 0 ? (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Weekly Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Weekly Summary</Text>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryLabel}>Total Steps</Text>
                                <Text style={styles.summaryValue}>{historyData.totalSteps.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryLabel}>Daily Average</Text>
                                <Text style={styles.summaryValue}>{Math.round(historyData.averageSteps).toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chart Container */}
                    <View style={styles.chartContainer}>
                        <WeeklyChart history={historyData.history} />
                    </View>

                    {/* Day list container */}
                    <View style={styles.listContainer}>
                        {historyData.history.map((day, ix) => (
                            <HistoryItem
                                key={day.date}
                                date={day.date}
                                steps={day.steps}
                                label={ix === 0 ? "Today" : ix === 1 ? "Yesterday" : undefined}
                            />
                        ))}
                    </View>

                    <Button
                        title="View Detailed Analytics"
                        variant="outline"
                        onPress={() => router.push('/steps/stats' as any)}
                        style={styles.statsButton}
                    />
                </ScrollView>
            ) : (
                <EmptyState
                    icon="📊"
                    title="No History Yet"
                    message="Walk around today and check back tomorrow!"
                />
            )}
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
    scrollContent: { padding: 20, paddingBottom: 40 },

    summaryCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryTitle: { fontSize: 18, color: Colors.purple, fontWeight: '600', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryBox: { flex: 1 },
    summaryLabel: { color: Colors.gray[400], fontSize: 14, marginBottom: 4 },
    summaryValue: { color: Colors.foreground, fontSize: 24, fontWeight: 'bold' },

    chartContainer: {
        paddingVertical: 10,
    },
    listContainer: {
        marginTop: 10,
    },
    statsButton: {
        marginTop: 32,
    }
});
