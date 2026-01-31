import { initRelay } from '@roll20-official/beacon-sdk'
import { debounce } from 'lodash'

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver
} from './handlers'
import {
  getMKHP,
  setMKHP,
  getTempHP,
  setTempHP,
  getSHP,
  setSHP,
  getMP,
  setMP
} from './handlers/computed'
import { reactive, ref, watch, nextTick, shallowRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/* 
This is the configuration for the relay. It defines the handlers and actions that the sheet will use.
The handlers are functions that are called by the relay when certain events occur.
The actions are custom functions that can be called by the sheet to perform specific actions.
the computed properties are exposed by the sheet to be used in macros, inline rolls and tokens.
*/
const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver
  },
  // Refer to our advanced example sheet on how to setup actions and computed properties.
  actions: {
    // Transform action - toggles between Student and Magi-Knight forms
    // Updates the token image and form state
    transform: {
      method: async ({ dispatch, character }) => {
        const attrs = character.attributes || {};
        const currentlyTransformed = attrs.isTransformed || false;
        const newTransformed = !currentlyTransformed;

        // Get the appropriate token image URL
        const studentImage = attrs.studentTokenImage || '';
        const knightImage = attrs.knightTokenImage || '';
        const newTokenImage = newTransformed ? knightImage : studentImage;

        // Update character attributes with new transform state
        dispatch.update({
          character: {
            id: character.id,
            attributes: {
              updateId: 'TRANSFORM',
              isTransformed: newTransformed,
            },
          },
        });

        // Update token image if a URL is configured
        if (newTokenImage) {
          await dispatch.updateTokensByCharacter({
            characterId: character.id,
            token: {
              imgsrc: newTokenImage,
            },
          });
        }

        // Post transformation message to chat
        const formName = newTransformed ? 'Magi-Knight' : 'Student';
        dispatch.post({
          characterId: character.id,
          content: `transforms into ${formName} form!`,
          options: { whisper: false },
        });
      },
    },
  },
  computed: {
    // Token bar attributes - these can be linked to token bars in Roll20
    // MKHP: Magi-Knight HP (current and max)
    mkhp: { tokenBarValue: true, get: getMKHP, set: setMKHP },
    // Temp HP: Temporary Hit Points (current only, no max)
    tempHp: { tokenBarValue: true, get: getTempHP, set: setTempHP },
    // SHP: Student HP (current and max)
    shp: { tokenBarValue: true, get: getSHP, set: setSHP },
    // MP: Magic Points (current and max)
    mp: { tokenBarValue: true, get: getMP, set: setMP },
  }
}

// Almost everything below here is Boilerplate and you probably want to keep it intact.
export const initValues = reactive({
  id: '',
  character: { attributes: {} },
  settings: {
    colorTheme: 'light',
    owned: true
  },
  compendiumDrop: null
})

/*
We use refs to keep track of the state of the sheet.
This is a way to keep track of the state of the sheet in a reactive way.
*/
export const beaconPulse = ref(0)
export const blockUpdate = ref(false)
export const dispatchRef = shallowRef()
export const dropUpdate = ref({})
export const settingsSheet = ref(false)
const sheetId = ref(uuidv4())

// Track cleanup functions for watchers/subscriptions
let cleanupFunctions = []

// Reset relay state and call all cleanup functions
export const resetRelayState = () => {
  // Call all cleanup functions
  cleanupFunctions.forEach(fn => {
    try { fn() } catch (e) { console.warn('Cleanup error:', e) }
  })
  cleanupFunctions = []

  // Reset module-level refs
  initValues.id = ''
  initValues.character = { attributes: {} }
  initValues.settings = { colorTheme: 'light', owned: true }
  initValues.compendiumDrop = null

  beaconPulse.value = 0
  blockUpdate.value = false
  dispatchRef.value = undefined
  dropUpdate.value = {}
  settingsSheet.value = false
  sheetId.value = uuidv4()

  // Cancel pending debounced updates
  debounceUpdate.cancel()

  console.log('[Relay] State reset')
}

/*
This is the function that is called when the character data is updated.
logMode is a flag that can be used to log the updates to the console. This is useful for debugging.
*/
const doUpdate = (dispatch, update, logMode = false) => {
  if (!initValues.character.id) {
    if (logMode) console.warn('⚠️ Skipping update: No character ID yet')
    return
  }
  if (logMode) console.info('➡️ ExampleSheet: Updating Firebase')
  if (logMode) console.dir(`Firebase Update: ${initValues.character.id}`, update)
  const character = {
    character: {
      id: initValues.character.id,
      ...update
    }
  }
  character.character.attributes.updateId = sheetId.value
  dispatch.updateCharacter(character)
}

// This is a debounced version of the update function that will only be called after 800ms of inactivity.
const debounceUpdate = debounce(doUpdate, 800)

/* 
Dev relay is used to run the sheet in a web browser
It will log the updates to the console instead of sending them to the VTT or Roll20/Characters
This is useful for testing the sheet without having to connect to the server.
*/
const devRelay = async () => ({
  update: (...args) => console.log('devRelay update', args),
  updateCharacter: (...args) => console.log('devRelay updateCharacter', args),
  characters: {},
  updateTokensByCharacter: () => ''
})

/*
This function is called to create the relay.
It will return the relayPinia and relayVue objects that can be used to install the relay in the sheet.
  RelayPinia is used to hydrate the store and watch for changes.
  RelayVue is used to provide the dispatch object from the Beacon SDK to the sheet.
We use a watcher of beaconPulse value to trigger a re-render of the sheet when the value changes, see the onChange handler.
This is just one way to trigger a re-render, you can implement your own logic to trigger a re-render.
*/
export const createRelay = async ({ devMode = false, primaryStore = 'app', logMode = false }) => {
  // Clean up any previous relay state before creating new relay
  resetRelayState()

  let dispatch;
  if (devMode) {
    dispatch = await devRelay();
  } else {
    try {
      // Add timeout - if initRelay doesn't resolve in 10 seconds, fall back to dev mode
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('initRelay timeout')), 10000)
      );
      dispatch = await Promise.race([initRelay(relayConfig), timeoutPromise]);
    } catch (error) {
      // SDK v0.1.15+ throws "Headless" when not in proper VTT context
      // Or initRelay timed out waiting for VTT connection
      // Fall back to dev mode to allow the sheet to render
      console.warn('⚠️ Beacon SDK error, falling back to dev relay:', error);
      dispatch = await devRelay();
      // Set default values so the sheet renders in dev/fallback mode
      initValues.id = 'dev-character';
      initValues.character = {
        id: 'dev-character',
        name: 'Dev Character',
        attributes: {
          sheet: {
            sheet_mode: 'pc'
          }
        }
      };
      initValues.settings.owned = true;
      initValues.settings.gm = true;
    }
  }
  const relayPinia = (context) => {
    if (context.store.$id !== primaryStore) return
    const store = context.store
    console.log('📦 RelayPinia initializing store:', primaryStore)

    dispatchRef.value = dispatch

    // Guard: Skip hydration if character data is not ready
    const { attributes, ...profile } = initValues.character
    if (!attributes || !initValues.character.id) {
      console.log('📦 Skipping hydration - no character data yet')
      return { ...dispatch }
    }

    console.log('📦 Hydrating with attributes:', attributes)
    console.log('📦 Hydrating with profile:', profile)
    store.hydrateStore(attributes, profile)

    // Beacon Provides access to settings, like campaign id for example
    store.setCampaignId(initValues.settings.campaignId)
    store.setPermissions(initValues.settings.owned, initValues.settings.gm)
    console.log('📦 Permissions set - owned:', initValues.settings.owned, 'gm:', initValues.settings.gm)


    // Watch for changes
    const unsubscribe = store.$subscribe(() => {
      if (blockUpdate.value === true) return
      const update = store.dehydrateStore()
      debounceUpdate(dispatch, update, logMode)
    })
    cleanupFunctions.push(unsubscribe)

    // Watch for changes from the Beacon SDK, triggered everytime the Beacon Pulse value changes
    const stopBeaconWatch = watch(beaconPulse, async (newValue, oldValue) => {
      if (logMode) console.log('❤️ Beacon Pulse', { newValue, oldValue })
      const characterId = initValues.character.id
      blockUpdate.value = true
      if (logMode) console.log('🔓🔴 locking changes')
      const { attributes, ...profile } = dispatch.characters[characterId]
      if (attributes.updateId === sheetId.value) {
        blockUpdate.value = false
        return
      }
      store.hydrateStore(attributes, profile)
      await nextTick()
      if (logMode) console.log('🔓🟢 unlocking changes')
      blockUpdate.value = false
    })
    cleanupFunctions.push(stopBeaconWatch)

    return { ...dispatch }
  }

  const relayVue = {
    install(app) {
      app.provide('dispatch', dispatch)
    }
  }

  return {
    relayPinia,
    relayVue
  }
}
