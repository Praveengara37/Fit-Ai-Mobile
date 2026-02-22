import { Stack } from 'expo-router';

export default function MealsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="log" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
