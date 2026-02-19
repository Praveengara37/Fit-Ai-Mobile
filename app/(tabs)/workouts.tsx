import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Workouts() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Workouts</Text>
                <Text style={styles.subtitle}>Workout tracking coming soon!</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.purple, marginBottom: 8 },
    subtitle: { fontSize: 16, color: Colors.gray[300] },
});
