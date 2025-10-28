import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

import { useItemStore } from '../character/characterQualitiesStore';
import { useConditionsStore } from '../conditions/conditionsStore';
import { useCustomConditionsStore } from '../conditions/customConditionsStore';
import { useAbilityScoreStore } from '../abilityScores/abilityScoresStore';
import { useCharacterStore } from '../character/characterStore';
import { useModifiersStore } from '../modifiers/modifiersStore';
import type { Modifier } from '../modifiers/modifiersStore';
import { useSettingsStore } from '../settings/settingsStore';

// interface Mod {
//     label?: string;
//     _id: string;
//     option: string;
//     variable: number;
//     conditional: string;
//     roll: string;
//     source?: string;
//     spCost?:number;
//     stuntType?:string;
// }
// interface Mod extends Modifier,

export const baseDamageBonus = computed(() => {
  const char = useCharacterStore();
  
  return 0;
})
export const damageMod = computed(() => {
    const char = useCharacterStore();
    const store = useItemStore();
    const customConditionsStore = useCustomConditionsStore();
    const conditionsStore = useConditionsStore();
    const damageOptions: Ref<Array<Modifier>> = ref([]);
    const favoredStuntMods: Ref<Array<Modifier>> = ref([]);
    // const items = [...store.items,...conditionsStore.conditions,...customConditionsStore.customConditions]
    // items.forEach(itm => {
    //   console.log(itm.modifiers)
    // })
    const mods = useModifiersStore();
    mods.modifiers.forEach(mod => {
      if (mod.option === 'Damage' && mod.modifiedValue === 'Roll') {
        const parent = store.items.filter(itm => itm._id === mod.parentId)[0]

        // console.log(store.items)

        // console.log(items.filter(itm => itm._id === mod.parentId)[0])
        // mod.label = parent.name; 

        // if (mod.source === 'Favored Stunt') {
            if(mod.source === 'Favored Stunt' && (parent.spCost || 0) <= char.stunts){
                mod.label = parent.name; 
                mod.source = parent.type;  
                mod.spCost = parent.spCost;
                mod.stuntType = parent.stuntType;
                damageOptions.value.push(mod);  
            } else {
              if(!parent) return
              mod.label = parent.name;
              mod.source = parent.type; 
              if(parent.type !== 'Favored Stunt') {
                damageOptions.value.push(mod); 
              }
            }
            if (mod.source === 'Favored Stunt' && ((parent.spCost || 0) <= char.stunts)) {
                favoredStuntMods.value.push(mod);
            }           
        }
        // if((parent.spCost || 0) > char.stunts){

        //   damageOptions.value.push(mod);  

        // } else {
        //   damageOptions.value.push(mod);  

        // }
        // if (mod.source === 'Favored Stunt' && ((parent.spCost || 0) <= char.stunts)) {
        //   mod.label = parent.name; 

        //     favoredStuntMods.value.push(mod);
        // }   
        // if((parent.spCost || 0) <= char.stunts){
        //     mod.label = itm.name; 
        //     mod.source = itm.type;  
        //     mod.spCost = itm.spCost;
        //     mod.stuntType = itm.stuntType;
        //     damageOptions.value.push(mod);  
        // } else {
        //   mod.source = itm.type; 
        //   if(itm.type !== 'Favored Stunt') {
        //     damageOptions.value.push(mod); 
        //   }
        // }
                    // if((itm.spCost ? itm.spCost : 0) <= char.stunts){
          // mod.source = itm.type;  
          // mod.spCost = itm.spCost;
          // mod.stuntType = itm.stuntType;+
          // console.log()
                    // } else {
                    //   mod.source = itm.type; 
                    //   if(itm.type !== 'Favored Stunt') {
                    //     damageOptions.value.push(mod); 
                    //   }
        // }
                    // if (mod.source === 'Favored Stunt' && ((itm.spCost ? itm.spCost : 0) <= char.stunts)) {
                    //     favoredStuntMods.value.push(mod);
                    // }           
                // }
    })
    // mods.modifiers.forEach(itm => {
    //     if (!itm.modifiers) return;
    //     console.log(itm.modifiers)
    //     itm.modifiers.forEach((mod: Mod) => {
    //       console.log(mod)
    //         if (mod.option === 'Damage') {
    //           // debugger
    //             if((itm.spCost ? itm.spCost : 0) <= char.stunts){
    //                 mod.label = itm.name; 
    //                 mod.source = itm.type;  
    //                 mod.spCost = itm.spCost;
    //                 mod.stuntType = itm.stuntType;
    //                 damageOptions.value.push(mod);  
    //             } else {
    //               mod.source = itm.type; 
    //               if(itm.type !== 'Favored Stunt') {
    //                 damageOptions.value.push(mod); 
    //               }
    //             }
    //             if (mod.source === 'Favored Stunt' && ((itm.spCost ? itm.spCost : 0) <= char.stunts)) {
    //                 favoredStuntMods.value.push(mod);
    //             }           
    //         }
    //     });
    // })
    return createCombinedDmgMods(damageOptions.value,favoredStuntMods.value)
});

function createCombinedDmgMods(array1: Modifier[], array2: Modifier[]): Modifier[] {
    const array3 = [...array1];
  
    array2.forEach(mod2 => {
      const matchingMod = array1.find(mod1 => mod1._id === mod2._id);
  
      if (!matchingMod) {
        // If no match, just push the mod from array2
        array3.push(mod2);
      } else {
        // Create a combined object if the objects are different
        
        array1.forEach(mod1 => {
          if (mod1._id !== mod2._id) {
            if(mod1.source !== mod2.source){
              array3.push({
                ...mod1,
                label: `${mod1.label} + ${mod2.label}`,
                roll: mergeDice([(mod1.variable ? (mod1.variable as string) : mod1.roll || ''), (mod2.variable ? (mod2.variable as string): mod2.roll||'')]),
                source: mod1.source,
                spCost: mod2.spCost,
  
              });
            }
            
          }
        });
      }
    });
  
    return array3;
  }
// Helper function to merge dice rolls (same as before)
function mergeDice(rolls: string[]): string {
  // console.log(rolls)
    const diceMap: Record<string, number> = {};
    let totalModifier = 0;

    function processRoll(roll: string) {
        const regex = /^(\d*)d(\d+)([+-]\d+)?$/;
        const match = roll.match(regex);

        if (match) {
            const num = Number(match[1] || 1);
            const sides = Number(match[2]);
            const modifier = Number(match[3] || 0);

            if (diceMap[sides]) {
                diceMap[sides] += num;
            } else {
                diceMap[sides] = num;
            }

            totalModifier += modifier;
        }
    }

    rolls.forEach(roll => processRoll(roll));

    const combinedDice = Object.entries(diceMap).map(([sides, num]) => `${num}d${sides}`);
    if (totalModifier !== 0) {
        combinedDice.push(`${totalModifier > 0 ? '+' : ''}${totalModifier}`);
    }

    return combinedDice.join(' + ');
}

export const damageBonus = computed(()=>{
  const mods = useModifiersStore();
  const totalBonus = ref(0);
  // console.log(totalBonus.value)

  // console.log(mods.modifiers)
  // mods.modifiers = []
    mods.modifiers.forEach(mod => {
      // mod = null
      if(mod.option === 'Damage' && mod.modifiedValue !== 'Roll'){
        // const modIndex = ref(0)
        switch(mod.sourceType){
          case 'Condition':
            console.log(mod)
            totalBonus.value += Number(mod.bonus || 0) + Number(mod.penalty || 0)
            
          break;
          default:
            totalBonus.value += Number(mod.bonus || 0) + Number(mod.penalty || 0)
          break;
        }
        // mods.modifiers.findIndex((submod) => submod._id === mod.parentId);
        // if (modIndex >= 0){
// mod.
        // }
        // if(mod.sourceType === 'Condition' && )
            // totalBonus.value += Number(mod.bonus || 0) + Number(mod.penalty || 0)

      }
    })
  return totalBonus.value
})

export const attackToHit = (attack: any) => {
  const settings = useSettingsStore();
  const ability = useAbilityScoreStore();
  const quals = useItemStore();
  const abilityBase = ref(`${attack.weaponGroupAbility}Base`);
  return computed(() => {
    let toHit = 0;
    if (settings.aimToggle === 'always') toHit += settings.aimValue;
    if (settings.aim) toHit += settings.aimValue;
    quals.items.forEach(qual => {
      if (qual.type === 'Ability Focus' && (qual.name === attack.weaponGroup || qual.customName === attack.name)) {
        if (qual.doubleFocus) {
          toHit += 4;
        } else if (qual.focus) {
          toHit += 2;
        }
      }
    });
    // @ts-ignore
    toHit += Number(ability[abilityBase.value] || 0);
    return toHit;
  });
};

export const attackFocus = (attack:any) => {
  const focusBonus = ref(0);
  const quals = useItemStore();
  quals.items.forEach(qual => {
    if (qual.type === 'Ability Focus' && (qual.name === attack.weaponGroup || qual.customName === attack.name)) {
      if(qual.doubleFocus){
        focusBonus.value += 4
      } else if(qual.focus){
        focusBonus.value += 2
      }
    }
  });
  return focusBonus.value
}