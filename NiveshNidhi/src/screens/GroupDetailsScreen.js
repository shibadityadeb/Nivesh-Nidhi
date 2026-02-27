import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Users, Calendar, IndianRupee, ShieldCheck } from 'lucide-react-native';
import { chitGroups, escrow, user as userApi } from '../services/api';
import { colors } from '../theme/colors';
import Button from '../components/Button';

function getRazorpayCheckout() {
  try {
    // react-native-razorpay is a native module; not available in Expo Go.
    // eslint-disable-next-line global-require
    const mod = require('react-native-razorpay');
    const Razorpay = mod?.default ?? mod;
    if (Razorpay && typeof Razorpay.open === 'function') return Razorpay;
    return null;
  } catch (e) {
    return null;
  }
}

export default function GroupDetailsScreen({ navigation }) {
  const route = useRoute();
  const { groupId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchGroupDetails = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!groupId) return;
    if (!silent) setLoading(true);
    try {
      const res = await chitGroups.getById(groupId);
      if (res.data?.success) {
        const payload = res.data.data;
        setGroup(payload);
        setJoinRequestStatus(payload.joinRequestStatus ?? null);
        setIsMember(Boolean(payload.isMember));
        setIsOrganizer(Boolean(payload.isOrganizer));
      } else if (!silent) {
        Alert.alert('Error', res.data?.message || 'Group not found');
      }
    } catch (error) {
      if (!silent) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to load group details'
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, fetchGroupDetails]);

  useFocusEffect(
    useCallback(() => {
      if (groupId && group) {
        fetchGroupDetails({ silent: true });
      }
    }, [groupId, group, fetchGroupDetails])
  );

  const fetchProfile = async () => {
    try {
      const res = await userApi.getMe();
      const fetchedUser = res.data?.data?.user || res.data?.data || res.data?.user || res.data || {};
      setProfile(fetchedUser);
    } catch (error) {
      console.error('Profile fetch error (GroupDetails):', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroupDetails({ silent: true });
    setRefreshing(false);
  }, [fetchGroupDetails]);

  const ensureKyc = () => {
    const isKycVerified =
      profile?.isKycVerified ||
      profile?.kycVerified ||
      profile?.data?.user?.isKycVerified ||
      false;

    if (!isKycVerified) {
      Alert.alert(
        'KYC Required',
        'KYC verification is required to join and pay for this group. Please complete KYC first.',
        [
          {
            text: 'Go to KYC',
            onPress: () => navigation.navigate('KycTab'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return false;
    }
    return true;
  };

  const handleApply = async () => {
    if (!profile) {
      Alert.alert('Login Required', 'Please login again to continue.');
      navigation.replace('Auth');
      return;
    }

    if (!ensureKyc()) return;

    if (!groupId) {
      Alert.alert('Error', 'Invalid group. Please go back and try again.');
      return;
    }

    const userId = profile.id || profile._id || profile.userId;
    if (!userId) {
      Alert.alert('Error', 'Could not determine your user account. Please re-login and try again.');
      return;
    }

    setApplyLoading(true);
    try {
      const payload = { userId };
      const res = await chitGroups.applyToJoin(groupId, payload);
      if (res.data?.success) {
        setJoinRequestStatus('pending');
        Alert.alert('Success', 'Request sent successfully and is awaiting organizer approval.');
      } else {
        const message = res.data?.message || 'Failed to apply';
        if (message.toLowerCase().includes('pending')) {
          setJoinRequestStatus('pending');
        }
        Alert.alert('Error', message);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to apply';
      if (message.toLowerCase().includes('pending')) {
        setJoinRequestStatus('pending');
      }
      Alert.alert('Error', message);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleMonthlyPayment = async () => {
    if (!profile || !group?.group) {
      Alert.alert('Error', 'Missing user or group details.');
      return;
    }

    if (!ensureKyc()) return;

    const RazorpayCheckout = getRazorpayCheckout();
    if (!RazorpayCheckout) {
      Alert.alert(
        'Payment gateway not available',
        'Razorpay requires a development or production build. It does not work in Expo Go. Build the app with a dev client to make payments.'
      );
      return;
    }

    setPaymentLoading(true);
    let transaction_id = null;
    try {
      const monthlyAmount =
        Number(group.group.rules?.monthly_amount || 0) > 0
          ? Number(group.group.rules.monthly_amount)
          : Number(group.group.chit_value) /
          Math.max(Number(group.group.duration_months), 1);

      const res = await escrow.contribute({
        chit_group_id: group.group.id,
        user_id: profile.id || profile._id || profile.userId,
        amount: monthlyAmount,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to initialize payment');
      }

      const { razorpay_order_id, amount } = res.data;
      transaction_id = res.data.transaction_id;

      const options = {
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SKVpiqvO8UAmrn',
        amount: amount * 100,
        currency: 'INR',
        name: 'Nivesh Nidhi',
        description: `Monthly payment for ${group.group.name}`,
        order_id: razorpay_order_id,
        prefill: {
          name: profile?.name || 'User',
          email: profile?.email || '',
          contact: profile?.phone || profile?.phoneNumber || '',
        },
        theme: {
          color: '#1d4ed8',
        },
      };

      try {
        const response = await RazorpayCheckout.open(options);
        try {
          const verifyRes = await escrow.verifyWebhook({
            transaction_id,
            payload: {
              payment: {
                entity: {
                  id: response.razorpay_payment_id,
                  notes: { transaction_id },
                },
              },
            },
          });
          if (verifyRes.data?.success) {
            Alert.alert(
              'Payment Successful',
              'Payment successful! Funds secured in Escrow & Blockchain.'
            );
            await fetchGroupDetails();
          } else {
            Alert.alert(
              'Verification issue',
              'Payment was received but verification failed. If amount was deducted, it will be refunded within 2–3 days.'
            );
          }
        } catch (err) {
          Alert.alert(
            'Verification failed',
            'Payment may have gone through. If amount was deducted, it will be refunded within 2–3 days if not confirmed.'
          );
          if (transaction_id) {
            try {
              await escrow.webhookFailed({
                transaction_id,
                error_description: err?.message || 'Verification failed',
              });
            } catch (e) {
              // ignore
            }
          }
        } finally {
          setPaymentLoading(false);
        }
      } catch (razorpayError) {
        setPaymentLoading(false);
        const msg = String(razorpayError?.message || razorpayError?.description || '');
        const isGatewayUnavailable =
          !msg ||
          /open of null|cannot read property 'open'|razorpay.*not available|native module/i.test(msg);
        const isUserCancel = /cancel|cancelled|dismiss|closed/i.test(msg);

        if (transaction_id) {
          try {
            await escrow.webhookFailed({
              transaction_id,
              error_description: msg || 'Payment did not complete',
            });
          } catch (e) {
            // ignore
          }
        }

        if (isGatewayUnavailable) {
          Alert.alert(
            'Payment gateway not available',
            'Razorpay could not be opened. Use a development or production build (not Expo Go) to make payments.'
          );
        } else if (!isUserCancel && msg) {
          Alert.alert(
            'Payment failed',
            msg + (msg.includes('refund') ? '' : '\n\nIf amount was deducted, it will be refunded within 2–3 days.')
          );
        }
      }
    } catch (error) {
      setPaymentLoading(false);
      Alert.alert(
        'Payment error',
        error?.response?.data?.message ||
        error?.message ||
        'Could not start payment. Please try again.'
      );
    }
  };

  const actionButton = useMemo(() => {
    if (!group) return null;

    const isFull =
      group.memberStats?.total >= group.memberStats?.capacity;

    if (profile?.role === 'ADMIN') {
      return {
        label: 'Admins cannot join groups',
        disabled: true,
        action: undefined,
      };
    }

    if (profile?.role === 'ORGANIZER') {
      return {
        label: 'Organizers cannot join groups',
        disabled: true,
        action: undefined,
      };
    }

    if (isMember || joinRequestStatus === 'approved') {
      if (group.hasPaidCurrentMonth) {
        return {
          label: 'Paid for Current Month',
          disabled: true,
          action: undefined,
        };
      }
      return {
        label: paymentLoading ? 'Processing Payment...' : 'Make Monthly Payment',
        disabled: paymentLoading,
        action: handleMonthlyPayment,
      };
    }

    if (joinRequestStatus === 'pending') {
      return {
        label: 'Request Sent (Awaiting Approval)',
        disabled: true,
        action: undefined,
      };
    }

    return {
      label: applyLoading ? 'Applying...' : 'Apply to Join',
      disabled: applyLoading || Boolean(isFull),
      action: handleApply,
    };
  }, [group, isMember, joinRequestStatus, applyLoading, paymentLoading]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textMuted }}>
          Loading group details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
          Group Not Found
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
          This chit group does not exist or has been deleted.
        </Text>
        <Button
          title="Back to Groups"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'<  Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.groupName}>{group.group.name}</Text>
          <Text style={styles.organizerText}>
            Organized by {group.organizerDetails?.name}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.infoBox}>
              <View style={styles.iconCircle}>
                <IndianRupee size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Chit Value</Text>
                <Text style={styles.infoValue}>
                  ₹{Number(group.group.chit_value).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight + '20' }]}>
                <Calendar size={18} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>
                  {group.group.duration_months} months
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accentLight + '20' }]}>
                <Users size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Members</Text>
                <Text style={styles.infoValue}>
                  {group.memberStats.total} / {group.memberStats.capacity}
                </Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '20' }]}>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>KYC Status</Text>
                <Text style={styles.infoValue}>
                  {profile?.isKycVerified ? 'KYC Verified' : 'KYC Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Button
            title={actionButton?.label || 'Apply to Join'}
            onPress={actionButton?.action}
            disabled={actionButton?.disabled}
            style={[
              styles.primaryBtn,
              (isMember || joinRequestStatus === 'approved') && !group?.hasPaidCurrentMonth && actionButton?.action === handleMonthlyPayment
                ? styles.paymentBtn
                : null,
            ]}
          />
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
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  backText: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  organizerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.secondary,
  },
  paymentBtn: {
    backgroundColor: '#16a34a',
  },
});

