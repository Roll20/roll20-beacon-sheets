<script setup>
import { STARSHIP_KINDS } from '@/rules/index.js'
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import RollBar from '@/components/shared/RollBar.vue'
import CrewPanel from './CrewPanel.vue'
import PilotingPanel from './PilotingPanel.vue'
import HullPanel from './HullPanel.vue'
import WeaponsPanel from './WeaponsPanel.vue'
import VehiclePage from './VehiclePage.vue'

const ship = useStarshipStore()
const meta = useMetaStore()
</script>

<template>
  <div class="page">
    <div class="topbar">
      <RollBar />
      <select
        class="kind"
        :value="ship.kind"
        :disabled="!meta.canEdit"
        aria-label="Starship or vehicle"
        @change="ship.setKind($event.target.value)"
      >
        <option v-for="k in STARSHIP_KINDS" :key="k.id" :value="k.id">{{ k.name }}</option>
      </select>
    </div>

    <VehiclePage v-if="ship.isVehicle" />

    <template v-else>
      <CrewPanel />

      <hr class="rule" />
      <PilotingPanel />

      <hr class="rule" />
      <HullPanel />

      <WeaponsPanel />

      <p v-if="!ship.baseHullPoints && !meta.name" class="start">
        Start with the ship&rsquo;s stat block: its base Defense, hull points, structural integrity,
        maneuverability and defense modifier. The sheet works out the rest once a pilot and a
        technician are in their seats.
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.kind {
  @include ps-well;
  margin-left: auto;
  height: 26px;
  font-size: 12px;
  font-weight: 700;
  padding: 0 6px;
}

.rule {
  border: none;
  border-top: 2px solid var(--ps-gold);
  margin: 2px 0;
}

.start {
  font-size: 11px;
  color: var(--ps-text-muted);
  text-align: center;
  line-height: 1.5;
  margin: 0;
}
</style>
