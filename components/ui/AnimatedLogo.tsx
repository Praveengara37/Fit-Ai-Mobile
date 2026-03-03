import { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Logo } from './Logo';

export function AnimatedLogo({ width = 120, height = 120 }: { width?: number, height?: number }) {
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
