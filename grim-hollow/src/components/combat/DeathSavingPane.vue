<template>
  <div class="death-saving">
      <BoxedScore
        :score="deathSaving"
        :label="$t('titles.abilities.death-saving')"
        type="modifier"
        :rollArgs="deathSaveRollArgs"
      />
    <div class="cols">
      <div class="death-saving__counter death-saving__counter--failures">
        <RangeBar
          :count="combat.deathSaves.failures"
          :max="combat.getMaxFailures"
          icon="skull"
          @update="(n:number) => combat.deathSaves.failures = n"
        />
      </div>
      <button class="death-saving__reset" type="button" @click="resetDeathSaving">
        <SvgIcon icon="refresh" />
      </button>
      <div class="death-saving__counter death-saving__counter--successes">
        <RangeBar
          :count="combat.deathSaves.successes"
          :max="combat.getMaxSuccesses"
          icon="heart"
          @update="(n:number) => combat.deathSaves.successes = n"
        />
      </div>
    </div>
  </div>
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
import { computed } from 'vue';
import BoxedScore from '../shared/BoxedScore.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import { effectKeys } from '@/effects.config';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import StyledBox from '../shared/StyledBox.vue';

const { t } = useI18n();
const combat = useCombatStore();
const proficiencies = useProficienciesStore();

const deathSaving = computed(() => {
  const deathSaving = useProficienciesStore().deathSaving;
  return useProficienciesStore().getProficiencyModifier(deathSaving);
});

const resetDeathSaving = () => {
  combat.deathSaves.failures = 0;
  combat.deathSaves.successes = 0;
};

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
  .cols {
    grid-template-columns: 1fr min-content 1fr;
  }
  &__counter {
    display: flex;
    align-items: center;
    &--failures {
      justify-content: right;
    }
    &--successes {
      justify-content: left;
    }
  }
}
</style>
