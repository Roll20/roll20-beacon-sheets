import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import sendToChat from '@/utility/sendToChat';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';

export type FightingStance = 'standard' | 'offensive' | 'defensive' | 'movement';
type CombatStatKey = 'potential' | 'defense' | 'speed';
type CombatBonusSet = Record<CombatStatKey, number>;
export type CombatBonusesByStance = Record<FightingStance, CombatBonusSet>;

export type CharacterHydrate = {
  character: {
    player: string;
    age: string;
    origin: string;
    occupation: string;
    experience: string;
    description: string;
    color: string;
    healthCondition: number;
    stamina: number;
    maxSurvival: number;
    survival: number;
    quest: string;
    // ascensionPoints: string;
    act1: string;
    act2: string;
    act3: string;
    ascensionGauge: number;
    disgraceGauge: number;
    isDisgrace: boolean;
    fightingStance: FightingStance;
    combatBonuses: CombatBonusesByStance;
  };
};

const DEFAULT_COMBAT_BONUSES: CombatBonusesByStance = {
  standard: { potential: 0, defense: 0, speed: 0 },
  offensive: { potential: 0, defense: 0, speed: 0 },
  defensive: { potential: 0, defense: 0, speed: 0 },
  movement: { potential: 0, defense: 0, speed: 0 },
};

const STANCES: FightingStance[] = ['standard', 'offensive', 'defensive', 'movement'];

export const useCharacterStore = defineStore('character', () => {
  const MAX_SURVIVAL_CAP = 10;
  const waysStore = useWaysStore();

  const player = ref('');
  const age = ref('');
  const origin = ref('');
  const occupation = ref('');
  const experience = ref('');
  const description = ref('');
  const color = ref('');
  const healthCondition = ref(1);
  const stamina = ref(10);
  const maxSurvival = ref(3);
  const survival = ref(3);

  // Ascension-related properties
  const quest = ref('');
  //   const ascensionPoints = ref('');
  const act1 = ref('');
  const act2 = ref('');
  const act3 = ref('');
  const ascensionGauge = ref(0);
  const disgraceGauge = ref(0);
  const isDisgrace = ref(false);

  // Combat-related properties
  const fightingStance = ref<FightingStance>('standard');
  const combatBonuses = ref<CombatBonusesByStance>(structuredClone(DEFAULT_COMBAT_BONUSES));

  const sanitizeBonusValue = (value: number): number => {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return 0;
    }
    return Math.trunc(value);
  };

  const mergeCombatBonuses = (source: CombatBonusesByStance | undefined): CombatBonusesByStance => {
    const merged = structuredClone(DEFAULT_COMBAT_BONUSES);
    if (!source) {
      return merged;
    }

    for (const stance of STANCES) {
      const stanceValues = source[stance];
      if (!stanceValues) continue;
      merged[stance].potential = sanitizeBonusValue(stanceValues.potential ?? 0);
      merged[stance].defense = sanitizeBonusValue(stanceValues.defense ?? 0);
      merged[stance].speed = sanitizeBonusValue(stanceValues.speed ?? 0);
    }
    return merged;
  };

  // Mental Resistance = Conviction + 5
  const mentalResistance = computed(() => {
    return waysStore.conviction + 5;
  });

  // Potential base: based on creativity score
  const potentialBase = computed(() => {
    const creativity = waysStore.creativity;
    if (creativity >= 5) return 3;
    if (creativity >= 2) return 2;
    return 1;
  });

  // Standard defense base: Reason + Awareness + 5
  const standardDefense = computed(() => {
    return waysStore.reason + waysStore.awareness + 5;
  });

  // Speed base = combativeness + awareness
  const speedBase = computed(() => {
    return waysStore.combativeness + waysStore.awareness;
  });

  const getPotentialForStance = (stance: FightingStance): number => {
    return potentialBase.value + combatBonuses.value[stance].potential;
  };

  // Offensive = Standard - Potential | Defensive/Movement = Standard + Potential
  const getDefenseStanceModifier = (stance: FightingStance): number => {
    const potentialForStance = getPotentialForStance(stance);
    if (stance === 'offensive') {
      return -potentialForStance;
    }
    if (stance === 'defensive' || stance === 'movement') {
      return potentialForStance;
    }
    return 0;
  };

  const getDefenseForStance = (stance: FightingStance): number => {
    return standardDefense.value + getDefenseStanceModifier(stance) + combatBonuses.value[stance].defense;
  };

  const getSpeedForStance = (stance: FightingStance): number => {
    return speedBase.value + combatBonuses.value[stance].speed;
  };

  const potential = computed(() => {
    return getPotentialForStance(fightingStance.value);
  });

  const defenseStanceModifier = computed(() => {
    return getDefenseStanceModifier(fightingStance.value);
  });

  const defense = computed(() => {
    return getDefenseForStance(fightingStance.value);
  });

  const speed = computed(() => {
    return getSpeedForStance(fightingStance.value);
  });

  const setCombatBonus = (stance: FightingStance, stat: CombatStatKey, value: number) => {
    combatBonuses.value[stance][stat] = sanitizeBonusValue(value);
  };

  // Check whether the health radio button is checked
  const isHealthChecked = computed(() => (value: number) => {
    return healthCondition.value >= value;
  });

  const setHealth = (value: number) => {
    healthCondition.value = value;
  };

  const isMaxSurvivalChecked = computed(() => (value: number) => {
    return maxSurvival.value >= value;
  });

  const setMaxSurvival = (value: number) => {
    maxSurvival.value = Math.max(0, Math.min(MAX_SURVIVAL_CAP, value));
    if (survival.value > maxSurvival.value) {
      survival.value = maxSurvival.value;
    }
  };

  const isSurvivalChecked = computed(() => (value: number) => {
    return survival.value >= value;
  });

  const setSurvival = (value: number) => {
    survival.value = Math.max(0, Math.min(maxSurvival.value, value));
  };

  watch(maxSurvival, (value) => {
    const clampedMax = Math.max(0, Math.min(MAX_SURVIVAL_CAP, value));
    if (clampedMax !== value) {
      maxSurvival.value = clampedMax;
      return;
    }

    if (survival.value > clampedMax) {
      survival.value = clampedMax;
    }
  });

  // Check whether the ascension gauge radio button is checked
  const isAscensionChecked = computed(() => (value: number) => {
    return ascensionGauge.value >= value;
  });

  const setAscensionGauge = (value: number) => {
    ascensionGauge.value = value;
  };

  const isDisgraceChecked = computed(() => (value: number) => {
    return disgraceGauge.value >= value;
  });

  const setDisgraceGauge = (value: number) => {
    disgraceGauge.value = value;
  };

  const toggleDisgraceMode = () => {
    isDisgrace.value = !isDisgrace.value;
  };

  const rollHealthScore = computed(() => () => {
    if (healthCondition.value >= 15) {
      return 3;
    } else if (healthCondition.value >= 11) {
      return 2;
    } else if (healthCondition.value >= 6) {
      return 1;
    } else {
      return 0;
    }
  });

  const dehydrate = () => {
    return {
      character: {
        player: player.value,
        age: age.value,
        origin: origin.value,
        occupation: occupation.value,
        experience: experience.value,
        description: description.value,
        color: color.value,
        healthCondition: healthCondition.value,
        stamina: stamina.value,
        maxSurvival: maxSurvival.value,
        survival: survival.value,
        mentalResistance: mentalResistance.value,
        quest: quest.value,
        // ascensionPoints: ascensionPoints.value,
        act1: act1.value,
        act2: act2.value,
        act3: act3.value,
        ascensionGauge: ascensionGauge.value,
        disgraceGauge: disgraceGauge.value,
        isDisgrace: isDisgrace.value,
        fightingStance: fightingStance.value,
        combatBonuses: combatBonuses.value,
        // We don't need to save the computed ones on Firebase as long as we have everything needed to calculate them.
      },
    };
  };

  const hydrate = (hydrateStore: CharacterHydrate) => {
    // Should only need to hydrate the same attributes as in "dehydrate".
    player.value = hydrateStore.character.player ?? player.value;
    age.value = hydrateStore.character.age ?? age.value;
    origin.value = hydrateStore.character.origin ?? origin.value;
    occupation.value = hydrateStore.character.occupation ?? occupation.value;
    experience.value = hydrateStore.character.experience ?? experience.value;
    description.value = hydrateStore.character.description ?? description.value;
    color.value = hydrateStore.character.color ?? color.value;
    healthCondition.value = hydrateStore.character.healthCondition ?? healthCondition.value;
    stamina.value = hydrateStore.character.stamina ?? stamina.value;
    setMaxSurvival(hydrateStore.character.maxSurvival);
    setSurvival(hydrateStore.character.survival);
    quest.value = hydrateStore.character.quest ?? quest.value;
    // ascensionPoints.value = hydrateStore.character.ascensionPoints ?? ascensionPoints.value;
    act1.value = hydrateStore.character.act1 ?? act1.value;
    act2.value = hydrateStore.character.act2 ?? act2.value;
    act3.value = hydrateStore.character.act3 ?? act3.value;
    ascensionGauge.value = hydrateStore.character.ascensionGauge ?? ascensionGauge.value;
    disgraceGauge.value = hydrateStore.character.disgraceGauge ?? disgraceGauge.value;
    isDisgrace.value = hydrateStore.character.isDisgrace ?? isDisgrace.value;
    fightingStance.value = hydrateStore.character.fightingStance;
    combatBonuses.value = mergeCombatBonuses(hydrateStore.character.combatBonuses);
  };

  return {
    player,
    age,
    origin,
    occupation,
    experience,
    description,
    color,
    healthCondition,
    stamina,
    maxSurvival,
    survival,
    mentalResistance,
    isHealthChecked,
    setHealth,
    isMaxSurvivalChecked,
    setMaxSurvival,
    isSurvivalChecked,
    setSurvival,
    quest,
    // ascensionPoints,
    act1,
    act2,
    act3,
    ascensionGauge,
    disgraceGauge,
    isDisgrace,
    isAscensionChecked,
    setAscensionGauge,
    isDisgraceChecked,
    setDisgraceGauge,
    toggleDisgraceMode,
    combatBonuses,
    setCombatBonus,
    potentialBase,
    standardDefense,
    defenseStanceModifier,
    speedBase,
    getPotentialForStance,
    getDefenseForStance,
    getSpeedForStance,
    potential,
    defense,
    speed,
    fightingStance,
    rollHealthScore,
    dehydrate,
    hydrate,
  };
});
