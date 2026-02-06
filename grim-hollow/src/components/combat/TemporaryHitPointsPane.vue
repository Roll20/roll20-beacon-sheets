<template>
  <div class="temporary-hit-points box">
    <div class="box__header">
      {{ $t('titles.temporary-hit-points') }}
    </div>
    <div class="box__content">
      <input
        type="number"
        v-model.number="combat.life.temporary"
        class="temporary-hit-points__input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';

const combat = useCombatStore();
</script>
<style lang="scss">
</style>
