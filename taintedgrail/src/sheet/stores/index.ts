import { defineStore } from 'pinia';
import { ref } from 'vue';
import jp from 'jsonpath';

import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useWaysStore } from '@/sheet/stores/waysStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useTraitsStore } from '@/sheet/stores/traits/traitsStore';
import { v4 as uuidv4 } from 'uuid';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useMetaStore, type MetaHydrate } from '@/sheet/stores/meta/metaStore';

/*
 * This is the master store for the entire character sheet.
 * This has access to all fields from all the other stores.
 * It is in charge of combining all data in 1 big object to sync it with Firebase.
 * We are listening to changes in this object in other to trigger Dehydrates.
 * Most of this does not need to be changed if you're using Vue.
 * */
export const useExampleSheetStore = defineStore('taintedgrailStore', () => {
  // List all the stores individually.
  const stores = {
    meta: useMetaStore(),
    character: useCharacterStore(),
    bio: useBioStore(),
    ways: useWaysStore(),
    inventory: useInventoryStore(),
    traits: useTraitsStore(),
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
      if (key === 'bio') {
        const charBio = stores.bio.dehydrate();
        character.name = charBio.bio.name;
        character.player = charBio.bio.player;
        character.avatar = charBio.bio.avatar;
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
        if (!partial[store]) return;
        //if (store === "rolls") return;
        stores[store].hydrate(partial[store]);
      });
    }
    if (meta) {
      //   stores.meta.hydrate(meta);
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
    stores.ways.waysScores = {
      Combativeness: 1,
      Creativity: 0,
      Awareness: 4,
      Reason: 4,
      Conviction: 1,
      domainsAndDisciplines: {
        closeCombat: 0,
        communication: 0,
        compassion: 0,
        craft: 0,
        erudition: 0,
        feats: 0,
        healing: 0,
        inspiration: 0,
        leadership: 0,
        magic: 0,
        monsters: 0,
        mountedCombat: 0,
        naturalEnvironment: 0,
        perception: 0,
        performance: 0,
        religion: 0,
        shootingAndThrowing: 0,
        stealth: 0,
        travel: 0,
        wyrdnessMysteries: 0,
      },
    };
    stores.character.xp = 6000;
    stores.character.heroDiceMod = 2;
    stores.inventory.items = [
      {
        _id: uuidv4(),
        slots: 1,
        name: 'Yarn Ball',
        description:
          'Can be rolled to force all other cats that see it to roll a Difficulty 10 Aura check or run after it.',
        type: 'item',
        quantity: 1,
      },
      {
        _id: uuidv4(),
        slots: 0,
        name: 'Claws',
        description: '1d4 damage. Agile. Finesse.',
        type: 'weapon',
        quantity: 2,
      },
      {
        _id: uuidv4(),
        slots: 2,
        name: 'Catplate Armor',
        description: '+4 defense',
        type: 'armor',
        quantity: 1,
      },
    ];
    stores.inventory.itemsStowed = [
      {
        _id: uuidv4(),
        slots: 1,
        name: 'Catnip',
        description: '????',
        type: 'item',
        quantity: 3,
      },
    ];
    stores.traits.traits = [
      {
        _id: uuidv4(),
        name: 'Feline',
        description: 'Proficient at jumping, hunting, stealth, acrobatics and climbing',
        type: 'skill',
      },
      {
        _id: uuidv4(),
        name: 'Super Cute',
        description:
          'When targeted for a melee attack, they must attempt a Difficulty 8 Aura test or the attack is cancelled.',
        type: 'power',
      },
    ];
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
