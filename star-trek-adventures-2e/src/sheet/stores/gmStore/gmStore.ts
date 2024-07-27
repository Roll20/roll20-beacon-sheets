import { defineStore } from "pinia";
import { reactive, toRaw, watch } from "vue";

export type GMHydrate = {
  momentum: number;
  threat: number;
}

export const useGMStore = defineStore("gm", () => {
  const resources = reactive({
    momentum: 0,
    threat: 0,
  })

  watch(()=> resources.momentum, (newValue, oldValue) => {
    console.log(newValue, oldValue)
  })

  const dehydrate = (): GMHydrate => {
    console.log(resources)
    return {...toRaw(resources)}
  }

  const hydrate = (hyrdrateStore: GMHydrate) => {
    console.log(hyrdrateStore)
    resources.momentum = hyrdrateStore.momentum ?? resources.momentum;
    resources.threat = hyrdrateStore.threat ?? resources.threat;
  }

  return {
    resources,
    dehydrate,
    hydrate,
  }
})