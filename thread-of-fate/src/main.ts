import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import App from './App.vue';

import './sheet/scss/index.scss';
import './maker/styles/theme.scss';

import { createRelay } from './relay/relay';
import { useDraftStore } from '@/maker/store/draftStore';

// IMPORTANT: `import.meta.env` must be accessed LITERALLY (not through an alias
// like `const meta = import.meta`) - Vite only injects its env object into modules
// whose source contains the literal text `import.meta.env`. The aliased form made
// env come back undefined in the dev server, which sent boot down the initRelay
// path and hung forever waiting for a Roll20 host (blank page, no errors).
const env = import.meta.env?.MODE || '';
// Offline mock relay is used in development/test and in the standalone desktop/web
// build (VITE_STANDALONE) - anywhere there is no Roll20 Beacon host to connect to.
const isStandalone = import.meta.env?.VITE_STANDALONE === 'true';
const isDevEnvironment = ['development', 'test'].includes(env) || isStandalone;

const main = async () => {
  const pinia = createPinia();
  const i18n = createI18n({});
  const app = createApp(App);
  const { relayPinia, relayVue } = await createRelay({
    devMode: isDevEnvironment,
    primaryStore: 'threadOfFateSheet',
  });

  app.use(pinia);
  app.use(i18n);
  app.use(relayVue);
  pinia.use(relayPinia);

  app.mount('#app');

  // Standalone persistence: autosave the draft to localStorage on every change.
  // (In the Roll20 VTT, the Beacon relay handles syncing instead.)
  const draftStore = useDraftStore();
  draftStore.$subscribe(() => draftStore.save());
};

main();
