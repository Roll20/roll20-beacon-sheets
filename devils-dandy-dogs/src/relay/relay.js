import { initRelay } from '@roll20-official/beacon-sdk'
import { debounce } from 'lodash'

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver
} from './handlers/handlers'
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
  actions: {},
  computed: {}
}

// Almost everything below here is Boilerplate and you probably want to keep it intact.
export const initValues = reactive({
  id: '',
  character: { attributes: {} },
  settings: {},
  compendiumDrop: null
})

/*
We use refs to keep track of the state of the sheet.
This is a way to keep track of the state of the sheet in a reactive way.
*/
export const beaconPulse = ref(0)
export const blockUpdate = ref(false)
// Set when a load threw after it began changing the store. The sheet may then hold part of
// the remote character and part of the old one, and saving that mixture would write it over
// the real character, so saves stay blocked until a later load succeeds (ddd-8ssl, ported
// from the Cypher sheet's relay).
const hydrateFailed = ref(false)
export const dispatchRef = shallowRef()
export const dropUpdate = ref({})
export const settingsSheet = ref(false)
const sheetId = ref(uuidv4())

/*
This is the function that is called when the character data is updated.
logMode is a flag that can be used to log the updates to the console. This is useful for debugging.
*/
// The profile fields the sheet saves beside its attributes (stores/index.js dehydrateStore).
const PROFILE_KEYS = ['name', 'bio', 'gmNotes', 'avatar']
const pickProfile = (source) => Object.fromEntries(PROFILE_KEYS.map((key) => [key, source?.[key]]))

// Profile fields the cache holds that differ from what the remote is known to hold. A
// journal rename touches only these, so its pulse still carries this sheet's updateId
// (ddd-i0q8). An absent field is no change. A null one is a clear, read as '' to match
// metaStore.hydrate.
export const outsideProfileChanges = (cached, known) =>
  Object.fromEntries(
    PROFILE_KEYS.filter((key) => cached?.[key] !== undefined)
      .map((key) => [key, cached[key] ?? ''])
      .filter(([key, value]) => value !== known?.[key])
  )

// Profile values the remote is known to hold, set on every save and every load.
let knownProfile = {}

const doUpdate = (dispatch, getUpdate, logMode = false) => {
  // getUpdate is a thunk: dehydration happens at debounce-fire time, never at
  // schedule time — a snapshot captured before a hydrate would resurrect stale
  // state the store no longer holds (ddd-ej2).
  const update = getUpdate()
  knownProfile = pickProfile(update)
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
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig))
  const relayPinia = (context) => {
    if (context.store.$id !== primaryStore) return
    const store = context.store

    dispatchRef.value = dispatch

    // Init Store
    const { attributes, ...profile } = initValues.character
    store.hydrateStore(attributes, profile)
    knownProfile = pickProfile(store.meta.dehydrate())

    // Beacon Provides access to settings, like campaign id for example
    store.setCampaignId(initValues.settings.campaignId)
    store.setPermissions(initValues.settings.owned, initValues.settings.gm)

    // Watch for changes
    store.$subscribe(() => {
      if (blockUpdate.value === true) return
      debounceUpdate(dispatch, () => store.dehydrateStore(), logMode)
    })

    // Watch for changes from the Beacon SDK, triggered everytime the Beacon Pulse value changes
    watch(beaconPulse, async (newValue, oldValue) => {
      if (logMode) console.log('❤️ Beacon Pulse', { newValue, oldValue })
      blockUpdate.value = true
      if (logMode) console.log('🔓🔴 locking changes')
      // Whether this pulse has begun writing to the store. A throw before that leaves the
      // store exactly as it was, so saves may resume. A throw after it may have left part of
      // the remote character applied, so they may not. Conservative: a write that threw before
      // changing anything still counts as begun.
      let storeWriteStarted = false
      try {
        const characterId = initValues.character.id
        const { attributes, ...profile } = dispatch.characters[characterId]
        // After a part-way failure the store may not match the remote, so even our own echo
        // takes the full hydrate below, which reloads the whole character and unblocks saves.
        // Otherwise a player editing alone, whose every later pulse is an own echo, would stay
        // blocked for the rest of the session.
        if (attributes.updateId === sheetId.value && !hydrateFailed.value) {
          // Our attributes, but the profile may have changed elsewhere. Take only the
          // fields that moved, so a name still being typed here survives an own echo,
          // and keep any pending save alive: it dehydrates at fire time and carries the
          // new values.
          const changed = outsideProfileChanges(profile, knownProfile)
          if (Object.keys(changed).length) {
            storeWriteStarted = true
            store.meta.hydrate(changed)
            knownProfile = { ...knownProfile, ...changed }
            await nextTick()
          }
          return
        }
        // A real hydrate supersedes any pending local persist: cancel it, or its
        // pre-hydrate snapshot fires after unlock and overwrites the newer remote
        // state (ddd-ej2). Own-echo pulses return above and keep pending writes.
        debounceUpdate.cancel()
        storeWriteStarted = true
        store.hydrateStore(attributes, profile)
        knownProfile = pickProfile(store.meta.dehydrate())
        // The store now matches the remote character, so a failure before this one no longer
        // blocks saves.
        hydrateFailed.value = false
        await nextTick()
      } catch (error) {
        // Catching at all is the point of this try. Before ddd-aary a throw anywhere above
        // left the lock set for the rest of the session, and the save gate then silently
        // dropped every later edit. The finally below now unlocks only when the store was
        // left intact. Logged rather than rethrown: that is what Vue's production build does
        // with a watcher error.
        console.error('Beacon hydrate failed', error)
        if (storeWriteStarted) {
          // A half-applied load: drop any queued save and block new ones until a later load
          // succeeds, so the mixture is never written over the real character.
          debounceUpdate.cancel()
          hydrateFailed.value = true
        }
      } finally {
        if (hydrateFailed.value) {
          if (logMode) console.log('🔒🔴 staying locked after a part-way failed load')
        } else {
          if (logMode) console.log('🔓🟢 unlocking changes')
          blockUpdate.value = false
        }
      }
    })

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
