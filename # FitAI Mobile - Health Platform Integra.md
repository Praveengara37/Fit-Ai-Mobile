# FitAI Mobile - Health Platform Integration (HealthKit + Health Connect)

## OVERVIEW

Integrate with native health platforms for automatic health data syncing:
- **iOS:** Apple Health (via HealthKit)
- **Android 14+:** Health Connect
- **Fallback:** Expo Pedometer (for older Android or denied permissions)

**User Benefit:** Automatic syncing of steps, workouts, and health data without manual entry.

---

## ARCHITECTURE

```
iOS:
  Apple Health → HealthKit SDK → FitAI App → Backend API

Android 14+:
  Health Connect → React Native Health Connect → FitAI App → Backend API

Android 13 or Permission Denied:
  Device Sensor → Expo Pedometer → FitAI App → Backend API
```

---

## DEPENDENCIES

**Install packages:**

```bash
# iOS - Apple Health
npm install react-native-health

# Android - Health Connect
npm install react-native-health-connect

# Fallback - Already have this
# expo-sensors (Pedometer) - already installed
```

---

## iOS SETUP (Apple Health / HealthKit)

### 1. Install Package

```bash
npm install react-native-health
cd ios && pod install && cd ..
```

### 2. Configure Permissions

**File:** `ios/FitAI/Info.plist`

Add these keys:

```xml
<key>NSHealthShareUsageDescription</key>
<string>FitAI needs access to read your steps, workouts, and health data to automatically track your fitness progress.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>FitAI needs access to save workout data to Apple Health.</string>
```

### 3. Enable HealthKit Capability

**File:** `app.json`

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "FitAI needs access to read your steps, workouts, and health data to automatically track your fitness progress.",
        "NSHealthUpdateUsageDescription": "FitAI needs access to save workout data to Apple Health."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true
      }
    }
  }
}
```

---

## ANDROID SETUP (Health Connect)

### 1. Install Package

```bash
npm install react-native-health-connect
```

### 2. Configure Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest>
  <!-- Health Connect permissions -->
  <uses-permission android:name="android.permission.health.READ_STEPS"/>
  <uses-permission android:name="android.permission.health.READ_EXERCISE"/>
  <uses-permission android:name="android.permission.health.READ_WEIGHT"/>
  <uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
  <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>

  <application>
    <!-- Health Connect activity -->
    <activity-alias
      android:name="ViewPermissionUsageActivity"
      android:exported="true"
      android:targetActivity=".MainActivity"
      android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
      <intent-filter>
        <action android:name="android.intent.action.VIEW_PERMISSION_USAGE"/>
        <category android:name="android.intent.category.HEALTH_PERMISSIONS"/>
      </intent-filter>
    </activity-alias>
  </application>
</manifest>
```

---

## IMPLEMENTATION

### 1. Health Service (Core Logic)

**File:** `services/HealthService.ts`

```typescript
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

      const totalSteps = results.reduce((sum, record) => sum + (record.count || 0), 0);

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

      return results.map((session: any) => ({
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
```

---

### 2. Health Sync Hook

**File:** `hooks/useHealthSync.ts`

```typescript
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
```

---

### 3. Settings Screen (Health Connection)

**File:** `app/settings/health.tsx`

```typescript
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useHealthSync } from '@/hooks/useHealthSync';

export default function HealthSettingsScreen() {
  const { healthSource, syncing, lastSync, syncHealthData } = useHealthSync();

  const getSourceName = () => {
    switch (healthSource) {
      case 'apple_health': return 'Apple Health';
      case 'health_connect': return 'Health Connect';
      case 'pedometer': return 'Device Pedometer';
      case 'none': return 'Not Connected';
    }
  };

  const getSourceIcon = () => {
    switch (healthSource) {
      case 'apple_health': return '🍎';
      case 'health_connect': return '💪';
      case 'pedometer': return '📱';
      case 'none': return '❌';
    }
  };

  const getSourceDescription = () => {
    switch (healthSource) {
      case 'apple_health': 
        return 'Automatically syncing steps and workouts from Apple Health';
      case 'health_connect': 
        return 'Automatically syncing steps and workouts from Health Connect';
      case 'pedometer': 
        return 'Using device sensor for step tracking';
      case 'none': 
        return 'No health data source connected';
    }
  };

  const handleSync = async () => {
    try {
      await syncHealthData();
      Alert.alert('Success', 'Health data synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync health data. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Data Connection</Text>
      </View>

      {/* Current Source */}
      <View style={styles.card}>
        <View style={styles.sourceHeader}>
          <Text style={styles.sourceIcon}>{getSourceIcon()}</Text>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceName}>{getSourceName()}</Text>
            <Text style={styles.sourceDescription}>{getSourceDescription()}</Text>
          </View>
        </View>

        {healthSource !== 'none' && (
          <>
            {lastSync && (
              <Text style={styles.lastSync}>
                Last synced: {lastSync.toLocaleString()}
              </Text>
            )}

            <Pressable
              style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.syncButtonText}>Sync Now</Text>
              )}
            </Pressable>
          </>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📊 What we sync:</Text>
        <Text style={styles.infoText}>• Daily step count</Text>
        <Text style={styles.infoText}>• Workouts (running, cycling, gym)</Text>
        <Text style={styles.infoText}>• Active calories burned</Text>
        <Text style={styles.infoText}>• Heart rate (if available)</Text>
      </View>

      {/* Privacy */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>🔒 Privacy</Text>
        <Text style={styles.privacyText}>
          Your health data is read locally from your device and securely sent to FitAI's servers. 
          We never share your health data with third parties.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5e5e5',
  },
  card: {
    backgroundColor: '#2a2235',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 16,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  lastSync: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  syncButton: {
    backgroundColor: '#a855f7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#2a2235',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 6,
  },
  privacyCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
});
```

---

### 4. Update Steps Screen

**File:** `app/(tabs)/steps.tsx`

**Add auto-sync on mount:**

```typescript
import { useHealthSync } from '@/hooks/useHealthSync';

export default function StepsScreen() {
  const { healthSource, syncHealthData } = useHealthSync();
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    loadSteps();
  }, []);

  async function loadSteps() {
    // Sync from health platform first
    await syncHealthData();
    
    // Then load from backend
    const response = await api.get('/api/steps/today');
    setSteps(response.data.data.steps);
  }

  return (
    <View>
      <Text>Steps: {steps}</Text>
      {healthSource !== 'none' && (
        <Text style={styles.source}>
          Synced from {healthSource === 'apple_health' ? 'Apple Health' : 
                      healthSource === 'health_connect' ? 'Health Connect' : 
                      'Device Pedometer'}
        </Text>
      )}
    </View>
  );
}
```

---

## TESTING CHECKLIST

### iOS:
- [ ] Apple Health permission prompt shows
- [ ] Steps sync correctly
- [ ] Workouts sync correctly
- [ ] Syncs last 7 days on first connection
- [ ] Manual sync button works
- [ ] Falls back to pedometer if permission denied

### Android 14+:
- [ ] Health Connect permission prompt shows
- [ ] Steps sync correctly
- [ ] Workouts sync correctly
- [ ] Manual sync works

### Android 13 and below:
- [ ] Falls back to Expo Pedometer
- [ ] Steps track correctly with pedometer

---

## SUCCESS CRITERIA

✅ iOS users can connect Apple Health  
✅ Android 14+ users can connect Health Connect  
✅ Older Android users use Pedometer fallback  
✅ Steps sync automatically  
✅ Workouts sync automatically  
✅ Manual sync button works  
✅ Last sync time displayed  
✅ Privacy info shown  
✅ No crashes if permissions denied  
✅ Graceful fallback to pedometer  

---

Implement with proper permissions and error handling!