import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function Input({ placeholder, value, onChangeText, secureTextEntry, keyboardType, label, style, autoCapitalize, maxLength }) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, style]}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize || 'none'}
                maxLength={maxLength}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.surface,
    }
});
