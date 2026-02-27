import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { User, ShieldCheck, Settings, LogOut, ChevronRight, Bell, FileText, Briefcase } from 'lucide-react-native';
import { user } from '../services/api';

export default function ProfileScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await user.getMe();
            // In case of the backend envelope, it's often res.data.data.user
            const fetchedUser = res.data?.data?.user || res.data?.data || res.data?.user || res.data || {};
            setProfileData(fetchedUser);
        } catch (error) {
            console.error('Profile fetch error:', error);
            // Non-critical, just keep as null or empty
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = async (lng) => {
        i18n.changeLanguage(lng);
        await AsyncStorage.setItem('settings.lang', lng);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('nn_token');
        navigation.replace('Auth');
    };

    const SettingRow = ({ icon: Icon, title, subtitle, onPress, rightElement }) => (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.settingIconBox}>
                <Icon size={20} color={colors.primary} />
            </View>
            <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement ? rightElement : (
                onPress ? <ChevronRight size={20} color={colors.textMuted} /> : null
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <User size={32} color={colors.surface} />
                    </View>
                    <View style={styles.profileInfo}>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.surface} style={{ alignSelf: 'flex-start' }} />
                        ) : (
                            <>
                                <Text style={styles.profileName}>{profileData?.name || "Nivesh Nidhi User"}</Text>
                                <Text style={styles.profileEmail}>{profileData?.email || profileData?.phoneNumber || t('profile.verify_email')}</Text>
                            </>
                        )}
                        <View style={styles.badgeContainer}>
                            <ShieldCheck size={14} color={colors.accent} />
                            <Text style={styles.badgeText}>{profileData?.isKycVerified ? t('profile.kyc_verified') : t('profile.kyc_pending')}</Text>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
                <View style={styles.sectionCard}>
                    <SettingRow
                        icon={User}
                        title={t('profile.personal_info')}
                        onPress={() => Alert.alert("Coming Soon", "Personal info management is currently under development.")}
                    />

                    <View style={styles.divider} />
                    <SettingRow
                        icon={FileText}
                        title={t('profile.kyc_docs')}
                        onPress={() => Alert.alert("Coming Soon", "KYC documents uploaded successfully via Web.")}
                    />
                </View>

                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
                <View style={styles.sectionCard}>
                    <SettingRow
                        icon={Bell}
                        title={t('profile.push_notifications')}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#767577', true: colors.primaryLight }}
                                thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
                            />
                        }
                    />
                    <View style={styles.divider} />
                    <View style={styles.languageSection}>
                        <View style={styles.languageHeader}>
                            <View style={styles.settingIconBox}>
                                <Settings size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.settingTitle}>{t('profile.app_language')}</Text>
                        </View>
                        <View style={styles.langList}>
                            <TouchableOpacity
                                style={[styles.langBtn, i18n.language === 'en' && styles.activeLangBtn]}
                                onPress={() => changeLanguage('en')}
                            >
                                <Text style={[styles.langText, i18n.language === 'en' && styles.activeLangText]}>
                                    English
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.langBtn, i18n.language === 'mr' && styles.activeLangBtn]}
                                onPress={() => changeLanguage('mr')}
                            >
                                <Text style={[styles.langText, i18n.language === 'mr' && styles.activeLangText]}>
                                    मराठी
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.langBtn, i18n.language === 'hi' && styles.activeLangBtn]}
                                onPress={() => changeLanguage('hi')}
                            >
                                <Text style={[styles.langText, i18n.language === 'hi' && styles.activeLangText]}>
                                    हिन्दी
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color={colors.error} />
                    <Text style={styles.logoutText}>{t('profile.log_out')}</Text>
                </TouchableOpacity>

                <Text style={styles.appVersion}>{t('profile.version')} v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: 24,
        borderRadius: 20,
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.surface,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    settingIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primaryLight + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTextContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    settingSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 64,
    },
    languageSection: {
        padding: 16,
    },
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    langList: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 48,
    },
    langBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    activeLangBtn: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    langText: {
        color: colors.textMuted,
        fontWeight: '500',
    },
    activeLangText: {
        color: colors.primary,
        fontWeight: '700',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '10',
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
        gap: 8,
    },
    logoutText: {
        color: colors.error,
        fontWeight: '700',
        fontSize: 16,
    },
    appVersion: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 24,
    }
});
