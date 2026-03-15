# FitAI Mobile - Step Tracking Technical Analysis

Based on an analysis of the codebase, here are the details regarding how step tracking is implemented in the FitAI mobile application.

## Summary

**NO, we are only using Expo Pedometer (device sensor only).** The application does not use full Apple Health or Google Fit API integrations. 

## 1. Packages Utilized
- ❌ **`react-native-health` (Apple Health)**: Not installed in `package.json`.
- ❌ **`react-native-google-fit` (Google Fit)**: Not installed in `package.json`.
- ✅ **`expo-sensors` (Pedometer)**: Installed (`"expo-sensors": "~15.0.8"`).

## 2. Implementation Specifics
- **Are we using `AppleHealthKit.getStepCount()`?** No.
- **Are we using `GoogleFit.getDailyStepCountSamples()`?** No.
- **Or just using `Pedometer.watchStepCount()`?** Yes. We are using `expo-sensors`' `Pedometer.getStepCountAsync()` to fetch past hardware counts and `Pedometer.watchStepCount()` for live session steps.
- **Does step count work when the app is closed/in background?** Yes and No. The live watcher (`watchStepCount`) stops when the app is fully killed. However, the device's hardware pedometer continues to count steps in the background. When the app is re-opened, `Pedometer.getStepCountAsync(start, end)` is called on mount to fetch the missing steps recorded by the hardware while the app was closed. 
- **Are we reading from phone's health apps or just device sensor?** We are reading from the **device sensor**. On iOS, `expo-sensors` reads from `CoreMotion` (which powers Apple Health's base step count from the phone), and on Android, it uses the `SensorManager` step counter. It does *not* read aggregated data from other sources (like a synced Apple Watch or Garmin).

## 3. Proof (Code Snippets)

The core step tracking logic is located in `hooks/useStepCounter.ts`.

It imports `Pedometer` from `expo-sensors`:
```typescript
import { Pedometer } from 'expo-sensors';
```

When the app loads, it tries to fetch the background hardware count:
```typescript
// hooks/useStepCounter.ts (around Line 44)
// Fetch today's count directly from HealthKit/Google Fit to sync with device hardware truth
try {
    const hardwareCount = await Pedometer.getStepCountAsync(start, end);
    if (hardwareCount?.steps > baseline && isMounted) {
        setSteps(hardwareCount.steps);
    }
} catch (err) {
    console.log('[useStepCounter] Background fetch issue, falling back to subscription delta.', err);
}
```

Then it subscribes to live updates while the app is active:
```typescript
// hooks/useStepCounter.ts (around Line 60)
pedometerSubscription.current = Pedometer.watchStepCount((result) => {
    if (isMounted) {
        setSteps(prev => {
            // If the device restarts the session count or we need a stable climb
            const newTotal = baseSessionSteps + result.steps;
            // Save locally quickly for rapid resilience
            saveStepsLocally(todayStr, newTotal);
            return newTotal;
        });
    }
});
```
