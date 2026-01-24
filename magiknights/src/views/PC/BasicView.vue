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

</style>