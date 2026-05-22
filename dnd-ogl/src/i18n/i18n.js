import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/pt-br.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en', // default locale
  fallbackLocale: 'en', // fallback if translation is missing
  messages: {
    en: en,
    es: es
  }
});

export default i18n;