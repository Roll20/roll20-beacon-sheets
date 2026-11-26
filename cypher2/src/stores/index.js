import { defineStore } from 'pinia'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useNpcStore } from '@/stores/npcStore.js'

export const DEFAULT_CHARACTER_NAME = 'Unnamed Character'

/*
 * Master store: combines meta (profile) + sheet (attributes) for the relay.
 * Unlike the Dog sheet quickstart, the sheet store dehydrates to the
 * attributes ROOT (not attributes.sheet) so contract paths appear verbatim
 * in the dehydrated document (beacon-mapping §2); `ui` is its own top-level
 * key (§4) and the relay stamps `updateId` beside them. NPC mode adds two more
 * top-level keys, `sheetType` and `npc`, only once a GM has first switched the
 * sheet to NPC (NPC spec §5.2); until then the payload is unchanged.
 */
export const useAppStore = defineStore('app', () => {
  const stores = {
    meta: useMetaStore(),
    sheet: useSheetStore(),
    npc: useNpcStore()
  }
  const storeRegistry = Object.keys(stores)

  const dehydrateStore = () => {
    const { name, bio, gmNotes, avatar } = stores.meta.dehydrate()
    return { name, bio, gmNotes, avatar, attributes: { ...stores.sheet.dehydrate(), ...stores.npc.dehydrate() } }
  }

  const hydrateStore = (attributes, profile) => {
    // Both stores read the same complete document. The NPC store REPLACES its state
    // from it, so an absent npc clears the branch (NPC spec §5.2).
    if (attributes) {
      stores.sheet.hydrate(attributes)
      stores.npc.hydrate(attributes)
    }
    // Outside the guard: a brand-new character can arrive with no attributes at all.
    stores.sheet.hasStoredUi = Boolean(attributes?.ui)
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
