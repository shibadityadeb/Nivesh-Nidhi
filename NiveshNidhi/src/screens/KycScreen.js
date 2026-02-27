import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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
          <View style={styles.iconBox}>
            <ShieldCheck size={28} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Complete Your KYC</Text>
            <Text style={styles.subtitle}>
              Secure Aadhaar verification is required to continue.
            </Text>
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
                if (Platform.OS === 'android') {
                  setTimeout(() => setShowStateOptions(false), 120);
                } else {
                  setShowStateOptions(false);
                }
              }}
            />
            {showStateOptions && filteredStates.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
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
                setCityQuery(text);
                setCity('');
                setShowCityOptions(true);
              }}
              placeholder={state ? 'Search city' : 'Select state first'}
              editable={!!state}
              style={[
                styles.input,
                !state && { backgroundColor: colors.surface, opacity: 0.6 },
              ]}
              onFocus={() => state && setShowCityOptions(true)}
              onBlur={() => {
                if (Platform.OS === 'android') {
                  setTimeout(() => setShowCityOptions(false), 120);
                } else {
                  setShowCityOptions(false);
                }
              }}
            />
            {loadingCities && (
              <Text style={styles.helper}>Loading cities...</Text>
            )}
            {showCityOptions && state && filteredCities.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight || '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
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

