import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Users, BarChart3, User, ShieldCheck } from 'lucide-react-native';

import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroupsScreen from '../screens/GroupsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import KycScreen from '../screens/KycScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import { colors } from '../theme/colors';
import { user } from '../services/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
    const [isVerified, setIsVerified] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await user.getMe();
                const fetchedUser = res.data?.data?.user || res.data?.user || res.data || {};
                setIsVerified(!!fetchedUser.isKycVerified);
            } catch (error) {
                // Default to showing it or handle error if needed
                setIsVerified(false);
            }
        };
        fetchStatus();
    }, []);

    if (isVerified === null) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    elevation: 0,
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="GroupsTab"
                component={GroupsScreen}
                options={{
                    tabBarLabel: 'Groups',
                    tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="DashboardTab"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
            {!isVerified && (
                <Tab.Screen
                    name="KycTab"
                    component={KycScreen}
                    options={{
                        tabBarLabel: 'KYC',
                        tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} />
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem('hasOnboarded').then(value => {
            if (value === null) {
                setIsFirstLaunch(true);
            } else {
                setIsFirstLaunch(false);
            }
        });
    }, []);

    if (isFirstLaunch === null) return null; // loading

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isFirstLaunch && (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                )}
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="AppLayout" component={AppTabs} />
                <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
