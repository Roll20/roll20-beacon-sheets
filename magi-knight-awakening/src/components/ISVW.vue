<script setup>
import NotchContainer from './NotchContainer.vue';
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();

const isvws = [
  'interests',
  'virtues',
  'strengths',
  'weaknesses',
  'electives_and_clubs',
  'characteristics',
  'quote',
  'player_links',
  'backstory',
];

// Change the h4 class from capitalize to one that capitalizes, strips out the underscores, and checks for "and, of, etc. and doesn't capitalize those"
</script>

<template>
  <div class="isvw flex-box flex-wrap tiny-gap">
    <label class="flex-box flex-column" v-for="item in isvws" :key="`student-${item}`">
      <NotchContainer width="thick" :notch="10" class="isvw-item">
              <h4 class='capitalize'>{{ item }}</h4>
        <textarea type="text" class="underline" v-model="sheet[item]"/>
      </NotchContainer>
    </label>
  </div>
</template>

<style>
.isvw > * {
  flex: 1;
}
.isvw-item{
  display: grid;
  min-width: 15cap;
  min-height: 5cap;
}
</style>