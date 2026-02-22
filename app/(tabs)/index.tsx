import { useAuth } from '@/components/AuthProvider';
import NutritionWidget from '@/components/meals/NutritionWidget';
import GoalCelebration from '@/components/steps/GoalCelebration';
import MotivationalMessage from '@/components/steps/MotivationalMessage';
import ProgressRing from '@/components/steps/ProgressRing';
import StatsCard from '@/components/steps/StatsCard';
import StepCounter from '@/components/steps/StepCounter';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { OfflineBar } from '@/components/ui/OfflineBar';
import { Colors } from '@/constants/Colors';
import { useStepCounter } from '@/hooks/useStepCounter';
import { getTodayMeals } from '@/lib/meals';
import { getTodaySteps } from '@/lib/steps';
import { DailyMeals, DailySteps } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAILY_GOAL = 10000;

export default function Dashboard() {
  const { user, hasProfile } = useAuth();
  const { steps, isPedometerAvailable, lastSyncTime, syncNow } = useStepCounter();
  const [todayData, setTodayData] = useState<DailySteps | null>(null);
  const [mealData, setMealData] = useState<DailyMeals | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(true); // Default true avoids mount popups

  useEffect(() => {
    // Enforce profile checks tightly
    if (!user) {
      // Don't fetch if no user context yet
      return;
    }
    if (!hasProfile) {
      router.replace('/profile/setup');
    } else {
      loadServerData();
      checkCelebrationStatus();
    }
  }, [user, hasProfile]);

  // Derived states. Assume default 1km per 1312 steps approx, and 1 cal per 25 steps approx if no server data
  const distanceKm = todayData?.distanceKm || (steps / 1312.65);
  const calories = todayData?.caloriesBurned || Math.round(steps / 25);
  const targetGoal = todayData?.goalSteps || DAILY_GOAL;
  const progressPercent = Math.min((steps / targetGoal) * 100, 100);

  const checkCelebrationStatus = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const val = await AsyncStorage.getItem(`celebrated_${todayStr}`);
      setHasCelebratedToday(!!val);
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger celebration only once per day
  useEffect(() => {
    if (steps >= targetGoal && !hasCelebratedToday) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCelebration(true);
      setHasCelebratedToday(true);
      const todayStr = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem(`celebrated_${todayStr}`, 'true');
    }
  }, [steps, targetGoal, hasCelebratedToday]);

  const loadServerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stepsData, mealsData] = await Promise.all([
        getTodaySteps(),
        getTodayMeals(),
      ]);
      if (stepsData) setTodayData(stepsData);
      setMealData(mealsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await Promise.all([syncNow(), loadServerData()]);
    setRefreshing(false);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Not synced yet';

    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Synced just now';
    if (diffMins === 1) return 'Synced 1 min ago';
    if (diffMins < 60) return `Synced ${diffMins} mins ago`;

    return `Synced today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading && !refreshing && !todayData && steps === 0) {
    return <LoadingSkeleton />;
  }

  if (error && !todayData) {
    return <ErrorState message={error} onRetry={loadServerData} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.fullName?.split(' ')[0] || 'User'}!</Text>
        </View>

        {/* Primary Ring & Counter */}
        <View style={styles.ringContainer}>
          <ProgressRing progress={progressPercent} size={280} strokeWidth={24}>
            <StepCounter steps={steps} color={progressPercent >= 100 ? Colors.success : Colors.foreground} />
          </ProgressRing>
        </View>

        <MotivationalMessage steps={steps} goalSteps={targetGoal} />

        {/* Pedometer Warning */}
        {!isPedometerAvailable && Platform.OS !== 'web' && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Pedometer not available on this device. Steps will not update automatically.
            </Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            label="Distance"
            value={`${distanceKm.toFixed(2)} km`}
            icon="navigate"
            color={Colors.cyan}
          />
          <StatsCard
            label="Calories"
            value={calories.toString()}
            icon="flame"
            color="#ef4444" // Custom red-flame
          />
          <StatsCard
            label="Goal"
            value={`${progressPercent.toFixed(0)}%`}
            icon="flag"
            color={progressPercent >= 100 ? Colors.success : Colors.purple}
          />
        </View>

        {/* Nutrition Widget */}
        <NutritionWidget
          totals={mealData?.totals}
          goals={mealData?.goals}
          onLogMeal={() => router.push('/meals/log' as any)}
        />

        {/* Navigation Blocks */}
        <View style={styles.navBlock}>
          <Button
            title="📊 View Step History"
            onPress={() => router.push('/steps/history' as any)}
          />
        </View>

        {/* Footer status */}
        <Text style={styles.syncText}>
          {formatLastSync(lastSyncTime)}
        </Text>

      </ScrollView>

      <GoalCelebration
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    color: Colors.gray[300],
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.purple,
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  navBlock: {
    marginTop: 8,
    gap: 12,
  },
  syncText: {
    textAlign: 'center',
    color: Colors.gray[400],
    fontSize: 12,
    marginTop: 24,
  }
});
