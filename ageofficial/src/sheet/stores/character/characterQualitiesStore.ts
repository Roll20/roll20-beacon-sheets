import { arrayToObject, objectToArray } from '@/utility/objectify';
import sendToChat from '@/utility/sendToChat';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { useModifiersStore } from '../modifiers/modifiersStore';



export type Quality = {
  type: 'Ability Focus' | 'Favored Stunt' | 'Ancestry' | 'Class' | 'Talent' | 'Specialization' | 'Special Feature';
  _id: string;
  name: string;
  quality?:string;
  description: string;
  customName?:string;
  focus?:boolean;
  doubleFocus?:boolean;
  qualityLevel?:string;
  qualityNovice?:string;
  qualityExpert?:string;
  qualityMaster?:string;
  roll?:string;
  spCost?:number;
  stuntType?:string;
  modifiers?: Record<string,any>;
}

export type ItemsHydrate = {
  items: {
    items: Record<string, Quality>;
  };
};

// Define the interface for the store items
export const useItemStore = defineStore('quality', ()=>{
  const items: Ref<Array<Quality>> = ref([]);
  const addItem = (selectedItem?:any) => {
    const newItem = {
        type:selectedItem ? selectedItem.type : '',
        _id: uuidv4(),
        name: selectedItem ? selectedItem.name : '',
        description: selectedItem ? selectedItem.description : '',
        enabled:true,
        modifiers:selectedItem ? selectedItem.modifiers : '',
        ability: selectedItem ? selectedItem.ability : ''
      }
      switch(newItem.type){
        case 'Ability Focus':
          Object.assign(newItem,{
            focus:selectedItem.focus,
            doubleFocus:selectedItem.doubleFocus
          })
        break;
        case 'Talent':   
        case 'Specialization':       
          Object.assign(newItem,{
            qualityLevel:selectedItem.qualityLevel,
            qualityNovice:selectedItem.qualityNovice,
            qualityExpert:selectedItem.qualityExpert,
            qualityMaster:selectedItem.qualityMaster
          })
        break;
        case 'Favored Stunt':
          Object.assign(newItem,{
            spCost:selectedItem.spCost,
            stuntType:selectedItem.stuntType
          })
        break;
      }
    if (selectedItem && selectedItem.customName) {
      Object.assign(newItem,{
        customName:selectedItem.customName,
      });
    }
    items.value.push(newItem);
    return newItem;
  }

  const removeItem = (_id: string) => {
  const indexToRemove = items.value.findIndex((items) => items._id === _id);
  const mods = useModifiersStore();
  const attachedMods = mods.parentItems(_id);
  if (attachedMods.length > 0) attachedMods.forEach(mod => mods.removeModifier(mod._id));
  if (indexToRemove >= 0) items.value.splice(indexToRemove, 1);

  };
  const getItem = (_id: string) => {
    const i = items.value.findIndex((items) => items._id === _id);
      if (i >= 0) {
        return items.value[i]};
    };
  const addModifier = (item:any) => {
    const quality = items.value.find((qty) => qty._id === item._id);
    if (!quality) return;
    if(quality.modifiers){
      quality.modifiers.push({
        _id: uuidv4(),
        option:'',
        customName:'',
        costType: '',
        variable:0
      })
    } 
    else {
      Object.assign(quality,{
        modifiers: [{
          _id: uuidv4(),
          option:'',
          customName:'',
          costType: '',
          variable:0
        }]
      })
    }
    
  }
  const removeModifier = (_id:string,index: number) => {
    const quality = items.value.find((item) => item._id === _id);
    if(!quality) return;
    quality.modifiers?.splice(index, 1);
    };
  const focusItems = items.value.filter(item => item.type === 'Ability Focus');
  const focusItems2 = () => {
      return items.value.filter(item => item.type === 'Ability Focus');
    }
  const stuntItems = items.value.filter(item => item.type === 'Favored Stunt');
  const talentItems =items.value.filter(item => item.type === 'Talent');
  const specializationItems =items.value.filter(item => item.type === 'Specialization');
  const ancestryClassItems = items.value.filter(item => item.type === 'Ancestry' || item.type === 'Class');

  const printQuality = async (_id:string) => {
    const quality = items.value.find((item) => item._id === _id);
    const traits = ref<any[]>([])
    if(quality?.type === 'Favored Stunt'){
      traits.value.push('Stunt Source: ' + quality?.stuntType)
    }
    await sendToChat({
      title: quality?.name || '',
      subtitle: quality?.type,
      traits: traits.value,
      description: quality?.description,
    });
  }

  const dehydrate = () => {
    return {
      items: {
        items: arrayToObject(items.value),
      },
    };
  };

  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: ItemsHydrate) => {
    items.value = objectToArray(hydrateStore.items?.items) || [];
    // Ensure that each item's modifiers are initialized properly
    items.value.forEach(item => {
      if (item.modifiers) {
        item.modifiers =  JSON.parse(item.modifiers.replace('$__$',''));
        // item.modifiers = objectToArray(item.modifiers)
      }
    });
  };
  return {
    items, 

    addItem,
    removeItem,
    getItem,
    addModifier,
    removeModifier,
    focusItems,
    focusItems2,
    stuntItems,
    specializationItems,
    ancestryClassItems,
    talentItems,
    printQuality,
    dehydrate,
    hydrate
  }
});