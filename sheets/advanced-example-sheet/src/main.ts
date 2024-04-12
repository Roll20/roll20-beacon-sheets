import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';

import './sheet/scss/index.scss';

import { createRelay } from './relay/relay';

// @ts-ignore
const env = import.meta.env.MODE || '';
// Determines if the offline mode dev relay should be used
const isDevEnvironment = ['development', 'test'].includes(env);

const main = async () => {
  const pinia = createPinia();
  const i18n = createI18n({});
  const app = createApp(App);
  const { relayPinia, relayVue } = await createRelay({ devMode: isDevEnvironment });

  app.use(pinia);
  app.use(router);
  app.use(i18n);
  app.use(relayVue);
  pinia.use(relayPinia);

  app.mount('#app');
};

main();
