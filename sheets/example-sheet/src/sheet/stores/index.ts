import { defineStore } from 'pinia';
import { ref } from 'vue';
import jp from 'jsonpath';
import { useMetaStore, type MetaHydrate } from '@/sheet/stores/meta/metaStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useTraitsStore } from '@/sheet/stores/traits/traitsStore';
import { v4 as uuidv4 } from 'uuid';
import { useBioStore } from '@/sheet/stores/bio/bioStore';

export const useExampleSheetStore = defineStore('examplesheetStore', () => {
  const stores = {
    meta: useMetaStore(),
    character: useCharacterStore(),
    bio: useBioStore(),
    abilityScores: useAbilityScoreStore(),
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

  const hydrateStore = (partial: Record<string, any>, meta: MetaHydrate) => {
    if (partial) {
      storeRegistry.forEach((store) => {
        if (!partial[store]) return;
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

  /*
  DEV METHOD used to fill the sheet with a lot of data without affecting how the stores are initialized.
  * Can invoke it from a button in the Settings tab.
  * */
  const loadExampleData = () => {
    stores.meta.name = 'Kitten';
    stores.meta.avatar = 'http://placekitten.com/200/200';
    stores.abilityScores.abilityScores = {
      Strength: { base: 1, current: 1 },
      Endurance: { base: 0, current: 0 },
      Agility: { base: 4, current: 4 },
      Charisma: { base: 4, current: 4 },
      Aura: { base: 1, current: 0 },
      Thought: { base: 0, current: 0 },
    };
    stores.bio.friends = 'My Human';
    stores.bio.enemies = 'Dogs';
    stores.bio.looks = 'Smol';
    stores.bio.species = 'Cat';
    stores.bio.likes = 'Fish, yarn';
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
    pageLoading,
    loadExampleData,
  };
});
