import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRelay } from './relay/relay'
import App from './App.vue'

/*
Welcome! If you are new to vue, this is the file that will render the vue app. This vue app is a quickstart guide,
to help get you started and familiar with the new flow of sheet development with our beacon SDK.

This vue app features one component, App.vue, that renders the entire sheet.

There is one custom data store, stores/sheetStore.js, to help detail how you can add what you need for your sheet.
Also, you can leverage character data already provided for you through the meta data store which is already setup for you in App.vue

The ability to read and write changes to your data is already configured with the beacon relay and you don't have to do any work to set that up.

This quickstart also features an example of how to render a roll template with the new beacon sheets. The roll templates still leverage handlebars with custom css,
and you can find that example being used in App.vue by sending a trait to the chat.
 */

// Determines if the offline mode dev relay should be used
const env = import.meta.env.MODE || ''
const isDevEnvironment = ['development', 'test'].includes(env)

// ddd-x61 guard. An un-mounted sheet is SILENT: initRelay (beacon-sdk index.js:39) never
// resolves without a host `init`, so app.mount() below never runs and the frame renders as a
// bare oxblood field with no error. That cost hours to diagnose once; this names it instead.
// Gated on MODE, not import.meta.env.DEV — the sandbox runs --mode staging, so a DEV gate
// would exclude the one environment where this happens (the ddd-dxk lesson). Verified absent
// from a production build.
if (import.meta.env.MODE !== 'production') {
  setTimeout(() => {
    if (document.querySelector('#app')?.childElementCount) return
    console.error(
      '[ddd-x61] sheet never mounted: initRelay got no `init` from the host. ' +
        'The frame is orphaned and cannot self-recover — close and reopen the character window.',
      { navType: performance.getEntriesByType('navigation')[0]?.type, windowName: window.name }
    )
  }, 15000)
}

// This sets up the pinia data store
const pinia = createPinia()
// This initializes the vue app
const app = createApp(App)
// This creates the beacon relay, that manages saving and reading changes from firebase for you!
const { relayPinia, relayVue } = await createRelay({
  devMode: isDevEnvironment
})

app.use(pinia)
app.use(relayVue)
pinia.use(relayPinia)

// Mounts the vue app to this div in the DOM
app.mount('#app')
