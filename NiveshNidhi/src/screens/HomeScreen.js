import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Users, TrendingUp, ChevronRight, FileText, User, BrainCircuit } from 'lucide-react-native';
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
        { icon: BrainCircuit, value: "AI Intelligence", label: t('home.continuous_monitoring') },
        { icon: Shield, value: t('home.blockchain'), label: t('home.secured_by') },
        { icon: TrendingUp, value: "Escrow", label: t('home.funds_managed') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Tricolor Header */}
            <View style={styles.tricolorHeader}>
                <View style={[styles.tricolorBar, { backgroundColor: colors.secondary }]} />
                <View style={[styles.tricolorBar, { backgroundColor: colors.surface }]} />
                <View style={[styles.tricolorBar, { backgroundColor: colors.accent }]} />
            </View>

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
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[colors.gradientSecondaryStart, colors.gradientSecondaryEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatar}
                        >
                            <User size={24} color={colors.surface} />
                        </LinearGradient>
                    </View>
                </View>

                {/* Hero / Banner Card */}
                <LinearGradient
                    colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroContent}>
                        <View style={styles.badge}>
                            <Shield size={14} color={colors.secondary} />
                            <Text style={styles.badgeText}>{t('home.badge_govt')}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{t('home.hero_title')}</Text>
                        <Text style={styles.heroSub}>{t('home.hero_sub')}</Text>

                        <TouchableOpacity 
                            style={styles.heroBtnWrapper} 
                            onPress={() => navigation.navigate('GroupsTab')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.gradientSecondaryStart, colors.gradientSecondaryEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.heroBtn}
                            >
                                <Text style={styles.heroBtnText}>{t('home.explore_btn')}</Text>
                                <ChevronRight size={16} color={colors.surface} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{t('home.quick_actions')}</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('GroupsTab')} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.lightPrimary }]}>
                            <Users size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.actionLabel}>{t('home.join_group')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('DashboardTab')} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.lightAccent }]}>
                            <TrendingUp size={24} color={colors.accent} />
                        </View>
                        <Text style={styles.actionLabel}>{t('home.my_dashboard')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('GovSchemes')} activeOpacity={0.7}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.lightSecondary }]}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tricolorHeader: {
        flexDirection: 'row',
        height: 4,
    },
    tricolorBar: {
        flex: 1,
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
        fontSize: 26,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    avatarContainer: {
        borderRadius: 28,
        elevation: 4,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        position: 'relative',
    },
    heroImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.15,
    },
    heroContent: {
        padding: 24,
        position: 'relative',
        zIndex: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 153, 51, 0.2)',
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
        fontWeight: '700',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.surface,
        marginBottom: 8,
        lineHeight: 36,
    },
    heroSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 24,
        lineHeight: 20,
    },
    heroBtnWrapper: {
        borderRadius: 30,
        overflow: 'hidden',
        alignSelf: 'flex-start',
        elevation: 4,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    heroBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    heroBtnText: {
        color: colors.surface,
        fontWeight: '700',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
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
        width: 68,
        height: 68,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: colors.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
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
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'center',
        fontWeight: '600',
    }
});
