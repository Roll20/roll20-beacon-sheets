import { initRelay } from '@roll20-official/beacon-sdk'
import debounce from 'lodash/debounce'

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver,
  onDropOver
} from './handlers/handlers'
import sheetComputed from './handlers/computed'
import devRelay from './devRelay'
import { reactive, ref, watch, nextTick, shallowRef } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver,
    onDropOver
  },
  actions: {},
  computed: sheetComputed
}

export const initValues = reactive({
  id: '',
  character: { attributes: {} },
  settings: {},
  compendiumDrop: null
})

export const beaconPulse = ref(0)
export const blockUpdate = ref(false)
export const dispatchRef = shallowRef()
export const dropUpdate = ref({})
export const settingsSheet = ref(false)
export const sheetDrops = ref([])
export const dragOverCount = ref(0)
export const refusedDropCount = ref(0)
export const settingsPulse = ref(0)
const sheetId = ref(uuidv4())

const doUpdate = (dispatch, update, logMode = false) => {
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

const debounceUpdate = debounce(doUpdate, 800)

export const createRelay = async ({ devMode = false, primaryStore = 'app', logMode = false }) => {
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig))
  const relayPinia = (context) => {
    if (context.store.$id !== primaryStore) return
    const store = context.store

    dispatchRef.value = dispatch

    const { attributes, ...profile } = initValues.character
    store.hydrateStore(attributes, profile)

    store.setCampaignId(initValues.settings.campaignId)
    store.setPermissions(initValues.settings.owned, initValues.settings.gm)

    watch(settingsPulse, () => {
      store.setPermissions(initValues.settings.owned, initValues.settings.gm)
    })

    store.$subscribe(() => {
      if (blockUpdate.value === true) return
      const update = store.dehydrateStore()
      debounceUpdate(dispatch, update, logMode)
    })

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
      store.hydrateStore(attributes, profile)
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
