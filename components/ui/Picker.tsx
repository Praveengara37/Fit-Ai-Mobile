import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PickerOption {
    label: string;
    value: string;
}

interface PickerProps {
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
    options: PickerOption[];
    error?: string;
}

export default function Picker({ label, value, onChange, options, error }: PickerProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (val: string) => {
        onChange(val);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.input, error && styles.inputError]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.inputText, !selectedOption && styles.placeholder]}>
                    {selectedOption ? selectedOption.label : `Select ${label}`}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.gray[300]} />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.foreground} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item.value === value && styles.optionItemSelected,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Ionicons name="checkmark" size={20} color={Colors.purple} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { color: Colors.gray[300], marginBottom: 8, fontSize: 14, fontWeight: '500' },
    input: {
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        color: Colors.foreground,
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputError: { borderColor: Colors.error },
    inputText: { color: Colors.foreground, fontSize: 16, flex: 1 },
    placeholder: { color: Colors.gray[400] },
    errorText: { color: Colors.error, fontSize: 12, marginTop: 4 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    modalTitle: { color: Colors.foreground, fontSize: 18, fontWeight: 'bold' },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.card,
    },
    optionItemSelected: { backgroundColor: Colors.card },
    optionText: { color: Colors.foreground, fontSize: 16 },
    optionTextSelected: { color: Colors.purple, fontWeight: 'bold' },
});
