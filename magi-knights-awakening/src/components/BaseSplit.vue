<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import SplitMods from '@/components/SplitMods.vue';
import CloverDisplay from '@/components/CloverDisplay.vue';
const sheet = useSheetStore();
const attributes = [
  {
    name: 'inspiration',
    image: 'star',
    crown: true,
    text: 'inspiration',
    readonly: false
  },
  {
    name: 'initiative',
    image: 'star',
    crown: false,
    text: 'Initiative',
    readonly: false,
    click: () => sheet.rollInitiative()
  },
  {
    name: 'stress',
    image: 'diamond',
    crown: false,
    text: 'Stress',
    readonly: false
  },
  {
    name: 'exhaustion',
    image: 'diamond',
    crown: false,
    text: 'Exhaustion',
    readonly: false
  }
];
</script>

<template>
  <SplitMods :attributes="attributes" @clicked="processRoll">
    <template v-slot:content>
      <CloverDisplay class="gloom-gems">
        <template v-slot:header>
          <span>gloom gems</span>
        </template>
        <template v-slot:content>
          <input type="number" name="gloom_gems" v-model="sheet.gloom_gems">
        </template>
      </CloverDisplay>
      <CloverDisplay class="unity-points">
        <template v-slot:header>
          <span>unity points</span>
        </template>
        <template v-slot:content>
          <input type="number" name="unity_points" v-model="sheet.unity_points">
        </template>
      </CloverDisplay>
    </template>
  </SplitMods>
</template>

<style>

</style>