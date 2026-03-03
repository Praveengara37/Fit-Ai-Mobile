# FitAI Mobile - Update Logo with New SVG Design

## Task
Replace the current logo with the new professional FitAI circular logo with audio waveform design throughout the mobile app.

## Logo Design
    - Circular design with gradient background(purple to cyan)
        - "FitAI" text at bottom
            - Audio waveform visualization in center
                - Perfect for dark theme
                    - Size: 250x250(scales well)

## Implementation Steps

### Step 1: Install SVG Support
    ```bash
npx expo install react-native-svg
```

### Step 2: Create Logo Component

    ** File:** `components/ui/Logo.tsx`

        ```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Defs, 
  LinearGradient, 
  RadialGradient,
  Stop, 
  Path, 
  G 
} from 'react-native-svg';

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 120, height = 120 }: LogoProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 250 250"
        fill="none"
      >
        <Defs>
          {/* Radial gradient for background */}
          <RadialGradient id="paint0_radial" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#2a1a40" />
            <Stop offset="100%" stopColor="#1a1625" />
          </RadialGradient>
          
          {/* Linear gradients for circular border and elements */}
          <LinearGradient id="paint1_linear" x1="18.5%" y1="125%" x2="231.6%" y2="-25%">
            <Stop offset="0%" stopColor="#A03EE5" />
            <Stop offset="21%" stopColor="#A059E5" />
            <Stop offset="47%" stopColor="#4485F5" />
            <Stop offset="70%" stopColor="#44C7F5" />
            <Stop offset="99%" stopColor="#39FFD9" />
          </LinearGradient>
          
          <LinearGradient id="paint3_linear" x1="21%" y1="125%" x2="228.4%" y2="-23.1%">
            <Stop offset="0%" stopColor="#1a1625" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#2a2235" stopOpacity="0.95" />
          </LinearGradient>
          
          {/* Text gradient */}
          <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#A03EE5" />
            <Stop offset="50%" stopColor="#4485F5" />
            <Stop offset="100%" stopColor="#39FFD9" />
          </LinearGradient>
          
          {/* Waveform gradient */}
          <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#A03EE5" />
            <Stop offset="21%" stopColor="#A059E5" />
            <Stop offset="47%" stopColor="#4485F5" />
            <Stop offset="70%" stopColor="#44C7F5" />
            <Stop offset="99%" stopColor="#39FFD9" />
          </LinearGradient>
        </Defs>

        {/* Background */}
        <Path d="M250 0H0v250h250V0z" fill="url(#paint0_radial)" />
        
        {/* Outer circle with gradient border */}
        <Path 
          d="M124.4 18.51c-57.75 0-105.9 48.12-105.9 106.5 0 57.93 47.77 105.1 105.9 105.1 57.63 0 107.1-46.98 107.1-105.1 0-57.82-47.88-106.5-107.1-106.5z" 
          fill="url(#paint1_linear)" 
          stroke="url(#paint1_linear)" 
          strokeMiterlimit="10" 
          strokeWidth="2.703"
        />
        
        {/* Inner circle */}
        <Path 
          d="M123.7 227.4c56.11 0 104.7-46.22 104.7-102.3s-47.37-104-104.7-104c-56.5 0-102.7 46.22-102.7 104 0 56.5 46.19 102.3 102.7 102.3z" 
          fill="url(#paint3_linear)"
        />
        
        {/* FitAI Text */}
        <Path d="M72.38 169.3h25.33v4.42h-19.68v8.3h17.38v4.38h-17.38v11.34h-6.1v-28.44h0.45z" fill="url(#textGradient)" />
        <Path d="M102.1 176.4h6.1v21.34h-5.65v-21.34h-0.45zm3.14-9.48c2.74 0 3.4 1.7 3.4 3.25 0 1.7-1.26 2.82-3.4 2.82-2.36 0-3.23-1.4-3.23-2.95 0-1.54 1.05-3.12 3.23-3.12z" fill="url(#textGradient)" />
        <Path d="M115.9 176.4v-6.08h5.2v6.08h7.3v3.8h-7.3v8.53c0 3.25 1.01 4.7 3.97 4.7 1.26 0 2.61-0.46 3.51-0.96l0.71 4.38c-1.44 0.72-3.66 1.13-5.55 1.13-5.56 0-7.84-2.56-7.84-8.26v-9.48h-4.2v-3.8h4.2v-0.04z" fill="url(#textGradient)" />
        <Path d="M145.7 169.3h6.7l15.51 28.44h-6.7l-3.48-6.62h-17.17l-3.31 6.62h-6.7l15.15-28.44zm-2.83 17.1h12.68l-6.24-12.46h-0.26l-6.18 12.46z" fill="url(#textGradient)" />
        <Path d="M171.4 169.3h5.6v28.44h-5.6v-28.44z" fill="url(#textGradient)" />
        
        {/* Audio waveform bars - simplified for performance */}
        <G stroke="url(#waveGradient)" strokeMiterlimit="10" strokeWidth="1.08">
          <Path d="M57.41 100.4l0.22-0.54h2.47l0.31 0.54v9.26l-0.49 0.5h-2.51l-0.66-0.5v-8.49l0.66-0.77z" />
          <Path d="M191.4 100.4l-0.49-0.54h-1.22l-0.36 0.54v9.26l0.36 0.5h1.71l0.49-0.5v-8.49l-0.49-0.77z" />
          <Path d="M62.92 90.04l0.9-0.63h4.85l0.71 0.63v29.66l-0.87 0.63h-4.9l-0.69-0.63v-29.66z" />
          <Path d="M73.12 84.91l0.91-0.77h5.6l0.91 0.77v40.31l-0.91 0.86h-5.6l-0.91-0.86v-40.31z" />
          <Path d="M84.64 77.61l1.15-1.17h6.61l1.11 1.17v54l-1.11 1.17h-6.61l-1.15-1.17v-54z" />
          <Path d="M155.5 77.61l1.11-1.17h7.3l1.11 1.17v54l-1.11 1.17h-7.3l-1.11-1.17v-54z" />
          <Path d="M168.7 84.91l0.91-0.77h4.9l0.91 0.77v40.31l-0.91 0.86h-4.9l-0.91-0.86v-40.31z" />
          <Path d="M179.6 90.72l0.86-0.68h4.9l0.91 0.68v28.94l-0.91 0.67h-4.9l-0.86-0.67v-28.94z" />
        </G>
        
        {/* Center horizontal bar */}
        <Path d="M96.78 100h55.94v9.35h-55.94v-9.35z" fill="url(#waveGradient)" stroke="url(#waveGradient)" strokeMiterlimit="10" strokeWidth="1.08" />
        
        {/* Radiating lines from center - simplified */}
        <G stroke="url(#waveGradient)" strokeMiterlimit="10" strokeWidth="1.08">
          <Path d="M103.5 113.5v19.34l-9.62 10.39h-21.52" />
          <Path d="M112.4 113.5v20.25l-2.51 3.48-15.16 15.16" />
          <Path d="M120 113.5v22.74l-8.49 10.7" />
          <Path d="M124.3 113.5v39.43" />
          <Path d="M129 113.5v22.74l8.49 10.7" />
          <Path d="M136.9 126.7v6.11l18.81 18.8h15.99" />
          <Path d="M145.4 113.5v18.43l10.33 11.79h19.69" />
          <Path d="M136.9 95.72v-21.34l17.9-17.21h9.11" />
          <Path d="M144.4 95.72v-20.44l12.19-9.76h18.79" />
          <Path d="M129 95.72v-23.09l7.53-9.76" />
          <Path d="M123.9 95.72v-40.09" />
          <Path d="M120 95.72v-23.09l-7.52-10.33" />
          <Path d="M103.7 95.72v-19.99l-9.8-9.76h-20.23" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Step 3: Update Login Screen

    ** File:** `app/login.tsx`

        ** Replace the current logo section with:**

            ```tsx
import { Logo } from '@/components/ui/Logo';

// In your render:
<View style={styles.logoContainer}>
  <Logo width={160} height={160} />
</View>

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
});
```

### Step 4: Update Register Screen

    ** File:** `app/register.tsx`

        ```tsx
import { Logo } from '@/components/ui/Logo';

<View style={styles.logoContainer}>
  <Logo width={140} height={140} />
</View>
```

### Step 5: Update Profile / Settings Header(Optional)

    ** File:** `app/(tabs)/profile.tsx`

        ```tsx
// Add small logo to header
<View style={styles.header}>
  <Logo width={50} height={50} />
  <Text style={styles.headerText}>Profile</Text>
</View>
```

### Step 6: Add to Splash Screen(Optional)

    ** File:** `app/_layout.tsx` or dedicated splash screen

        ```tsx
// While app is loading
<View style={styles.splashContainer}>
  <Logo width={180} height={180} />
  <ActivityIndicator color="#a855f7" size="large" style={{ marginTop: 20 }} />
</View>

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1a1625',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## Sizing Guidelines

    ```tsx
// Different sizes for different contexts
<Logo width={50} height={50} />   // Header/nav (small)
<Logo width={120} height={120} /> // Default
<Logo width={160} height={160} /> // Login/Register (prominent)
<Logo width={200} height={200} /> // Splash/Welcome (large)
```

## Optional: Animated Logo

    ** Create:** `components/ui/AnimatedLogo.tsx`

        ```tsx
import { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Logo } from './Logo';

export function AnimatedLogo({ width = 120, height = 120 }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    
    opacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 600 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Logo width={width} height={height} />
    </Animated.View>
  );
}
```

        ** Usage:**
            ```tsx
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

<AnimatedLogo width={160} height={160} />
```

## Styling Options

### Add Glow Effect
    ```tsx
const styles = StyleSheet.create({
  logoWithGlow: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});

<View style={styles.logoWithGlow}>
  <Logo width={160} height={160} />
</View>
```

### Add Subtle Rotation Animation
    ```tsx
const rotation = useSharedValue(0);

useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 20000 }),
    -1,
    false
  );
}, []);

const rotateStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${ rotation.value } deg` }]
}));
```

## Testing Checklist

    - [] Logo displays correctly on login screen
        - [] Logo displays correctly on register screen
            - [] Logo is sharp and not pixelated
                - [] Colors look good on dark background
                    - [] Logo scales properly on different screen sizes
                        - [] No performance issues(smooth rendering)
                            - [] Works on both iOS and Android
                                - [] Gradient colors match design(purple to cyan)

## Troubleshooting

    ** If gradients don't show:**
        - Make sure react - native - svg is installed
            - Restart metro bundler: `npx expo start --clear`
                - Check that Defs are before Path elements

                    ** If performance is slow:**
                        - Use the simplified version(remove some decorative paths)
                            - Consider using a PNG export for very old devices

## Success Criteria

✅ Logo appears on all authentication screens  
✅ Colors match FitAI brand(purple / cyan gradient)  
✅ Logo is crisp on all device sizes  
✅ No console warnings or errors  
✅ Smooth performance  
✅ Professional appearance  

## Notes

    - The logo has a circular design with gradient background
        - Features an audio waveform visualization in the center
            - "FitAI" text at the bottom
                - Perfectly matches your dark theme(#1a1625)
                    - Purple(#A03EE5) to cyan(#39FFD9) gradient