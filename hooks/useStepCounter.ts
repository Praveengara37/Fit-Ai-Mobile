import { getLocalDateString, getLocalSteps, getTodaySteps, logSteps, saveStepsLocally } from '@/lib/steps';
import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';

// 15 Minutes
const SYNC_INTERVAL_MS = 15 * 60 * 1000;

export function useStepCounter() {
    const [steps, setSteps] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const syncTimer = useRef<NodeJS.Timeout | null>(null);
    const pedometerSubscription = useRef<Pedometer.Subscription | null>(null);

    // Initial load: Check availability & fetch today baseline
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                const todayStr = getLocalDateString();
                const available = await Pedometer.isAvailableAsync();

                if (isMounted) setIsPedometerAvailable(available);

                // Load baseline from local cache
                const localBaseline = await getLocalSteps(todayStr);

                // Fetch server baseline and override if larger
                const serverData = await getTodaySteps();
                const serverBaseline = serverData?.steps || 0;
                const baseline = Math.max(localBaseline, serverBaseline);

                if (isMounted) {
                    setSteps(baseline);
                    setLastSyncTime(new Date());
                }

                // If available, subscribe
                if (available && !pedometerSubscription.current) {
                    const end = new Date();
                    const start = new Date();
                    start.setHours(0, 0, 0, 0);

                    // Fetch today's count directly from HealthKit/Google Fit to sync with device hardware truth
                    try {
                        const hardwareCount = await Pedometer.getStepCountAsync(start, end);
                        if (hardwareCount?.steps > baseline && isMounted) {
                            setSteps(hardwareCount.steps);
                        }
                    } catch (err) {
                        console.log('[useStepCounter] Background fetch issue, falling back to subscription delta.', err);
                    }

                    // Start listening to live step increments.
                    // Instead of raw replacement, add relative delta. Note: Pedometer subscription 
                    // returns steps walked since subscription started. To avoid drifting, we store 
                    // the initial boot total and add the live session delta to it.
                    let baseSessionSteps = Math.max(localBaseline, serverBaseline);

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
                }
            } catch (e) {
                console.error('[useStepCounter] Initialization Error:', e);
            }
        };

        // Fire request permission before initialization setup, though expo-sensors usually auto-prompts on first usage
        Pedometer.requestPermissionsAsync().then(() => init());

        return () => {
            isMounted = false;
            if (pedometerSubscription.current) {
                pedometerSubscription.current.remove();
                pedometerSubscription.current = null;
            }
        };
    }, []);

    const syncNow = useCallback(async () => {
        if (steps <= 0) return;
        const todayStr = getLocalDateString();

        const success = await logSteps(todayStr, steps);
        if (success) {
            setLastSyncTime(new Date());
        }
    }, [steps]);

    // Timer context to periodically dump data to the API remotely
    useEffect(() => {
        syncTimer.current = setInterval(() => {
            syncNow();
        }, SYNC_INTERVAL_MS) as unknown as NodeJS.Timeout;

        return () => {
            if (syncTimer.current) clearInterval(syncTimer.current);
        };
    }, [syncNow]);

    return { steps, isPedometerAvailable, lastSyncTime, syncNow };
}
