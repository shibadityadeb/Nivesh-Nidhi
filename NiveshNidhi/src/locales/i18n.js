import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr }
};

const LANGUAGE_KEY = 'settings.lang';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            const language = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (language) {
                return callback(language);
            } else {
                return callback('en');
            }
        } catch (error) {
            console.log('Error reading language', error);
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    }
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        compatibilityJSON: 'v3',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
