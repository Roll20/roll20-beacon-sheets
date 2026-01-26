import { defineStore } from 'pinia';
import { ref } from 'vue';
import jp from 'jsonpath';
import { useMetaStore, type MetaHydrate } from '@/sheet/stores/meta/metaStore';
import { useAbilitiesStore } from './abilities/abilitiesStore';
import { v4 as uuidv4 } from 'uuid';
import { useBiographyStore } from '@/sheet/stores/biography/biographyStore';
import { useEffectsStore } from './modifiers/modifiersStore';
import { useProficienciesStore } from './proficiencies/proficienciesStore';
import { useProgressionStore } from './progression/progressionStore';
import { features } from 'process';
import { useFeaturesStore } from './features/faturesStore';
import { useActionsStore } from './actions/actionsStore';
import { useResourcesStore } from './resources/resourcesStore';
import { useEquipmentStore } from './equipment/equipmentStore';
import { useCombatStore } from './combat/combatStore';
import { useCurrencyStore } from './currency/currencyStore';
import { useTagsStore } from './tags/tagsStore';
import { useInsanityStore } from './insanity/insanityStore';
import { useSpellsStore } from './spells/spellsStore';
import { useNpcStore } from './npc/npcStore';
import { useUnrankedProficienciesStore } from './proficiencies/unrankedProficienciesStore';
import { useDefenseStore } from './defenses/defenseStore';
import { useAttunementStore } from './attunement/attunementStore';
import { useConditionsStore } from './conditions/conditionsStore';
import { useSensesStore } from './senses/sensesStore';
/*
 * This is the master store for the entire character sheet.
 * This has access to all fields from all the other stores.
 * It is in charge of combining all data in 1 big object to sync it with Firebase.
 * We are listening to changes in this object in other to trigger Dehydrates.
 * Most of this does not need to be changed if you're using Vue.
 * */
export const useSheetStore = defineStore('sheetStore', () => {
  // List all the stores individually.
  const stores = {
    meta: useMetaStore(),
    biography: useBiographyStore(),
    abilities: useAbilitiesStore(),
    modifiers: useEffectsStore(),
    proficiencies: useProficienciesStore(),
    progression: useProgressionStore(),
    features: useFeaturesStore(),
    actions: useActionsStore(),
    resources: useResourcesStore(),
    equipment: useEquipmentStore(),
    combat: useCombatStore(),
    currency: useCurrencyStore(),
    tags: useTagsStore(),
    insanity: useInsanityStore(),
    spells: useSpellsStore(),
    npcs: useNpcStore(),
    defenses: useDefenseStore(),
    unrankedProficiencies: useUnrankedProficienciesStore(),
    attunement: useAttunementStore(),
    conditions: useConditionsStore(),
    senses: useSensesStore(), 
  };

  const pageLoading = ref(false);

  const storeRegistry = Object.keys(stores) as (keyof typeof stores)[];

  const getValue = (path: string) => {
    const value = jp.value(stores, path);
    return value;
  };

  const setValue = (path: string, newValue: any) => {
    const value = jp.value(stores, path, newValue);
    return value;
  };

  const doAction = (path: string, payload: Record<string, any>) => {
    const func = jp.value(stores, path);
    if (typeof func === 'function') func(payload, stores);
  };

  // Loops through all the stores and runs their Dehydrate.
  // Meta store has unique behavior which shouldn't be modified.
  // This is invoked any time Firebase data changes.
  const dehydrateStore = () => {
    const character: Record<string, any> = {};
    character.attributes = {};
    const storeKeys = Object.keys(stores) as (keyof typeof stores)[];
    storeKeys.forEach((key) => {
      //if (key === "rolls") return;
      if (key === 'meta') {
        const { name, bio, gmNotes, avatar } = stores.meta.dehydrate();
        character.name = name;
        character.bio = bio;
        character.gmNotes = gmNotes;
        character.avatar = avatar;
      } else {
        character.attributes[key] = stores[key].dehydrate();
      }
    });
    return character;
  };

  // Loops through all stores and runs Hydrate.
  // Invoked every time anything in this sheet is updated.
  const hydrateStore = (partial: Record<string, any>, meta: MetaHydrate) => {
    if (partial) {
      storeRegistry.forEach((store) => {
        if (!partial[store] && store != 'npcs') return;
        //if (store === "rolls") return;
        stores[store].hydrate(partial[store]);
      });
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

  /*
  DEV METHOD used to fill the sheet with a lot of data without affecting how the stores are initialized.
  * Can invoke it from a button in the Settings tab.
  * */
  const loadExampleData = () => {
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
    loadExampleData,
  };
});
