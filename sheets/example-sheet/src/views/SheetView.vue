<template>
  <div class="examplesheet-sheet">
    <div class="examplesheet__header">
    </div>
    <div class="examplesheet__main">
      <div class="examplesheet__column">
        <div class="examplesheet__character">
          <BioSection/>
        </div>
        <div class="examplesheet__combat">
          <CombatSection />
        </div>
      </div>
      <div class="examplesheet__column">
        <div class="examplesheet__ability-scores">
          <AbilityScoresSection/>
        </div>
        <div class="examplesheet__traits">
          <TraitsSection/>
        </div>
      </div>
      <div class="examplesheet__column">
        <div class="examplesheet__xp">
          <XPSection/>
        </div>
      </div>


    </div>
    <div class="examplesheet__inventory">
      <InventorySection/>
    </div>
  </div>
</template>

<script setup>
import { useExampleSheetStore } from '@/sheet/stores'
import AbilityScoresSection from '@/components/AbilityScoresSection.vue'
import BioSection from '@/components/BioSection.vue'
import XPSection from '@/components/XPSection.vue'
import InventorySection from '@/components/inventory/InventorySection.vue'
import TraitsSection from '@/components/traits/TraitsSection.vue'
import CombatSection from '@/components/CombatSection.vue'

const store = useExampleSheetStore()
</script>

<style lang="scss">
@use "../common/scss/vars.scss" as vars;

.examplesheet {
  &__header {
    // todo avatar, name
  }

  &__main {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: 33rem 33rem 20rem;
  }

  &__column {
    display: grid;
    gap: 1rem;
  }

  &__inventory {
    width: 88rem;
  }
}
</style>
