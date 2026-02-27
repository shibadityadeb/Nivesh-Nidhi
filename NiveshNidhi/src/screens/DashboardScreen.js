import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, PieChart } from 'lucide-react-native';
import { user, escrow } from '../services/api';

export default function DashboardScreen() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [totalInvestment, setTotalInvestment] = useState(0);
    const [activeGroups, setActiveGroups] = useState(0);
    const [nextPayout, setNextPayout] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);

    const fetchDashboardData = async () => {
        try {
            // Fetch user's joined chit groups
            const userChitsRes = await user.getChits();
            let chits = userChitsRes.data?.data?.chits || userChitsRes.data?.data || userChitsRes.data?.chits || userChitsRes.data || [];

            if (!Array.isArray(chits)) {
                chits = Object.values(chits).filter(val => typeof val === 'object');
            }

            setActiveGroups(chits.length);

            // Calculate aggregate metrics based on joined groups
            let calculatedTotal = 0;
            let expectedPayout = 0;
            const activities = [];

            chits.forEach((chit) => {
                const groupInfo = chit.ChitGroup || {};
                calculatedTotal += parseFloat(groupInfo.subscriptionAmount || 0);
                expectedPayout += parseFloat(groupInfo.poolAmount || 0);

                activities.push({
                    id: chit.id,
                    title: t('dashboard.joined_group'),
                    sub: groupInfo.name || t('dashboard.unknown_chit'),
                    amount: t('dashboard.active'),
                    type: 'join'
                });
            });

            setTotalInvestment(calculatedTotal);
            setNextPayout(expectedPayout > 0 ? expectedPayout / chits.length : 0);
            setRecentActivity(activities.slice(0, 5)); // Keep latest 5

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            Alert.alert("Error", "Could not fetch dashboard metrics.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <Text style={styles.title}>{t('home.dashboard')}</Text>

                <View style={styles.balanceCard}>
                    <View>
                        <Text style={styles.balanceLabel}>{t('dashboard.total_investments')}</Text>
                        <Text style={styles.balanceValue}>₹{totalInvestment.toLocaleString()}</Text>
                    </View>
                    <View style={styles.escrowBadge}>
                        <ShieldCheck size={16} color={colors.surface} />
                        <Text style={styles.escrowText}>{t('dashboard.escrow_protected')}</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <View style={[styles.iconWrapper, { backgroundColor: colors.accentLight + '20' }]}>
                            <ArrowUpRight size={20} color={colors.accent} />
                        </View>
                        <Text style={styles.statLabel}>{t('dashboard.est_payout')}</Text>
                        <Text style={styles.statAmount}>₹{nextPayout.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={[styles.iconWrapper, { backgroundColor: colors.secondaryLight + '20' }]}>
                            <PieChart size={20} color={colors.secondary} />
                        </View>
                        <Text style={styles.statLabel}>{t('dashboard.active_groups')}</Text>
                        <Text style={styles.statAmount}>{activeGroups}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('dashboard.recent_activity')}</Text>
                <View style={styles.activityCard}>
                    {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                        <View key={activity.id || index} style={[styles.activityItem, index === recentActivity.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={[styles.activityIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                                <ArrowDownLeft size={20} color={colors.primary} />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activitySub}>{activity.sub}</Text>
                            </View>
                            <Text style={[styles.activityAmount, { color: colors.primary }]}>{activity.amount}</Text>
                        </View>
                    )) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: colors.textMuted }}>{t('dashboard.no_activity')}</Text>
                        </View>
                    )}
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 20,
    },
    balanceCard: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    balanceLabel: {
        color: colors.textMuted,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 4,
    },
    balanceValue: {
        color: colors.surface,
        fontSize: 32,
        fontWeight: '700',
    },
    escrowBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    escrowText: {
        color: colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statLabel: {
        color: colors.textMuted,
        fontSize: 14,
        marginBottom: 4,
    },
    statAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
    },
    activityCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accentLight + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    activitySub: {
        fontSize: 14,
        color: colors.textMuted,
    },
    activityAmount: {
        fontSize: 16,
        fontWeight: '700',
    }
});
