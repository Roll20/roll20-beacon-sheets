<script setup>
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import NotchContainer from './NotchContainer.vue';
import Skill from './Skill.vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const { customProficiency } = storeToRefs(sheet); // Make sure to use storeToRefs for reactivity
const skills = ['academic arts', 'athletics','coordination','creativity','deception','influence','insight','investigation','leadership','medicine','mysiticism','perception','performance','persuasion','purity','stealth','stem']

const proficiencyMap = {
    0: 2,  // or use a more detailed lookup based on the table
    1: 3,
    2: 3,
    3: 4,
    4: 5,
    5: 6
  };

  watch(
      () => sheet.customProficiency,
      (newValue, oldValue) => 
      {
        if (newValue != '') {
          sheet.proficiency = newValue;
        } else {
          var reputation = sheet.reputation;
          sheet.proficiency = Number(proficiencyMap[reputation]);
        }
      }
    );

    watch(
      () => sheet.reputation,
      (newValue, oldValue) => 
      {
        var reputation = sheet.reputation;
        sheet.proficiency = Number(proficiencyMap[reputation]);
      }
    );

</script>

<!-- <template>
  <NotchContainer width="thick" :notch="20" class="skill-container">
    <h3>skills</h3>
    <Skill v-for="name in skills" :key="name" :skillName="name"></Skill>
    <div class="flex-box half-gap">
      <span>Proficiency Bonus</span>
      <input type="number" v-model="sheet.customProficiency" 
             :placeholder="sheet.proficiency" 
             class="proficiency-input" />
    </div>
  </NotchContainer>
</template> -->

<template>
  <NotchContainer width="thick" :notch="20" class="skill-container">
    <h3>skills</h3>
    <Skill v-for="name in skills" :key="name" :skillName="name"></Skill>
    <div class="flex-box half-gap">
      <span>Proficiency Bonus</span>
      <input 
        type="number"
        v-model="sheet.customProficiency" 
        :placeholder="sheet.proficiency" 
        class="proficiency-input" />
    </div>
  </NotchContainer>
</template>


<style>
  .skill-container {
    align-self: start;
    display: grid;
    gap: var(--tiny-gap);
  }
  .proficiency-input {
    width: 50px;
  }
</style>