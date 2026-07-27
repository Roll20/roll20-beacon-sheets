import { defineStore } from 'pinia'
import { ref } from 'vue'
import jp from 'jsonpath'
import { useMetaStore } from '@/stores/metaStore.js'
import { useStatsStore } from '@/stores/statsStore.js'
import { useSkillsStore } from '@/stores/skillsStore.js'
import { useInventoryStore } from '@/stores/inventoryStore.js'
import { useGrimoireStore } from '@/stores/grimoireStore.js'
import { useNecromancyStore } from '@/stores/necromancyStore.js'
import { useUiStore } from '@/stores/uiStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useEnemyStore } from '@/stores/enemyStore.js'

// Here you can set all default values for your sheet.
// This is your blank slate, new character setup.
export const DEFAULT_CHARACTER_NAME = 'My Hero'
export const DEFAULT_AVATAR_URL =
  'https://s3.amazonaws.com/files.d20.io/images/388362206/5R6pOnpvGrIRL2L0ImU-uA/original.png'
export const DEFAULT_FACTION = 'The Guild of Awesome'

/*
 * This is the master store for the entire character sheet.
 * This has access to all fields from all the other stores.
 * It is in charge of combining all data in 1 big object to sync it with Firebase.
 * We are listening to changes in this object in other to trigger Dehydrates.
 * Most of this does not need to be changed if you're using Vue.
 * */
export const useAppStore = defineStore('app', () => {
  // List all the stores individually.
  const stores = {
    meta: useMetaStore(),
    stats: useStatsStore(),
    skills: useSkillsStore(),
    inventory: useInventoryStore(),
    grimoire: useGrimoireStore(),
    necromancy: useNecromancyStore(),
    ui: useUiStore(),
    npc: useNpcStore(),
    enemy: useEnemyStore()
  }
  const storeRegistry = Object.keys(stores)

  const pageLoading = ref(false)

  const getValue = (path) => {
    return jp.value(stores, path)
  }
  const setValue = (path, newValue) => {
    return jp.value(stores, path, newValue)
  }
  const doAction = (path, payload) => {
    const func = jp.value(stores, path)
    if (typeof func === 'function') func(payload, stores)
  }

  // Loops through all the stores and runs their Dehydrate.
  // Meta store has unique behavior which shouldn't be modified.
  // Invoked every time anything in this sheet is updated.
  const dehydrateStore = () => {
    const character = {}
    character.attributes = {}
    const storeKeys = Object.keys(stores)

    storeKeys.forEach((key) => {
      if (key === 'meta') {
        const { name, bio, gmNotes, avatar } = stores.meta.dehydrate()

        character.name = name
        character.bio = bio
        character.gmNotes = gmNotes
        character.avatar = avatar
      } else {
        character.attributes[key] = stores[key].dehydrate()
      }
    })

    return character
  }

  // Loops through all stores and runs Hydrate. 
  // This is invoked any time Firebase data changes.
  const hydrateStore = (partial, meta) => {
    if (partial) {
      storeRegistry.forEach((store) => {
        if (!partial[store]) return
        stores[store].hydrate(partial[store])
      })
    }
    if (meta) {
      stores.meta.hydrate(meta)
    }
  }

  const setPermissions = (owned, gm) => {
    stores.meta.permissions.isOwner = owned
    stores.meta.permissions.isGM = gm
  }
  const setCampaignId = (campaignId) => {
    stores.meta.campaignId = campaignId
  }

  /*
  DEV METHOD used to fill the sheet with a lot of data without affecting how the stores are initialized.
  * Can invoke it from a button in the Settings tab.
  * */
  const loadExampleData = () => {
    stores.meta.name = DEFAULT_CHARACTER_NAME
    stores.meta.avatar = DEFAULT_AVATAR_URL
    stores.stats.hpActual = 30
    stores.stats.hpTotal = 30
  }

  return {
    ...stores,
    storeRegistry,
    getValue,
    setValue,
    doAction,
    dehydrateStore,
    hydrateStore,
    setPermissions,
    setCampaignId,
    pageLoading,
    loadExampleData
  }
})
