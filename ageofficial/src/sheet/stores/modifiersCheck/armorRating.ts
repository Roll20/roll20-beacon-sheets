import { computed, ref } from 'vue';
import { useModifiersStore } from '../modifiers/modifiersStore';
import { useInventoryStore } from '../inventory/inventoryStore';

export const armorRatingMod = computed(() => {
    const mods = useModifiersStore();
    const inventory = useInventoryStore();
    const totalMods = mods.modifiers.reduce((armorMod, mod) => {
        if (mod.option === 'Armor Rating' && mod.modifiedValue === 'Modify') {
          armorMod += Number(mod.variable);
        }
      return armorMod
    }, 0);
    return totalMods + (inventory.equippedArmor?.defenseMod || 0);
  });

  // export const armorRatingSet = computed(() => {
  //   const mods = useModifiersStore();
  //   return mods.modifiers.reduce((armorMod, mod) => {
  //       if (mod.option === 'Armor Rating' && mod.modifiedValue === 'Set') {
  //         armorMod += Number(mod.variable);
  //       }
  //     return armorMod;
  //   }, 0);
  // });
  export const armorRatingSet = computed(() => {
    const mods = useModifiersStore();
    // Filter the relevant modifiers
    const relevantMods = mods.modifiers.filter(
      mod => mod.option === 'Armor Rating' && mod.modifiedValue === 'Set'
    );
  
    // If no relevant modifiers exist, return null
    if (relevantMods.length === 0) {
      return null; // Or `undefined` if that's preferred
    }
  
    // Otherwise, calculate the total armorMod
    return relevantMods.reduce((armorMod, mod) => {
      armorMod += Number(mod.variable);
      return armorMod;
    }, 0);
  });
  