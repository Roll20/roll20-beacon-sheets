import { createPinia } from 'pinia';
import { createApp } from 'vue';
import i18n from './i18n/i18n';

import App from './App.vue';
import router from './router';

import FloatingVue from 'floating-vue'

import './common/scss/scrollbars.scss';
import './common/scss/tooltip.scss';
import './common/scss/tailwind.css';
import './sheet/scss/index.scss';

import { createRelay } from './relay/relay';

const env = import.meta.env.MODE || '';

const isDevEnvironment = ['development', 'test'].includes(env);

const tooltipConfig = {
  themes: {
    tooltip: {
      
      delay: { show: 1000, hide: 100 },
    },
    sheet: {
      '$extend': 'tooltip',
    },
  },
}

const main = async () => {
  const pinia = createPinia();
  const app = createApp(App);
  const { relayPinia, relayVue } = await createRelay({ devMode: isDevEnvironment });

  app.use(pinia);
  app.use(router);
  app.use(i18n);
  app.use(relayVue);
  app.use(FloatingVue, tooltipConfig)
  pinia.use(relayPinia);

  app.mount('#app');
};

main();
