import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { config } from '@/config';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import type { ModifiedValue, ModifiedProficiency } from '../modifiers/modifiersStore';
import type { AbilityData, AbilityKey } from '../abilities/abilitiesStore';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { getEntryByLabel, getEntryById } from '@/utility/getEntryBy';
import { useProgressionStore } from '../progression/progressionStore';
import { effectKeys } from '@/effects.config';
import { useI18n } from 'vue-i18n';

export const proficiencyLevelsValues = [0, 0.5, 1, 2];

export const proficiencyLevels = {
  untrained: 0,
  'half-proficient': 0.5,
  proficient: 1,
  expert: 2,
} as const;

export const proficiencyLevelsBase = {
  ...proficiencyLevels,
  automatic: -1,
} as const;

export type ProficiencyLevel = (typeof proficiencyLevels)[keyof typeof proficiencyLevels];
export type ProficiencyLevelKey = keyof typeof proficiencyLevels;

export type ProficiencyLevelBase =
  (typeof proficiencyLevelsBase)[keyof typeof proficiencyLevelsBase];
export type ProficiencyLevelBaseKey = keyof typeof proficiencyLevelsBase;

export type UnrankedProficiencyGroup = 'armors' | 'languages' | 'weapons';
export type RankedProficiencyGroup = 'abilities' | 'savings' | 'default-skills' | 'tools';
export type ProficiencyGroup = RankedProficiencyGroup | UnrankedProficiencyGroup;

type ProficiencyQuery = UnrankedProficiency | RankedProficiency | undefined;

export type RankedProficiency = {
  _id: string;
  label: string;
  ability: AbilityKey;
  level: ProficiencyLevelBase;
  group: RankedProficiencyGroup;
};

export type UnrankedProficiency = {
  _id: string;
  label: string;
  group: UnrankedProficiencyGroup;
};

export type ProficienciesHydrate = {
  ranked: Record<string, RankedProficiency>;
  unranked: Record<string, UnrankedProficiency>;
};

const getEmptyProficiency = (
  label: string,
  ability: AbilityKey,
  group: RankedProficiencyGroup,
): RankedProficiency => {
  return {
    _id: uuidv4(),
    label,
    ability,
    group,
    level: -1,
  };
};

export const useProficienciesStore = defineStore('proficiencies', () => {
  const { t } = useI18n();

  const ranked: Ref<RankedProficiency[]> = ref([
    getEmptyProficiency('initiative', 'dexterity', 'abilities'),
    getEmptyProficiency('death-saving', 'constitution', 'abilities'),
    ...config.abilities.map((ability) =>
      getEmptyProficiency(`${ability}-check`, ability, 'abilities'),
    ),
    ...config.abilities.map((ability) =>
      getEmptyProficiency(`${ability}-saving`, ability, 'savings'),
    ),
    ...Object.entries(config.skills).map(([key, value]) =>
      getEmptyProficiency(key, value.ability, 'default-skills'),
    ),
  ]);

  const getPassiveProficiency = (proficiency: RankedProficiency): ModifiedValue => {
    if (!proficiency) {
      return computed(() => ({ final: 0, modifiers: [] }));
    }
    const modifier = getProficiencyModifier(proficiency);
    const basePassiveScore = computed(() => modifier.value.final + 10);
    return useEffectsStore().getModifiedValue(
      basePassiveScore.value,
      effectKeys[`${proficiency.label}-passive` as keyof typeof effectKeys],
    );
  };

  const unranked: Ref<UnrankedProficiency[]> = ref([]);

  const initiative = computed(() => ranked.value[0]);
  const deathSaving = computed(() => ranked.value[1]);

  const getProficiencyByLabel = (label: string): RankedProficiency | undefined => {
    return getEntryByLabel(label, ranked.value) as RankedProficiency | undefined;
  };

  const getProficiencyLevelKey = (value: ProficiencyLevel): ProficiencyLevelKey => {
    const entry = Object.entries(proficiencyLevels).find(([, v]) => v === value);
    return (entry?.[0] ?? 'untrained') as ProficiencyLevelKey;
  };

  const getModifiedProficiencyLevel = (proficiency: RankedProficiency): ModifiedProficiency => {
    const keysToQuery: (string | undefined)[] = [
      effectKeys[`${proficiency.label}-proficiency` as keyof typeof effectKeys],
    ];

    if (proficiency.group === 'savings') {
      keysToQuery.push(effectKeys['saving-proficiency']);
    } else if (proficiency.group === 'default-skills') {
      keysToQuery.push(effectKeys['skill-proficiency']);
    } else if (proficiency.group === 'tools') {
      keysToQuery.push(effectKeys['tools-proficiency']);
    }

    const validKeys = keysToQuery.filter((key): key is string => !!key);

    return useEffectsStore().getModifiedProficiency(validKeys, proficiency.level);
  };

  const getProficiencyAbility = (proficiency: RankedProficiency): AbilityData | undefined =>
    getEntryByLabel(proficiency.ability, useAbilitiesStore().abilities) as AbilityData | undefined;
  const getProficiencyModifier = (proficiency: RankedProficiency): ModifiedValue => {
    const ability = getProficiencyAbility(proficiency);
    if (!ability) {
      return computed(() => ({
        final: 0,
        modifiers: [],
      }));
    }

    const rawAbilityBonus = useAbilitiesStore().getAbilityModifier(ability).value.final;

    const proficiencyBonus = Math.floor(
      getModifiedProficiencyLevel(proficiency).value.final *
        useProgressionStore().getProficiencyBonus,
    );

    const baseValue = rawAbilityBonus + proficiencyBonus;

    const keysToQuery: string[] = [];
    keysToQuery.push(effectKeys[`${proficiency.label}` as keyof typeof effectKeys]);
    if (proficiency.group === 'savings') {
      keysToQuery.push(effectKeys.saving);
    } else if (proficiency.group === 'default-skills') {
      keysToQuery.push(effectKeys.skill);
      keysToQuery.push(effectKeys.check);
    } else if (proficiency.group === 'tools') {
      keysToQuery.push(effectKeys.tools);
    } else if (proficiency.label === 'initiative') {
      keysToQuery.push(effectKeys.check);
      keysToQuery.push(effectKeys['dexterity-check']);
    } else if (proficiency.label === 'death-saving') {
      keysToQuery.push(effectKeys.saving);
      keysToQuery.push(effectKeys['constitution-saving']);
    }

    return useEffectsStore().getModifiedValue(baseValue, keysToQuery);
  };

  const updateRanked = (id: string | undefined, patch: Partial<RankedProficiency>): void => {
    const proficiency = id
      ? (getEntryById(id, ranked.value) as RankedProficiency | undefined)
      : false;
    if (!proficiency) {
      const newSkill = { ...getEmptyProficiency('New Skill', 'strength', 'tools'), ...patch };
      ranked.value.push(newSkill);
    } else {
      Object.assign(proficiency, patch);
    }
  };

  const updateUnranked = (id: string, patch: Partial<UnrankedProficiency>): void => {
    const proficiency = getEntryById(id, unranked.value) as UnrankedProficiency;
    Object.assign(proficiency, patch);
  };

  const removeRanked = (id: string | undefined): void => {
    const index = ranked.value.findIndex((item) => item._id === id);
    if (index >= 0) {
      ranked.value.splice(index, 1);
    }
  };

  const dehydrate = (): ProficienciesHydrate => {
    return {
      ranked: arrayToObject(ranked.value),
      unranked: arrayToObject(unranked.value),
    };
  };

  const hydrate = (payload: ProficienciesHydrate) => {
    ranked.value = objectToArray(payload.ranked) || ranked.value;
    unranked.value = objectToArray(payload.unranked) || unranked.value;
  };

  return {
    ranked,
    unranked,
    initiative,
    deathSaving,

    getPassiveProficiency,
    getProficiencyLevelKey,
    getModifiedProficiencyLevel,
    getProficiencyAbility,
    getProficiencyModifier,
    getProficiencyByLabel,

    updateRanked,
    updateUnranked,
    removeRanked,

    dehydrate,
    hydrate,
  };
});
