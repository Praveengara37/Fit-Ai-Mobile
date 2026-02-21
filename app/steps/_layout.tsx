import { Stack } from 'expo-router';

export default function StepsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="history" />
            <Stack.Screen name="stats" />
        </Stack>
    );
}
