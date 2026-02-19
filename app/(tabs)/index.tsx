import { useAuth } from '@/components/AuthProvider';
import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.fullName || 'User'}!</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Steps Today</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Calories</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>0</Text>
            <Text style={styles.cardLabel}>Workouts</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, color: Colors.gray[300] },
  name: { fontSize: 36, fontWeight: 'bold', color: Colors.purple, marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: Colors.cyan, marginBottom: 8 },
  cardLabel: { fontSize: 14, color: Colors.gray[300] },
});
