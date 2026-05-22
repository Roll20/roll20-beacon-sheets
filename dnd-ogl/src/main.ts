import { createPinia } from 'pinia';
import { createApp } from 'vue';
import i18n from './i18n/i18n';

import App from './App.vue';
import router from './router';

import FloatingVue from 'floating-vue'
import VueTagsInput from '@sipec/vue3-tags-input';

import { createRelay, dispatchRef, initValues } from './relay/relay';

import 'floating-vue/dist/style.css'
import './sheet/scss/index.scss';
import { type Dispatch } from '@roll20-official/beacon-sdk';

const tooltipConfig = {
  themes: {
    info: {
      '$extend': 'tooltip',
    },
  },
}

// @ts-ignore
const env = import.meta.env.MODE || '';
// Determines if the offline mode dev relay should be used
const isDevEnvironment = ['development', 'test'].includes(env);

const main = async () => {

  function openCompendiumPopout(url: string) {
    const dispatch = dispatchRef.value as Dispatch;
    const isVTT = initValues.settings.environment === "VTT";
    if (isVTT) {
      dispatch.openDialogFromLink({ urlString: url });
    }
    else {
      window.open(url, undefined, "popup=true, width=770, height=620, noopener");
    }
  }

  const pinia = createPinia();
  const app = createApp(App);
  app.config.globalProperties.$openCompendiumPopout = openCompendiumPopout
  const { relayPinia, relayVue } = await createRelay({ devMode: isDevEnvironment });

  app.use(pinia);
  app.use(router);
  app.use(i18n);
  app.use(relayVue);
  app.use(FloatingVue, tooltipConfig)
  app.component('vue-tags-input', VueTagsInput);

  pinia.use(relayPinia);

  app.mount('#app');
};

main();
