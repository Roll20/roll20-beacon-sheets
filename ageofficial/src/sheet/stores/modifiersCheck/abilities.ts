import { computed } from "vue";
import { useModifiersStore } from "../modifiers/modifiersStore";

export const abilityMods = computed(() => {
  const values:any[] = []

    const mods = useModifiersStore();
    mods.modifiers.forEach((mod:any) => {
      if (mod.option === 'Ability' && mod.enabled){
        console.log(mod)
        values.push({ability:mod.modifiedValue, name:mod.abilityFocus,variable:mod.bonus || mod.penalty || 0})
      }
    });
  return values;
})