<template>
  <NineSlicedBox theme="h">
    <div class="section combat-section">
      <div class="rows gap--medium">
        <div class="cols boxed-panes">
          <NineSlicedBox theme="c">
            <div class="rows">
              <ArmorClassPane />
              <div class="nine-sliced-box__divider nine-sliced-box__divider--marginless"></div>
              <SpeedPane />
            </div>
          </NineSlicedBox>
          <NineSlicedBox theme="c">
            <div class="cols cols--hp">
              <HitPointsPane />
            <div class="nine-sliced-box__divider nine-sliced-box__divider--marginless nine-sliced-box__divider--vertical"></div>
              <div class="rows">
                <HitPointsMaxPane />
                <div class="nine-sliced-box__divider nine-sliced-box__divider--marginless"></div>
                <TemporaryHitPointsPane />
              </div>
            </div>
          </NineSlicedBox>
        </div>
        <ToggableSection :active="combat.life.hitPoints <= 0 || !combat.life.hitPoints">
          <DeathSavingPane />
        </ToggableSection>
        <ExhaustionTracker />
        <RestingSection />
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import ArmorClassPane from './ArmorClassPane.vue';
import HitPointsPane from './HitPointsPane.vue';
import SpeedPane from './SpeedPane.vue';
import DeathSavingPane from './DeathSavingPane.vue';
import TemporaryHitPointsPane from './TemporaryHitPointsPane.vue';
import HitPointsMaxPane from './HitPointsMaxPane.vue';
import ExhaustionTracker from './ExhaustionTracker.vue';
import RestingSection from './RestingSection.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
import ToggableSection from '../shared/ToggableSection.vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';

const combat = useCombatStore();

</script>

<style lang="scss" scoped>
.combat-section {
  > .rows {
    > .cols {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--size-gap-medium);
      //height: 80px;
    }
  }
  .cols--hp {
    grid-template-columns: 80px min-content 1fr;
    gap: var(--size-gap-xsmall);
    align-items: center;
    .nine-sliced-box__divider {
      margin-right: 5px;
    }
  }
  .box {
    // min-height: 50%;
  }
}
</style>
<style lang="scss">
  .sheet .boxed-panes {
    .box__header {
      //background-color: var(--color-ability-box);
      font-family: var(--font-family-title);
      font-weight: normal;
      text-transform: uppercase;
      padding: 1px 0;
    }
    .sidebar-link {
      text-transform: uppercase;
    }
    .box__content {
      //border: 2px solid var(--color-ability-box);
      border-top: 0;
      //background: rgba(0, 0, 0, 0);
      //-webkit-backdrop-filter: blur(4px);
      //backdrop-filter: blur(4px);
    }
    input {
      background: transparent;
      //color: rgba(255,255,255,0.85);
    }
    .rows:has(.box:nth-child(2)) {
      .box:nth-child(1) {
        .box__content {
          border-bottom: 0;
        }
      }
    }
  }
</style>