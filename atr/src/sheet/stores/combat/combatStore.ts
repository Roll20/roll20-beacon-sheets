import { defineStore } from 'pinia';
import { ref, computed, effect } from 'vue';
import type { Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import { type ModifiedValue } from '../modifiers/modifiersStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { type AbilityData, type AbilityKey, useAbilitiesStore } from '../abilities/abilitiesStore';
import { getEntryByLabel } from '@/utility/getEntryBy';
import { useProgressionStore } from '../progression/progressionStore';
import { effectKeys } from '@/effects.config';
import { useI18n } from 'vue-i18n';
import { config } from '@/config';

export type SpeedKey = (typeof config.speeds)[number];

export type SpeedData = {
  base: number;
  description: string;
};

export type ArmorClass = {
  mode: 'automatic' | 'manual';
  base: number;
  ability: AbilityKey;
  ballistic: number;
};

export type DeathSaves = {
  successes: number;
  failures: number;
};

export type Life = {
  hitPoints: number;
  temporary: number;
};

export type CombatHydrate = {
  combat: {
    armorClass: ArmorClass;
    speed: Record<SpeedKey, SpeedData>;
    deathSaves: DeathSaves;
    life: Life;
    exhaustion: number;
    inhalation: number;
    inspiration: number;
  };
};

export const useCombatStore = defineStore('combat', () => {
  const { t } = useI18n();

  const armorClass: Ref<ArmorClass> = ref({
    mode: 'automatic',
    base: 10,
    ability: 'dexterity',
    ballistic: 10,
  });

  const deathSaves: Ref<DeathSaves> = ref({
    max: 3,
    successes: 0,
    failures: 0,
  });

  const exhaustion = ref(0);
  const inhalation = ref(0);
  const inspiration = ref(0);

  const baseMaxDeathSaves = 3;
  const maxDeathSavesConstraint = 5;
  const minDeathSavesConstraint = 1;
  const getMaxSuccesses = computed(() => {
    const effectsStore = useEffectsStore();
    const keysToQuery = [effectKeys['death-saves-max'], effectKeys['death-saves-successes-max']];
    const modifiedValue = effectsStore.getModifiedValue(baseMaxDeathSaves, keysToQuery).value.final;
    return Math.max(minDeathSavesConstraint, Math.min(modifiedValue, maxDeathSavesConstraint));
  });

  const getMaxFailures = computed(() => {
    const effectsStore = useEffectsStore();
    const keysToQuery = [effectKeys['death-saves-max'], effectKeys['death-saves-failures-max']];
    const modifiedValue = effectsStore.getModifiedValue(baseMaxDeathSaves, keysToQuery).value.final;
    return Math.max(minDeathSavesConstraint, Math.min(modifiedValue, maxDeathSavesConstraint));
  });

  const speed: Ref<Record<SpeedKey, SpeedData>> = ref(
    config.speeds.reduce((acc, speedKey) => {
      acc[speedKey] = { base: speedKey === 'walk' ? 30 : 0, description: '' };
      return acc;
    }, {} as Record<SpeedKey, SpeedData>),
  );

  const life: Ref<Life> = ref({
    hitPoints: 0,
    temporary: 0,
  });

  const getArmorClass = (): ModifiedValue =>
    useEffectsStore().getModifiedValue(
      armorClass.value.base +
        useAbilitiesStore().getAbilityModifier(
          getEntryByLabel(armorClass.value.ability, useAbilitiesStore().abilities) as AbilityData,
        ).value.final,
      effectKeys[
        `${armorClass.value.mode}-armor-class`.replace('automatic-', '') as keyof typeof effectKeys
      ],
    );

  const getBallisticArmorClass = (): ModifiedValue =>
    useEffectsStore().getModifiedValue(
      armorClass.value.ballistic,
      effectKeys[
        `${armorClass.value.mode}-ballistic-armor-class`.replace(
          'automatic-',
          '',
        ) as keyof typeof effectKeys
      ],
    );

  const getBallisticResistance = (): ModifiedValue => {
    const baseValue =
      armorClass.value.ballistic > 0
        ? Math.floor(Math.max(armorClass.value.ballistic - 10, 0) / 2)
        : 0;
    const result = useEffectsStore().getModifiedValue(
      baseValue,
      effectKeys[
        `${armorClass.value.mode}-ballistic-resistance`.replace(
          'automatic-',
          '',
        ) as keyof typeof effectKeys
      ],
    );
    return result;
  };

  const getTemporaryHitPoints = (): ModifiedValue =>
    useEffectsStore().getModifiedValue(life.value.temporary, effectKeys['temporary-hit-points']);

  const getConstitutionModifier = computed(() => {
    return (
      useAbilitiesStore().getAbilityModifier(
        getEntryByLabel('constitution', useAbilitiesStore().abilities) as AbilityData,
      ).value.final * useProgressionStore().getLevel
    );
  });

  const getHitPointsMax = (): ModifiedValue =>
    useEffectsStore().getModifiedValue(
      useProgressionStore().classes.reduce((total, cls) => {
        return total + cls.hitPoints.reduce((sum, hp) => sum + hp, 0);
      }, 0) + getConstitutionModifier.value,
      effectKeys[
        `${useProgressionStore().hitPointsMode}-hit-points-max`
          .replace('average-', '')
          .replace('manual-', '')
          .replace('rolled-', '') as keyof typeof effectKeys
      ],
    );

  const getSpeed = (speedKey: SpeedKey): ModifiedValue => {
    const speedData = speed.value[speedKey] ?? { base: 0 };
    return useEffectsStore().getModifiedValue(speedData.base, [effectKeys[`${speedKey}-speed`], effectKeys['speed']]);
  };

  const dehydrate = (): CombatHydrate => {
    return {
      combat: {
        armorClass: armorClass.value,
        speed: speed.value,
        deathSaves: deathSaves.value,
        life: life.value,
        exhaustion: exhaustion.value,
        inhalation: inhalation.value,
        inspiration: inspiration.value,
      },
    };
  };

  const hydrate = (payload: CombatHydrate) => {
    armorClass.value = payload.combat.armorClass || armorClass.value;
    deathSaves.value = payload.combat.deathSaves || deathSaves.value;
    speed.value = payload.combat.speed || speed.value;
    life.value = payload.combat.life || life.value;
    exhaustion.value = payload.combat.exhaustion || 0;
    inhalation.value = payload.combat.inhalation || 0;
    inspiration.value = payload.combat.inspiration || 0;
  };

  return {
    armorClass,
    deathSaves,
    speed,
    life,
    exhaustion,
    inhalation,
    inspiration,
    getMaxSuccesses,
    getMaxFailures,
    getArmorClass,
    getBallisticArmorClass,
    getBallisticResistance,
    getTemporaryHitPoints,
    getHitPointsMax,
    getSpeed,
    dehydrate,
    hydrate,
  };
});
