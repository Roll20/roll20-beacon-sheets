import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import sendToChat from '@/utility/sendToChat';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';

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
    survival: number;
    quest: string;
    ascensionPoints: string;
    act1: string;
    act2: string;
    act3: string;
    ascensionGauge: number;
    fightingStance: string;
  };
};

export const useCharacterStore = defineStore('character', () => {
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
  const survival = ref(3);

  // Ascension-related properties
  const quest = ref('');
  const ascensionPoints = ref('');
  const act1 = ref('');
  const act2 = ref('');
  const act3 = ref('');
  const ascensionGauge = ref(0);

  // Combat-related properties
  const fightingStance = ref('standard');

  // Potential: based on creativity score
  const potential = computed(() => {
    const creativity = waysStore.creativity;
    if (creativity >= 5) return 3;
    if (creativity >= 2) return 2;
    return 1;
  });

  // Mental Resistance = Conviction + 5
  const mentalResistance = computed(() => {
    return waysStore.conviction + 5;
  });

  // Defense = Base: reason + awareness + 5 | Offensive: base - potential | Defensive/Movement: base + potential
  const defense = computed(() => {
    const base = waysStore.reason + waysStore.awareness + 5;
    if (fightingStance.value === 'offensive') {
      return base - potential.value;
    } else if (fightingStance.value === 'defensive' || fightingStance.value === 'movement') {
      return base + potential.value;
    } else {
      return base;
    }
  });

  // Speed = combativeness + awareness
  const speed = computed(() => {
    return waysStore.combativeness + waysStore.awareness;
  });

  // Check whether the health radio button is checked
  const isHealthChecked = computed(() => (value: number) => {
    return healthCondition.value >= value;
  });

  const setHealth = (value: number) => {
    healthCondition.value = value;
  };

  // Check whether the ascension gauge radio button is checked
  const isAscensionChecked = computed(() => (value: number) => {
    return ascensionGauge.value >= value;
  });

  const setAscensionGauge = (value: number) => {
    ascensionGauge.value = value;
  };

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
        survival: survival.value,
        mentalResistance: mentalResistance.value,
        quest: quest.value,
        ascensionPoints: ascensionPoints.value,
        act1: act1.value,
        act2: act2.value,
        act3: act3.value,
        ascensionGauge: ascensionGauge.value,
        fightingStance: fightingStance.value,
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
    survival.value = hydrateStore.character.survival ?? survival.value;
    quest.value = hydrateStore.character.quest ?? quest.value;
    ascensionPoints.value = hydrateStore.character.ascensionPoints ?? ascensionPoints.value;
    act1.value = hydrateStore.character.act1 ?? act1.value;
    act2.value = hydrateStore.character.act2 ?? act2.value;
    act3.value = hydrateStore.character.act3 ?? act3.value;
    ascensionGauge.value = hydrateStore.character.ascensionGauge ?? ascensionGauge.value;
    fightingStance.value = hydrateStore.character.fightingStance ?? fightingStance.value;
  };

  const rollHealthScore = () => {
    const healthValue = healthCondition.value;
    if (healthValue >= 15) {
      return 3;
    } else if (healthValue >= 11) {
      return 2;
    } else if (healthValue >= 6) {
      return 1;
    } else {
      return 0;
    }
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
    survival,
    mentalResistance,
    isHealthChecked,
    setHealth,
    quest,
    ascensionPoints,
    act1,
    act2,
    act3,
    ascensionGauge,
    isAscensionChecked,
    setAscensionGauge,
    potential,
    defense,
    speed,
    fightingStance,
    rollHealthScore,
    dehydrate,
    hydrate,
  };
});
