<script setup>
import NotchContainer from './NotchContainer.vue';
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();

const isvws = [
  'interests',
  'virtues',
  'strengths',
  'weaknesses'
];
</script>

<template>
  <div class="isvw flex-box flex-wrap tiny-gap">
    <label class="flex-box flex-column" v-for="item in isvws" :key="`student-${item}`">
      <span class='capitalize'>{{ item }}</span>
      <NotchContainer width="thick" :notch="20" class="isvw-item">
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