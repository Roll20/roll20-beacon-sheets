import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { defineStore } from 'pinia';
import { reactive, ref, toRaw, watch } from 'vue';
import { useMetaStore } from '../meta/metaStore';

export type GMHydrate = GMResources & {
  localSheetID: number;
};

export type GMResources = {
  momentum: number;
  threat: number;
};

export const useGMStore = defineStore('gm', () => {
  const metaStore = useMetaStore();
  const localSheetID = ref(initValues.id ?? 'headless');
  const resources = reactive<GMResources>({
    momentum: 0,
    threat: 0,
  });

  watch(
    () => resources.momentum,
    async (newValue) => {
      if (localSheetID.value === initValues.sharedSettings.gmID) {
        const dispatch = toRaw(dispatchRef.value) as Dispatch;
        await dispatch.updateSharedSettings({
          settings: {
            momentum: newValue,
          },
        });
      }
    },
  );
  watch(
    () => resources.threat,
    async (newValue) => {
      if (localSheetID.value === initValues.sharedSettings.gmID) {
        const dispatch = toRaw(dispatchRef.value) as Dispatch;
        await dispatch.updateSharedSettings({
          settings: {
            threat: newValue,
          },
        });
      }
    },
  );

  const registerAsGMSheet = async () => {
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        gmID: localSheetID.value,
      },
    });
    metaStore.name = 'GM Sheet';
  };

  return {
    resources,
    localSheetID,
    registerAsGMSheet,
  };
});

export const updateGMResources = (change: Partial<GMResources>) => {
  const gmStore = useGMStore();
  console.log(gmStore.localSheetID, change);
  const { momentum = gmStore.resources.momentum, threat = gmStore.resources.threat } = change;
  Object.assign(gmStore.resources, { momentum, threat });
};
