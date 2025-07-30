<template>
  <div class="taintedgrail-sheet">
    <div class="taintedgrail__header"></div>
    <div class="taintedgrail__main">
      <div class="taintedgrail__ways">
        <WaysSection />
      </div>
      <div class="taintedgrail__content">
        <div class="taintedgrail__top-row">
          <div class="taintedgrail__character">
            <BioSection />
          </div>
          <div class="taintedgrail__ability-scores">
            <AbilityScoresSection />
          </div>
          <div class="taintedgrail__traits">
            <TraitsSection />
          </div>
        </div>
        <div class="taintedgrail__inventory">
          <InventorySection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useExampleSheetStore } from '@/sheet/stores';
import AbilityScoresSection from '@/components/AbilityScoresSection.vue';
import BioSection from '@/components/BioSection.vue';
import InventorySection from '@/components/inventory/InventorySection.vue';
import TraitsSection from '@/components/traits/TraitsSection.vue';
import WaysSection from '@/components/WaysSection.vue';

useExampleSheetStore();
</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;

.taintedgrail {
  &__main {
    width: 1140px; // TODO: Remove!
    height: 720px; // TODO: Remove!
    display: grid;
    gap: 1rem;
	padding-top: 10px;
    margin-bottom: 1rem;
    grid-template-columns: 110px calc(1140px - 110px - 1rem);
    box-sizing: border-box;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__top-row {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
  }

  &__inventory {
    width: 100%;
  }
}
</style>
