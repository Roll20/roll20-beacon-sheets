import { dispatchRef } from "@/relay/relay";
import type { Dispatch } from "@roll20-official/beacon-sdk";
import { defineStore } from "pinia";
import { reactive, ref, toRaw, watch } from "vue";
import { useMetaStore } from "../meta/metaStore";

export type GMHydrate = GMResources & {
  localSheetID: number;
}

export type GMResources = {
  momentum: number;
  threat: number;
}

export const useGMStore = defineStore("gm", () => {
  const metaStore = useMetaStore();
  const localSheetID = ref();
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

  const registerAsGMSheet = async () => {
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        gmID: localSheetID.value,
      }
    })
    metaStore.name = "GM Sheet";
  }

  const dehydrate = (): GMHydrate => {
    return {
      ...toRaw(resources), 
      localSheetID: localSheetID.value,
    }
  }

  const hydrate = (hyrdrateStore: GMHydrate) => {
    console.log("hyrdate start!", hyrdrateStore)
    resources.momentum = hyrdrateStore.momentum ?? resources.momentum;
    resources.threat = hyrdrateStore.threat ?? resources.threat;
    localSheetID.value = hyrdrateStore.localSheetID;
    console.log("hyrdate done!", localSheetID.value)
  }

  const updateGMResources = (change: Partial<GMResources>) => {
    const gmStore = useGMStore();
    const {
      momentum = gmStore.resources.momentum,
      threat = gmStore.resources.threat
    } = change
    Object.assign(resources, {momentum, threat})
  }

  return {
    updateGMResources,
    resources,
    registerAsGMSheet,
    dehydrate,
    hydrate,
  }
})