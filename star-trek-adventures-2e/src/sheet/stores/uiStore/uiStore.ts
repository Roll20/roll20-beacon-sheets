import type { DepartmentKey, AttributeKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("interface", () => {
  const modifyingStat = ref<AttributeKey | DepartmentKey | undefined>()
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
