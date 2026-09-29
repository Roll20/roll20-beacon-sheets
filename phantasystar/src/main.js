import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRelay } from './relay/relay'
import App from './App.vue'

const env = import.meta.env.MODE || ''
const isDevEnvironment = ['development', 'test'].includes(env)

const pinia = createPinia()
const app = createApp(App)
const { relayPinia, relayVue } = await createRelay({
  devMode: isDevEnvironment
})

app.config.errorHandler = (err, instance, info) => {
  const name = instance?.$options?.__name || instance?.$?.type?.__name || 'unknown'
  console.error(`[PS sheet] error in <${name}> (${info}):`, err)
}

app.use(pinia)
app.use(relayVue)
pinia.use(relayPinia)

app.mount('#app')
