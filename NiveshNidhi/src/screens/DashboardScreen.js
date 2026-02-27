import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import {
  ShieldCheck,
  Link2,
  ExternalLink,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { user as userApi } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await userApi.getChits();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      } else {
        const data = res.data?.data ?? res.data;
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setTransactions([]);
      Alert.alert('Error', 'Could not load your investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalInvestment = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const uniqueGroupIds = [...new Set(
    transactions
      .map((tx) => tx.escrow_account?.chit_group?.id)
      .filter(Boolean)
  )];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openBlockchain = (hash) => {
    if (hash) {
      const url = `https://amoy.polygonscan.com/tx/${hash}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your portfolio...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Dashboard</Text>
          <Text style={styles.subtitle}>
            Track your Chit Fund investments, Escrow locks, and blockchain transactions.
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Total in Escrow</Text>
            <Text style={styles.balanceValue} numberOfLines={1}>
              ₹{totalInvestment.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.escrowBadge}>
            <ShieldCheck size={16} color={colors.surface} />
            <Text style={styles.escrowText}>Escrow protected</Text>
          </View>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <ShieldCheck size={56} color={colors.textMuted} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No Investments Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven’t joined any Chit Groups yet. Browse groups and make your first contribution.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate?.('GroupsTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseBtnText}>Browse Chit Groups</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {uniqueGroupIds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Active Chit Funds</Text>
                <View style={styles.groupCards}>
                  {uniqueGroupIds.map((groupId) => {
                    const tx = transactions.find(
                      (t) => t.escrow_account?.chit_group?.id === groupId
                    );
                    const group = tx?.escrow_account?.chit_group;
                    if (!group) return null;
                    return (
                      <TouchableOpacity
                        key={groupId}
                        style={styles.groupCard}
                        onPress={() =>
                          navigation.navigate?.('GroupDetails', { groupId })
                        }
                        activeOpacity={0.8}
                      >
                        <View style={styles.groupCardHeader}>
                          <Text style={styles.groupCardName} numberOfLines={1}>
                            {group.name}
                          </Text>
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                          </View>
                        </View>
                        <View style={styles.groupCardRow}>
                          <Text style={styles.groupCardLabel}>Chit Value</Text>
                          <Text style={styles.groupCardVal}>
                            ₹{Number(group.chit_value || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.groupCardRow}>
                          <Text style={styles.groupCardLabel}>Duration</Text>
                          <Text style={styles.groupCardVal}>
                            {group.duration_months ?? '—'} months
                          </Text>
                        </View>
                        <View style={styles.groupCardRow}>
                          <Text style={styles.groupCardLabel}>Members</Text>
                          <Text style={styles.groupCardVal}>
                            {group.current_members ?? 0} / {group.member_capacity ?? '—'}
                          </Text>
                        </View>
                        <View style={styles.viewGroupCta}>
                          <Text style={styles.viewGroupCtaText}>View Group</Text>
                          <ChevronRight size={18} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Ledger</Text>
              <View style={styles.ledgerList}>
                {transactions.map((tx) => {
                  const group = tx.escrow_account?.chit_group;
                  const org = group?.organization;
                  return (
                    <View key={tx.id} style={styles.ledgerCard}>
                      <View style={styles.ledgerMain}>
                        <View style={styles.ledgerHeader}>
                          <Text style={styles.ledgerGroupName} numberOfLines={1}>
                            {group?.name || 'Unknown Group'}
                          </Text>
                          <View style={styles.securedBadge}>
                            <Text style={styles.securedBadgeText}>
                              ₹{Number(tx.amount || 0).toLocaleString('en-IN')} Secured
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.ledgerOrg}>
                          Organized by {org?.name || '—'}
                        </Text>
                        <View style={styles.ledgerDateRow}>
                          <Calendar size={14} color={colors.textMuted} />
                          <Text style={styles.ledgerDate}>
                            Paid on {formatDate(tx.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ledgerMeta}>
                        <View style={styles.escrowStatusRow}>
                          <ShieldCheck size={16} color={colors.success} />
                          <Text style={styles.escrowStatusText}>Funds locked safely</Text>
                        </View>
                        {tx.blockchain_hash ? (
                          <TouchableOpacity
                            style={styles.blockchainRow}
                            onPress={() => openBlockchain(tx.blockchain_hash)}
                          >
                            <Link2 size={14} color={colors.primary} />
                            <Text style={styles.blockchainLink} numberOfLines={1}>
                              View on Polygon
                            </Text>
                            <ExternalLink size={12} color={colors.primary} />
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.blockchainPending}>
                            Blockchain sync pending...
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceTop: {
    marginBottom: 14,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
  },
  balanceValue: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  escrowText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
  },
  groupCards: {
    gap: 14,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  groupCardName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  groupCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupCardLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  groupCardVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  viewGroupCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  viewGroupCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ledgerList: {
    gap: 14,
  },
  ledgerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ledgerMain: {
    marginBottom: 14,
  },
  ledgerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 10,
  },
  ledgerGroupName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  securedBadge: {
    backgroundColor: colors.secondaryLight + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  securedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  ledgerOrg: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  ledgerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ledgerDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  ledgerMeta: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  escrowStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  escrowStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  blockchainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockchainLink: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  blockchainPending: {
    fontSize: 12,
    color: '#b45309',
  },
});
