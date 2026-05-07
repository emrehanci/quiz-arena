import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import { DEFAULT_LANGUAGE } from '../constants';

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
