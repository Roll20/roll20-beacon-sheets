import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { dispatchRef, initValues } from '@/relay/relay.js';
import { createRollTemplate } from '@/rollTemplates/index.js';

const sendToChat = ({ trait }) => {
  const rollTemplate = createRollTemplate({ trait });
  return dispatchRef.value.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: { whisper: undefined },
  });
};

const addTrait = (traits) => {
  const trait = {
    _id: uuidv4(),
    name: `Trait ${traits.value?.length + 1}`,
    description: ''
  }
  traits.value.push(trait);
}
const removeTrait = (traits, traitId) => {
  const indexToRemove = traits.value.findIndex((trait) => trait._id === traitId);
  if (indexToRemove >= 0) traits.value.splice(indexToRemove, 1);
};
const postTraitToChat = (trait) => {
  sendToChat({ trait });
}

const sheetStore = () => {
  const faction = ref('');
  const traits = ref([]);
  const traitsCount = computed(() => traits.value?.length);

  const dehydrate = () => {
    return {
      faction: faction.value,
      traits: arrayToObject(traits.value)
    };
  };
  const hydrate = (hydrateStore) => {
    faction.value = hydrateStore.faction ?? faction.value;
    traits.value = objectToArray(hydrateStore.traits) || traits.value;
  };

  return {
    faction,
    traits,
    traitsCount,
    addTrait: () => addTrait(traits),
    removeTrait: (traitId) => removeTrait(traits, traitId),
    postTraitToChat,
    dehydrate,
    hydrate
  };
}

export const useSheetStore = defineStore(
  'sheet',
  sheetStore
);
