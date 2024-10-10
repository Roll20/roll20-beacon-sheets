<script setup>
import AbilityScore from './AbilityScore.vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const { abilityScores } = sheet;
const scoreNames = Object.keys(abilityScores);
</script>

<template>
  <div class="ability-container">
    <div class="ability-score-section">
      <AbilityScore v-for="name in scoreNames" :key="name" :score="name">
        <template v-slot:ability><button @click=sheet.rollAbility(name) class="capitalize bold">{{ name }}</button></template>
        <template v-slot:mod><span>{{ abilityScores[name].mod }}</span></template>
        <template v-slot:score>
          <input type="number" v-model="abilityScores[name].score">
        </template>
      </AbilityScore>
    </div>
  </div>
</template>

<style lang="scss">
.ability-container{
  container: ability-container / inline-size;
}
.ability-score-section{
  display: grid;
  justify-content: space-around;
  grid-auto-flow: dense;
  // normal slot replicating paper sheet
  @container (210px < width <= 300px){
    grid-template-columns: auto auto;
    .ability-score-container:is(:nth-child(1):nth-child(2):nth-child(3)){
      grid-column: 1;
    }
  }
  // wider slot
  @container (300px < width < 640px){
    grid-template-columns: auto auto auto;
  }
  // Extra wide slot
  @container (width >= 640px){
    grid-auto-flow: column;
  }
  h5{
    margin:0;
    text-transform: capitalize;
    text-align: center;
  }
}
</style>