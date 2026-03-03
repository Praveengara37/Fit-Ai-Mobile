import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export async function requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert(
            'Camera Permission Required',
            'FitAI needs camera access to analyze your meals. Please enable it in Settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
        );
        return false;
    }

    return true;
}

export async function requestPhotoLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert(
            'Photo Library Permission Required',
            'FitAI needs access to your photo library to select meal photos.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
        );
        return false;
    }

    return true;
}
