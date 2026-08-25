import { defineStore } from 'pinia'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetStore } from '@/stores/sheetStore.js'

export const DEFAULT_CHARACTER_NAME = 'Unnamed Character'

/*
 * Master store: combines meta (profile) + sheet (attributes) for the relay.
 * Unlike the Dog sheet quickstart, the sheet store dehydrates to the
 * attributes ROOT (not attributes.sheet) so contract paths appear verbatim
 * in the dehydrated document (beacon-mapping §2); `ui` is its own top-level
 * key (§4) and the relay stamps `updateId` beside them.
 */
export const useAppStore = defineStore('app', () => {
  const stores = {
    meta: useMetaStore(),
    sheet: useSheetStore()
  }
  const storeRegistry = Object.keys(stores)

  const dehydrateStore = () => {
    const { name, bio, gmNotes, avatar } = stores.meta.dehydrate()
    return { name, bio, gmNotes, avatar, attributes: stores.sheet.dehydrate() }
  }

  const hydrateStore = (attributes, profile) => {
    if (attributes) stores.sheet.hydrate(attributes)
    if (profile) stores.meta.hydrate(profile)
  }

  const setPermissions = (owned, gm) => {
    stores.meta.permissions.isOwner = owned
    stores.meta.permissions.isGM = gm
  }
  const setCampaignId = (campaignId) => {
    stores.meta.campaignId = campaignId
  }

  return { ...stores, storeRegistry, dehydrateStore, hydrateStore, setPermissions, setCampaignId }
})
