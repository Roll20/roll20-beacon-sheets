<template>
  <div :class="['section', 'boxed-score-section', `boxed-score-section--${type}`]">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ label }}</h3>
        <div class="section-score section-score--cut" v-if="type === 'score'">
          {{ score.value.final }}
        </div>
        <div class="section-score section-score--cut" v-else-if="type === 'modifier'">
          <RollModifier :finalBonus="score.value.final" :rollArgs="rollArgs" />
        </div>
        <div class="teste"></div>
      </div>
    </StyledBox>
  </div>
</template>

<script setup lang="ts">
import { type ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import RollModifier from './RollModifier.vue';
import type { LabeledBonus } from '@/utility/roll';
import SvgIcon from './SvgIcon.vue';
import StyledBox from './StyledBox.vue';

const props = withDefaults(
  defineProps<{
    score: ModifiedValue;
    label: string;
    type?: 'score' | 'modifier';
    rollArgs?: any;
  }>(),
  {
    type: 'score',
  },
);
</script>
<style lang="scss" scoped>
.section {
  &__header {
    .section-score {
      &--cut {
        font-family: var(--font-family-title);
        font-size: var(--size-font-large);
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        right: 0px;
        top: 2px;
        height: calc(100% - 4px);
        width: 4rem;
        z-index: 9999;
        //background: var(--color-background);
      }
    }
  }
  .teste {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 60px;
    height: 60px;
    background: #061028;
    opacity: 0.35;
  }
}
</style>
