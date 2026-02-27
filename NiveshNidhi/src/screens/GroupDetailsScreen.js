import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Users, Calendar, IndianRupee, ShieldCheck } from 'lucide-react-native';
import { chitGroups, escrow, user as userApi } from '../services/api';
import { colors } from '../theme/colors';
import Button from '../components/Button';

function getRazorpayCheckout() {
  try {
    // `react-native-razorpay` is a native module and will not exist in Expo Go.
    // Lazy-require so the app can run in Expo Go; payments will require a dev build.
    // eslint-disable-next-line global-require
    const mod = require('react-native-razorpay');
    return mod?.default ?? mod;
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

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getMe();
      const fetchedUser = res.data?.data?.user || res.data?.data || res.data?.user || res.data || {};
      setProfile(fetchedUser);
    } catch (error) {
      console.error('Profile fetch error (GroupDetails):', error);
    }
  };

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const res = await chitGroups.getById(groupId);
      if (res.data?.success) {
        const payload = res.data.data;
        setGroup(payload);
        setJoinRequestStatus(payload.joinRequestStatus || null);
        setIsMember(Boolean(payload.isMember));
        setIsOrganizer(Boolean(payload.isOrganizer));
      } else {
        Alert.alert('Error', res.data?.message || 'Group not found');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to load group details'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
    setRefreshing(false);
  };

  const ensureKyc = () => {
    const isKycVerified =
      profile?.isKycVerified ||
      profile?.aadhaarVerified ||
      profile?.kycVerified;

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

    setPaymentLoading(true);
    try {
      const RazorpayCheckout = getRazorpayCheckout();
      if (!RazorpayCheckout?.open) {
        setPaymentLoading(false);
        Alert.alert(
          'Payments not supported in Expo Go',
          'Razorpay needs a custom development build (or production build). Please run the app with a dev build to make payments.'
        );
        return;
      }

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
        throw new Error('Failed to initialize payment');
      }

      const { razorpay_order_id, transaction_id, amount } = res.data;

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

      RazorpayCheckout.open(options)
        .then(async (response) => {
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
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            Alert.alert(
              'Verification Failed',
              'Sorry, something went wrong. If money has been deducted it will be refunded to your account in 2-3 days.'
            );
          } finally {
            setPaymentLoading(false);
          }
        })
        .catch(async (error) => {
          setPaymentLoading(false);
          if (error?.description) {
            Alert.alert(
              'Payment Failed',
              `${error.description}. If money has been deducted it will be refunded to your account in 2-3 days.`
            );
          } else {
            Alert.alert(
              'Payment Cancelled',
              'Payment cancelled by user.'
            );
          }
          try {
            await escrow.webhookFailed({
              transaction_id,
              error_description: error?.description || 'Payment failed or cancelled on mobile.',
            });
          } catch (err) {
            // no-op
          }
        });
    } catch (error) {
      setPaymentLoading(false);
      Alert.alert(
        'Payment Error',
        error?.response?.data?.message ||
        error?.message ||
        'Could not initiate payment. Please try again later.'
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
            style={styles.primaryBtn}
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
});

