<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import SplitMods from '@/components/SplitMods.vue';
import CloverDisplay from '@/components/CloverDisplay.vue';
const sheet = useSheetStore();
const attributes = [
  {
    name: 'inspiration',
    image: 'star',
    text: 'inspiration',
    readonly: false
  },
  {
    name: 'initiative',
    image: 'star',
    text: 'Initiative',
    readonly: false,
    click: () => sheet.rollInitiative()
  },
  {
    name: 'stress',
    image: 'diamond',
    text: 'Stress',
    readonly: false
  },
  {
    name: 'exhaustion',
    image: 'diamond',
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
          <span class="clover-span">gloom gems</span>
        </template>
        <template v-slot:content>
          <input class="input-number" type="number" name="gloom_gems" v-model="sheet.gloom_gems">
        </template>
      </CloverDisplay>
      <CloverDisplay class="unity-points">
        <template v-slot:header>
          <span class="clover-span">unity points</span>
        </template>
        <template v-slot:content>
          <input class="input-number" type="number" name="unity_points" v-model="sheet.unity_points">
        </template>
      </CloverDisplay>
    </template>
  </SplitMods>
</template>

<style>
.input-number{
  text-align: center;
}

@supports (-moz-appearance: none) {
  .input-number {
    margin-left: 38px; /* Move the input to the right in Firefox */
  }
  .clover-container {
    margin-left: -75px;
    margin-right: 0px;
  }
  .clover-span{
    margin-left: 70px;
  }
}
</style>