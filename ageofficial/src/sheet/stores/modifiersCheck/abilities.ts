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
  })
  console.log(values)
  return values
//   if(values.length > 0){
//     return values.reduce(function(a,b){return a+b;})
//   } else {
//     return 0
//   }
})