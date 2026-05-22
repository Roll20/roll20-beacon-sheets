<template>
  <div class="ability">
    <div class="rows">
      <label class="ability__label">
        <SidebarLink
          componentName="AbilitySidebar"
          :props="{ ability: ability }"
          :options="{
            title: $t(`titles.${label}`),
            hasSave: true,
          }"
          :label="$t(`abbreviations.${label}`)"
        />
      </label>
      <div class="ability__number">
        <span>{{ modifiedScore.value.final }}</span>
      </div>
      <div class="ability__bonus">
        <RollModifier
          :finalBonus="modifier.value.final"
          :rollArgs="rollArgs"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModifiedNumber from '@/components/shared/ModifiedNumber.vue';
import RollModifier from '@/components/shared/RollModifier.vue';
import type { AbilityData, AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { type ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { getEntryById } from '@/utility/getEntryBy';
import { computed } from 'vue';
import { effectKeys } from '@/effects.config';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const abilities = useAbilitiesStore();


const props = defineProps<{
  _id: string;
  label: AbilityKey;
  score: number;
  modifiedScore: ModifiedValue;
  modifier: ModifiedValue;
  onBaseChange: (val: number) => void;
}>();

const ability = computed(() => getEntryById(props._id, useAbilitiesStore().abilities));

const rollArgs = computed((): D20RollArgs => {
  const bonuses: LabeledBonus[] = [];
  const modifierResult = abilities.getAbilityCheckModifier(ability.value as AbilityData).value;

  const effectsTotal = modifierResult.modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const baseModifier = modifierResult.final - effectsTotal;
  
  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.ability-modifier'), value: baseModifier });
  }
  modifierResult.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return {
    rollName: t(`titles.abilities.${props.label}`),
    subtitle: t('rolls.ability-check'),
    bonuses: bonuses,
    rollBonusKeys: [
      effectKeys[`${props.label}-check-roll`],
      effectKeys['check-roll'],
    ],
    actionDieKeys: [
      effectKeys[`${props.label}-check-action-die`],
      effectKeys['check-action-die'],
    ],
  };
});
</script>
<style lang="scss" scoped>
.ability {
  width: 5rem;
  .rows {
    align-items: center;
  }

  &__label,
  &__number,
  &__bonus {
    min-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  &__label {
    font-family: var(--font-family-title);
    font-weight: normal;
    background: var(--color-ability-box);
    color: var(--color-box-detail);
    padding: 1px 0;
  }
  &__number {
    height: 4.5rem;
    padding-bottom: 0.5rem;
    font-size: var(--size-font-xxlarge);
    border: 2px solid var(--color-ability-box);
    border-top: 0;
  }
  &__bonus {
    width: 50%;
    min-width: auto;
    height: 2rem;
    font-size: var(--size-font-large);
    border: 2px solid var(--color-box);
    background: var(--color-background);
    margin-top: calc(-1rem - 1px);
  }
}
</style>
