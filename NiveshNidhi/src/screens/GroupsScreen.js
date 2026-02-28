import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chitGroups, user as userApi } from '../services/api';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import {
  Users,
  Calendar,
  IndianRupee,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react-native';

const PENDING_STORAGE_KEY = 'nn_join_pending_group_ids';

const TAB_JOINED = 'joined';
const TAB_DISCOVER = 'discover';

export default function GroupsScreen({ navigation }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TAB_JOINED);
  const [allGroups, setAllGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [pendingGroupIds, setPendingGroupIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const loadPendingFromStorage = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPendingGroupIds(typeof parsed === 'object' && parsed !== null ? parsed : {});
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const savePendingToStorage = useCallback(async (next) => {
    try {
      await AsyncStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const res = await chitGroups.getAll();
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : (data && Object.values(data)) || [];
      setAllGroups(list);
    } catch (error) {
      console.error(error);
      setAllGroups([]);
      Alert.alert('Error', 'Could not fetch chit groups.');
    }
  }, []);

  const fetchJoined = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('nn_token');
      if (!token) {
        setJoinedGroups([]);
        return;
      }
      const res = await chitGroups.getActiveGroups();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const list = res.data.data;
        setJoinedGroups(list);
        setPendingGroupIds((prev) => {
          const next = { ...prev };
          list.forEach((g) => delete next[g.id]);
          if (Object.keys(next).length !== Object.keys(prev).length) {
            savePendingToStorage(next);
          }
          return next;
        });
      } else {
        setJoinedGroups([]);
      }
    } catch (error) {
      setJoinedGroups([]);
    }
  }, [savePendingToStorage]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await userApi.getMe();
      const user = res.data?.data?.user || res.data?.user || res.data?.data || res.data || {};
      setProfile(user);
    } catch (error) {
      console.error('Profile fetch error (GroupsScreen):', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingFromStorage();
  }, [loadPendingFromStorage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchAll(),
      fetchJoined(),
      fetchProfile(),
    ]).finally(() => {
      if (!cancelled) {
        setLoading(false);
        setRefreshing(false);
      }
    });
    return () => { cancelled = true; };
  }, [fetchAll, fetchJoined, fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchJoined();
    }, [fetchJoined])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAll(),
        fetchJoined(),
        loadPendingFromStorage(),
      ]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchAll, fetchJoined, loadPendingFromStorage]);

  const isPending = (groupId) => Boolean(pendingGroupIds[groupId]);
  const joinedIds = new Set(joinedGroups.map((g) => g.id));

  const listJoined = [
    ...joinedGroups.map((g) => ({ ...g, _status: 'joined' })),
    ...allGroups
      .filter((g) => isPending(g.id) && !joinedIds.has(g.id))
      .map((g) => ({ ...g, _status: 'pending' })),
  ];

  const listDiscover = allGroups.filter((g) => !joinedIds.has(g.id) && !isPending(g.id));

  const handleApplyToGroup = async (group) => {
    const token = await AsyncStorage.getItem('nn_token');
    if (!token) {
      Alert.alert(
        t('auth.login') || 'Login Required',
        t('groups.login_required') || 'Please login to apply for this chit group.',
        [
          { text: t('auth.login') || 'Login', onPress: () => navigation.replace('Auth') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    if (!profileLoading && !profile) {
      Alert.alert('Profile Required', 'We could not load your profile. Please try again from the Profile tab.');
      return;
    }
    const isKycVerified =
      profile?.isKycVerified || profile?.kycVerified || profile?.data?.user?.isKycVerified || false;
    if (!isKycVerified) {
      Alert.alert(
        'KYC Required',
        'KYC verification is required to join. Please complete KYC from the Profile tab.'
      );
      return;
    }
    const groupId = group.id || group._id;
    if (!groupId) {
      Alert.alert('Error', 'Invalid group information.');
      return;
    }
    const userId = profile?.id || profile?._id || profile?.userId;
    if (!userId) {
      Alert.alert('Error', 'Could not determine your account. Please re-login.');
      return;
    }

    setApplyLoadingId(groupId);
    try {
      const res = await chitGroups.applyToJoin(groupId, { userId });
      if (res.data?.success) {
        const next = { ...pendingGroupIds, [groupId]: true };
        setPendingGroupIds(next);
        savePendingToStorage(next);
        setActiveTab(TAB_JOINED);
        Alert.alert('Success', 'Your request has been sent. You can track it under My Groups.');
      } else {
        const msg = res.data?.message || 'Failed to apply.';
        if (msg.toLowerCase().includes('pending')) {
          const next = { ...pendingGroupIds, [groupId]: true };
          setPendingGroupIds(next);
          savePendingToStorage(next);
          setActiveTab(TAB_JOINED);
        }
        Alert.alert('Error', msg);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Failed to apply.';
      if (msg.toLowerCase().includes('pending')) {
        const next = { ...pendingGroupIds, [groupId]: true };
        setPendingGroupIds(next);
        savePendingToStorage(next);
        setActiveTab(TAB_JOINED);
      }
      Alert.alert('Error', msg);
    } finally {
      setApplyLoadingId((prev) => (prev === groupId ? null : prev));
    }
  };

  const openGroupDetails = (groupId) => {
    if (groupId) navigation.navigate('GroupDetails', { groupId });
  };

  const renderJoinedCard = ({ item }) => {
    const groupId = item.id || item._id;
    const status = item._status || 'joined';
    const isPendingStatus = status === 'pending';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => openGroupDetails(groupId)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.badge,
              isPendingStatus ? styles.badgePending : styles.badgeJoined,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isPendingStatus ? styles.badgeTextPending : styles.badgeTextJoined,
              ]}
            >
              {isPendingStatus ? 'Pending' : 'Joined'}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Users size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {item.current_members ?? 0} / {item.member_capacity ?? '—'} members
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <IndianRupee size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>
              ₹{Number(item.chit_value || 0).toLocaleString()} · {item.duration_months ?? '—'} mo
            </Text>
          </View>
        </View>
        {item.organization && (
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <MapPin size={16} color={colors.textMuted} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.organization.city}, {item.organization.state}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.openLabel}>Open group</Text>
          <ChevronRight size={20} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoverCard = ({ item }) => {
    const groupId = item.id || item._id;
    const isLoading = applyLoadingId === groupId;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => openGroupDetails(groupId)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.status && (
            <View style={[styles.badge, styles.badgeOpen]}>
              <Text style={styles.badgeTextOpen}>{item.status === 'OPEN' ? 'Open' : item.status}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Users size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {(item.current_members ?? 0)} / {item.member_capacity ?? '—'} members
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <IndianRupee size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>
              ₹{Number(item.chit_value || 0).toLocaleString()} · {item.duration_months ?? '—'} mo
            </Text>
          </View>
        </View>
        {item.organization && (
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <MapPin size={16} color={colors.textMuted} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.organization.city}, {item.organization.state}
              </Text>
            </View>
          </View>
        )}
        <Button
          title={isLoading ? 'Applying...' : 'Apply to Join'}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleApplyToGroup(item);
          }}
          style={styles.btnApply}
          disabled={isLoading}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyJoined = () => (
    <View style={styles.emptyContainer}>
      <Users size={48} color={colors.textMuted} style={{ opacity: 0.5, marginBottom: 12 }} />
      <Text style={styles.emptyTitle}>No groups yet</Text>
      <Text style={styles.emptyText}>
        Groups you join or apply to will appear here. Switch to Discover to find groups.
      </Text>
    </View>
  );

  const renderEmptyDiscover = () => (
    <View style={styles.emptyContainer}>
      <Users size={48} color={colors.textMuted} style={{ opacity: 0.5, marginBottom: 12 }} />
      <Text style={styles.emptyTitle}>No other groups</Text>
      <Text style={styles.emptyText}>
        You’re in or have applied to all available groups. Check back later.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Chit Groups</Text>
        </View>
        <Text style={styles.headerTitle}>My Groups & Discover</Text>
        <Text style={styles.headerSubtitle}>
          Manage your groups and find new ones near you.
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_JOINED && styles.tabActive]}
          onPress={() => setActiveTab(TAB_JOINED)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === TAB_JOINED && styles.tabTextActive,
            ]}
          >
            My Groups
          </Text>
          {listJoined.length > 0 && (
            <View style={[styles.tabCount, activeTab === TAB_JOINED && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, activeTab === TAB_JOINED && styles.tabCountTextActive]}>
                {listJoined.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_DISCOVER && styles.tabActive]}
          onPress={() => setActiveTab(TAB_DISCOVER)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === TAB_DISCOVER && styles.tabTextActive,
            ]}
          >
            Discover
          </Text>
          {listDiscover.length > 0 && (
            <View style={[styles.tabCount, activeTab === TAB_DISCOVER && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, activeTab === TAB_DISCOVER && styles.tabCountTextActive]}>
                {listDiscover.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : activeTab === TAB_JOINED ? (
        <FlatList
          data={listJoined}
          renderItem={renderJoinedCard}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyJoined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <FlatList
          data={listDiscover}
          renderItem={renderDiscoverCard}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyDiscover}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    elevation: 4,
    shadowOpacity: 0.15,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabCount: {
    marginLeft: 6,
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabCountTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  groupName: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: colors.primary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeJoined: {
    backgroundColor: '#dcfce7',
  },
  badgeTextJoined: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#fef9c3',
  },
  badgeTextPending: {
    color: '#a16207',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeOpen: {
    backgroundColor: colors.primary + '18',
  },
  badgeTextOpen: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  openLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  btnApply: {
    marginTop: 12,
    backgroundColor: '#2563eb',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
