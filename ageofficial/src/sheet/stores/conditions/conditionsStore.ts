import { defineStore } from "pinia";
import { ref } from "vue";
import type { ComputedRef, Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';

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
    conditions: {
      conditions: Record<string, Condition>;
    };
  };
export const useConditionsStore = defineStore('conditions', ()=>{
    const conditions: Ref<Array<Condition>> = ref([]);
    const addCondition = (selectedCondition:any) => {
        const newCondition = {
            _id: uuidv4(),
            name: selectedCondition.name,
            description: selectedCondition.description,
            show:false,
            enabled:true,
            modifiers:selectedCondition.modifiers
          }
        conditions.value.push(newCondition);
        return newCondition;
      }
      const removeCondition = (_id: string) => {
        const indexToRemove = conditions.value.findIndex((conditions) => conditions._id === _id);
        if (indexToRemove >= 0) conditions.value.splice(indexToRemove, 1);
      };
      const showCondition = (_id: string) => {
        const indexToShow = conditions.value.findIndex((conditions) => conditions._id === _id);
        if (indexToShow >= 0) conditions.value[indexToShow].show = !conditions.value[indexToShow].show
      }
      const dehydrate = () => {
        return {
          conditions: {
            conditions: arrayToObject(conditions.value),
          },
        };
      };
    
      /*
       * Since the items array is coming is an object, we convert it back into an array before saving here.
       * */
      const hydrate = (hydrateStore: ConditionsHydrate) => {
        conditions.value = objectToArray(hydrateStore.conditions?.conditions) || conditions.value;
        conditions.value.forEach(item => {
          if (item.modifiers) {
            item.modifiers =  JSON.parse(item.modifiers.replace('$__$',''));
            // item.modifiers = objectToArray(item.modifiers)
          }
        });
      };
      return {
        conditions,

        addCondition,
        removeCondition,
        showCondition,
        dehydrate,
        hydrate,
      };
})