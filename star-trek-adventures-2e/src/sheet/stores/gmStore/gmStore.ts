import { dispatchRef } from "@/relay/relay";
import type { Dispatch } from "@roll20-official/beacon-sdk";
import { defineStore } from "pinia";
import { reactive, toRaw, watch } from "vue";

export type GMHydrate = GMResources

export type GMResources = {
  momentum: number;
  threat: number;
}

export const useGMStore = defineStore("gm", () => {
  const resources = reactive<GMResources>({
    momentum: 0,
    threat: 0,
  })
  
  watch(() => resources.momentum, async (newValue) => {
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        momentum: newValue
      }
    })
  })
  watch(() => resources.threat, async (newValue) => {
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        threat: newValue
      }
    })
  })

  const dehydrate = (): GMHydrate => {
    return {...toRaw(resources)}
  }

  const hydrate = (hyrdrateStore: GMHydrate) => {
    resources.momentum = hyrdrateStore.momentum ?? resources.momentum;
    resources.threat = hyrdrateStore.threat ?? resources.threat;
  }

  return {
    resources,
    dehydrate,
    hydrate,
  }
})

export const updateGMResources = (change: Partial<GMResources>) => {
  const gmStore = useGMStore();
  const {
    momentum = gmStore.resources.momentum,
    threat = gmStore.resources.threat
  } = change
  Object.assign(gmStore.resources, {momentum, threat})
}