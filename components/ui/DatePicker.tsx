import React from 'react';
import Input from './Input';

interface DatePickerProps {
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
    error?: string;
}

export default function DatePicker({ label, value, onChange, error }: DatePickerProps) {
    const handleTextChange = (text: string) => {
        // Enforce YYYY-MM-DD pattern validation simply for now
        let formatted = text.replace(/[^0-9-]/g, '');

        // Auto-insert hyphens
        if (formatted.length > 4 && formatted[4] !== '-') {
            formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
        }
        if (formatted.length > 7 && formatted[7] !== '-') {
            formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
        }

        // Limit to 10 chars (YYYY-MM-DD)
        formatted = formatted.slice(0, 10);

        onChange(formatted);
    };

    return (
        <Input
            label={label}
            value={value || ''}
            onChangeText={handleTextChange}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            error={error}
        />
    );
}
