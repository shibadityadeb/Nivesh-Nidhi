import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import Input from '../components/Input';
import { auth } from '../services/api';

export default function AuthScreen({ navigation }) {
    const { t } = useTranslation();
    const [isSignUp, setIsSignUp] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(false);

    // Form State
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleAuth = async () => {
        setLoading(true);
        setError("");

        try {
            let res;
            if (isSignUp) {
                res = await auth.signup({ name, email, phone, password });
            } else {
                res = await auth.login({ email, password });
            }

            // Save token
            const token = res.data?.data?.token || res.data?.token;

            if (token) {
                await AsyncStorage.setItem('nn_token', token);
                navigation.replace('AppLayout');
            } else {
                setError("No authentication token received from server.");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "An authentication error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleSwitch = () => {
        setIsSignUp(!isSignUp);
        setError("");
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isSignUp ? "Join the ChitFund platform" : "Sign in to your account"}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {isSignUp && (
                            <View style={styles.inputWrapper}>
                                <User size={20} color={colors.textMuted} style={styles.icon} />
                                <Input
                                    placeholder="Full Name"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.inputWithIcon}
                                    autoCapitalize="words"
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <Mail size={20} color={colors.textMuted} style={styles.icon} />
                            <Input
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={styles.inputWithIcon}
                            />
                        </View>

                        {isSignUp && (
                            <View style={styles.inputWrapper}>
                                <Phone size={20} color={colors.textMuted} style={styles.icon} />
                                <Input
                                    placeholder="Phone Number (10-digit Indian)"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    style={styles.inputWithIcon}
                                    maxLength={10}
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <Lock size={20} color={colors.textMuted} style={styles.icon} />
                            <Input
                                placeholder={isSignUp ? "Password (min 8 chars)" : "Password"}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                style={styles.inputWithIcon}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <AlertCircle size={16} color={colors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            title={loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                            onPress={handleAuth}
                            style={styles.submitBtn}
                        />

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchText}>
                                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            </Text>
                            <TouchableOpacity onPress={handleSwitch}>
                                <Text style={styles.switchLink}>
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center'
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMuted,
    },
    form: {
        gap: 16,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    icon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        zIndex: 1,
        padding: 4,
    },
    inputWithIcon: {
        paddingLeft: 40,
        paddingRight: 40,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '10', // 10% opacity
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.error + '30',
        gap: 8,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        flex: 1,
    },
    submitBtn: {
        marginTop: 8,
        backgroundColor: colors.primary, // Using navy directly
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    switchText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    switchLink: {
        color: colors.secondary, // Saffron
        fontSize: 14,
        fontWeight: '600',
    }
});
