import { useMetaStore, type MetaHydrate } from '@/sheet/stores/meta/metaStore';
import jp from 'jsonpath';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStatsStore } from './statsStore/statsStore';
import { useGMStore } from './gmStore/gmStore';
import { useUIStore } from './uiStore/uiStore';
import { useRollStore } from './rollStore/rollStore';
import { useMilestoneStore } from './milestoneStore/milestoneStore';


export const useStarTrekStore = defineStore('StarTrek', () => {
  // List all the stores individually.
  const stores = {
    gm: useGMStore(),
    meta: useMetaStore(),
    milestones: useMilestoneStore(),
    roll: useRollStore(),
    stats: useStatsStore(),
    ui: useUIStore(),
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
      if (key === 'meta') {
        const { name, bio, gmNotes, avatar } = stores.meta.dehydrate();
        character.name = name;
        character.bio = bio;
        character.gmNotes = gmNotes;
        character.avatar = avatar;
      } else if (key !== "gm") {
        character.attributes[key] = stores[key].dehydrate();
      }
    });
    console.log("dehydrate last stop",character);
    return character;
  };

  // Loops through all stores and runs Hydrate.
  // Invoked every time anything in this sheet is updated.
  const hydrateStore = (partial: Record<string, any>, meta: MetaHydrate) => {
    console.log("hydrate first stop", partial)
    if (partial) {
      storeRegistry.forEach((store) => {
        if (!partial[store] || store === "gm") return;
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
