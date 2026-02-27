import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chitGroups, user as userApi } from '../services/api';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import { Users, Clock } from 'lucide-react-native';

export default function GroupsScreen({ navigation }) {
    const { t } = useTranslation();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [applyLoadingId, setApplyLoadingId] = useState(null);
    const [joinStatusByGroup, setJoinStatusByGroup] = useState({});

    useEffect(() => {
        fetchGroups();
        fetchProfile();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await chitGroups.getAll();
            const fetchedGroups = res.data?.data?.groups || res.data?.data || res.data?.groups || res.data || [];

            // Check if it's an array, else default to empty
            setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : Object.values(fetchedGroups));
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch chit groups from server.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await userApi.getMe();
            const fetchedUser = res.data?.data?.user || res.data?.data || res.data?.user || res.data || {};
            setProfile(fetchedUser);
        } catch (error) {
            // Non-blocking; profile will remain null and auth checks will fallback to navigation
            console.error('Profile fetch error (GroupsScreen):', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchGroups();
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('groups.no_chits')}</Text>
        </View>
    );

    const handleApplyToGroup = async (group) => {
        try {
            const token = await AsyncStorage.getItem('nn_token');
            if (!token) {
                Alert.alert(
                    t('auth.login') || 'Login Required',
                    t('groups.login_required') || 'Please login to apply for this chit group.',
                    [
                        {
                            text: t('auth.login') || 'Login',
                            onPress: () => navigation.replace('Auth'),
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
                return;
            }

            if (!profileLoading && !profile) {
                Alert.alert(
                    'Profile Required',
                    'We could not load your profile details. Please try again from the Profile tab.'
                );
                return;
            }

            const isKycVerified =
                profile?.isKycVerified ||
                profile?.aadhaarVerified ||
                profile?.kycVerified;

            if (!isKycVerified) {
                Alert.alert(
                    'KYC Required',
                    'KYC verification is required to join this chit group. Please complete your KYC from the Profile tab on web.'
                );
                return;
            }

            const groupId = group.id || group._id || group.chit_group_id;
            if (!groupId) {
                Alert.alert('Error', 'Invalid group information. Please try again later.');
                return;
            }

            const userId = profile?.id || profile?._id || profile?.userId;
            if (!userId) {
                Alert.alert('Error', 'Could not determine your user account. Please re-login and try again.');
                return;
            }

            setApplyLoadingId(groupId);

            const payload = { userId };
            const res = await chitGroups.applyToJoin(groupId, payload);

            if (res.data?.success) {
                setJoinStatusByGroup((prev) => ({
                    ...prev,
                    [groupId]: 'pending',
                }));
                Alert.alert('Success', 'Your request to join this chit group has been sent for organizer approval.');
            } else {
                const message = res.data?.message || 'Failed to apply for this chit group.';
                if (message.toLowerCase().includes('pending')) {
                    setJoinStatusByGroup((prev) => ({
                        ...prev,
                        [groupId]: 'pending',
                    }));
                }
                Alert.alert('Error', message);
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to apply for this chit group.';

            if (message.toLowerCase().includes('pending')) {
                const groupId = group.id || group._id || group.chit_group_id;
                if (groupId) {
                    setJoinStatusByGroup((prev) => ({
                        ...prev,
                        [groupId]: 'pending',
                    }));
                }
            }

            Alert.alert('Error', message);
        } finally {
            const groupId = group.id || group._id || group.chit_group_id;
            setApplyLoadingId((prevId) => (prevId === groupId ? null : prevId));
        }
    };

    const renderGroup = ({ item }) => {
        const groupId = item.id || item._id || item.chit_group_id;
        const isPending = groupId && joinStatusByGroup[groupId] === 'pending';
        const isLoading = groupId && applyLoadingId === groupId;

        let buttonLabel = t('groups.apply');
        if (isPending) {
            buttonLabel = 'Request Sent (Awaiting Approval)';
        } else if (isLoading) {
            buttonLabel = 'Applying...';
        }

        return (
            <View style={styles.card}>
                <Text style={styles.groupName}>{item.name}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                        <Users size={20} color={colors.textMuted} />
                        <Text style={styles.infoText}>{item.member_capacity || item.max_members || item.maxMembers} {t('groups.members')}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Clock size={20} color={colors.textMuted} />
                        <Text style={styles.infoText}>{item.duration_months || item.durationMonths} {t('groups.months')}</Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>{t('groups.subscription')}</Text>
                    <Text style={styles.amountVal}>₹{Number(item.chit_value || item.subscription_amount || item.subscriptionAmount || 0).toLocaleString()}/{t('groups.mo')}</Text>
                </View>

                <Button
                    title={buttonLabel}
                    onPress={() => handleApplyToGroup(item)}
                    style={styles.joinBtn}
                    disabled={isPending || isLoading}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{t('home.explore')}</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderGroup}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
    },
    list: {
        paddingBottom: 24,
        gap: 16,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: colors.border,
    },
    amountLabel: {
        color: colors.textMuted,
        fontSize: 14,
    },
    amountVal: {
        color: colors.secondary,
        fontWeight: '700',
        fontSize: 18,
    },
    joinBtn: {
        marginTop: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 16,
    }
});
