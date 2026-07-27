import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRelay } from './relay/relay'
import App from './App.vue'

/*
Point d'entrée de la fiche "Les Chroniques d'Enyllion".

L'interface est rendue par App.vue et découpée en composants par onglet (PJ, PNJ,
ennemis...). Les données sont réparties dans plusieurs stores Pinia dédiés
(stores/statsStore.js, skillsStore.js, grimoireStore.js, inventoryStore.js,
necromancyStore.js, npcStore.js, enemyStore.js, metaStore.js, uiStore.js...),
chacun exposant hydrate/dehydrate pour la persistance via le relay Beacon.

Les jets et messages de chat passent par utility/rolls.js et les roll templates
Handlebars de rollTemplates/.
 */

// Determines if the offline mode dev relay should be used
const env = import.meta.env.MODE || ''
const isDevEnvironment = ['development', 'test'].includes(env)

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
