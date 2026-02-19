<template>
  <div class="resource-item">
    <DicePool :pool="pool" :rollArgs="hitDiceArgs" class="hit-die" />
    <CurrentMaxNumber :count="count" :max="max" @update="updateCount" />
  </div>
</template>

<script setup lang="ts">
import { type Resource } from '@/sheet/stores/resources/resourcesStore';
import CurrentMaxNumber from '../shared/CurrentMaxNumber.vue';
import { useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { type HitDieSize, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { computed, watch } from 'vue';
import DicePool from '../shared/DicePool.vue';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { createComponentsFromFormula } from '@/utility/diceParser';
import { effectKeys } from '@/effects.config';

const { t } = useI18n();
const props = defineProps<{
  hitDie: HitDieSize;
}>();

const pool = computed(() => useEffectsStore().getModifiedDicePool([props.hitDie], 'hit-dice'));

const hitDiceArgs = computed(() => {
  const components = [
    ...createComponentsFromFormula(props.hitDie, t('titles.hit-dice')),
  ];

  return {
    rollName: t('rolls.hit-dice-roll'),
    subtitle: props.hitDie.toLocaleUpperCase(),
    damageGroups: [
      {
        type: t('rolls.hp-recovered'),
        components: components,
      },
    ],
    isCrit: false,
    whisper: false,
    sourceType: 'feature' as 'spell' | 'action' | 'feature' | 'item',
    damageModifierKeys: [effectKeys['hit-dice-bonus']],
    damageRollKeys: [effectKeys['hit-dice-roll']],
  };
});

const progressionStore = useProgressionStore();
const count = computed(() => {
  const hitDice = progressionStore.hitDice.used;
  return hitDice[props.hitDie] || 0;
});

const max = computed(() => {
  const hitDice = progressionStore.getHitDice;
  return hitDice[props.hitDie] || 0;
});

const updateCount = (newCount: number) => {
  progressionStore.hitDice.used[props.hitDie] = newCount;
};
</script>

<style lang="scss" scoped>
.resource-item {
  &__label {
    margin-bottom: var(--size-gap-xsmall);
  }
  &--centered {
    .hit-die {
      display: block;
      text-align: center;
      width: 100%;
      text-transform: capitalize;
    }
  }
}
</style>
