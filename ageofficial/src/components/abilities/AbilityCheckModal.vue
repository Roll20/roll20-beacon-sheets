<template>
    <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal">
          <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
          </div>
          <div>
            <button class="ability-check-btn" @click="rollAbilityCheck(ability, false);$emit('close')">
              Roll {{ ability }}                
            </button>
          </div>
          <hr />
          <div v-for="focus in combineObjects(abilityFocusArray)" :key="focus">
            <button class="ability-check-btn" @click="rollAbilityWithFocus(focus);$emit('close')">
              {{ focus.name || focus.focus }} ({{ focus.variable > 0 ? `+${focus.variable}` : focus.variable }})
            </button>
          </div>
      </div>
    </div>
    </Transition>
</template>
<script setup>
const props = defineProps({
  show: Boolean,
  ability: String,

})
import { computed, ref } from 'vue';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useAbilityFocusesStore } from '@/sheet/stores/abilityScores/abilityFocusStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
// import { defineEmits } from 'vue';
import { mage, fage2e, bluerose,fage1e, cthulhu } from '../modifiers/focuses';
import { abilityMods } from '@/sheet/stores/modifiersCheck/abilities';

const { abilityScores, rollAbilityCheck } = useAbilityScoreStore();
const focus = useAbilityFocusesStore();
const quality = useItemStore();
const emit = defineEmits(['rerollCheck']);
const abilityFocusArray = ref(
  [...quality.items.filter(foc => foc.ability === props.ability),...abilityMods.value.filter(am => am.ability === props.ability)]
);
const filteredFocuses = ref(fage2e)

switch(useSettingsStore().gameSystem){
  case 'fage2e':
    filteredFocuses.value = fage2e;
  break;
  case 'mage':
    filteredFocuses.value = mage;
  break;
  case 'fage1e':
    filteredFocuses.value = fage1e;
  break;
  case 'bluerose':
    filteredFocuses.value = bluerose;
  break;
  case 'cthulhu':
    filteredFocuses.value = cthulhu;
  break;
}
// const combinedArray = Object.entries(filteredFocuses).flatMap(([ability, names]) => {
//     return names.map(name => {
//         const matchingFocus = abilityFocusArray.value.find(item => item.ability === ability && item.name === name);
//         return {
//             ability: ability,
//             doubleFocus: matchingFocus ? matchingFocus.doubleFocus : false,  // default to false if not found
//             focus: matchingFocus ? matchingFocus.focus : false,  // default to false if not found
//             name: name
//         };
//     });
// });
// const combinedArray = computed(() => {
//   return Object.entries(filteredFocuses).flatMap(([ability, names]) => {
//     return names.map(name => {
//       const matchingFocus = abilityFocusArray.value.find(item => item.ability === ability && item.name === name);
//       return {
//         ability: ability,
//         doubleFocus: matchingFocus ? matchingFocus.doubleFocus : false,  // default to false if not found
//         focus: matchingFocus ? matchingFocus.focus : false,  // default to false if not found
//         name: name
//       };
//     });
//   });
// });
function focusBonus(obj){
  if (obj.doubleFocus) {
      return 4; // Return 4 if doubleFocus is true
    } else if (obj.focus) {
      return 2; // Return 2 if only focus is true
    } else {
      return 0;
    }
}
const rollAbilityWithFocus = (focus) => {
  if (quality.items.some(item => 
    item.modifiers && item.modifiers.some(modifier => 
        modifier.ability === focus.ability && modifier.abilityFocus === focus.name
    )
)) {
    // Your code here when the condition is true
    emit('rerollCheck',focus);
    rollAbilityCheck(props.ability, true, focus.variable,focus)
} else {
    // Your code here when the condition is false
    rollAbilityCheck(props.ability, true, focus.variable,focus)

}
}
function combineObjects(array) {
  const result = [];
  const abilityWideVariables = {};
  array.forEach((item) => {
    // // Skip if name is an empty string
    // if (!item.name) return;
    // // Check if an entry with the same ability and name already exists in the result
    // let existing = result.find(
    //   (obj) => obj.ability === item.ability && obj.name === item.name
    // );

    // if (existing) {
    //   // Combine the variable based on focus and doubleFocus values
    //   existing.variable += item.variable || (item.focus ? 2 : 0) + (item.doubleFocus ? 4 : 0);
    // } else {
    //   // Create a new entry with initial variable based on focus and doubleFocus
    //   const variable = (item.variable || 0) + (item.focus ? 2 : 0) + (item.doubleFocus ? 2 : 0);
    //   result.push({ ability: item.ability, name: item.name, variable });
    // }
    // If the item has a name, handle it as a unique entry
    if (item.name) {
      // Find if there's already an entry in the result with the same ability and name
      let existing = result.find(
        (obj) => obj.ability === item.ability && obj.name === item.name
      );

      if (existing) {
        // Add the variable from the item to the existing object
        existing.variable += item.variable || 0;
        existing.variable += item.focus ? 2 : 0;
        existing.variable += item.doubleFocus ? 4 : 0;
      } else {
        // Create a new object if none exists yet
        const variable = (item.variable || 0) + (item.focus ? 2 : 0) + (item.doubleFocus ? 4 : 0);
        result.push({ ability: item.ability, name: item.name, variable });
      }
    } else if (item.ability && !item.name) {
      // If there is an ability but no name, store the variable for that ability
      abilityWideVariables[item.ability] = (abilityWideVariables[item.ability] || 0) + item.variable;
    }
  });

  // Add ability-wide variables to matching results by ability
  result.forEach((obj) => {
    if (abilityWideVariables[obj.ability]) {
      obj.variable += abilityWideVariables[obj.ability];
    }
  });

  return result;
}
</script>
<style>
.ability-check-btn {
  background-color: #ecf6ff;
    border: 2px solid rgb(30, 78, 122);
    color: #1e4e7a;
    border-radius: 8px;
    font-weight: bold;
    width: 95%;
    padding: 6px;
    font-size: 1.25rem;
    margin-bottom: 10px;
}
.modal-footer-actions {
  padding-top:10px;
}
</style>