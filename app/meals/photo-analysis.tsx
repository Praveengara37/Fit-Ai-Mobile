import { Colors } from '@/constants/Colors';
import { analyzePhoto, saveMealFromPhoto } from '@/lib/meals';
import { DetectedFood } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhotoAnalysisScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [analyzing, setAnalyzing] = useState(true);
    const [results, setResults] = useState<any>(null);
    const [foods, setFoods] = useState<DetectedFood[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (params.imageUri) {
            analyzeImage(params.imageUri as string);
        }
    }, [params.imageUri]);

    async function analyzeImage(uri: string) {
        try {
            const analysis = await analyzePhoto(uri);
            setResults(analysis);
            setFoods(analysis.detectedFoods);

            if (analysis.detectedFoods.length === 0) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                    'No Foods Detected',
                    'Try retaking the photo with better lighting and clearer view.',
                    [
                        { text: 'Retake', onPress: () => router.back() },
                        { text: 'Cancel', style: 'cancel' },
                    ],
                );
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error: any) {
            console.error('Analysis error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                'Analysis Failed',
                error.response?.data?.error || 'Failed to analyze photo. Please try again.',
                [
                    { text: 'Retake', onPress: () => router.back() },
                    { text: 'Cancel', style: 'cancel' },
                ],
            );
        } finally {
            setAnalyzing(false);
        }
    }

    function handleRemoveFood(index: number) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Remove Food', `Remove ${foods[index].detectedName}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => setFoods(foods.filter((_, i) => i !== index)),
            },
        ]);
    }

    function handleAdjustPortion(index: number, multiplier: number) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const newFoods = [...foods];
        const food = { ...newFoods[index] };
        const baseNutrition = food.databaseMatch?.nutrition || food.estimatedNutrition;

        // Always compute from the original results to avoid rounding drift
        const original = results.detectedFoods[index];
        const origNutrition = original.databaseMatch?.nutrition || original.estimatedNutrition;

        const scaled = {
            ...baseNutrition,
            calories: Math.round(origNutrition.calories * multiplier),
            protein: Math.round(origNutrition.protein * multiplier),
            carbs: Math.round(origNutrition.carbs * multiplier),
            fat: Math.round(origNutrition.fat * multiplier),
        };

        if (food.databaseMatch) {
            food.databaseMatch = { ...food.databaseMatch, nutrition: scaled };
        } else {
            food.estimatedNutrition = scaled;
        }

        newFoods[index] = food;
        setFoods(newFoods);
    }

    async function handleSaveMeal() {
        if (foods.length === 0) {
            Alert.alert('Error', 'No foods to save');
            return;
        }

        setSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const foodsToSave = foods.map((food) => {
                const nutrition = food.databaseMatch?.nutrition || food.estimatedNutrition;
                return {
                    foodId: food.databaseMatch?.foodId || 'estimated',
                    foodName: food.databaseMatch?.foodName || food.detectedName,
                    servingSize: nutrition.servingSize,
                    calories: nutrition.calories,
                    protein: nutrition.protein,
                    carbs: nutrition.carbs,
                    fat: nutrition.fat,
                };
            });

            await saveMealFromPhoto(foodsToSave, 'lunch');

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Meal logged successfully!', [
                { text: 'OK', onPress: () => router.push('/meals' as any) },
            ]);
        } catch (error) {
            console.error('Save error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save meal. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    const totalNutrition = foods.reduce(
        (total, food) => {
            const nutrition = food.databaseMatch?.nutrition || food.estimatedNutrition;
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                carbs: total.carbs + nutrition.carbs,
                fat: total.fat + nutrition.fat,
            };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return Colors.success;
            case 'medium':
                return Colors.warning;
            case 'low':
                return '#f97316';
            default:
                return Colors.gray[300];
        }
    };

    const getConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return '✓ High';
            case 'medium':
                return '⚠ Medium';
            case 'low':
                return '⚠️ Low';
            default:
                return '';
        }
    };

    // ── Loading state ──
    if (analyzing) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.purple} />
                <Text style={styles.loadingText}>Analyzing your photo...</Text>
                <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </SafeAreaView>
        );
    }

    // ── No results ──
    if (!results || foods.length === 0) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.purple} />
                </Pressable>
                <Text style={styles.headerTitle}>Review Results</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Photo preview */}
                <Image
                    source={{ uri: params.imageUri as string }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                />

                {/* Disclaimers */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerTitle}>⚠️ Please Review</Text>
                    {results.disclaimers.map((text: string, i: number) => (
                        <Text key={i} style={styles.disclaimerText}>
                            • {text}
                        </Text>
                    ))}
                </View>

                {/* Warnings */}
                {results.warnings && results.warnings.length > 0 && (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>⚠️ Warnings</Text>
                        {results.warnings.map((text: string, i: number) => (
                            <Text key={i} style={styles.warningText}>
                                • {text}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Quality info */}
                <View style={styles.qualityInfo}>
                    <Text style={styles.qualityLabel}>Photo: {results.photoQuality}</Text>
                    <Text style={styles.qualityLabel}>•</Text>
                    <Text style={styles.qualityLabel}>Confidence: {results.overallConfidence}</Text>
                </View>

                {/* Foods */}
                <View style={styles.foodsList}>
                    {foods.map((food, index) => {
                        const nutrition = food.databaseMatch?.nutrition || food.estimatedNutrition;

                        return (
                            <View key={index} style={styles.foodItem}>
                                {/* Header */}
                                <View style={styles.foodHeader}>
                                    <View style={styles.foodTitleRow}>
                                        <Text style={styles.foodName}>
                                            {food.databaseMatch?.foodName || food.detectedName}
                                        </Text>
                                        <Pressable onPress={() => handleRemoveFood(index)}>
                                            <Text style={styles.removeButton}>Remove</Text>
                                        </Pressable>
                                    </View>
                                    <Text
                                        style={[
                                            styles.confidence,
                                            { color: getConfidenceColor(food.confidence) },
                                        ]}
                                    >
                                        {getConfidenceBadge(food.confidence)}
                                    </Text>
                                </View>

                                {/* Nutrition */}
                                <View style={styles.nutritionGrid}>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionLabel}>Calories</Text>
                                        <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionLabel}>Protein</Text>
                                        <Text style={styles.nutritionValue}>{nutrition.protein}g</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionLabel}>Carbs</Text>
                                        <Text style={styles.nutritionValue}>{nutrition.carbs}g</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionLabel}>Fat</Text>
                                        <Text style={styles.nutritionValue}>{nutrition.fat}g</Text>
                                    </View>
                                </View>

                                {/* Serving size */}
                                <Text style={styles.servingSize}>
                                    Serving: {nutrition.servingSize}
                                </Text>

                                {/* Portion adjuster */}
                                <View style={styles.portionAdjuster}>
                                    <Text style={styles.portionLabel}>Adjust portion:</Text>
                                    <View style={styles.portionButtons}>
                                        {[0.5, 1, 1.5, 2].map((mult) => (
                                            <Pressable
                                                key={mult}
                                                style={[
                                                    styles.portionButton,
                                                    mult === 1 && styles.portionButtonActive,
                                                ]}
                                                onPress={() => handleAdjustPortion(index, mult)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.portionButtonText,
                                                        mult === 1 && styles.portionButtonTextActive,
                                                    ]}
                                                >
                                                    {mult}x
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Notes */}
                                {food.notes && (
                                    <Text style={styles.foodNotes}>Note: {food.notes}</Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Add food button */}
                <Pressable
                    style={styles.addFoodButton}
                    onPress={() => router.push('/meals/log' as any)}
                >
                    <Text style={styles.addFoodText}>+ Add missing food manually</Text>
                </Pressable>

                {/* Total */}
                <View style={styles.totalBox}>
                    <Text style={styles.totalTitle}>Total Nutrition</Text>
                    <View style={styles.totalGrid}>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totalNutrition.calories}</Text>
                            <Text style={styles.totalLabel}>Calories</Text>
                        </View>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totalNutrition.protein}g</Text>
                            <Text style={styles.totalLabel}>Protein</Text>
                        </View>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totalNutrition.carbs}g</Text>
                            <Text style={styles.totalLabel}>Carbs</Text>
                        </View>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totalNutrition.fat}g</Text>
                            <Text style={styles.totalLabel}>Fat</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
                <Pressable style={styles.retakeButton} onPress={() => router.back()}>
                    <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </Pressable>
                <Pressable
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveMeal}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Log Meal</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        fontSize: 18,
        color: Colors.foreground,
        marginTop: 16,
    },
    loadingSubtext: {
        fontSize: 14,
        color: Colors.gray[300],
        marginTop: 8,
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    disclaimer: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        marginBottom: 12,
    },
    disclaimerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.warning,
        marginBottom: 6,
    },
    disclaimerText: {
        fontSize: 11,
        color: '#fde047',
        marginBottom: 2,
    },
    warningBox: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
        marginBottom: 12,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f97316',
        marginBottom: 6,
    },
    warningText: {
        fontSize: 11,
        color: '#fb923c',
        marginBottom: 2,
    },
    qualityInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    qualityLabel: {
        fontSize: 12,
        color: Colors.gray[300],
        textTransform: 'capitalize',
    },
    foodsList: {
        gap: 12,
        marginBottom: 12,
    },
    foodItem: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    foodHeader: {
        marginBottom: 12,
    },
    foodTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.foreground,
        flex: 1,
    },
    removeButton: {
        fontSize: 12,
        color: Colors.error,
    },
    confidence: {
        fontSize: 11,
        fontWeight: '500',
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionLabel: {
        fontSize: 10,
        color: Colors.gray[300],
        marginBottom: 2,
    },
    nutritionValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.foreground,
    },
    servingSize: {
        fontSize: 11,
        color: Colors.gray[300],
        marginBottom: 12,
    },
    portionAdjuster: {
        marginBottom: 8,
    },
    portionLabel: {
        fontSize: 12,
        color: Colors.gray[300],
        marginBottom: 6,
    },
    portionButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    portionButton: {
        flex: 1,
        paddingVertical: 8,
        backgroundColor: Colors.background,
        borderRadius: 8,
        alignItems: 'center',
    },
    portionButtonActive: {
        backgroundColor: Colors.purple,
    },
    portionButtonText: {
        fontSize: 12,
        color: Colors.foreground,
    },
    portionButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    foodNotes: {
        fontSize: 11,
        color: Colors.gray[300],
        fontStyle: 'italic',
        marginTop: 8,
    },
    addFoodButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.border,
        alignItems: 'center',
        marginBottom: 16,
    },
    addFoodText: {
        fontSize: 14,
        color: Colors.purple,
    },
    totalBox: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.purple,
    },
    totalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 12,
        textAlign: 'center',
    },
    totalGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    totalItem: {
        alignItems: 'center',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 10,
        color: Colors.gray[300],
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    retakeButton: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    retakeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.foreground,
    },
    saveButton: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.purple,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
