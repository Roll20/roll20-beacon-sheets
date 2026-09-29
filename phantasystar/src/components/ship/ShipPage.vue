<script setup>
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import RollBar from '@/components/shared/RollBar.vue'
import CrewPanel from './CrewPanel.vue'
import PilotingPanel from './PilotingPanel.vue'
import HullPanel from './HullPanel.vue'
import WeaponsPanel from './WeaponsPanel.vue'

const ship = useStarshipStore()
const meta = useMetaStore()
</script>

<template>
  <div class="page">
    <RollBar />

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
