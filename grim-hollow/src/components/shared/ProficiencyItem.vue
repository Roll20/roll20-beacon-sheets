<template>
  <div class="proficiency-item">
    <div>
      <SidebarLink
        componentName="SkillSidebar"
        :props="sidebarProps"
        :options="{
          title: t('actions.edit-skill'),
          hasSave: true,
          hasDelete: props.group === 'tools',
        }"
        :label="linkLabel"
        class="proficiency-item__label"
      />
    </div>
    <div class="proficiency-item__proficiency">
      <!-- <select
        class="proficiency-item__select proficiency-item__select--base"
        :value="level"
        @change="$emit('update:level', Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="(value, levelKey) in proficiencyLevelsBase"
          :key="levelKey"
          :value="proficiencyLevelsBase[levelKey]"
        >
          {{ $t(`titles.proficiency-levels.${levelKey}`) }}
        </option>
      </select>
      <div :class="proficiencyDisplayClass"></div> -->
      <SvgIcon :icon="proficiencyDisplay" />
    </div>

    <span class="proficiency-item__bonus">
      <RollModifier :finalBonus="proficiencyModifier.value.final" :rollArgs="rollArgs" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type AbilityKey, useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import RollModifier from '@/components/shared/RollModifier.vue';
import type {
  RankedProficiency,
  ProficiencyLevelBase,
  RankedProficiencyGroup,
} from '@/sheet/stores/proficiencies/proficienciesStore';
import {
  proficiencyLevels,
  proficiencyLevelsBase,
  useProficienciesStore,
} from '@/sheet/stores/proficiencies/proficienciesStore';
import type { ModifiedProficiency, ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { effectKeys } from '@/effects.config';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { type LabeledBonus } from '@/utility/roll';
import SvgIcon from './SvgIcon.vue';

const { t } = useI18n();
const props = defineProps<{
  _id: string;
  label: string;
  ability: AbilityKey;
  level: ProficiencyLevelBase;
  modifiedLevel: ModifiedProficiency;
  group: RankedProficiencyGroup;
  toolKey?: string;
}>();

defineEmits<{
  (e: 'update:level', value: number): void;
  (e: 'update:ability', value: AbilityKey): void;
}>();

const proficiencies = useProficienciesStore();

const proficiencyModifier = computed(() => {
  return proficiencies.getProficiencyModifier({
    _id: props._id,
    label: props.label,
    ability: props.ability,
    level: props.level,
    group: props.group,
    toolKey: props.toolKey,
  });
});

const abilityKeys = computed(() => useAbilitiesStore().abilities.map((ability) => ability.label));

const proficiencyLabel = computed(() =>
  proficiencies.getProficiencyLevelKey(props.modifiedLevel.value.final),
);

const proficiencyDisplay = computed(() => {
  return proficiencyLabel.value;
});

const linkLabel = computed(() => {
  const baseLabel =
    props.group === 'tools' ? props.label : t(`titles.${props.group}.${props.label}`);
  const abilityAbbr = t(`abbreviations.${props.ability}`);
  return props.group === 'savings' ? baseLabel : `${baseLabel} (${abilityAbbr})`;
});

const sidebarProps = computed(() => ({
  skill: {
    _id: props._id,
    label: props.label,
    ability: props.ability,
    level: props.level,
    group: props.group,
    toolKey: props.toolKey,
  },
}));

const sidebarOptions = computed(() => ({
  title: t('actions.edit-skill'),
}));

const rollArgs = computed(() => {
  const proficiency = props;

  const bonuses: LabeledBonus[] = [];
  const ability = proficiencies.getProficiencyAbility(proficiency);
  if (ability) {
    const modifiedScore = useAbilitiesStore().getModifiedAbilityScore(ability);
    const rawAbilityBonus = Math.floor((modifiedScore.value.final - 10) / 2);
    bonuses.push({ label: t(`titles.abilities.${ability.label}`), value: rawAbilityBonus });
  }

  const proficiencyBonusValue = Math.floor(
    proficiencies.getModifiedProficiencyLevel(proficiency).value.final *
      useProgressionStore().getProficiencyBonus,
  );
  if (proficiencyBonusValue !== 0) {
    bonuses.push({ label: t('titles.proficiency-bonus'), value: proficiencyBonusValue });
  }

  const modifiedValue = proficiencies.getProficiencyModifier(proficiency);
  modifiedValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys: (string | undefined)[] = [
    effectKeys[`${proficiency.label}-roll` as keyof typeof effectKeys],
  ];
  const actionDieKeys: (string | undefined)[] = [
    effectKeys[`${proficiency.label}-action-die` as keyof typeof effectKeys],
  ];

  if (proficiency.group === 'savings') {
    rollBonusKeys.push(effectKeys['saving-roll']);
    actionDieKeys.push(effectKeys['saving-action-die']);
  } else if (proficiency.group === 'default-skills' || proficiency.group === 'tools') {
    if (proficiency.group === 'tools' && props.toolKey) {
      rollBonusKeys.push(effectKeys[`${props.toolKey}-roll` as keyof typeof effectKeys]);
      actionDieKeys.push(effectKeys[`${props.toolKey}-action-die` as keyof typeof effectKeys]);
    }
    rollBonusKeys.push(effectKeys[proficiency.group === 'tools' ? 'tools-roll' : 'skill-roll']);
    rollBonusKeys.push(effectKeys['check-roll']);
    rollBonusKeys.push(effectKeys[`${proficiency.ability}-check`]);
    rollBonusKeys.push(effectKeys[`${proficiency.ability}-check-roll`]);

    actionDieKeys.push(
      effectKeys[proficiency.group === 'tools' ? 'tools-action-die' : 'skill-action-die'],
    );
    actionDieKeys.push(effectKeys['check-action-die']);
  }

  let rollName: string;
  if (proficiency.group === 'tools') {
    rollName = proficiency.label;
  } else {
    const rollNameKey =
      proficiency.group === 'savings'
        ? `titles.savings.${proficiency.label}`
        : `titles.default-skills.${proficiency.label}`;
    rollName = t(rollNameKey);
  }

  return {
    rollName: rollName,
    subtitle: t(`rolls.${proficiency.group}`),
    bonuses: bonuses,
    rollBonusKeys: rollBonusKeys.filter((key): key is string => !!key),
    actionDieKeys: actionDieKeys.filter((key): key is string => !!key),
  };
});
</script>

<style lang="scss" scoped>
.proficiency-item {
  display: contents;
  &__label {
    min-width: 6rem;
    white-space: nowrap;
  }
  &__select {
    padding: 0.25rem;
  }
  &__ability-short {
    color: #666;
    font-size: 0.9em;
    margin-left: 0.25rem;
  }
  &__bonus {
    font-weight: bold;
    text-align: right;
  }
  &__proficiency {
    display: grid;
    border-radius: 50%;
    overflow: hidden;
    > * {
      width: 16px;
      height: 16px;
      cursor: pointer;
      grid-column: 1;
      grid-row: 1;
    }
    select {
      opacity: 0;
    }
  }
  &__proficiency-display {
    pointer-events: none;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 50%;
    &--untrained {
      border: 1px dashed black;
    }
    &--half-proficient {
      background-color: rgb(132, 132, 255);
    }
    &--proficient {
      background-color: blue;
    }
    &--expert {
      border: 2px solid blue;
      display: flex;
      align-items: center;
      justify-content: center;

      &:after {
        background-color: blue;
        content: '';
        display: block;
        height: calc(100% - 4px);
        width: calc(100% - 4px);
        border-radius: 50%;
      }
    }
  }
}
</style>
