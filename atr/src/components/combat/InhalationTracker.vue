<template>
  <div :class="['section', 'boxed-score-section', `boxed-score-section--exhaustion`]">
    <div class="section__header">
      <h3>{{ $t('titles.inhalation') }}</h3>
      <div class="section-score">
        <RangeBar
          :count="combat.inhalation"
          :max="6"
          @update="(n:number) => (combat.inhalation = n)"
        />
      </div>
    </div>
    <div class="section__body">
      <div class="list">
        <template
          v-for="level in 6"
          :key="level"
          
        >
          <div class="exhaustion-level" v-if="combat.inhalation >= level"><strong>{{ level }}:</strong><span>{{ t(`descriptions.inhalation-levels.${level}`) }}</span></div>
        </template>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">

import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import RangeBar from '../shared/RangeBar.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const combat = useCombatStore();

const resetInhalation = () => {
  combat.inhalation = 0;
};
</script>

<style lang="scss" scoped>
.boxed-score-section--exhaustion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  .section__header {
    display: grid;
    grid-template-columns: 1fr min-content;
  }
  .section-score {
    padding-right: 1rem;
    display: flex;
    align-items: center;
  }
  .list {
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: start;
    gap: 0.5rem 0.25rem;
    padding-bottom: 0.25rem;
    > .exhaustion-level {
      display: contents;
    }
  }
}
</style>
