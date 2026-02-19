import { Colors } from '@/constants/Colors';
import { StyleSheet, Text } from 'react-native';

export default function Logo() {
    return <Text style={styles.logo}>FitAI</Text>;
}

const styles = StyleSheet.create({
    logo: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.purple,
        textAlign: 'center',
    },
});
