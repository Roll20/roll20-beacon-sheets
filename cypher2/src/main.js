import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRelay } from './relay/relay'
import App from './App.vue'

// Offline dev relay outside the Roll20 host (dev server, vitest).
const env = import.meta.env.MODE || ''
const isDevEnvironment = ['development', 'test'].includes(env)

const pinia = createPinia()
const app = createApp(App)
const { relayPinia, relayVue } = await createRelay({ devMode: isDevEnvironment })

app.use(pinia)
app.use(relayVue)
pinia.use(relayPinia)

// Test seam for scripts/capture.mjs — the harness sets ui.theme/ui.characterSegment/ui.kitSegment/ui.guidedRoll
// before the Settings select exists. DEV-only: import.meta.env.DEV is false in every
// built bundle. NOT gated on MODE — ddd-dxk: the sandbox runs mode 'staging', and a
// MODE check would ship this to players.
if (import.meta.env.DEV) window.__pinia__ = pinia

app.mount('#app')
