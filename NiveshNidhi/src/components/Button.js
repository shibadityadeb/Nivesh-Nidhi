import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, type = 'primary', style, disabled }) {
    const getGradientColors = () => {
        switch (type) {
            case 'primary': return [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];
            case 'secondary': return [colors.gradientSecondaryStart, colors.gradientSecondaryEnd];
            case 'accent': return [colors.gradientAccentStart, colors.gradientAccentEnd];
            default: return [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];
        }
    };

    const getTextColor = () => {
        if (type === 'outline') return colors.primary;
        return colors.surface;
    };

    const getBorder = () => {
        if (type === 'outline') return { borderWidth: 2, borderColor: colors.primary };
        return {};
    };

    if (type === 'outline') {
        return (
            <TouchableOpacity
                style={[styles.button, getBorder(), style, disabled && styles.disabled]}
                onPress={onPress}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled}
            style={[styles.buttonWrapper, style, disabled && styles.disabled]}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        backgroundColor: colors.surface,
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.5,
    },
});
