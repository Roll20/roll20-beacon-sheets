
import { type AttributeKey, AttributesEnum, type AttributeValue } from "@/system/gameTerms";
import { type ModifierKey, ModifierOperations } from "@/system/logicTerms";
import { defineStore } from "pinia";
import { computed, reactive, toRaw } from "vue";

export type AttributeModifier = {
  operation: ModifierKey,
  value: number,
};

export type AttributeField = {
  label: AttributeValue;
  base: number;
  modifiers?: AttributeModifier[];
}

export const useAttributeStore = defineStore("attributes", () => {
  const fields = reactive<Record<AttributeKey, AttributeField>>({
    CONTROL: {
      label: AttributesEnum.CONTROL,
      base: 0,
    },
    DARING: {
      label: AttributesEnum.DARING,
      base: 0,
    },
    FITNESS: {
      label: AttributesEnum.FITNESS,
      base: 0,
    },
    PRESENCE: {
      label: AttributesEnum.PRESENCE,
      base: 0,
    },
    INSIGHT: {
      label: AttributesEnum.INSIGHT,
      base: 0,
    },
    REASON: {
      label: AttributesEnum.REASON,
      base: 0,
    },
  } as const)

  const calculateAttribute = (attribute: AttributeKey): number => {
    let total = fields[attribute].base;
    const modifiers = fields[attribute].modifiers
    if (modifiers && modifiers.length > 0) {
      modifiers.forEach((modifier)=> {
        total = ModifierOperations[modifier.operation](total, modifier.value)
      })
    }
    return total;
  }

  const CONTROL = computed(() => calculateAttribute("CONTROL"))
  const FITNESS = computed(() => calculateAttribute("FITNESS"))
  const PRESENCE = computed(() => calculateAttribute("PRESENCE"))
  const DARING = computed(() => calculateAttribute("DARING"))
  const INSIGHT = computed(() => calculateAttribute("INSIGHT"))
  const REASON = computed(() => calculateAttribute("PRESENCE"))


  const dehydrate = () => {
    return {
      ...toRaw(fields)
    }
  }

  const hydrate = (hydrateStore: Record<AttributeKey,AttributeField>) => {
    Object.assign(fields, hydrateStore)
  }

  return {
    fields,
    CONTROL,
    FITNESS,
    PRESENCE,
    DARING,
    INSIGHT,
    REASON,

    dehydrate,
    hydrate
  }
})