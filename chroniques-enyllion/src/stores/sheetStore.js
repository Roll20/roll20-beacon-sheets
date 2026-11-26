import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'
import { dispatchRef, initValues } from '@/relay/relay.js'
import { createRollTemplate } from '@/rollTemplates/index.js'

/*
This function will leverage the beacon SDK to render a roll template to the chat log.
You can customize your roll templates, from what data you want to display, to how they look.
This project features a single roll template in handlebars.
 */
const sendToChat = ({ trait }) => {
  const rollTemplate = createRollTemplate({ trait })
  return dispatchRef.value.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: { whisper: undefined }
  })
}

/*
Adds a trait to the list of traits
 */
const addTrait = (traits) => {
  const trait = {
    _id: uuidv4(),
    name: `Trait ${traits.value?.length + 1}`,
    description: ''
  }
  traits.value.push(trait)
}

/*
Removes a trait from the list of traits
 */
const removeTrait = (traits, traitId) => {
  const indexToRemove = traits.value.findIndex((trait) => trait._id === traitId)
  if (indexToRemove >= 0) traits.value.splice(indexToRemove, 1)
}

/*
Calls the sendToChat function to post the trait to the chat log.
NOTE: The roll template in handlebars checks to see if the passed in data to the chat
is a trait object, and if so, will render the traits name and description with custom CSS.
 */
const postTraitToChat = (trait) => {
  sendToChat({ trait })
}

/*
This is a custom data store, that will house everything you need for data specific to your sheet.
Here you can define all attributes, as well as sheet functions.

In the example we have provided, there is a custom faction text field, as well as a list of
trait objects, that feature a name and description.

This is a great starting place to customize what data you need for your sheet.
 */
const sheetStore = () => {
  const faction = ref('')
  const traits = ref([])
  const traitsCount = computed(() => traits.value?.length)

  // Handles retrieving these values from the store
  const dehydrate = () => {
    return {
      faction: faction.value,
      traits: arrayToObject(traits.value)
    }
  }
  // Handles updating these values in the store.
  const hydrate = (hydrateStore) => {
    faction.value = hydrateStore.faction ?? faction.value
    traits.value = objectToArray(hydrateStore.traits) || traits.value
  }

  return {
    faction,
    traits,
    traitsCount,
    addTrait: () => addTrait(traits),
    removeTrait: (traitId) => removeTrait(traits, traitId),
    postTraitToChat,
    dehydrate,
    hydrate
  }
}

export const useSheetStore = defineStore('sheet', sheetStore)
