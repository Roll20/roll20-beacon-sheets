<template>
  <NineSlicedBox theme="c-r">
    <div class="death-saving">
      <div class="cols">
        <div :class="[
          'death-saving__counter', 
          'death-saving__counter--failures',
          { 'death-saving__counter--pending': isStabilizingPending },
        ]">
          <RangeBar
            :count="combat.deathSaves.failures"
            :max="combat.getMaxFailures"
            @update="(n:number) => combat.deathSaves.failures = n"
            class="range-bar--failure"
            tooltip="Failures"
          />
        </div>
        <div class="death-saving__label">
          <span>{{ $t('titles.savings.death-saving') }} ({{ $t(`titles.${combat.deathSaves.condition}`) }})</span>
          <RollModifier :finalBonus="deathSaving.value.final" :rollArgs="deathSaveRollArgs" v-tooltip="$t(`descriptions.dropping-to-zero-hit-points.${combat.deathSaves.condition}`)"/>
        </div>
        <div
          :class="[
            'death-saving__counter',
            'death-saving__counter--successes',
            { 'death-saving__counter--pending': isStabilizingPending },
          ]"
        >
          <RangeBar
            :count="combat.deathSaves.successes"
            :max="combat.getMaxSuccesses"
            @update="(n:number) => combat.deathSaves.successes = n"
            class="range-bar--success"
            tooltip="Successes"
            :disabled="combat.deathSaves.failures >= combat.getMaxFailures"
          />
        </div>
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import ProficiencyItem from '../shared/ProficiencyItem.vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import RangeBar from '../shared/RangeBar.vue';
import {
  type ProficiencyLevelBase,
  useProficienciesStore,
} from '@/sheet/stores/proficiencies/proficienciesStore';
import { useI18n } from 'vue-i18n';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { computed, ref, watch } from 'vue';
import BoxedScore from '../shared/BoxedScore.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import { effectKeys } from '@/effects.config';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import StyledBox from '../shared/StyledBox.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
import RollModifier from '../shared/RollModifier.vue';

const { t } = useI18n();
const combat = useCombatStore();
const proficiencies = useProficienciesStore();

const STABLE_TRANSITION_DELAY_MS = 2000;
const isStabilizingPending = ref(false);

const deathSaving = computed(() => {
  const deathSaving = useProficienciesStore().deathSaving;
  return useProficienciesStore().getProficiencyModifier(deathSaving);
});

watch(
  () => combat.deathSaves.successes,
  (newValue, _, onCleanup) => {
    if (newValue < combat.getMaxSuccesses) {
      isStabilizingPending.value = false;
      return;
    }

    isStabilizingPending.value = true;

    const timeoutId = window.setTimeout(() => {
      if (combat.deathSaves.successes < combat.getMaxSuccesses) {
        isStabilizingPending.value = false;
        return;
      }

      combat.deathSaves.condition = 'stable';
      combat.deathSaves.failures = 0;
      combat.deathSaves.successes = 0;
      isStabilizingPending.value = false;
    }, STABLE_TRANSITION_DELAY_MS);

    onCleanup(() => {
      window.clearTimeout(timeoutId);
      isStabilizingPending.value = false;
    });
  },
);

watch(() => combat.deathSaves.failures, (newValue) => {
  if(newValue === combat.getMaxFailures) combat.deathSaves.condition = 'dead';
  else if (newValue >= 0) combat.deathSaves.condition = 'dying';
});

const deathSaveRollArgs = computed((): D20RollArgs => {
  const deathSavingProf = proficiencies.deathSaving;
  if (!deathSavingProf) return {
    rollName: t('titles.abilities.death-saving'),
    subtitle: t('rolls.savings'),
    bonuses: [],
    rollBonusKeys: [
      effectKeys['death-saving-roll'],
      effectKeys['saving-roll'],
    ],
    actionDieKeys: [
      effectKeys['death-saving-action-die'],
      effectKeys['saving-action-die'],
    ],
  };

  const bonuses: LabeledBonus[] = [];
  const modifier = proficiencies.getProficiencyModifier(deathSavingProf);

  modifier.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return {
    rollName: t('titles.abilities.death-saving'),
    subtitle: t('rolls.savings'),
    bonuses: bonuses,
    rollBonusKeys: [
      effectKeys['death-saving-roll'],
      effectKeys['saving-roll'],
    ],
    actionDieKeys: [
      effectKeys['death-saving-action-die'],
      effectKeys['saving-action-die'],
    ],
  };
});
</script>
<style lang="scss">
.death-saving {
  display: grid;
  align-items: center;
  min-height: 100%;
  .cols {
    grid-template-columns: 1fr max-content 1fr;
    align-items: center;
  }
  &__label {
    display: grid;
    grid-template-areas: "stack";
    justify-items: center;
    span, .roll-modifier {
      grid-area: stack;
    }
    span {
      font-weight: normal;
      text-transform: uppercase;
      font-family: var(--font-family-title);
      color: var(--color-primary);
    }
    .roll-modifier {
      opacity: 0;
      min-width: 100%;
      min-height: 100%;
    }
    &:hover,&:focus-within {
      span {
        color: var(--rollbonus-color-hover);
      }
    }
  }
  &__counter {
    display: flex;
    align-items: center;

    &--pending {
      animation: death-save-blink 2s ease-in-out infinite;
    }

    &--failures {
      justify-self: left;
      --rangebar-border-color-hover: var(--color-negative);
      --rangebar-border-color-checked: var(--color-negative);
      --rangebar-border-color-checked-hover: var(--color-negative);
      --rangebar-check-color: var(--color-negative);
    }
    &--successes {
      justify-self: right;
      --rangebar-border-color-hover: var(--color-positive);
      --rangebar-border-color-checked: var(--color-positive);
      --rangebar-border-color-checked-hover: var(--color-positive);
      --rangebar-check-color: var(--color-positive);
    }
  }
}

@keyframes death-save-blink {
  0%,
  100% {
    opacity: 1;
  }

  22% {
    opacity: 0.55;
  }

  38% {
    opacity: 1;
  }

  62% {
    opacity: 0.55;
  }

  78% {
    opacity: 1;
  }
}
</style>