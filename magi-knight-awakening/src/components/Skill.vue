<script setup>
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const {skills} = sheet
const {
  skillName
} = defineProps({
  skillName: String
});

const skillRef = skillName.replace(/\s+/g,'_');
const skillObj = skills[skillRef];
const abilityAbbreviations = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha'
}

// Function to handle clearing input and resetting to default value
const resetToDefault = () => {
  if (skillObj.overrideValue === '' || skillObj.overrideValue === null) {
    skillObj.overrideValue = null;
  }
};

</script>

<template>
  <div class="skill-row">
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
    <input type="checkbox" :name="`${skillRef}_proficiency`" value="1" v-model="skillObj.proficiency">
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
    }
    .skill-value{
      width: 3ch;
      text-align: center;
    }
  }
</style>