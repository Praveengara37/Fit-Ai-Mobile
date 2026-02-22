import AddedFoodItem from '@/components/meals/AddedFoodItem';
import FoodResult from '@/components/meals/FoodResult';
import MealTypeSelector from '@/components/meals/MealTypeSelector';
import RecentFoodCard from '@/components/meals/RecentFoodCard';
import ServingSizeModal from '@/components/meals/ServingSizeModal';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { getRecentFoods, logMeal, saveRecentFoods, searchFoods } from '@/lib/meals';
import { Food, MealFood } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogMealScreen() {
    const params = useLocalSearchParams<{ type?: string }>();
    const [mealType, setMealType] = useState(params.type || 'breakfast');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[]>([]);
    const [addedFoods, setAddedFoods] = useState<MealFood[]>([]);
    const [recentFoods, setRecentFoods] = useState<Food[]>([]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    // Serving size modal
    const [modalFood, setModalFood] = useState<Food | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadRecent();
    }, []);

    const loadRecent = async () => {
        const foods = await getRecentFoods();
        setRecentFoods(foods);
    };

    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
            if (debounceRef.current) clearTimeout(debounceRef.current);

            if (text.length < 2) {
                setResults([]);
                return;
            }

            debounceRef.current = setTimeout(async () => {
                setSearching(true);
                try {
                    const data = await searchFoods(text, 10);
                    setResults(data);
                } catch {
                    Alert.alert('Error', 'Failed to search foods');
                } finally {
                    setSearching(false);
                }
            }, 300);
        },
        [],
    );

    const handleAddFood = (food: Food) => {
        setEditIndex(null);
        setModalFood(food);
    };

    const handleModalConfirm = (mealFood: MealFood) => {
        if (editIndex !== null) {
            // Editing existing
            setAddedFoods((prev) => prev.map((f, i) => (i === editIndex ? mealFood : f)));
        } else {
            setAddedFoods((prev) => [...prev, mealFood]);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setModalFood(null);
        setEditIndex(null);
    };

    const handleEditFood = (index: number) => {
        const food = addedFoods[index];
        setEditIndex(index);
        setModalFood({
            foodId: food.foodId || '',
            name: food.foodName,
            brandName: food.brandName,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            servingSize: food.servingSize,
            servingUnit: food.servingUnit,
        });
    };

    const handleRemoveFood = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAddedFoods((prev) => prev.filter((_, i) => i !== index));
    };

    const totalCalories = addedFoods.reduce((sum, f) => sum + f.calories, 0);

    const handleSave = async () => {
        if (addedFoods.length === 0) return;
        setSaving(true);
        try {
            await logMeal({
                mealType: mealType as any,
                date: new Date().toISOString().split('T')[0],
                foods: addedFoods,
            });
            await saveRecentFoods(addedFoods);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch {
            Alert.alert('Saved Offline', 'Meal saved locally and will sync when you\'re back online.');
            router.back();
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Log Meal</Text>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Meal type */}
                    <MealTypeSelector value={mealType} onChange={setMealType} />

                    {/* Search */}
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={Colors.gray[400]} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search food..."
                            placeholderTextColor={Colors.gray[400]}
                            value={query}
                            onChangeText={handleSearch}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => { setQuery(''); setResults([]); }}>
                                <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
                            </Pressable>
                        )}
                    </View>

                    {/* Recent foods */}
                    {query.length < 2 && (
                        <RecentFoodCard foods={recentFoods} onQuickAdd={handleAddFood} />
                    )}

                    {/* Loading */}
                    {searching && (
                        <ActivityIndicator color={Colors.purple} style={{ marginVertical: 16 }} />
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Search Results</Text>
                            {results.map((food, idx) => (
                                <FoodResult key={`${food.foodId}-${idx}`} food={food} onAdd={() => handleAddFood(food)} />
                            ))}
                        </View>
                    )}

                    {/* No results */}
                    {query.length >= 2 && !searching && results.length === 0 && (
                        <Text style={styles.noResults}>No foods found for "{query}"</Text>
                    )}

                    {/* Added foods */}
                    {addedFoods.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Added ({addedFoods.length} foods)</Text>
                            {addedFoods.map((food, idx) => (
                                <AddedFoodItem
                                    key={idx}
                                    food={food}
                                    onRemove={() => handleRemoveFood(idx)}
                                    onEdit={() => handleEditFood(idx)}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.totalText}>
                        Total: {Math.round(totalCalories)} calories
                    </Text>
                    <Button
                        title="Save Meal"
                        onPress={handleSave}
                        disabled={addedFoods.length === 0}
                        loading={saving}
                    />
                </View>
            </KeyboardAvoidingView>

            <ServingSizeModal
                visible={!!modalFood}
                food={modalFood}
                onClose={() => { setModalFood(null); setEditIndex(null); }}
                onConfirm={handleModalConfirm}
            />
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
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontWeight: '700',
        color: Colors.foreground,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.foreground,
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.foreground,
        marginBottom: 10,
    },
    noResults: {
        textAlign: 'center',
        color: Colors.gray[400],
        fontSize: 14,
        marginTop: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.card,
    },
    totalText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.foreground,
        textAlign: 'center',
        marginBottom: 12,
    },
});
