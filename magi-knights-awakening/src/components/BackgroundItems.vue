<script setup>
import NotchContainer from './NotchContainer.vue';
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();

const backgroundItems = { 
  player_links: 'Player Links',
  quote: 'Quote',
  interests: 'Interests',
  virtues: 'Virtues',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  electives: 'Electives & Clubs',
  characteristics: 'characteristics',
};

const backstoryItems = {
  backstory: 'backstory',
};

</script>

<template>

    <!-- Backstory Section -->
    <div class="backstory flex-box flex-wrap tiny-gap">
    <label class="flex-box flex-column" v-for="(value, key) in backstoryItems" :key="`backstory-${key}`">
      <NotchContainer width="thick" notch="25" class="backstory-item">
        <h4 class="capitalize">{{ value }}</h4>
        <!-- Bind to sheet[key] instead of sheet[value] -->
        <textarea type="text" class="underline" v-model="sheet[key]" />
      </NotchContainer>
    </label>
  </div>

  <!-- Background Items Section -->
  <div class="backgroundItems flex-box flex-wrap tiny-gap">
    <label class="flex-box flex-column" v-for="(value, key) in backgroundItems" :key="`background-${key}`">
      <NotchContainer width="thick" notch="10" class="background-item">
        <h4 class="capitalize">{{ value }}</h4>
        <!-- Bind to sheet[key] instead of sheet[value] -->
        <textarea type="text" class="underline" v-model="sheet[key]" />
      </NotchContainer>
    </label>
  </div>

</template>

<style>

.backgroundItems > * {
  flex: 1;
}

.background-item{
  display: grid;
  min-width: 22.4cap;
  min-height: 10cap;
  max-width: 22.4cap;
  margin-top: .5cap;
  margin-right: 0.5cap;
}

.background-item textarea {
    width: 100%;
    height: 100%;
    min-height: 10cap;
    box-sizing: border-box;
}

.backstory{
  flex: 1;
  margin-top: 1cap;
  margin-right: 1cap;
}

.backstory-item{
  display:grid;
  min-width: 50cap;
  min-height: 17.1cap;
}

.backstory-item, textarea {
    width: 100%;
    height: 100%;
    min-height: 20cap;
    box-sizing: border-box;
}

</style>