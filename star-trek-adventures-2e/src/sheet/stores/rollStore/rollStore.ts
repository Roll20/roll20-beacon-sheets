import type { AttributeKey, DepartmentKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { reactive } from "vue";

export type ActiveStats = {
  attribute?: AttributeKey;
  department?: DepartmentKey;
  focus?: string;
}

export const useRollStore = defineStore("roll", () => {
  const activeStats = reactive<ActiveStats>({});

  return {
    activeStats
  }
})