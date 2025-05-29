import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';
import rollToChat from '@/utility/rollToChat';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useAbilityScoreStore } from '../abilityScores/abilityScoresStore';
import { useCharacterStore } from '../character/characterStore';

interface Enhancement {
  _id: string;
  part:string;
  cost:string;
  description: string;
}
export type EnhancementsHydrate = {
  enhancements: {
    enhancements: Record<string, Enhancement>;
  };
};
export const useEnhancementStore = defineStore('enhancements', () => {
    const enhancements: Ref<Array<Enhancement>> = ref([]);
    const enhancementsCount: ComputedRef<number> = computed(() => enhancements.value.length);

    const addEnhancement = (enhancement?:any) => {
      const newEnhancement = {
        _id: uuidv4(),
        part: enhancement ? enhancement?.part : '',
        cost: enhancement ? enhancement?.cost : '',
        description: enhancement ? enhancement?.description : '',
      }
      enhancements.value.push(newEnhancement);
    }
    const removeEnhancement = (_id: string) => {
        const indexToRemove = enhancements.value.findIndex((enhancements) => enhancements._id === _id);
        if (indexToRemove >= 0) enhancements.value.splice(indexToRemove, 1);
    };
  
    const printEnhancement = async (_id: string) => {
      
      const enhancement =
        enhancements.value.find((item) => item._id === _id);
          if (!enhancement) return;
          console.log(enhancement)
          await sendToChat({
            title: enhancement.part,
            subtitle: 'Enhancement',
            description: enhancement.description,
          });
    //   const enhancement = enhancements.value.find((item) => item._id === _id);
    //   if (!enhancement) return;
    //   const modifier = ref(0);
    //   console.log('enhancement', enhancement);
    //   const components:any[] = [
    //     { label: `Base Roll`, sides: 6, count:3, alwaysShowInBreakdown: true },
    //     { label: enhancement.ability, value: Number(bonus) },
    //   ];
      
    //   const ability = useAbilityScoreStore();
    //   await rollToChat({
    //     title: enhancement.name,
    //     subtitle: enhancement.enhancementType,
    //     characterName: useMetaStore().name,
    //     allowHeroDie: false,
    //     textContent:enhancement.enhancementTest ? enhancement.enhancementTest + '<br /> vs. Enhancementpower ('+ (10 + Number(ability.WillpowerBase))+')' : '',
    //     targetNumber:enhancement.targetNumber,
    //     components
    //   });
    };
    /*
       * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
       * */
    const dehydrate = () => {
        return {
            enhancements: {
            enhancements: arrayToObject(enhancements.value),
            },
        };
    };
    
    /*
    * Since the items array is coming is an object, we convert it back into an array before saving here.
    * */
    const hydrate = (hydrateStore: EnhancementsHydrate) => {
    enhancements.value = objectToArray(hydrateStore.enhancements?.enhancements) || enhancements.value;
    };
    return {
    enhancements,
    enhancementsCount,

    addEnhancement,
    removeEnhancement,
    printEnhancement,

    dehydrate,
    hydrate,
    };
});