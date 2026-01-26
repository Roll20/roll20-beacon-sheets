import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type NPCHydrate = {
  npc: {
    level: number;
    description: string;
    healthCondition: number;
    stamina: number;
    mentalResistance: number;
    attack: number;
    defense: number;
    speed: number;
    potential: number;
    damage: number;
    protection: number;
    perception: number;
    stealth: number;
    feats: number;
    hpGoodMax: number;
    hpOkayMax: number;
    hpBadMax: number;
    hpCriticalMax: number;
  };
};

export const useNPCStore = defineStore('npc', () => {
  const level = ref(0);
  const description = ref('');
  const healthCondition = ref(0);
  const stamina = ref(0);
  const mentalResistance = ref(0);
  const attack = ref(0);
  const defense = ref(0);
  const damage = ref(0);
  const protection = ref(0);
  const speed = ref(0);
  const potential = ref(0);
  const perception = ref(0);
  const stealth = ref(0);
  const feats = ref(0);
  const hpGoodMax = ref(0);
  const hpOkayMax = ref(0);
  const hpBadMax = ref(0);
  const hpCriticalMax = ref(0);

  const setHealth = (value: number) => {
    healthCondition.value = value;
  };

  const rollHealthScore = computed(() => () => {
    if (healthCondition.value <= hpCriticalMax.value) {
      return 3;
    } else if (healthCondition.value <= hpBadMax.value) {
      return 2;
    } else if (healthCondition.value <= hpOkayMax.value) {
      return 1;
    } else {
      return 0;
    }
  });

  const dehydrate = () => {
    return {
      npc: {
        level: level.value,
        description: description.value,
        healthCondition: healthCondition.value,
        stamina: stamina.value,
        mentalResistance: mentalResistance.value,
        attack: attack.value,
        defense: defense.value,
        speed: speed.value,
        potential: potential.value,
        damage: damage.value,
        protection: protection.value,
        perception: perception.value,
        stealth: stealth.value,
        feats: feats.value,
        hpGoodMax: hpGoodMax.value,
        hpOkayMax: hpOkayMax.value,
        hpBadMax: hpBadMax.value,
        hpCriticalMax: hpCriticalMax.value,
      },
    };
  };

  const hydrate = (hydrateData: NPCHydrate) => {
    level.value = hydrateData.npc.level ?? level.value;
    description.value = hydrateData.npc.description ?? description.value;
    healthCondition.value = hydrateData.npc.healthCondition ?? healthCondition.value;
    stamina.value = hydrateData.npc.stamina ?? stamina.value;
    mentalResistance.value = hydrateData.npc.mentalResistance ?? mentalResistance.value;
    attack.value = hydrateData.npc.attack ?? attack.value;
    defense.value = hydrateData.npc.defense ?? defense.value;
    speed.value = hydrateData.npc.speed ?? speed.value;
    potential.value = hydrateData.npc.potential ?? potential.value;
    damage.value = hydrateData.npc.damage ?? damage.value;
    protection.value = hydrateData.npc.protection ?? protection.value;
    perception.value = hydrateData.npc.perception ?? perception.value;
    stealth.value = hydrateData.npc.stealth ?? stealth.value;
    feats.value = hydrateData.npc.feats ?? feats.value;
    hpGoodMax.value = hydrateData.npc.hpGoodMax ?? hpGoodMax.value;
    hpOkayMax.value = hydrateData.npc.hpOkayMax ?? hpOkayMax.value;
    hpBadMax.value = hydrateData.npc.hpBadMax ?? hpBadMax.value;
    hpCriticalMax.value = hydrateData.npc.hpCriticalMax ?? hpCriticalMax.value;
  };

  return {
    level,
    description,
    healthCondition,
    stamina,
    mentalResistance,
    attack,
    defense,
    speed,
    potential,
    damage,
    protection,
    perception,
    stealth,
    feats,
    hpGoodMax,
    hpOkayMax,
    hpBadMax,
    hpCriticalMax,
    setHealth,
    rollHealthScore,
    dehydrate,
    hydrate,
  };
});
