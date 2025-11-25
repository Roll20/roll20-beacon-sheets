import { defineStore } from "pinia";
import { ref } from "vue";
import type { ComputedRef, Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { damageBonus } from "../modifiersCheck/attackDamage";

export type Modifier = {
    _id: string;
    parentId:string;
    sourceType:string;
    modifiedType?:string;
    modifiedValue?:string;
    option?:string;
    costType?: string;
    penalty?:number;
    bonus?:number;
    variable?:string | number;
    conditional?: string;
    roll?: string;
    source?: string;
    spCost?:number;
    stuntType?:string;
    label?:string;
    enabled?:boolean;
    abilityFocus?:string;
}
export type ModifiersHydrate = {
    modifiers: {
        modifiers: Record<string, Modifier>;
    };
  };
export const useModifiersStore = defineStore('modifiers', ()=>{
  const modifiers: Ref<Array<Modifier>> = ref([]);
  const addModifier = (parentSource:any) => {
      const newModifier = {
          _id: uuidv4(),
          parentId:parentSource._id,
          sourceType:parentSource.type,            
          enabled:parentSource.enabled        
        }
        modifiers.value.push(newModifier);
      return newModifier;
  }
  const removeModifier = (_id:string) => {
    const indexToRemove = modifiers.value.findIndex((mod) => mod._id === _id);
    if (indexToRemove >= 0) modifiers.value.splice(indexToRemove, 1);
  };

  const parentItems = (parentId:string) => {
    return modifiers.value.filter(mod => mod.parentId === parentId);
  };
  const toggleMod = (id:string,enabled:boolean,) => {
    modifiers.value.forEach(mod => {
      if(mod.parentId === id) {
        mod.enabled = enabled
      }
    })
  }
  const getDamageBonus = () => {

    return damageBonus
  }
    const dehydrate = () => {
        return {
            modifiers: {
                modifiers: arrayToObject(modifiers.value),
          },
        };
      };
    
      /*
       * Since the items array is coming is an object, we convert it back into an array before saving here.
       * */
      const hydrate = (hydrateStore: ModifiersHydrate) => {
        modifiers.value = objectToArray(hydrateStore.modifiers?.modifiers) || modifiers.value;
        // modifiers.value.forEach(item => {
        //   if (item.modifiers) {
        //     item.modifiers =  JSON.parse(item.modifiers.replace('$__$',''));
        //     // item.modifiers = objectToArray(item.modifiers)
        //   }
        // });
      };
      return {
        modifiers,
        addModifier,
        removeModifier,
        parentItems,
        toggleMod,
        getDamageBonus,
        dehydrate,
        hydrate,
      };
})