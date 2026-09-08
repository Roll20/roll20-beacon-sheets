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

// Token-bar exposure (spec §4): campaigns bind bars to these computed pools.
// The get shape follows the Beacon advanced-example convention; the sandbox
// walkthrough is the real gate (spec §8 risk). Attributes carry contract paths
// at their root (stores/index.js), so pools live at attributes.pools.<name>.
const poolFromCharacter = (character, pool) => {
  const p = character?.attributes?.pools?.[pool]
  return { current: p?.current ?? 0, max: p?.max ?? 0 }
}

// Marks a write as token-originated. doUpdate stamps the sheet's own id here so
// the beaconPulse watcher can skip its own echo; a token-bar write must NOT
// inherit that id, or the watcher swallows the pulse and the sheet UI drifts
// away from the bar. Any non-sheetId value forces the hydrate (ddd-6qe).
export const TOKEN_BAR_UPDATE_ID = 'token-bar'

// Token-side edits (ddd-6qe). The SDK derives read-only from the ABSENCE of a
// set handler (actionHandler.js: `readonly: !computed[property].set`), which is
// why the bar bubble showed a blocked cursor with get alone. Args arrive as raw
// host strings, and onSetComputed re-runs get() right after set() to echo the
// value back to the bar — so the dispatch must land in the SDK's character
// cache before that read, which dispatch.updateCharacter does synchronously.
const setPoolCurrent = (pool) => async ({ character, dispatch }, value) => {
  if (!dispatch?.updateCharacter) return
  const parsed = Number(String(value ?? '').trim())
  // A cleared or garbled bubble must not silently zero a GM's pool mid-combat.
  if (String(value ?? '').trim() === '' || !Number.isFinite(parsed)) return
  const { max } = poolFromCharacter(character, pool)
  const current = Math.min(Math.max(0, Math.floor(parsed)), max)
  // updateCharacter jsonDiffs `attributes` against the cached document and
  // treats every OMITTED key as a deletion (deep-object-diff yields undefined,
  // replaceUndefined turns it into null, deleteNullValues drops the key). A
  // one-pool fragment would therefore wipe wounds, armor, the other pools, and
  // even this pool's own max/edge. Send the whole tree with only `current`
  // moved; unchanged branches are shared by reference and never mutated, and
  // updateCharacter deep-clones before diffing.
  const attributes = {
    ...character?.attributes,
    pools: {
      ...character?.attributes?.pools,
      [pool]: { ...character?.attributes?.pools?.[pool], current }
    },
    updateId: TOKEN_BAR_UPDATE_ID
  }
  await dispatch.updateCharacter({ character: { id: character?.id, attributes } })
}

const poolComputed = (pool) => ({
  tokenBarValue: true,
  get: ({ character }) => poolFromCharacter(character, pool),
  set: setPoolCurrent(pool)
})

export const computedPools = {
  might: poolComputed('might'),
  speed: poolComputed('speed'),
  intellect: poolComputed('intellect')
}

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
  computed: computedPools
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
      const characterId = initValues.character.id
      blockUpdate.value = true
      if (logMode) console.log('🔓🔴 locking changes')
      const { attributes, ...profile } = dispatch.characters[characterId]
      if (attributes.updateId === sheetId.value) {
        blockUpdate.value = false
        return
      }
      // A real hydrate supersedes any pending local persist: cancel it, or its
      // pre-hydrate snapshot fires after unlock and overwrites the newer remote
      // state (ddd-ej2). Own-echo pulses return above and keep pending writes.
      debounceUpdate.cancel()
      store.hydrateStore(attributes, profile)
      // Baseline = the document remote just gave us: roller churn after a
      // hydrate must not echo it back, while an edit restoring a pre-hydrate
      // value differs from this baseline and still persists (ddd-hy2 audit).
      lastSentPayload = JSON.stringify(store.dehydrateStore())
      await nextTick()
      if (logMode) console.log('🔓🟢 unlocking changes')
      blockUpdate.value = false
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
