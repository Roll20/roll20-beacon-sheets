<script setup>
import NotchContainer from './NotchContainer.vue';
import Skill from './Skill.vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const skills = ['academic arts', 'athletics','coordination','creativity','deception','influence','insight','investigation','leadership','medicine','mysiticism','perception','performance','persuasion','purity','stealth','stem']
</script>

<template>
  <NotchContainer width="thick" :notch="20" class="skill-container">
    <h3>skills</h3>
    <Skill v-for="name in skills" :key="name" :skillName="name"></Skill>
    <div class="flex-box half-gap">
      <span>Proficiency Bonus</span>
      <span>{{ sheet.proficiency }}</span>
    </div>
  </NotchContainer>
</template>

<style>
.skill-container{
  align-self: start;
  display: grid;
  gap: var(--tiny-gap);
}
</style>