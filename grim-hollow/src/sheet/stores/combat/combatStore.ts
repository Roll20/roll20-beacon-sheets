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
  armorClass: ArmorClass;
  speed: Record<SpeedKey, SpeedData>;
  deathSaves: DeathSaves;
  life: Life;
  exhaustion: number;
  inspiration: number;
  useRollDialog: boolean;
};

export const useCombatStore = defineStore('combat', () => {
  const { t } = useI18n();

  const armorClass: Ref<ArmorClass> = ref({
    mode: 'automatic',
    base: 10,
    ability: 'dexterity',
  });

  const deathSaves: Ref<DeathSaves> = ref({
    max: 3,
    successes: 0,
    failures: 0,
  });

  const exhaustion = ref(0);
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
  
  const useRollDialog = ref(true);

  const shouldDisplayRollDialog = (event: MouseEvent): boolean => {
    if (!useRollDialog.value && !event.altKey) return false;
    else if(!useRollDialog.value && event.altKey) return true;
    else if(useRollDialog.value && event.altKey) return false;
    return true;
  };

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

  const getTemporaryHitPoints = (): number =>
    life.value.temporary;

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
    
    return computed(() => {
      const effectsStore = useEffectsStore();
      const keys = [effectKeys[`${speedKey}-speed`], effectKeys['speed']];
      
      const modification = effectsStore.getModifiedValue(speedData.base, keys).value;

      // If base speed is 0, bonuses should not apply unless a "Set" or "Set Base" effect has granted that movement mode
      if (speedData.base === 0 && modification.final > 0) {
        const hasGrantingEffect = effectsStore.effects.some(effect => {
          if (!effect.enabled) return false;
          
          return effect.effects.some(single => {
             if (!keys.includes(single.attribute as typeof keys[number])) return false;
             if (!single.operation.startsWith('set')) return false;
             
             return effectsStore.isEffectSingleActive(effect, single);
          });
        });

        if (!hasGrantingEffect) {
          return {
            final: 0,
            modifiers: []
          };
        }
      }

      return modification;
    });
  };


  const dehydrate = (): CombatHydrate => {
    return {
      armorClass: armorClass.value,
      speed: speed.value,
      deathSaves: deathSaves.value,
      life: life.value,
      exhaustion: exhaustion.value,
      inspiration: inspiration.value,
      useRollDialog: useRollDialog.value,
    };
  };

  const hydrate = (payload: CombatHydrate) => {
    armorClass.value = payload.armorClass || armorClass.value;
    deathSaves.value = payload.deathSaves || deathSaves.value;
    if (payload.speed) {
      Object.keys(payload.speed).forEach((key) => {
        const speedKey = key as SpeedKey;
        if (speed.value[speedKey]) {
          speed.value[speedKey] = payload.speed[speedKey];
        }
      });
    }
    life.value = payload.life || life.value;
    exhaustion.value = payload.exhaustion || 0;
    inspiration.value = payload.inspiration || 0;
    useRollDialog.value = payload.useRollDialog !== undefined ? payload.useRollDialog : useRollDialog.value;
  };

  return {
    armorClass,
    deathSaves,
    speed,
    life,
    exhaustion,
    inspiration,
    useRollDialog,
    getMaxSuccesses,
    getMaxFailures,
    getArmorClass,
    getTemporaryHitPoints,
    getHitPointsMax,
    getSpeed,
    shouldDisplayRollDialog,
    dehydrate,
    hydrate,
  };
});
