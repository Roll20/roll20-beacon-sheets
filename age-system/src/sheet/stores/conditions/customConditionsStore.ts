import { defineStore } from "pinia";
import { ref } from "vue";
import type { ComputedRef, Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { useModifiersStore } from "../modifiers/modifiersStore";

export type Condition = {
    _id:string;
    name:string;
    description:string;
    enabled:boolean;
    show:boolean;
    custom?:boolean;
    modifiers?: Record<string,any>;
}
export type ConditionsHydrate = {
  customConditions: {
      customConditions: Record<string, Condition>;
    };
  };
export const useCustomConditionsStore = defineStore('customConditions', ()=>{
    const customConditions: Ref<Array<Condition>> = ref([]);
    const addCondition = (selectedCondition?:any) => {
        const newCondition = {
            _id: uuidv4(),
            name: `New Skill ${customConditions.value.length + 1}`,
            description: '',
            enabled:false,
            show:false
          }
          customConditions.value.push(newCondition);
        return newCondition;
      }
      const removeCondition = (_id: string) => {
        const indexToRemove = customConditions.value.findIndex((customConditions) => customConditions._id === _id);
        const mods = useModifiersStore();
        const attachedMods = mods.parentItems(_id);
        if (attachedMods.length > 0) attachedMods.forEach(mod => mods.removeModifier(mod._id));
        if (indexToRemove >= 0) customConditions.value.splice(indexToRemove, 1);
      };
      const showCondition = (_id: string) => {
        const indexToShow = customConditions.value.findIndex((customConditions) => customConditions._id === _id);
        if (indexToShow >= 0) customConditions.value[indexToShow].show = !customConditions.value[indexToShow].show
      }
      const getConditionById = (_id: string) => {
        const i = customConditions.value.findIndex((customConditions) => customConditions._id === _id);
        if (i >= 0) customConditions.value[i];
      };
      const addModifier = (customCondition:any) => {
        const condition = customConditions.value.find((qty) => qty._id === customCondition._id);
        if (!condition) return;
        if(condition.modifiers){
          condition.modifiers.push({
            _id: uuidv4(),
            modifiedType:'',
            modifiedValue:'',
            // costType: '',
            // penalty:null,
            // bonus:null,
            // variable:null
          })
        } 
        else {
          Object.assign(condition,{
            modifiers: [{
              _id: uuidv4(),
              // option:'',
              // customName:'',
              // costType: '',
              // variable:0
              // modifiedType:'',
              // modifiedValue:'',
              // costType: '',
              // penalty:null,
              // bonus:null,
              // variable:null
            }]
          })
        }
        
      }
      const removeModifier = (_id:string,index: number) => {
        const condition = customConditions.value.find((customCondition) => customCondition._id === _id);
        if(!condition) return;
        condition.modifiers?.splice(index, 1);
        };
      const dehydrate = () => {
        return {
          customConditions: {
            customConditions: arrayToObject(customConditions.value),
          },
        };
      };
    
      /*
       * Since the customConditions array is coming is an object, we convert it back into an array before saving here.
       * */
      const hydrate = (hydrateStore: ConditionsHydrate) => {
        customConditions.value = objectToArray(hydrateStore.customConditions?.customConditions) || customConditions.value;
        customConditions.value.forEach(item => {
          if (item.modifiers) {
            item.modifiers =  JSON.parse(item.modifiers.replace('$__$',''));
            // item.modifiers = objectToArray(item.modifiers)
          }
        });
      };
      return {
        customConditions,

        addCondition,
        removeCondition,
        showCondition,
        getConditionById,
        addModifier,
        removeModifier,
        dehydrate,
        hydrate,
      };
})