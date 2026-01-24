<script setup>
import { watch, computed } from 'vue';
import NotchContainer from './NotchContainer.vue';
import Skill from './Skill.vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const skills = ['academic arts', 'athletics','coordination','creativity','deception','influence','insight','investigation','leadership','medicine','mysticism','perception','performance','persuasion','purity','stealth','stem']

const skillRefs = skills.map(s => s.replace(/\s+/g, '_'));

const masteryBonus = computed(() => Math.max(1, sheet.reputation));

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
          if (reputation > 5) {
            sheet.proficiency = 6;
          } else if (reputation < 0) {
            sheet.proficiency = 0;
          } else {
            sheet.proficiency = Number(proficiencyMap[reputation]);
          }
        }
      }
    );

    watch(
      () => sheet.reputation,
      (newValue, oldValue) =>
      {
      if (newValue > 5){
        sheet.proficiency = 6;
        return;
      }
      if (newValue < 0){
        sheet.proficiency = 0;
        return;
      }
        var oldProf = sheet.proficiency;
        if (sheet.customProficiency == '' || sheet.customProficiency == undefined)
      {
        var reputation = sheet.reputation;
        sheet.proficiency = Number(proficiencyMap[reputation]);
      }else{
        sheet.proficiency = oldProf;
      }
    });

</script>

<template>
  <NotchContainer width="thick" :notch="20" class="skill-container">
    <h3>skills</h3>
    <Skill v-for="name in skills" :key="name" :skillName="name" :isMastered="sheet.masteredSkill === name.replace(/\s+/g, '_')"></Skill>
    <div class="mastery-row">
      <label>Mastery</label>
      <select v-model="sheet.masteredSkill" class="mastery-select">
        <option value="">None</option>
        <option v-for="ref in skillRefs" :key="ref" :value="ref">{{ ref.replace(/_/g, ' ') }}</option>
      </select>
      <span v-if="sheet.masteredSkill" class="mastery-bonus">+{{ masteryBonus }}</span>
    </div>
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
  .mastery-row {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 4px 0;
    label {
      font-size: 0.85em;
      font-weight: bold;
    }
    .mastery-select {
      text-transform: capitalize;
      flex: 1;
    }
    .mastery-bonus {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--accent, #4a9);
    }
  }
</style>