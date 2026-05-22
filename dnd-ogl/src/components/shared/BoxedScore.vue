<template>
  <NineSlicedBox :theme="box">
    <div :class="['section']">
      <div class="section__header">
        <h3>{{ label }}</h3>
      </div>
      <div class="section__score">
        <div class="section-score section-score--cut" v-if="type === 'score'">
          {{ score.value.final }}
        </div>
        <div class="section-score section-score--cut" v-else-if="type === 'modifier'">
          <RollModifier :finalBonus="score.value.final" :rollArgs="rollArgs" />
        </div>
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import { type ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import RollModifier from './RollModifier.vue';
import type { LabeledBonus } from '@/utility/roll';
import SvgIcon from './SvgIcon.vue';
import StyledBox from './StyledBox.vue';
import NineSlicedBox from './NineSlicedBox.vue';

const props = withDefaults(
  defineProps<{
    score: ModifiedValue;
    label: string;
    type?: 'score' | 'modifier';
    rollArgs?: any;
    box?: 'passive' | 'inspiration' | 'proficiency'
  }>(),
  {
    type: 'score',
    box: 'passive',
  },
);
</script>
<style lang="scss" scoped>
.section {
  display: grid;
  grid-template-columns: 1fr 48px;
  align-items: center;
  .section__header {
    h3 {
      text-align: left;
      padding: 0 10px;
    }
  }
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
</style>
