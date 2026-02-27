import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Users, TrendingUp, ChevronRight, FileText } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { user } from '../services/api';

export default function HomeScreen({ navigation }) {
    const { t } = useTranslation();
    const [userName, setUserName] = useState("User");

    const [refreshing, setRefreshing] = useState(false);

    const fetchName = async () => {
        try {
            const res = await user.getMe();
            const fetchedUser = res.data?.data?.user || res.data?.user || res.data?.data || res.data;
            if (fetchedUser?.name) {
                setUserName(fetchedUser.name.split(' ')[0]);
            }
        } catch (error) {
            // Ignore
        }
    };

    useEffect(() => {
        fetchName();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchName();
        setRefreshing(false);
    };

    const stats = [
        { icon: Users, value: "108,000+", label: t('home.happy_subscribers') },
        { icon: Shield, value: t('home.blockchain'), label: t('home.secured_by') },
        { icon: TrendingUp, value: "₹50Cr+", label: t('home.funds_managed') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >

                {/* Header Profile Area */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{t('home.greeting', { name: userName })}</Text>
                        <Text style={styles.subtitle}>{t('home.welcome_sub')}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <UserIcon />
                    </View>
                </View>

                {/* Hero / Banner Card aligned with Web HeroSection */}
                <View style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <View style={styles.badge}>
                            <Shield size={14} color={colors.secondary} />
                            <Text style={styles.badgeText}>{t('home.badge_govt')}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{t('home.hero_title')}</Text>
                        <Text style={styles.heroSub}>{t('home.hero_sub')}</Text>

                        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('GroupsTab')}>
                            <Text style={styles.heroBtnText}>{t('home.explore_btn')}</Text>
                            <ChevronRight size={16} color={colors.surface} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{t('home.quick_actions')}</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('GroupsTab')}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                            <Users size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.actionLabel}>{t('home.join_group')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('DashboardTab')}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.accentLight + '20' }]}>
                            <TrendingUp size={24} color={colors.accent} />
                        </View>
                        <Text style={styles.actionLabel}>{t('home.my_dashboard')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.secondaryLight + '20' }]}>
                            <FileText size={24} color={colors.secondary} />
                        </View>
                        <Text style={styles.actionLabel}>{t('home.schemes')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Platform Stats */}
                <Text style={styles.sectionTitle}>{t('home.platform_overview')}</Text>
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statBox}>
                            <stat.icon size={28} color={colors.secondary} style={styles.statIcon} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const UserIcon = () => (
    <View style={styles.userIconPlaceholder}>
        <User size={24} color={colors.primary} />
    </View>
);

import { User } from 'lucide-react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    heroContent: {
        padding: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary + '20',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
        gap: 6,
    },
    badgeText: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.surface,
        marginBottom: 8,
        lineHeight: 34,
    },
    heroSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 24,
        lineHeight: 20,
    },
    heroBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    heroBtnText: {
        color: colors.surface,
        fontWeight: '700',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionItem: {
        alignItems: 'center',
        width: '30%',
    },
    actionIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
    }
});
