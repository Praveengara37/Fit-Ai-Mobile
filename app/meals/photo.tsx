import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhotoCaptureScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function requestPermissions() {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'FitAI needs camera and photo library access to analyze your meals.',
                [{ text: 'OK' }],
            );
            return false;
        }
        return true;
    }

    async function takePhoto() {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            setLoading(true);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                    pathname: '/meals/photo-analysis',
                    params: { imageUri: result.assets[0].uri },
                } as any);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function selectFromGallery() {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            setLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                    pathname: '/meals/photo-analysis',
                    params: { imageUri: result.assets[0].uri },
                } as any);
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to select photo. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.purple} />
                </Pressable>
                <Text style={styles.headerTitle}>Photo Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>📷</Text>
                <Text style={styles.title}>Take a Photo of Your Meal</Text>
                <Text style={styles.subtitle}>
                    AI will identify foods and estimate calories automatically
                </Text>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <Pressable style={styles.primaryButton} onPress={takePhoto} disabled={loading}>
                        <Ionicons name="camera" size={22} color="#fff" />
                        <Text style={styles.primaryButtonText}>Take Photo</Text>
                    </Pressable>

                    <Pressable style={styles.secondaryButton} onPress={selectFromGallery} disabled={loading}>
                        <Ionicons name="images" size={22} color={Colors.foreground} />
                        <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
                    </Pressable>
                </View>

                {/* Tips */}
                <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>📸 Tips for best results:</Text>
                    <Text style={styles.tipItem}>• Take photo from above (bird's eye view)</Text>
                    <Text style={styles.tipItem}>• Use good lighting</Text>
                    <Text style={styles.tipItem}>• Keep foods separated on plate</Text>
                    <Text style={styles.tipItem}>• Avoid blurry or dark images</Text>
                    <Text style={styles.tipItem}>• Simple foods work best</Text>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        ⚠️ AI estimates may vary by ±20%. You'll be able to review and adjust before saving.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.foreground,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 80,
        textAlign: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.foreground,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.gray[300],
        textAlign: 'center',
        marginBottom: 40,
    },
    actions: {
        gap: 12,
        marginBottom: 40,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.purple,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 8,
    },
    secondaryButtonText: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: '600',
    },
    tips: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 8,
    },
    tipItem: {
        fontSize: 12,
        color: Colors.gray[300],
        marginBottom: 4,
    },
    disclaimer: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    disclaimerText: {
        fontSize: 11,
        color: Colors.warning,
        textAlign: 'center',
    },
});
