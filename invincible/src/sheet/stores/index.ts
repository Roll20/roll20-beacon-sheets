import { defineStore, getActivePinia } from 'pinia';
import { ref } from 'vue';
import jp from 'jsonpath';
import { deleteEntity as systemDeleteEntity } from '@/system/entities/deleteEntity';
import { getFromContext } from '@/utility/accessor';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { sampleStore } from '@/sheet/stores/sample/sampleStore';
import { effectsStore } from '@/sheet/stores/effects/effectsStore';
import { powersStore } from '@/sheet/stores/powers/powersStore';
import { abilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { combatStore } from '@/sheet/stores/combat/combatStore';
import { biographyStore } from '@/sheet/stores/biography/biographyStore';
import { featuresStore } from '@/sheet/stores/features/featuresStore';
import { actionsStore } from '@/sheet/stores/actions/actionsStore';
import { CharacterDataSchema, SheetHydrateSchema, type SheetHydrate, type CharacterData } from '@/schemas/hydrate/sheet';
import { gearStore } from './gear/gearStore';
import { normalizeArrays } from '@/utility/normalizeArrays';

export const characterStore = defineStore('character', () => {
  const stores = {
    meta: metaStore(),
    sample: sampleStore(),
    effects: effectsStore(),
    powers: powersStore(),
    abilities: abilitiesStore(),
    combat: combatStore(),
    biography: biographyStore(),
    features: featuresStore(),
    actions: actionsStore(),
    gear: gearStore(),
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

  const hydrateStore = (store: SheetHydrate) => {
    if (store) {
      storeRegistry.forEach((storeKey) => {
        if (!store[storeKey]) return;
        (stores[storeKey] as any).hydrate(store[storeKey]);
      });
    }
  };

  const setPermissions = (owned: boolean, gm: boolean) => {
    stores.meta.permissions.isOwner = owned;
    stores.meta.permissions.isGM = gm;
  };
  const setCampaignId = (campaignId?: number) => {
    stores.meta.campaignId = campaignId;
  };

  const deleteEntity = (entityId: string) => {
    return systemDeleteEntity(stores, entityId);
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
    deleteEntity,
  };
});

export const getCharacterData = (character?: any): CharacterData => {
  const pinia = getActivePinia();
  const store = pinia ? characterStore() : undefined;
  let context = character || store;

  
  if (context && typeof context === 'object' && context.character && context.dispatch) {
    context = context.character;
  }

  if (!context) {
    throw new Error('getCharacterData: No context provided and Pinia is not active.');
  }

  const result: any = {};

  
  
  
  const schemaShape = SheetHydrateSchema.shape;

  Object.keys(schemaShape).forEach((storeKey) => {
    let subSchema = (schemaShape as any)[storeKey];
    
    while (subSchema._def.innerType) {
      subSchema = subSchema._def.innerType;
    }

    if (subSchema.shape) {
      result[storeKey] = {};
      Object.keys(subSchema.shape).forEach((attrKey) => {
        result[storeKey][attrKey] = getFromContext(`${storeKey}.${attrKey}`, context);
      });
    }
  });

  
  const normalized = normalizeArrays(result);

  
  const parsed = CharacterDataSchema.safeParse(normalized);
  if (!parsed.success) {
    console.warn('[stores/index.ts] getCharacterData validation failed:', parsed.error);
    return normalized as CharacterData;
  }
  return parsed.data;
};
