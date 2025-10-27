<template>
  <div class="section combat-section">
    <div class="rows">
      <div class="cols">
        <div class="rows">
          <ArmorClassPane />
          <SpeedPane />
        </div>
        <div class="cols cols--hp">
          <HitPointsPane />
          <div class="rows">
            <HitPointsMaxPane />
            <TemporaryHitPointsPane />
          </div>
        </div>
      </div>
      <div class="rows">
        <RestingSection />
        <DeathSavingPane />
        <ExhaustionTracker />
        <InhalationTracker />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArmorClassPane from './ArmorClassPane.vue';
import HitPointsPane from './HitPointsPane.vue';
import SpeedPane from './SpeedPane.vue';
import DeathSavingPane from './DeathSavingPane.vue';
import TemporaryHitPointsPane from './TemporaryHitPointsPane.vue';
import HitPointsMaxPane from './HitPointsMaxPane.vue';
import ExhaustionTracker from './ExhaustionTracker.vue';
import InhalationTracker from './InhalationTracker.vue';
import RestingSection from './RestingSection.vue';

</script>

<style lang="scss" scoped>
.combat-section {
  > .rows {
    gap: var(--size-gap-medium);
    > .rows {
      gap: var(--size-gap-medium);
    }
    > .cols {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--size-gap-medium);
      height: 80px;
    }
  }
  .cols--hp {
    grid-template-columns: 1fr 1fr;
    gap: var(--size-gap-xsmall);
  }
  .box {
    min-height: 50%;
  }
}
</style>