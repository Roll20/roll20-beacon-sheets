<template>
  <div :class="['section', 'boxed-score-section', `boxed-score-section--exhaustion`]">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.exhaustion') }}</h3>
        <div class="section-score">
          <RangeBar
            :count="combat.exhaustion"
            :max="6"
            @update="(n:number) => (combat.exhaustion = n)"
          />
        </div>
      </div>
    </StyledBox>
    <div class="section__body" v-if="combat.exhaustion > 0">
      <div class="list">
        <div class="exhaustion-level">
          <strong>{{ combat.exhaustion }}:</strong>
          <span>{{ t(`descriptions.exhaustion-levels.${combat.exhaustion}`) }}</span>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">

import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import RangeBar from '../shared/RangeBar.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import { useI18n } from 'vue-i18n';
import StyledBox from '../shared/StyledBox.vue';

const { t } = useI18n();
const combat = useCombatStore();

const resetExhaustion = () => {
  combat.exhaustion = 0;
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
