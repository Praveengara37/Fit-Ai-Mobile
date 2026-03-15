import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { Pedometer } from 'expo-sensors';

export type HealthSource = 'apple_health' | 'health_connect' | 'pedometer' | 'none';

export interface HealthData {
  steps: number;
  date: string;
  source: HealthSource;
}

export interface WorkoutData {
  type: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  distance?: number; // meters
  calories: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  source: HealthSource;
  externalId: string;
}

export class HealthService {
  private healthSource: HealthSource = 'none';

  async initialize(): Promise<HealthSource> {
    if (Platform.OS === 'ios') {
      const available = await this.initializeAppleHealth();
      if (available) {
        this.healthSource = 'apple_health';
        return 'apple_health';
      }
    }

    if (Platform.OS === 'android') {
      const available = await this.initializeHealthConnect();
      if (available) {
        this.healthSource = 'health_connect';
        return 'health_connect';
      }
    }

    // Fallback to pedometer
    const pedometerAvailable = await Pedometer.isAvailableAsync();
    if (pedometerAvailable) {
      this.healthSource = 'pedometer';
      return 'pedometer';
    }

    this.healthSource = 'none';
    return 'none';
  }

  private async initializeAppleHealth(): Promise<boolean> {
    try {
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.Workout,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.BodyMass,
          ],
          write: []
        }
      };

      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, (error) => {
          if (error) {
            console.log('[HealthService] Apple Health initialization error:', error);
            resolve(false);
          } else {
            console.log('[HealthService] Apple Health initialized');
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('[HealthService] Apple Health init failed:', error);
      return false;
    }
  }

  private async initializeHealthConnect(): Promise<boolean> {
    try {
      // Check if Health Connect is available (Android 14+)
      const isAvailable = await initialize();
      
      if (!isAvailable) {
        console.log('[HealthService] Health Connect not available');
        return false;
      }

      // Request permissions
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ExerciseSession' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Weight' },
      ]);

      console.log('[HealthService] Health Connect initialized:', granted);
      return true;

    } catch (error) {
      console.error('[HealthService] Health Connect init failed:', error);
      return false;
    }
  }

  async getStepsForDate(date: Date): Promise<HealthData | null> {
    try {
      if (this.healthSource === 'apple_health') {
        return await this.getAppleHealthSteps(date);
      }

      if (this.healthSource === 'health_connect') {
        return await this.getHealthConnectSteps(date);
      }

      if (this.healthSource === 'pedometer') {
        return await this.getPedometerSteps(date);
      }

      return null;
    } catch (error) {
      console.error('[HealthService] Get steps error:', error);
      return null;
    }
  }

  private async getAppleHealthSteps(date: Date): Promise<HealthData | null> {
    return new Promise((resolve) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const options = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      };

      AppleHealthKit.getStepCount(options, (err, results) => {
        if (err) {
          console.error('[HealthService] Apple Health steps error:', err);
          resolve(null);
        } else {
          resolve({
            steps: results.value || 0,
            date: date.toISOString().split('T')[0],
            source: 'apple_health'
          });
        }
      });
    });
  }

  private async getHealthConnectSteps(date: Date): Promise<HealthData | null> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const results = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      const totalSteps = results.records.reduce((sum: number, record: any) => sum + (record.count || 0), 0);

      return {
        steps: totalSteps,
        date: date.toISOString().split('T')[0],
        source: 'health_connect'
      };
    } catch (error) {
      console.error('[HealthService] Health Connect steps error:', error);
      return null;
    }
  }

  private async getPedometerSteps(date: Date): Promise<HealthData | null> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await Pedometer.getStepCountAsync(startOfDay, endOfDay);

      return {
        steps: result.steps || 0,
        date: date.toISOString().split('T')[0],
        source: 'pedometer'
      };
    } catch (error) {
      console.error('[HealthService] Pedometer steps error:', error);
      return null;
    }
  }

  async getStepsForDateRange(startDate: Date, endDate: Date): Promise<HealthData[]> {
    const results: HealthData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const data = await this.getStepsForDate(new Date(currentDate));
      if (data) {
        results.push(data);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  async getWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    if (this.healthSource === 'apple_health') {
      return await this.getAppleHealthWorkouts(startDate, endDate);
    }

    if (this.healthSource === 'health_connect') {
      return await this.getHealthConnectWorkouts(startDate, endDate);
    }

    return [];
  }

  private async getAppleHealthWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getSamples(options, (err, results) => {
        if (err) {
          console.error('[HealthService] Apple Health workouts error:', err);
          resolve([]);
        } else {
          const workouts: WorkoutData[] = (results || []).map((workout: any) => ({
            type: workout.activityName || 'Workout',
            name: workout.activityName || 'Workout',
            startTime: workout.start,
            endTime: workout.end,
            duration: workout.duration || 0,
            distance: workout.distance || undefined,
            calories: Math.round(workout.calories || 0),
            heartRateAvg: undefined,
            heartRateMax: undefined,
            source: 'apple_health' as HealthSource,
            externalId: workout.id || `apple_${Date.now()}`
          }));
          resolve(workouts);
        }
      });
    });
  }

  private async getHealthConnectWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    try {
      const results = await readRecords('ExerciseSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      return results.records.map((session: any) => ({
        type: session.exerciseType || 'Workout',
        name: session.title || session.exerciseType || 'Workout',
        startTime: session.startTime,
        endTime: session.endTime,
        duration: Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000),
        distance: session.distance,
        calories: Math.round(session.totalEnergyBurned || 0),
        heartRateAvg: session.heartRateAvg,
        heartRateMax: session.heartRateMax,
        source: 'health_connect' as HealthSource,
        externalId: session.metadata?.id || `hc_${Date.now()}`
      }));
    } catch (error) {
      console.error('[HealthService] Health Connect workouts error:', error);
      return [];
    }
  }

  getHealthSource(): HealthSource {
    return this.healthSource;
  }
}

// Singleton instance
export const healthService = new HealthService();
