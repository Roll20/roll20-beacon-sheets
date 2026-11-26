import { defineStore } from 'pinia';
import { ref } from 'vue';
import jp from 'jsonpath';
import { useMetaStore, type MetaHydrate } from '@/sheet/stores/meta/metaStore';
import { useDraftStore } from '@/maker/store/draftStore';
import { useCrucibleLibraryStore } from '@/crucible/store/crucibleLibrary.store';
import { useCrucibleEncounterStore } from '@/crucible/store/crucibleEncounter.store';
import { useCrucibleCharacterStore } from '@/crucible/store/crucibleCharacter.store';

/*
 * Master store for "The Thread of Fate" character maker.
 * It aggregates the Beacon `meta` store (name/avatar/bio fields Roll20 expects)
 * and the maker's `draft` store (the whole CharacterDraft). Its dehydrate/hydrate
 * methods are what the Beacon relay (src/relay/relay.ts) uses to sync with Roll20.
 *
 * The primary store id below must match `primaryStore` passed to createRelay().
 *
 * Crucible data rides three attribute keys, with different audiences:
 *  - crucible / cruciblePlay: THIS character is a deployed Crucible entity (the
 *    Roll20 "NPC sheet" model). Synced for everyone; players receive the
 *    player-safe projection on hydrate.
 *  - crucibleLibrary / crucibleEncounters: the Storyteller's forge. GM-ONLY -
 *    player sessions neither read nor write these keys, so the GM's prep and
 *    secrets never surface on a player's client even if the raw attribute data
 *    reaches a character they can open.
 */
export const useThreadOfFateStore = defineStore('threadOfFateSheet', () => {
  const stores = {
    meta: useMetaStore(),
    draft: useDraftStore(),
    crucible: useCrucibleLibraryStore(),
    crucibleEncounters: useCrucibleEncounterStore(),
    crucibleCharacter: useCrucibleCharacterStore(),
  };

  const pageLoading = ref(false);
  const storeRegistry = Object.keys(stores) as (keyof typeof stores)[];

  const getValue = (path: string) => jp.value(stores, path);
  const setValue = (path: string, newValue: any) => jp.value(stores, path, newValue);
  const doAction = (path: string, payload: Record<string, any>) => {
    const func = jp.value(stores, path);
    if (typeof func === 'function') func(payload, stores);
  };

  // In the VTT, `gm` comes from Beacon settings. Standalone/dev has no host, so
  // the user is always the Storyteller of their own browser.
  const isGmSession = () => stores.meta.permissions.isGM !== false;

  // Combine all stores into one Roll20-bound object. Meta is handled specially.
  const dehydrateStore = () => {
    const character: Record<string, any> = {};
    character.attributes = {};

    const { name, bio, gmNotes, avatar } = stores.meta.dehydrate();
    const boundEntity = stores.crucibleCharacter.dehydrateEntity();

    if (boundEntity) {
      // This character IS a Crucible entity: it presents as the creature.
      character.name =
        boundEntity.roll20.concealName && boundEntity.roll20.concealedAs
          ? boundEntity.roll20.concealedAs
          : boundEntity.identity.name || name;
      character.avatar = boundEntity.token.imageUrl || boundEntity.identity.portrait || avatar;
      character.bio = boundEntity.identity.description || bio;
      character.gmNotes = gmNotes;
      character.attributes.crucible = boundEntity;
      character.attributes.cruciblePlay = stores.crucibleCharacter.dehydratePlay();
    } else {
      // Normal PC sheet.
      character.name = stores.draft.draft.identity.name || name;
      character.avatar = stores.draft.draft.bio.avatarImage || avatar;
      character.bio = bio;
      character.gmNotes = gmNotes;
    }

    character.attributes.draft = stores.draft.dehydrate();
    // The Storyteller's library + encounters: only GM sessions write these.
    if (isGmSession()) {
      character.attributes.crucibleLibrary = stores.crucible.dehydrate();
      character.attributes.crucibleEncounters = stores.crucibleEncounters.dehydrate();
    }
    return character;
  };

  const hydrateStore = (partial: Record<string, any>, meta: MetaHydrate) => {
    if (partial?.draft) {
      stores.draft.hydrate(partial.draft);
    }
    if (partial?.crucible) {
      stores.crucibleCharacter.hydrate(partial.crucible, partial.cruciblePlay, isGmSession());
    }
    // GM-only: player sessions never load the Storyteller's library or encounters.
    if (isGmSession()) {
      if (partial?.crucibleLibrary) {
        stores.crucible.hydrate(partial.crucibleLibrary);
      }
      if (partial?.crucibleEncounters) {
        stores.crucibleEncounters.hydrate(partial.crucibleEncounters);
      }
    }
    if (meta) {
      stores.meta.hydrate(meta);
    }
  };

  const setPermissions = (owned: boolean, gm: boolean) => {
    stores.meta.permissions.isOwner = owned;
    stores.meta.permissions.isGM = gm;
  };
  const setCampaignId = (campaignId?: number) => {
    stores.meta.campaignId = campaignId;
  };

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
  };
});
