import { useState, useEffect } from 'react';
import { healthService, HealthSource } from '@/services/HealthService';
import api from '@/lib/api';

export function useHealthSync() {
  const [healthSource, setHealthSource] = useState<HealthSource>('none');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    initializeHealth();
  }, []);

  async function initializeHealth() {
    const source = await healthService.initialize();
    setHealthSource(source);

    // Auto-sync on initialization
    if (source !== 'none') {
      await syncHealthData();
    }
  }

  async function syncHealthData() {
    setSyncing(true);

    try {
      // Sync last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Get steps for date range
      const stepsData = await healthService.getStepsForDateRange(startDate, endDate);

      // Send to backend (bulk)
      if (stepsData.length > 0) {
        await api.post('/api/health/sync-steps-bulk', {
          source: stepsData[0].source,
          entries: stepsData.map(d => ({
            date: d.date,
            steps: d.steps
          }))
        });
      }

      // Get workouts
      const workouts = await healthService.getWorkouts(startDate, endDate);

      // Send workouts to backend
      for (const workout of workouts) {
        await api.post('/api/health/sync-workout', workout);
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('[useHealthSync] Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }

  return {
    healthSource,
    syncing,
    lastSync,
    syncHealthData
  };
}
