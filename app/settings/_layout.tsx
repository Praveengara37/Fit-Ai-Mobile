import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="nutrition-goals" />
            <Stack.Screen name="step-goals" />
            <Stack.Screen name="recommendations" />
        </Stack>
    );
}
