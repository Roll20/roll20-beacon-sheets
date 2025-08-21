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
          <div class="taintedgrail__health">
            <HealthSection />
          </div>
          <div class="taintedgrail__traits">
            <TraitsSection />
          </div>
        </div>
        <div class="taintedgrail__tabs">
          <TabSection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTaintedGrailStore } from '@/sheet/stores';
import BioSection from '@/components/BioSection.vue';
import HealthSection from '@/components/HealthSection.vue';
import TraitsSection from '@/components/TraitsSection.vue';
import TabSection from '@/components/TabSection.vue';
import WaysSection from '@/components/WaysSection.vue';

useTaintedGrailStore();
</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;

.taintedgrail {
  &__main {
    display: grid;
    gap: 1rem;
    padding-top: 10px;
    margin-bottom: 1rem;
    grid-template-columns: 110px calc(100% - 110px - 1rem);
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

  &__tabs {
    width: 100%;
  }
}
</style>
