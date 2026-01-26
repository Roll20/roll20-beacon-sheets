import { computed, ref } from 'vue';
import { useItemStore } from '../character/characterQualitiesStore';
import { useInventoryStore } from '../inventory/inventoryStore';
import { useConditionsStore } from '../conditions/conditionsStore';
import { useAbilityScoreStore } from '../abilityScores/abilityScoresStore';
import { useModifiersStore } from '../modifiers/modifiersStore';

export const defenseMod = computed(() => {
  const store = useItemStore();

  // Sum up the item modifiers that affect "Defense"
  const qMods = store.items.reduce((armorMod, itm) => {
    if (!itm.modifiers) return armorMod;
    itm.modifiers.forEach((mod: any) => {
      if (mod.option === 'Defense') {
        armorMod += Number(mod.variable);
      }
    });
    return armorMod;
  }, 0);
  
  // Combine item modifiers with speed conditions
  return Number(qMods + defenseConditions() + (useInventoryStore()?.equippedShield?.defenseMod || 0));
});
  const defenseConditions = (): number => {
    const conditions = useConditionsStore().conditions;
  const values:number[] = []
  const ability = useAbilityScoreStore();

  conditions.forEach((con)=>{
    if(!con.modifiers) return
    if(typeof con.modifiers === 'string'){
      JSON.parse((con.modifiers as string).replace('$__$','')).forEach((cm:any)=>{
        if(cm.modifiedValue === 'Defense'){
          if(typeof cm.penalty === 'number'){
            values.push(cm.penalty)
          } else {
            const pVal = ability[cm.penalty+'Base'];
            values.push(-pVal)
          }
        }
      })
    } else {
      con.modifiers.forEach((cm: any)=>{
      if(cm.modifiedValue === 'Defense'){
        if(typeof cm.penalty === 'number'){
          values.push(cm.penalty)
        } else {
          const pVal = ability[cm.penalty+'Base'];
          values.push(-pVal)
        }
      }
    })
    }
  })
  const mods = useModifiersStore();
    mods.modifiers.forEach(mod => {
      if (mod.option === 'Defense' && mod.enabled){
        values.push(mod.bonus || mod.penalty || 0)
      }
  })
  if(values.length > 0){
    return values.reduce(function(a,b){return a+b;})
  } else {
    return 0
  }
  };

  export const toughnessMod = computed(() => {
    const mods = useModifiersStore();
    const ability = useAbilityScoreStore();
    const totalMods = ref(0);
    if(mods.modifiers.length === 0){
      totalMods.value = Number(ability.ConstitutionBase);
    } else {
      totalMods.value = mods.modifiers.reduce((toughMod, mod) => {
        toughMod = Number(ability.ConstitutionBase);
        if (mod.option === 'Toughness') {
          if(mod.modifiedValue === 'Modify'){
            toughMod += Number(mod.variable);
          } else {
            toughMod = Number(mod.variable);
          }
        }
      return toughMod
    }, 0);
    }
    
    return totalMods.value >= 0 ? totalMods.value : 0;
  });
// export const defenseMod = computed(() => {
//     console.log(useInventoryStore().equippedShield?.defenseMod)
//     // let armorRMod =0
//     // const store = useItemStore();    
//     // // The computed property will automatically update when store.items changes
//     // return store.items.reduce((armorMod, itm) => {
//     //   if (!itm.modifiers) return 4;
      
//     //   itm.modifiers.forEach((mod:any) => {
//     //     if (mod.option === 'Armor') {
//     //       armorRMod = armorMod += Number(mod.variable);
//     //     }
//     //   });
  
//     //   return armorRMod;
//     // }, 0);
//     return 0
//   });