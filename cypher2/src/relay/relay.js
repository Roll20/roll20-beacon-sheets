import { initRelay } from '@roll20-official/beacon-sdk'
import { debounce } from 'lodash'

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver,
  onDropOver
} from './handlers/handlers'
import { reactive, ref, watch, nextTick, shallowRef, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { tokenBars, computedPools, computedHealth, TOKEN_BAR_UPDATE_ID } from './tokenBars.js'

/* 
This is the configuration for the relay. It defines the handlers and actions that the sheet will use.
The handlers are functions that are called by the relay when certain events occur.
The actions are custom functions that can be called by the sheet to perform specific actions.
the computed properties are exposed by the sheet to be used in macros, inline rolls and tokens.
*/

/*
Token-bar exposure. The whole set lives in tokenBars.js, which owns the values, their
names, their write rules and the SDK's read/write shape; this file is only the seam that
hands them to initRelay.

Re-exported here because both halves were defined in this file until the bar set was
widened beyond the three Pools and NPC health, and the relay's own tests and the
compendium drop path reach for them by these names.
*/
export { tokenBars, computedPools, computedHealth, TOKEN_BAR_UPDATE_ID }

// Exported for the handler-registration test (spec ⑥ §7.2 "Relay").
export const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver,
    onDropOver
  },
  // Refer to our advanced example sheet on how to setup actions and computed properties.
  actions: {},
  computed: tokenBars
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
// Hydrate lock (spec ⑥ decision 14). A COUNT of pulse callbacks still running, not a
// boolean each one clears. Vue does not await an async watch callback, so two can
// overlap around their `await nextTick()`, and the first to finish must not unlock the
// second.
const activeHydrates = ref(0)
// Set when a hydrate throws after it began changing the store. The store may then hold
// part of the remote document, and saving it would overwrite the remote with that mix,
// so saves stay blocked until a later hydrate succeeds (plan audit round 1).
const hydrateFailed = ref(false)
// Saves are skipped while this is true.
export const blockUpdate = computed(() => activeHydrates.value > 0 || hydrateFailed.value)
let idleWaiters = []

// Only the pulse watcher calls these two in production. They are exported so tests can
// hold the lock longer than any real hydrate does.
export const beginHydrate = () => {
  activeHydrates.value += 1
}
export const endHydrate = () => {
  activeHydrates.value = Math.max(0, activeHydrates.value - 1)
  if (blockUpdate.value) return
  const waiters = idleWaiters
  idleWaiters = []
  for (const resolve of waiters) resolve()
}
export const hydratesInFlight = () => activeHydrates.value

// Resolves once saves are unblocked. Another hydrate can start before the caller's
// continuation runs, so a caller about to write must re-check blockUpdate in the same
// synchronous run as the write (compendium/drop.js does). A caller that gives up first
// leaves its resolver here until the lock drains. That is one small closure per
// abandoned wait, accepted like the SDK's own unanswered request handlers (spec ⑥ §5).
export const awaitHydrationIdle = () =>
  blockUpdate.value ? new Promise((resolve) => idleWaiters.push(resolve)) : Promise.resolve()
export const dispatchRef = shallowRef()
export const dropUpdate = ref({})
export const settingsSheet = ref(false)
const sheetId = ref(uuidv4())

/*
This is the function that is called when the character data is updated.
logMode is a flag that can be used to log the updates to the console. This is useful for debugging.
*/
// Last payload the remote is known to hold — set on every dispatch AND on
// every hydrate (to the post-hydrate document). Transient UI state
// (rollerStat) bubbles $subscribe without changing the dehydrated document,
// so byte-identical fires are skipped (ddd-hy2) — including the first roller
// churn after startup or a hydrate. An edit restoring a PRE-hydrate value
// still differs from the post-hydrate baseline, so it persists (audit r2).
let lastSentPayload = null

// The profile fields the sheet saves beside its attributes (stores/index.js dehydrateStore).
const PROFILE_KEYS = ['name', 'bio', 'gmNotes', 'avatar']

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

const doUpdate = (dispatch, getUpdate, logMode = false) => {
  // getUpdate is a thunk: dehydration happens at debounce-fire time, never at
  // schedule time — a snapshot captured before a hydrate would resurrect stale
  // state the store no longer holds (ddd-ej2).
  const update = getUpdate()
  const payload = JSON.stringify(update)
  if (payload === lastSentPayload) {
    if (logMode) console.info('⏭️ Skipping byte-identical update')
    return
  }
  lastSentPayload = payload
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
    lastSentPayload = JSON.stringify(store.dehydrateStore()) // startup baseline (ddd-hy2)

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
      beginHydrate()
      if (logMode) console.log('🔓🔴 locking changes')
      // Whether this pulse has attempted a store write. A throw before that leaves the
      // store exactly as it was, so saves may resume. A throw after it may have left part
      // of the remote document applied, so they may not. Conservative: a write that threw
      // before changing anything still counts as attempted.
      let storeWriteStarted = false
      try {
        const characterId = initValues.character.id
        const { attributes, ...profile } = dispatch.characters[characterId]
        // After a part-way failure the store may not match the remote, so even our own
        // echo takes the full hydrate below, which reloads the whole remote document and
        // unblocks saves. Otherwise an editor whose later pulses are all own echoes would
        // stay blocked for the session (plan audit round 2).
        if (attributes.updateId === sheetId.value && !hydrateFailed.value) {
          // Our attributes, but the profile may have changed elsewhere. Take only the
          // fields that moved, so a name still being typed here survives an own echo,
          // and keep any pending save alive: it dehydrates at fire time and carries the
          // new values. Rebase the save gate's profile too, since the remote holds it.
          const known = JSON.parse(lastSentPayload ?? '{}')
          const changed = outsideProfileChanges(profile, known)
          if (Object.keys(changed).length) {
            storeWriteStarted = true
            store.meta.hydrate(changed)
            const next = { ...known, ...changed }
            const { name, bio, gmNotes, avatar } = next
            lastSentPayload = JSON.stringify({ name, bio, gmNotes, avatar, attributes: known.attributes })
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
        // Baseline = the document remote just gave us: roller churn after a
        // hydrate must not echo it back, while an edit restoring a pre-hydrate
        // value differs from this baseline and still persists (ddd-hy2 audit).
        lastSentPayload = JSON.stringify(store.dehydrateStore())
        // The store now matches the remote document, so a failure before this one no
        // longer blocks saves.
        hydrateFailed.value = false
        await nextTick()
      } catch (error) {
        // Before spec ⑥ a throw here left the lock set for the rest of the session and
        // silently stopped every save. Logged rather than rethrown: Vue's production
        // build only logs a watcher error too.
        console.error('Beacon hydrate failed', error)
        if (storeWriteStarted) {
          // A half-applied hydrate: drop any queued save and block new ones until a
          // later hydrate succeeds, so the mix is never written over the remote.
          debounceUpdate.cancel()
          hydrateFailed.value = true
        }
      } finally {
        endHydrate()
        if (logMode) console.log('🔓🟢 unlocking changes')
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
