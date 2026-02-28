import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Lock, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import { kyc, locations } from '../services/api';
import { STATES } from '../constants/indiaLocations';
import { validateAadhaar, sanitizeAadhaar } from '../utils/validateAadhaar';

export default function KycScreen({ navigation }) {
  const { t } = useTranslation();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarStatus, setAadhaarStatus] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [city, setCity] = useState('');
  const [showCityOptions, setShowCityOptions] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showStateOptions, setShowStateOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!aadhaarNumber) {
      setAadhaarStatus('');
      return;
    }
    const status = validateAadhaar(aadhaarNumber);
    setAadhaarStatus(status);
  }, [aadhaarNumber]);

  const filteredCities = cityOptions.filter((c) =>
    c.toLowerCase().includes(cityQuery.toLowerCase())
  );

  const filteredStates = STATES.filter((s) =>
    s.toLowerCase().includes(stateQuery.toLowerCase())
  );

  useEffect(() => {
    if (!state) {
      setCityOptions([]);
      setCity('');
      setCityQuery('');
      return;
    }

    let cancelled = false;
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await locations.getCities(state);
        const cities =
          res.data?.data?.cities || res.data?.cities || [];
        if (!cancelled) {
          setCityOptions(cities);
        }
      } catch (error) {
        if (!cancelled) {
          setCityOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCities(false);
        }
      }
    };

    fetchCities();

    return () => {
      cancelled = true;
    };
  }, [state]);

  const handleSubmit = async () => {
    if (submitting) return;

    const status = validateAadhaar(aadhaarNumber);
    if (status !== 'verified') {
      setAadhaarStatus('not verified');
      Alert.alert('Invalid Aadhaar', 'Please enter a valid Aadhaar number.');
      return;
    }

    if (!name || name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Name must be at least 3 characters.');
      return;
    }

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 18) {
      Alert.alert('Invalid Age', 'Age must be 18 or above.');
      return;
    }

    if (!state) {
      Alert.alert('State Required', 'Please select your state.');
      return;
    }
    if (!city) {
      Alert.alert('City Required', 'Please select your city.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        // Send Aadhaar without spaces to API
        aadhaarNumber: sanitizeAadhaar(aadhaarNumber),
        name: name.trim(),
        age: ageNum,
        state,
        city,
      };

      const res = await kyc.verify(payload);
      if (res.data?.success) {
        Alert.alert('KYC Verified', 'Your KYC has been verified successfully.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('KYC Failed', res.data?.message || 'KYC verification failed.');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'KYC verification failed';
      Alert.alert('KYC Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your KYC</Text>
          <Text style={styles.subtitle}>
            Instant verification powered by Government of India's DigiLocker
          </Text>
        </View>

        {/* DigiLocker Badge */}
        <LinearGradient
          colors={['#e0f2fe', '#dbeafe']}
          style={styles.digilockerCard}
        >
          <Image
            source={{ uri: 'https://digilocker.gov.in/assets/img/digilocker_logo.png' }}
            style={styles.digilockerLogo}
            resizeMode="contain"
          />
          <Text style={styles.digilockerTitle}>DigiLocker Verified</Text>
          <Text style={styles.digilockerSubtitle}>Government of India</Text>
          <Text style={styles.digilockerDesc}>
            Your documents are securely verified through India's official digital locker system
          </Text>
        </LinearGradient>

        {/* Security Features */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <View style={styles.securityIconBox}>
              <Lock size={16} color={colors.secondary} />
            </View>
            <Text style={styles.securityTitle}>Secured Verification</Text>
          </View>
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <CheckCircle size={14} color={colors.secondary} />
              <Text style={styles.securityText}>256-bit encrypted data transmission</Text>
            </View>
            <View style={styles.securityItem}>
              <CheckCircle size={14} color={colors.secondary} />
              <Text style={styles.securityText}>Instant verification in seconds</Text>
            </View>
            <View style={styles.securityItem}>
              <CheckCircle size={14} color={colors.secondary} />
              <Text style={styles.securityText}>No data stored on our servers</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Aadhaar Number</Text>
            <TextInput
              value={aadhaarNumber}
              onChangeText={(text) => {
                // Remove non-digits, then format as 4-4-4 with spaces for display
                const digitsOnly = text.replace(/\D/g, '').slice(0, 12);
                const parts = [];
                for (let i = 0; i < digitsOnly.length; i += 4) {
                  parts.push(digitsOnly.slice(i, i + 4));
                }
                setAadhaarNumber(parts.join(' '));
              }}
              keyboardType="number-pad"
              placeholder="12-digit Aadhaar number"
              style={styles.input}
            />
            {aadhaarNumber.length > 0 && (
              <Text
                style={[
                  styles.helper,
                  aadhaarStatus === 'verified'
                    ? { color: colors.success || '#16a34a' }
                    : { color: colors.error || '#dc2626' },
                ]}
              >
                {aadhaarStatus === 'verified'
                  ? 'Aadhaar status: verified'
                  : 'Aadhaar status: not verified'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Enter your age"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>State</Text>
            <TextInput
              value={stateQuery}
              onChangeText={(text) => {
                setStateQuery(text);
                setState('');
                setCity('');
                setCityQuery('');
                setShowStateOptions(true);
              }}
              placeholder="Search state"
              style={styles.input}
              onFocus={() => setShowStateOptions(true)}
              onBlur={() => {
                setTimeout(() => setShowStateOptions(false), 200);
              }}
            />
            {showStateOptions && filteredStates.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
                  {filteredStates.map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        setState(st);
                        setStateQuery(st);
                        setCity('');
                        setCityQuery('');
                        setShowStateOptions(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>City</Text>
            <TextInput
              value={cityQuery}
              onChangeText={(text) => {
                if (!state) {
                  Alert.alert('State Required', 'Please select a state first');
                  return;
                }
                setCityQuery(text);
                setCity('');
                setShowCityOptions(true);
              }}
              placeholder={state ? 'Search city' : 'Select state first'}
              editable={true}
              style={[
                styles.input,
                !state && { backgroundColor: colors.surface, opacity: 0.6 },
              ]}
              onFocus={() => {
                if (!state) {
                  Alert.alert('State Required', 'Please select a state first');
                } else {
                  setShowCityOptions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowCityOptions(false), 200);
              }}
            />
            {loadingCities && (
              <Text style={styles.helper}>Loading cities...</Text>
            )}
            {showCityOptions && state && filteredCities.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                  {filteredCities.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => {
                        setCity(c);
                        setCityQuery(c);
                        setShowCityOptions(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Button
            title={submitting ? 'Verifying...' : 'Submit for Verification'}
            onPress={handleSubmit}
            style={styles.submitBtn}
            disabled={
              submitting || !aadhaarNumber || !name || !age || !state || !city
            }
          />

          {submitting && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>
                Verifying your Aadhaar details securely...
              </Text>
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
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  digilockerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  digilockerLogo: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  digilockerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  digilockerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  digilockerDesc: {
    fontSize: 13,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 18,
  },
  securityCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.lightSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  securityList: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityText: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  helper: {
    marginTop: 4,
    fontSize: 12,
  },
  chipRow: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  selectInputText: {
    fontSize: 14,
    color: colors.text,
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

