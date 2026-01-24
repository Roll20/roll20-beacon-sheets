<script setup>
import { useSheetStore } from '@/stores/sheetStore';

import AbilityScoreSection from '@/components/AbilityScoreSection.vue';
import Crystal from '@/components/Crystal.vue';
import EclipseChart from '@/components/EclipseChart.vue';
import TechniquesTactics from '../sections/TechniquesTactics.vue';
import PowerShards from '../sections/PowerShards.vue';
import router from '@/router';

console.log('router',router);
const sheet = useSheetStore();
</script>

<template>
  <div class="basic-view">
    <EclipseChart />
    <Crystal />
    <AbilityScoreSection class="tall-section" />
    <div class="subgrid tall-section">
      <TechniquesTactics />
      <PowerShards />
    </div>
    <div class="tallies-section">
      <div class="tally-group">
        <label class="tally-label">Budget Tallies</label>
        <input type="number" class="tally-input" min="0" v-model.number="sheet.budgetTallies">
      </div>
      <div class="tally-group">
        <label class="tally-label">Training Tallies</label>
        <div class="tally-counter">
          <input type="number" class="tally-input" min="0" :max="sheet.trainingTalliesMax" v-model.number="sheet.trainingTallies">
          <span class="tally-max">/ {{ sheet.trainingTalliesMax }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.basic-view {
  display: grid;
  gap: inherit;
  grid-auto-flow: dense;

  @container (650px < width) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @container (500px < width <=650px) {
    grid-template-columns: 1fr 1fr;
  }
}
.overflow-container {
  --_overflow: 25px;
  position: relative;
  margin-top: var(--_overflow);
  display: flex;
  flex-direction: column;

  .overflow-header {
    margin-top: calc(var(--_overflow) * -1);
    align-self: center;
    background: var(--masterBack);
  }
}
.tallies-section {
  display: flex;
  gap: var(--gap);
  align-items: center;
  padding: var(--half-gap) var(--gap);
  border: 1px solid var(--borderColor);
  border-radius: 4px;

  .tally-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .tally-label {
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .tally-input {
    width: 4ch;
    text-align: center;
    padding: 2px 4px;
  }
  .tally-counter {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .tally-max {
    font-size: 0.85em;
    opacity: 0.7;
  }
}



</style>