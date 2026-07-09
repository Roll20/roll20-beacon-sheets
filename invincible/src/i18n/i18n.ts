import { createI18n } from 'vue-i18n';
import en from './locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en
  }
});

export default i18n;