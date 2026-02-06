<template>
  <div class="spell-source-details">
    <div class="spell-source-details__item">
      <span class="spell-source-details__label">{{ $t('titles.spellcasting-ability') }}</span>
        <div class="hold">
          <span v-if="sources.length > 0" class="spell-source-details__value">{{ sources[0].ability }}</span>
          <SvgIcon class="info-icon" icon="info" v-if="sources.length > 1" v-tooltip="{ theme: 'info', content: allSpellAbilities, html: true }" />
        </div>
      </div>
    <div class="spell-source-details__item">
      <span class="spell-source-details__label">{{ $t('titles.spell-save-dc') }}</span>
      <div class="hold">
        <span v-if="sources.length > 0" class="spell-source-details__value">DC {{ sources[0].spellDC.value.final }}</span>
        <SvgIcon class="info-icon" icon="info" v-if="sources.length > 1" v-tooltip="{ theme: 'info', content: allSpellDCs, html: true }" />
      </div>
    </div>
    <div class="spell-source-details__item">
      <span class="spell-source-details__label">{{ $t('titles.spell-attack-bonus') }}</span>
        <div class="hold">
          <RollModifier
            class="spell-source-details__value"
            :finalBonus="sources[0].attackBonus.value.final"
            :rollArgs="rollArgs"
            v-if="sources.length > 0"
          />
          <SvgIcon class="info-icon" icon="info" v-if="sources.length > 1" v-tooltip="{ theme: 'info', content: allSpellAttackBonuses, html: true }" />
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RollModifier from '../shared/RollModifier.vue';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import { getEntryByLabel } from '@/utility/getEntryBy';
import { type AbilityData, useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { effectKeys } from '@/effects.config';
import SvgIcon from '../shared/SvgIcon.vue';
import { parseFormulaAndEvaluate } from '@/sheet/stores/formulas';

type sourceType = 'action' | 'spell' | 'feature' | 'item';

const { t } = useI18n();

const spells = useSpellsStore();

const sources = computed(() =>
  spells.sources.map((source) => ({
    id: source._id,
    name: source.name,
    attackBonus: spells.getSourceAttackBonus(source._id),
    ability: source.type === 'ability' ? t(`titles.abilities.${source.ability}`) : 'Flat DC',
    spellDC: spells.getSourceDC(source._id),
    sourceObject: source,
  })),
);

const getEmptyRoll = (patch:Record<string, unknown>) => {
  return {
    rollName: '',
    subtitle: '',
    bonuses: [],
    rollBonusKeys: [],
    actionDieKeys: [],
    critRange: 20,
    sourceType: 'spell' as sourceType,
    ...patch
  };
};

const rollArgs =  computed((): D20RollArgs => {
  const source = sources.value[0].sourceObject;
  const bonuses: LabeledBonus[] = [];

  if (source.type === 'ability') {
    const ability = getEntryByLabel(source.ability, useAbilitiesStore().abilities) as AbilityData;
    const modifiedScore = useAbilitiesStore().getModifiedAbilityScore(ability);
    const rawAbilityBonus = Math.floor((modifiedScore.value.final - 10) / 2);
    bonuses.push({ label: t(`titles.abilities.${source.ability}`), value: rawAbilityBonus });
    
    const proficiencyBonus = Math.floor(useProgressionStore().getProficiencyBonus);
    if (proficiencyBonus !== 0) {
      bonuses.push({ label: t('titles.proficiency-bonus'), value: proficiencyBonus });
    }
  } else if (source.type === 'flat') {
    bonuses.push({ label: t('titles.base-score'), value: parseFormulaAndEvaluate(source.flat) });
  }

  const modifiedValue = spells.getSourceAttackBonus(source._id);
  modifiedValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return getEmptyRoll({
    rollName: `${source.name} ${t('titles.attack')}`,
    subtitle: t('rolls.attack-roll'),
    bonuses: bonuses,
    rollBonusKeys: [effectKeys['spell-attack-roll'], effectKeys['attack-roll']],
    actionDieKeys: [effectKeys['spell-attack-action-die'], effectKeys['attack-action-die']],
  });
});


const allSpellAbilities = computed(() => {
  if (sources.value.length < 1) {
    return '';
  } else {
    const dcs = sources.value.map((source) => {
      return `<span>${source.name}: ${source.ability}</span>`;
    });
    return dcs.join('<br/>');
  }
});

const allSpellDCs = computed(() => {
  if (sources.value.length < 1) {
    return '';
  } else {
    const dcs = sources.value.map((source) => {
      return `<span>${source.name}: ${source.spellDC.value.final}</span>`;
    });
    return dcs.join('<br/>');
  }
});

const allSpellAttackBonuses = computed(() => {
  if (sources.value.length < 1) {
    return '';
  } else {
    const dcs = sources.value.map((source) => {
      return `<span>${source.name}: ${source.attackBonus.value.final}</span>`;
    });
    return dcs.join('<br/>');
  }
});
</script>

<style lang="scss" scoped>
.spell-source-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  font-size: var(--size-font-large);
  gap: var(--size-gap-large);
  margin-bottom: var(--size-gap-large);
  margin-top: 10px;
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__label {
    font-weight: normal;
    font-family: var(--font-family-title);
    text-transform: uppercase;
    font-size: var(--size-font-medium);
    margin-bottom: 5px;
  }
  &__value {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    height: calc(var(--size-font-large) * 3);
    border: 2px solid var(--color-box);
  }
  .hold {
    position: relative;
    width: 100%;
    .info-icon {
      right: 12px;
    }
  }
}
</style>
