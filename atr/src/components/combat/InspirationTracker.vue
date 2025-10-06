<template>
  <div :class="['section', 'boxed-score-section', `boxed-score-section--inspiration`]">
    <div class="section__header">
      <h3>{{ $t('titles.inspiration') }}</h3>
      <div class="section-score">
        <RangeBar
          :count="combat.inspiration"
          :max="1"
          @update="(n:number) => (combat.inspiration = n)"
        />
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import RangeBar from '../shared/RangeBar.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const combat = useCombatStore();

const resetInspiration = () => {
  combat.inspiration = 0;
};
</script>

<style lang="scss" scoped>
.boxed-score-section--inspiration {
  .section__header {
    display: grid;
    grid-template-columns: 1fr min-content;
  }
  .section-score {
    padding-right: 1rem;
    display: flex;
    align-items: center;
  }
}
</style>