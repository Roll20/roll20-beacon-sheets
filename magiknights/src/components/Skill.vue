<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import { computed } from 'vue';

const sheet = useSheetStore();
const {
  skillName,
  isMastered
} = defineProps({
  skillName: String,
  isMastered: { type: Boolean, default: false }
});

const skillRef = skillName.replace(/\s+/g,'_');
const abilityAbbreviations = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha'
}

// Access skill data through store to maintain reactivity
const skillObj = computed(() => sheet.skills[skillRef]);

// Computed with getter/setter for proficiency to ensure proper reactivity
const proficiencyModel = computed({
  get: () => sheet.skills[skillRef].proficiency,
  set: (val) => { sheet.skills[skillRef].proficiency = val; }
});

// Function to handle clearing input and resetting to default value
const resetToDefault = () => {
  if (sheet.skills[skillRef].overrideValue === '' || sheet.skills[skillRef].overrideValue === null) {
    sheet.skills[skillRef].overrideValue = '';
  }
};

</script>

<template>
  <div class="skill-row" :class="{ mastered: isMastered }">
    <select :name="`${skillRef}_ability`" v-model="skillObj.ability">
      <option v-for="ability in skillObj.abilitiesList" :key="ability.id" :value="ability">{{ abilityAbbreviations[ability] }}</option>
    </select>
    <input
      type="number"
      class="skill-value"
      v-model="skillObj.overrideValue"
      :placeholder="skillObj.value"
      @blur="resetToDefault"
    />
    <input type="checkbox" :name="`${skillRef}_proficiency`" v-model="proficiencyModel" :class="{ 'mastery-diamond': isMastered }">
    <button @click="sheet.rollSkill(skillRef)" class="skill-name">{{ skillName }}</button>
  </div>
</template>

<style lang="scss">
  .skill-row{
    display: flex;
    gap:var(--skill-gap);
    align-items: center;
    .skill-name{
      text-transform: capitalize;
      color: var(--color);
    }
    select{
      text-transform: capitalize;
      width: 6ch;
    }
    input[type="checkbox"]{
      appearance: none;
      cursor: pointer;
      border: 1px solid var(--borderColor);
      width: 10px;
      aspect-ratio: 1 / 1;
      rotate: 52deg;
      transform: skew(15deg);
      &:checked{
        background-color: var(--borderColor);
      }
      &.mastery-diamond {
        border-color: var(--accent, #4a9);
        &:checked {
          background-color: var(--accent, #4a9);
        }
      }
    }
    .skill-value{
      width: 3ch;
      text-align: center;
      color: var(--color);
    }
    &.mastered .skill-name {
      color: var(--accent, #4a9);
      font-weight: bold;
    }
  }
</style>