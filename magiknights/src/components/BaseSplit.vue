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
      <CloverDisplay v-if="sheet.unity_available" class="unity-points">
        <template v-slot:header>
          <span class="clover-span">unity points</span>
        </template>
        <template v-slot:content>
          <div class="unity-display">
            <input class="input-number unity-current" type="number" name="unity_points" v-model="sheet.unity_points" :max="sheet.unity_max" min="0">
            <span class="unity-separator">/</span>
            <span class="unity-max">{{ sheet.unity_max }}</span>
          </div>
        </template>
      </CloverDisplay>
      <CloverDisplay v-else class="unity-points unity-locked">
        <template v-slot:header>
          <span class="clover-span">unity points</span>
        </template>
        <template v-slot:content>
          <span class="locked-text" title="Unlocked at Reputation Level II">🔒</span>
        </template>
      </CloverDisplay>
    </template>
  </SplitMods>
</template>

<style>
.input-number{
  text-align: center;
}

.unity-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.unity-current {
  width: 2ch;
  text-align: right;
  padding-right: 2px;
}

.unity-separator {
  font-size: 1.2em;
  color: var(--color);
}

.unity-max {
  font-size: 1.2em;
  color: var(--color);
  min-width: 1ch;
}

.unity-locked {
  opacity: 0.5;
}

.locked-text {
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: help;
}

@supports (-moz-appearance: none) { /* Tweak positions for clovers only in Firefox */
  .input-number {
    margin-left: 38px;
  }
  .clover-container {
    margin-left: -75px;
  }
  .clover-span{
    margin-left: 70px;
  }
}
</style>