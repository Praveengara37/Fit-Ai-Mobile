import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useHealthSync } from '@/hooks/useHealthSync';

export default function HealthSettingsScreen() {
  const { healthSource, syncing, lastSync, syncHealthData } = useHealthSync();

  const getSourceName = () => {
    switch (healthSource) {
      case 'apple_health': return 'Apple Health';
      case 'health_connect': return 'Health Connect';
      case 'pedometer': return 'Device Pedometer';
      case 'none': return 'Not Connected';
    }
  };

  const getSourceIcon = () => {
    switch (healthSource) {
      case 'apple_health': return '🍎';
      case 'health_connect': return '💪';
      case 'pedometer': return '📱';
      case 'none': return '❌';
    }
  };

  const getSourceDescription = () => {
    switch (healthSource) {
      case 'apple_health': 
        return 'Automatically syncing steps and workouts from Apple Health';
      case 'health_connect': 
        return 'Automatically syncing steps and workouts from Health Connect';
      case 'pedometer': 
        return 'Using device sensor for step tracking';
      case 'none': 
        return 'No health data source connected';
    }
  };

  const handleSync = async () => {
    try {
      await syncHealthData();
      Alert.alert('Success', 'Health data synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync health data. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Data Connection</Text>
      </View>

      {/* Current Source */}
      <View style={styles.card}>
        <View style={styles.sourceHeader}>
          <Text style={styles.sourceIcon}>{getSourceIcon()}</Text>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceName}>{getSourceName()}</Text>
            <Text style={styles.sourceDescription}>{getSourceDescription()}</Text>
          </View>
        </View>

        {healthSource !== 'none' && (
          <>
            {lastSync && (
              <Text style={styles.lastSync}>
                Last synced: {lastSync.toLocaleString()}
              </Text>
            )}

            <Pressable
              style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.syncButtonText}>Sync Now</Text>
              )}
            </Pressable>
          </>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📊 What we sync:</Text>
        <Text style={styles.infoText}>• Daily step count</Text>
        <Text style={styles.infoText}>• Workouts (running, cycling, gym)</Text>
        <Text style={styles.infoText}>• Active calories burned</Text>
        <Text style={styles.infoText}>• Heart rate (if available)</Text>
      </View>

      {/* Privacy */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>🔒 Privacy</Text>
        <Text style={styles.privacyText}>
          Your health data is read locally from your device and securely sent to FitAI's servers. 
          We never share your health data with third parties.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5e5e5',
  },
  card: {
    backgroundColor: '#2a2235',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 16,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  lastSync: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  syncButton: {
    backgroundColor: '#a855f7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#2a2235',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 6,
  },
  privacyCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
});
