import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import './src/locales/i18n'; // Initialize i18n
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
