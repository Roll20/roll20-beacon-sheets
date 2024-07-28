import { type AttributeKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("interface", () => {
  const modifyingStat = ref<AttributeKey | undefined>()
  const editMode = ref(false);

  const dehydrate = () => {};
  const hydrate = () => {};

  return {
    editMode,
    modifyingStat,

    dehydrate,
    hydrate,
  }
})
