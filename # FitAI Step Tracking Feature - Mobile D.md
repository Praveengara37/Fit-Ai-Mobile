# FitAI Step Tracking Feature - Mobile Development PRD

## ROLE
You are a senior mobile developer with 10+ years of experience building fitness and health tracking applications for iOS and Android. You have deep expertise in React Native, Expo, device sensors (pedometer/accelerometer), background tasks, real-time data synchronization, and creating smooth, performant mobile UIs. You've shipped production apps with millions of users tracking health metrics daily.

## PROBLEM STATEMENT

### Current State
FitAI mobile app currently has:
- Authentication system (login, register, JWT tokens)
- Profile management (setup, view, edit)
- Tab navigation (Home, Meals, Workouts, Profile)
- Dark theme UI matching brand colors

### The Gap
Users cannot track their daily steps automatically. There's no way to:
- See real-time step count from device sensors
- Track steps throughout the day automatically
- View step history and progress
- See goal progress visualization
- Get motivation from daily achievements
- Sync step data to backend for history

### User Need
Users need a mobile app that:
1. **Automatically counts steps** using device pedometer (no manual entry needed)
2. **Displays live step count** on dashboard (updates in real-time)
3. **Shows goal progress** with visual progress bar/ring
4. **Syncs to backend** periodically (every 15 minutes or when app is opened)
5. **Shows step history** with daily breakdown (last 7 days)
6. **Displays statistics** (weekly total, daily average, best day)
7. **Works in background** (counts steps even when app is closed)
8. **Celebrates achievements** (reaching 10k steps)
9. **Provides daily motivation** with encouraging messages

### Business Impact
Step tracking is the foundation for:
- Daily user engagement (users check multiple times per day)
- Habit formation (checking progress becomes a routine)
- Goal achievement motivation
- Social features foundation (challenges, leaderboards)
- Activity-based AI recommendations
- Gamification and rewards system

### User Experience Vision
**Morning:** User opens app → sees yesterday's total and today's progress starting
**Throughout Day:** Automatic counting in background, no interaction needed
**Midday Check:** User opens app → sees 5,432 steps, 54% to goal, encouraging message
**Evening:** User hits 10,000 steps → confetti animation, achievement unlocked
**Before Bed:** User checks weekly stats → sees 5-day streak, total 52,340 steps

## PROJECT CONTEXT

### Technical Stack
- **Framework:** React Native with Expo SDK
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React hooks (useState, useContext, useEffect)
- **Storage:** AsyncStorage (for offline step data)
- **HTTP Client:** Axios with Bearer token authentication
- **Sensors:** Expo Sensors (Pedometer)
- **Background Tasks:** Expo TaskManager (optional for background sync)
- **Charts:** react-native-chart-kit or victory-native
- **Backend:** http://192.168.1.22:3000

### Existing Project Structure
```
fitai-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard (update this)
│   │   ├── meals.tsx
│   │   ├── workouts.tsx
│   │   └── profile.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Logo.tsx
│   └── AuthProvider.tsx
├── lib/
│   ├── api.ts                 # Axios with token
│   ├── auth.ts
│   └── storage.ts
├── constants/
│   └── Colors.ts
└── types/
    └── index.ts
```

### Backend API (Already Built)
```
POST http://192.168.1.22:3000/api/steps/log
Headers: Authorization: Bearer <token>
Body: {
  date: "2026-02-21",
  steps: 8547,
  distanceKm: 6.8,          // Optional
  caloriesBurned: 340       // Optional
}
Response: { success: true, data: { steps: {...} } }

GET http://192.168.1.22:3000/api/steps/today
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    steps: {
      date: "2026-02-21",
      steps: 8547,
      distanceKm: 6.8,
      caloriesBurned: 340,
      goalSteps: 10000,
      goalProgress: 85.47,
      goalReached: false
    }
  }
}

GET http://192.168.1.22:3000/api/steps/history?startDate=2026-02-15&endDate=2026-02-21
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    history: [
      { date: "2026-02-21", steps: 8547, ... },
      { date: "2026-02-20", steps: 0, ... },
      ...
    ],
    totalSteps: 45230,
    averageSteps: 6461
  }
}

GET http://192.168.1.22:3000/api/steps/stats?period=week
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    period: "week",
    stats: {
      totalSteps: 45230,
      averageSteps: 6461,
      totalDistanceKm: 36.18,
      totalCalories: 1809,
      bestDay: { date: "2026-02-19", steps: 12450 },
      currentStreak: 5,
      daysWithActivity: 7,
      goalReachedDays: 3
    }
  }
}
```

## REQUIREMENTS

### Functional Requirements

#### FR1: Real-time Step Counter on Dashboard
**Location:** Update `app/(tabs)/index.tsx`

**Features:**
1. **Large step counter display**
   - Big number showing current steps (e.g., "8,547")
   - Updated in real-time as user walks
   - Smooth animation when count increases
   - Prominent placement at top of dashboard

2. **Circular progress ring**
   - Visual ring showing progress to 10,000 step goal
   - Fills as steps increase (e.g., 85% filled for 8,500 steps)
   - Color gradient: Purple → Cyan (brand colors)
   - Shows percentage inside ring

3. **Quick stats cards**
   - Distance walked today (km/miles)
   - Calories burned today
   - Goal progress percentage
   - Each in small card with icon

4. **Motivational message**
   - Context-aware messages based on progress:
     * 0-2,000 steps: "Let's get moving! 🚶"
     * 2,000-5,000: "Great start! Keep it up 💪"
     * 5,000-8,000: "You're halfway there! 🔥"
     * 8,000-10,000: "Almost there! You got this! 🎯"
     * 10,000+: "Goal crushed! Amazing! 🎉"

5. **Last sync indicator**
   - Small text: "Synced 2 minutes ago"
   - Shows when data was last sent to backend

**Technical Implementation:**
```typescript
// Use Expo Pedometer API
import { Pedometer } from 'expo-sensors';

// Subscribe to step updates
const subscription = Pedometer.watchStepCount(result => {
  setSteps(result.steps);
});

// Calculate today's steps from midnight to now
const end = new Date();
const start = new Date();
start.setHours(0, 0, 0, 0);

const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
```

#### FR2: Automatic Background Step Counting
**Features:**
1. **Start counting on app launch**
   - Check pedometer availability on mount
   - Start subscription to step updates
   - Load baseline from midnight to now

2. **Continue in background (iOS)**
   - Use Pedometer API (continues in background on iOS)
   - Android may need foreground service (optional for MVP)

3. **Handle app state changes**
   - When app goes to background: keep subscription active
   - When app returns to foreground: update count immediately
   - Handle app restart: recalculate from midnight

4. **Error handling**
   - Check if pedometer is available (some devices don't have it)
   - Handle permission denied gracefully
   - Show message if sensor unavailable

**Permissions:**
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "Allow FitAI to access motion sensors for step counting"
        }
      ]
    ]
  }
}
```

#### FR3: Automatic Backend Sync
**Features:**
1. **Sync strategy**
   - Sync every 15 minutes if steps changed
   - Sync when app opens/resumes
   - Sync when hitting goal (10,000 steps)
   - Store locally first, then sync (offline-first)

2. **Offline support**
   - Store steps in AsyncStorage
   - Queue sync operations if offline
   - Sync when connection restored
   - Show "Syncing..." indicator

3. **Conflict resolution**
   - Backend value is source of truth
   - If backend has more steps, update local
   - If local has more, send to backend

**Implementation:**
```typescript
// Sync function
const syncSteps = async (steps: number) => {
  try {
    // Save locally first
    await AsyncStorage.setItem('todaySteps', steps.toString());
    
    // Sync to backend
    const today = new Date().toISOString().split('T')[0];
    await api.post('/api/steps/log', {
      date: today,
      steps: steps,
    });
    
    setLastSyncTime(new Date());
  } catch (error) {
    // Queue for later if network error
    console.log('Sync failed, will retry');
  }
};

// Auto-sync every 15 minutes
useInterval(() => {
  if (steps > 0) syncSteps(steps);
}, 15 * 60 * 1000);
```

#### FR4: Step History Screen
**Location:** Create new screen `app/steps/history.tsx`

**Features:**
1. **7-day history list**
   - Each day shows: date, steps, progress bar
   - Current day at top
   - Gray out days with 0 steps
   - Highlight days that reached goal (green checkmark)

2. **Mini bar chart**
   - Visual bar chart of last 7 days
   - X-axis: Days of week (Mon, Tue, Wed...)
   - Y-axis: Steps (0 - 15,000 scale)
   - Bars colored based on goal achievement

3. **Weekly summary card**
   - Total steps this week
   - Average steps per day
   - Days goal reached (e.g., "3 of 7 days")
   - Current streak (consecutive days with activity)

4. **Best day badge**
   - "Best day: Tuesday - 12,450 steps 🏆"

5. **Navigation**
   - Access from dashboard (tap "View History" button)
   - Back button to return to dashboard

**Data Loading:**
```typescript
// Fetch history on mount
useEffect(() => {
  const fetchHistory = async () => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const response = await api.get('/api/steps/history', {
      params: { startDate: sevenDaysAgo, endDate: today }
    });
    
    setHistory(response.data.data.history);
  };
  
  fetchHistory();
}, []);
```

#### FR5: Weekly Stats View
**Location:** Section in `app/steps/history.tsx` or separate `app/steps/stats.tsx`

**Features:**
1. **Period selector**
   - Toggle: Week / Month / Year
   - Default: Week

2. **Key metrics cards**
   - Total steps
   - Average per day
   - Total distance (km)
   - Total calories
   - Best day (date + steps)
   - Current streak (consecutive active days)

3. **Achievement badges**
   - "5-day streak! 🔥"
   - "Walked 50km this week! 🚶"
   - "Hit goal 5 times! 🎯"

4. **Comparison to previous period**
   - "↑ 15% vs last week"
   - Show trend (up/down arrow with percentage)

**Data Loading:**
```typescript
const fetchStats = async (period: 'week' | 'month' | 'year') => {
  const response = await api.get('/api/steps/stats', {
    params: { period }
  });
  setStats(response.data.data.stats);
};
```

#### FR6: Goal Achievement Celebration
**Features:**
1. **10,000 step celebration**
   - Detect when user crosses 10,000 steps
   - Show confetti animation (react-native-confetti-cannon)
   - Display modal: "🎉 You did it! 10,000 steps!"
   - Play satisfying sound (optional)
   - Save achievement locally (don't show again today)

2. **Visual feedback**
   - Progress ring turns green when goal reached
   - Step counter pulses briefly
   - Motivational message updates

**Implementation:**
```typescript
useEffect(() => {
  if (steps >= 10000 && !goalReachedToday) {
    // Show celebration
    setShowCelebration(true);
    setGoalReachedToday(true);
    
    // Save flag
    AsyncStorage.setItem('goalReachedToday', 'true');
    
    // Optional: trigger sync immediately
    syncSteps(steps);
  }
}, [steps]);
```

### Non-Functional Requirements

#### NFR1: Performance
- Step counter updates smoothly (60 FPS)
- No lag when incrementing numbers
- Efficient re-renders (use React.memo)
- Charts render quickly (<100ms)
- Background counting doesn't drain battery

#### NFR2: Offline-First
- Works without internet connection
- Stores steps locally in AsyncStorage
- Syncs when connection available
- Shows offline indicator when disconnected

#### NFR3: Battery Efficiency
- Use native pedometer API (most efficient)
- Avoid unnecessary re-renders
- Debounce sync operations
- Stop subscriptions when app is killed

#### NFR4: Accuracy
- Steps match device health app (iOS Health, Google Fit)
- No duplicate counting if app reopens
- Correct daily reset at midnight
- Handle timezone changes properly

#### NFR5: User Experience
- Loading states for all async operations
- Skeleton screens while fetching data
- Error messages are helpful
- Smooth animations (use Animated API)
- Haptic feedback on goal achievement

#### NFR6: Accessibility
- Large, readable fonts
- High contrast colors
- VoiceOver/TalkBack support
- Haptic feedback for visual cues

## UI/UX DESIGN

### Dashboard Layout (app/(tabs)/index.tsx)

```
┌─────────────────────────────────────┐
│  Welcome back, [Name]!              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      8,547                  │   │ ← Large step count
│  │      steps today            │   │
│  │                             │   │
│  │   ╭─────────╮               │   │
│  │   │  85%    │               │   │ ← Circular progress
│  │   │         │               │   │
│  │   ╰─────────╯               │   │
│  │                             │   │
│  │   "You're halfway there!"   │   │ ← Motivational message
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ 6.8km│  │ 340  │  │ 85%  │     │ ← Quick stats
│  │Distance│ │ Cals │  │Goal  │     │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  📊 View History                    │ ← Navigation button
│  📈 Weekly Stats                    │
│                                     │
│  Synced 2 minutes ago              │ ← Last sync
└─────────────────────────────────────┘
```

### History Screen Layout

```
┌─────────────────────────────────────┐
│  ← Steps History                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Weekly Summary            │   │
│  │   Total: 45,230 steps       │   │
│  │   Average: 6,461/day        │   │
│  │   Goal reached: 3/7 days    │   │
│  │   Streak: 5 days 🔥         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Bar Chart (7 days)        │   │
│  │   ▃▅█▆▇▅▃                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Today         8,547 ████████░ ✓   │
│  Yesterday     0     ░░░░░░░░░░    │
│  2 days ago    12,450 ██████████ ✓ │
│  3 days ago    7,890 ███████░░░    │
│  ...                               │
└─────────────────────────────────────┘
```

### Color Scheme (Match Existing)
```typescript
// Use Colors from constants/Colors.ts
background: '#1a1625'     // Dark purple-black
card: '#2a2235'           // Card background
purple: '#a855f7'         // Primary purple
cyan: '#22d3ee'           // Primary cyan
success: '#22c55e'        // Goal reached
gray: '#9ca3af'           // Inactive
```

## DELIVERABLES

### 1. Install Dependencies
```bash
npx expo install expo-sensors
npm install react-native-chart-kit
npm install react-native-svg  # Required for charts
npm install react-native-confetti-cannon  # For celebrations
```

### 2. Update Types
**File:** `types/index.ts`
```typescript
export interface DailySteps {
  id?: string;
  date: string;
  steps: number;
  distanceKm?: number;
  caloriesBurned?: number;
  goalSteps?: number;
  goalProgress?: number;
  goalReached?: boolean;
}

export interface StepsHistory {
  history: DailySteps[];
  totalDays: number;
  totalSteps: number;
  averageSteps: number;
}

export interface StepsStats {
  period: 'week' | 'month' | 'year';
  totalSteps: number;
  averageSteps: number;
  totalDistanceKm: number;
  totalCalories: number;
  bestDay: { date: string; steps: number };
  currentStreak: number;
  daysWithActivity: number;
  goalReachedDays: number;
}
```

### 3. Create Steps API Module
**File:** `lib/steps.ts`
```typescript
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function logSteps(date: string, steps: number): Promise<DailySteps>;
export async function getTodaySteps(): Promise<DailySteps>;
export async function getStepsHistory(startDate: string, endDate: string): Promise<StepsHistory>;
export async function getStepsStats(period: 'week' | 'month' | 'year'): Promise<StepsStats>;

// Offline support
export async function saveStepsLocally(date: string, steps: number): Promise<void>;
export async function getLocalSteps(date: string): Promise<number>;
```

### 4. Create Step Counter Hook
**File:** `hooks/useStepCounter.ts`
```typescript
import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { logSteps } from '@/lib/steps';

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check availability
    // Subscribe to updates
    // Get steps from midnight to now
    // Auto-sync periodically
    // Cleanup on unmount
  }, []);

  const syncNow = async () => {
    // Manual sync function
  };

  return { steps, isPedometerAvailable, lastSyncTime, syncNow };
}
```

### 5. Create Reusable Components

**File:** `components/steps/StepCounter.tsx`
- Large step count display
- Smooth number animation
- Props: steps, animated

**File:** `components/steps/ProgressRing.tsx`
- Circular progress indicator
- Gradient colors (purple to cyan)
- Props: progress (0-100), size

**File:** `components/steps/StatsCard.tsx`
- Small stat card with icon
- Props: label, value, icon

**File:** `components/steps/MotivationalMessage.tsx`
- Context-aware message based on steps
- Props: steps, goalSteps

**File:** `components/steps/HistoryItem.tsx`
- Single day history item
- Props: date, steps, goalReached

**File:** `components/steps/WeeklyChart.tsx`
- Bar chart for 7 days
- Props: history data

### 6. Update Dashboard Screen
**File:** `app/(tabs)/index.tsx`

**Changes:**
1. Import useStepCounter hook
2. Add step counter display at top
3. Add progress ring
4. Add quick stats cards
5. Add motivational message
6. Add "View History" button
7. Add last sync indicator
8. Handle pedometer unavailable state
9. Show loading state on initial load
10. Handle errors gracefully

**Key Code:**
```typescript
export default function Dashboard() {
  const { user } = useAuth();
  const { steps, isPedometerAvailable, lastSyncTime, syncNow } = useStepCounter();
  const [todayData, setTodayData] = useState<DailySteps | null>(null);

  // Load today's data from backend on mount
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    // Fetch from backend
    // Merge with local steps if higher
  };

  // UI with step counter, progress ring, etc.
}
```

### 7. Create History Screen
**File:** `app/steps/history.tsx`

**Features:**
1. Fetch 7-day history on mount
2. Display weekly summary card
3. Show bar chart
4. List daily entries
5. Highlight goal achievements
6. Show streak
7. Pull-to-refresh support
8. Loading skeleton
9. Empty state if no data

### 8. Create Stats Screen (Optional - can be part of history)
**File:** `app/steps/stats.tsx`

**Features:**
1. Period selector (week/month/year)
2. Key metrics cards
3. Best day badge
4. Streak indicator
5. Comparison to previous period
6. Achievement badges

### 9. Add Navigation
**Update:** `app/(tabs)/index.tsx`
```typescript
<Pressable onPress={() => router.push('/steps/history')}>
  <Text>📊 View History</Text>
</Pressable>
```

**Create:** Stack navigation for steps
```typescript
// app/_layout.tsx - add steps route
<Stack.Screen name="steps/history" options={{ title: 'Steps History' }} />
<Stack.Screen name="steps/stats" options={{ title: 'Statistics' }} />
```

### 10. Add Celebration Animation
**File:** `components/steps/GoalCelebration.tsx`
```typescript
import ConfettiCannon from 'react-native-confetti-cannon';

export function GoalCelebration({ visible, onHide }) {
  return (
    <Modal visible={visible} transparent>
      <ConfettiCannon count={200} origin={{x: -10, y: 0}} />
      <View>
        <Text>🎉 Goal Reached!</Text>
        <Text>You walked 10,000 steps today!</Text>
        <Button title="Awesome!" onPress={onHide} />
      </View>
    </Modal>
  );
}
```

## TESTING REQUIREMENTS

### Manual Testing Checklist

#### Step Counter
- [ ] Open app → step counter shows current steps
- [ ] Walk around → step counter increases
- [ ] Close app → reopen → counter continues from correct value
- [ ] Midnight passes → counter resets to 0

#### Syncing
- [ ] Steps sync to backend every 15 minutes
- [ ] Turn off wifi → steps save locally
- [ ] Turn on wifi → steps sync automatically
- [ ] Last sync time updates correctly

#### History
- [ ] View history → shows 7 days
- [ ] Days with 0 steps show correctly
- [ ] Bar chart displays correctly
- [ ] Weekly summary calculates correctly

#### Stats
- [ ] Switch between week/month/year → data updates
- [ ] Best day shows correctly
- [ ] Streak calculates correctly
- [ ] Totals and averages are accurate

#### Goal Celebration
- [ ] Hit 10,000 steps → confetti shows
- [ ] Confetti only shows once per day
- [ ] Modal dismisses correctly

#### Edge Cases
- [ ] Device doesn't have pedometer → show message
- [ ] Permission denied → show explanation
- [ ] No internet → offline mode works
- [ ] First time user → shows 0 steps initially
- [ ] Multiple app opens same day → no duplicate counting

## SUCCESS CRITERIA

✅ Step counter shows real-time steps from device pedometer  
✅ Counter updates smoothly without lag  
✅ Progress ring displays goal progress visually  
✅ Steps sync to backend automatically  
✅ Offline mode works (stores locally, syncs later)  
✅ History screen shows 7-day breakdown  
✅ Charts render correctly  
✅ Stats calculate accurately  
✅ Goal celebration triggers at 10,000 steps  
✅ Works in background on iOS  
✅ Battery efficient (no excessive drain)  
✅ Handles errors gracefully  
✅ Matches dark theme design  
✅ Smooth animations and transitions  

## IMPLEMENTATION NOTES

### Pedometer Best Practices
1. **Check availability first** - Some Android devices don't have pedometer
2. **Request permission** - Handle denied gracefully
3. **Calculate from midnight** - Reset daily at 00:00
4. **Unsubscribe on unmount** - Prevent memory leaks
5. **Handle app restart** - Recalculate when app opens
6. **Respect user privacy** - Explain why permission is needed

### Common Pitfalls to Avoid
- ❌ Not checking if pedometer is available
- ❌ Subscribing multiple times (memory leak)
- ❌ Not unsubscribing on unmount
- ❌ Counting steps twice if app reopens
- ❌ Syncing too frequently (battery drain)
- ❌ Not handling offline state
- ❌ Complex re-renders causing lag

### Performance Tips
1. Use React.memo for expensive components
2. Debounce step updates (update UI every second, not every step)
3. Use FlatList for history (virtualized rendering)
4. Lazy load charts
5. Cache API responses
6. Optimize animations (use native driver)

## PERMISSIONS

### iOS (Info.plist)
```xml
<key>NSMotionUsageDescription</key>
<string>FitAI needs access to your motion data to count your daily steps and track your activity.</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

### Expo Config (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "Allow FitAI to access your motion sensors to automatically count your steps throughout the day."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMotionUsageDescription": "FitAI needs access to your motion data to count your daily steps."
      }
    },
    "android": {
      "permissions": ["ACTIVITY_RECOGNITION"]
    }
  }
}
```

## POST-IMPLEMENTATION

### User Onboarding
Add a one-time tutorial explaining:
1. Steps are counted automatically
2. Works in background
3. Syncs to cloud
4. Set your daily goal (default 10,000)

### Analytics to Track
- Daily active users checking steps
- Average steps per user
- Goal achievement rate
- Feature engagement (history views, stats views)
- Sync success rate

### Future Enhancements (Not in Scope)
- Custom step goals (per user setting)
- Hourly breakdown (steps per hour)
- Step challenges with friends
- Badges and achievements
- Apple Health / Google Fit sync
- Export data to CSV
- Step reminders (hourly movement nudges)
- Weekly email summaries

## TIMELINE ESTIMATE

**Total Time:** 1.5 - 2 hours

- Install dependencies: 10 minutes
- Update types: 5 minutes
- Create steps API module: 15 minutes
- Create useStepCounter hook: 20 minutes
- Create reusable components: 20 minutes
- Update dashboard with step counter: 20 minutes
- Create history screen: 15 minutes
- Create stats view: 10 minutes
- Add celebration animation: 10 minutes
- Testing: 15 minutes

## DELIVERABLE FORMAT

Provide files organized by:
1. Types (types/index.ts updates)
2. API module (lib/steps.ts)
3. Hooks (hooks/useStepCounter.ts)
4. Components (components/steps/*.tsx)
5. Screens (app/(tabs)/index.tsx, app/steps/*.tsx)
6. Config (app.json permissions)

Each file should:
- Have complete implementation
- Include all imports
- Have TypeScript types
- Include error handling
- Follow existing dark theme
- Have smooth animations
- Include loading states
- Handle offline mode

End with:
- Permission configuration instructions
- Testing checklist
- Known limitations (if any)