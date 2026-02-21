import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function OfflineBar() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            // NetInfo state might be initially unknown, so we check explicit false
            if (state.isConnected === false) {
                setIsOffline(true);
            } else {
                setIsOffline(false);
            }
        });
        return unsubscribe;
    }, []);

    if (!isOffline) return null;

    return (
        <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>📡 Offline - Steps will sync when online</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    offlineBar: {
        backgroundColor: '#ef4444',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 50,
        elevation: 5,
    },
    offlineText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
