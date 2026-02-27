import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, type = 'primary', style }) {
    const getBackgroundColor = () => {
        switch (type) {
            case 'primary': return colors.primary;
            case 'secondary': return colors.secondary;
            case 'accent': return colors.accent;
            case 'outline': return 'transparent';
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (type === 'outline') return colors.primary;
        return colors.surface;
    };

    const getBorder = () => {
        if (type === 'outline') return { borderWidth: 1, borderColor: colors.primary };
        return {};
    }

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: getBackgroundColor() }, getBorder(), style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    }
});
