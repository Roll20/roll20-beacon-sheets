<template>
  <div :class="['section', 'boxed-score-section', `boxed-score-section--${type}`]">
    <div class="section__header">
      <h3>{{ label }}</h3>
      <div class="section-score section-score--cut" v-if="type === 'score'">
        {{ score.value.final }}
      </div>
      <div class="section-score section-score--cut" v-else-if="type === 'modifier'">
        <RollModifier :finalBonus="score.value.final" :rollArgs="rollArgs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import RollModifier from './RollModifier.vue';
import type { LabeledBonus } from '@/utility/roll';

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
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        right: 2px;
        top: 2px;
        height: calc(100% - 4px);
        width: 4rem;
        background: var(--color-background);
      }
    }
  }
}
</style>
