import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export function confirmDelete(
    title: string,
    message: string,
    onConfirm: () => Promise<void> | void
) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
                await onConfirm();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
        },
    ]);
}

export function confirmAction(
    title: string,
    message: string,
    confirmLabel: string,
    onConfirm: () => Promise<void> | void
) {
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
            text: confirmLabel,
            onPress: async () => {
                await onConfirm();
            },
        },
    ]);
}
