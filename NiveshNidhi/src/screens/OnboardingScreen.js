import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Landmark } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const flatListRef = React.useRef(null);

    const slides = [
        {
            id: '1',
            title: t('onboarding.slide1_title'),
            description: t('onboarding.slide1_desc'),
            icon: <ShieldCheck size={80} color={colors.primary} />
        },
        {
            id: '2',
            title: t('onboarding.slide2_title'),
            description: t('onboarding.slide2_desc'),
            icon: <Lock size={80} color={colors.secondary} />
        },
        {
            id: '3',
            title: t('onboarding.slide3_title'),
            description: t('onboarding.slide3_desc'),
            icon: <Landmark size={80} color={colors.accent} />
        }
    ];

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('hasOnboarded', 'true');
        navigation.replace('Auth');
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                bounces={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                scrollEventThrottle={32}
            />
            <View style={styles.footer}>
                <View style={styles.indicators}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentIndex === index && styles.activeIndicator
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.buttons}>
                    {currentIndex < slides.length - 1 ? (
                        <>
                            <Button type="outline" title={t('onboarding.skip')} onPress={finishOnboarding} style={styles.halfBtn} />
                            <Button title={t('onboarding.next')} onPress={handleNext} style={styles.halfBtn} />
                        </>
                    ) : (
                        <Button title={t('onboarding.start')} onPress={handleNext} style={{ flex: 1 }} />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: 24,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    activeIndicator: {
        width: 24,
        backgroundColor: colors.primary,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    halfBtn: {
        flex: 1,
    }
});
