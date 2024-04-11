import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRelay } from './relay/relay';
import App from './App.vue'

const env = import.meta.env.MODE || '';
// Determines if the offline mode dev relay should be used
const isDevEnvironment = ['development', 'test'].includes(env);

const pinia = createPinia();
const app = createApp(App);
const {
  relayPinia,
  relayVue
} = await createRelay({
  devMode: isDevEnvironment
});

app.use(pinia);
app.use(relayVue);
pinia.use(relayPinia);

app.mount('#app')
