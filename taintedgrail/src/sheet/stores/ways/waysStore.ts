import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import sendUserError from '@/utility/sendUserError';
import { friendlyNameToDomain } from '@/utility/formattedNames';
import { v4 as uuidv4 } from 'uuid';

export type Domain = {
  way: { title: WaysScore; abbreviation: string };
  base: number;
  bonus: number;
  penalty: number;
  total: number;
};

export type Discipline = {
  // Bonus and Penalty are inherited from the domain.
  _id: string;
  name: string;
  parentDomain: string;
  base: number;
  total: number;
};

export type WaysHydrate = {
  ways: {
    combativeness: number;
    creativity: number;
    awareness: number;
    reason: number;
    conviction: number;
  };

  domains: {
    closeCombat: Domain;
    communication: Domain;
    compassion: Domain;
    craft: Domain;
    erudition: Domain;
    feats: Domain;
    healing: Domain;
    inspiration: Domain;
    leadership: Domain;
    magic: Domain;
    monsters: Domain;
    mountedCombat: Domain;
    naturalEnvironment: Domain;
    perception: Domain;
    performance: Domain;
    religion: Domain;
    shootingAndThrowing: Domain;
    stealth: Domain;
    travel: Domain;
    wyrdnessMysteries: Domain;
  };

  disciplines: Record<string, Discipline>;
};

export type WaysScore = 'combativeness' | 'creativity' | 'awareness' | 'reason' | 'conviction';

const WAY_CONFIG = {
  combativeness: 'COMB',
  creativity: 'CREA',
  awareness: 'AWAR',
  reason: 'REA',
  conviction: 'CONV',
} as const satisfies Record<WaysScore, string>;

const DOMAIN_CONFIG = {
  closeCombat: 'combativeness',
  communication: 'creativity',
  compassion: 'conviction',
  craft: 'creativity',
  erudition: 'reason',
  feats: 'combativeness',
  healing: 'reason',
  inspiration: 'conviction',
  leadership: 'conviction',
  magic: 'reason',
  monsters: 'awareness',
  mountedCombat: 'combativeness',
  naturalEnvironment: 'reason',
  perception: 'awareness',
  performance: 'creativity',
  religion: 'conviction',
  shootingAndThrowing: 'combativeness',
  stealth: 'awareness',
  travel: 'reason',
  wyrdnessMysteries: 'creativity',
} as const satisfies Record<string, WaysScore>;

const createDomain = (wayTitle: WaysScore, abbreviation: string) => ({
  way: { title: wayTitle, abbreviation },
  base: 0,
  bonus: 0,
  penalty: 0,
  total: 0,
});

export const useWaysStore = defineStore('ways', () => {
  // Initialize Ways Scores
  const ways = ref({
    combativeness: 0,
    creativity: 0,
    awareness: 0,
    reason: 0,
    conviction: 0,
  });

  // Initialize Domain Scores
  const domains = ref(
    Object.fromEntries(
      Object.entries(DOMAIN_CONFIG).map(([domainKey, wayScore]) => [domainKey, createDomain(wayScore, WAY_CONFIG[wayScore])]),
    ) as Record<keyof typeof DOMAIN_CONFIG, ReturnType<typeof createDomain>>,
  );

  const disciplines = ref<Discipline[]>([]);

  const setWayScore = (way: WaysScore, score: number) => {
    ways.value[way] = Number(score) || 0;
  };

  // Setters
  const setCombativeness = (value: number) => setWayScore('combativeness', value);
  const setCreativity = (value: number) => setWayScore('creativity', value);
  const setAwareness = (value: number) => setWayScore('awareness', value);
  const setReason = (value: number) => setWayScore('reason', value);
  const setConviction = (value: number) => setWayScore('conviction', value);

  // Computed getters
  const combativeness = computed(() => ways.value.combativeness);
  const creativity = computed(() => ways.value.creativity);
  const awareness = computed(() => ways.value.awareness);
  const reason = computed(() => ways.value.reason);
  const conviction = computed(() => ways.value.conviction);

  const calculateDomainTotals = () => {
    Object.keys(domains.value).forEach((domainKey) => {
      const key = domainKey as keyof typeof domains.value;
      const domain = domains.value[key];
      const wayScore = ways.value[domain.way.title as WaysScore] || 0;
      domain.total = domain.base + domain.bonus + wayScore - domain.penalty;
    });
  };

  const calculateDisciplineTotals = () => {
    // Total = Base + (parent bonus) + way - (parent penalty)
    disciplines.value.forEach((discipline) => {
      const domain = domains.value[discipline.parentDomain as keyof typeof domains.value];
      discipline.total = discipline.base + domain.bonus + ways.value[domain.way.title as WaysScore] - domain.penalty;
    });
  };

  // Watch for changes in scores and recalculate totals
  watch(ways, calculateDomainTotals, { deep: true });
  watch(domains, calculateDomainTotals, { deep: true });
  watch(disciplines, calculateDisciplineTotals, { deep: true });

  // Calculate initial totals
  calculateDomainTotals();
  calculateDisciplineTotals();

  // Discipline management functions
  const addDiscipline = async (discipline: any) => {
    const disciplineName = discipline.properties.Name;
    const parentDomainFriendly = discipline.properties['data-Domain'];

    // Check if discipline already exists anywhere
    const existingDiscipline = getDisciplineByName(disciplineName);
    if (existingDiscipline) {
      await sendUserError({
        title: 'Discipline already exists',
        textContent: `You already have the ${disciplineName} discipline.`,
      });
      return false;
    }

    // Verify the parent domain exists
    const domainExists = domains.value[parentDomainFriendly as keyof typeof domains.value];

    if (domainExists) {
      const newDiscipline: Discipline = {
        _id: uuidv4(),
        name: disciplineName,
        parentDomain: parentDomainFriendly,
        base: 0,
        total: 0,
      };
      disciplines.value.push(newDiscipline);
      return true;
    } else {
      return false;
    }
  };

  const removeDiscipline = (disciplineId: string) => {
    disciplines.value = disciplines.value.filter((d) => d._id !== disciplineId);
  };

  const addCustomDiscipline = (parentDomain: string) => {
    let name = 'New Discipline';
    let suffix = 2;
    while (getDisciplineByName(name)) {
      name = `New Discipline ${suffix}`;
      suffix += 1;
    }

    const newDiscipline: Discipline = {
      _id: uuidv4(),
      name,
      parentDomain,
      base: 6,
      total: 6,
    };
    disciplines.value.push(newDiscipline);
  };

  const getDisciplineByName = (disciplineName: string): Discipline | undefined => {
    return disciplines.value.find((discipline) => discipline.name.toLowerCase() === disciplineName.toLowerCase());
  };

  // Domain field setters
  const setDomainBase = (domain: string, value: number) => {
    const foundDomain = domains.value[domain as keyof typeof domains.value];
    if (foundDomain) foundDomain.base = value;
  };

  const setDomainBonus = (domain: string, value: number) => {
    const foundDomain = domains.value[domain as keyof typeof domains.value];
    if (foundDomain) foundDomain.bonus = value;
  };

  const setDomainPenalty = (domain: string, value: number) => {
    const foundDomain = domains.value[domain as keyof typeof domains.value];
    if (foundDomain) foundDomain.penalty = value;
  };

  // It can be very convenient to make a Getter/Setter computed prop like this to read/write data into store.
  // This will just read/write into the previously defined ability score fields.
  const waysScores = computed({
    get() {
      return {
        combativeness: ways.value.combativeness,
        creativity: ways.value.creativity,
        awareness: ways.value.awareness,
        reason: ways.value.reason,
        conviction: ways.value.conviction,
      };
    },
    set(scores) {
      ways.value.combativeness = scores.combativeness || ways.value.combativeness;
      ways.value.creativity = scores.creativity || ways.value.creativity;
      ways.value.awareness = scores.awareness || ways.value.awareness;
      ways.value.reason = scores.reason || ways.value.reason;
      ways.value.conviction = scores.conviction || ways.value.conviction;
    },
  });

  // Dehydrate determines how fields in Firebase are updated when there's a change in this store.
  // Everything that needs to be saved to Firebase should be defined here.
  const dehydrate = () => {
    return {
      ways: waysScores.value,
      domains: domains.value,
      disciplines: arrayToObject(disciplines.value),
    };
  };

  // Hydrate determines how the store is updated when we receive updates from Firebase
  const hydrate = (hydrateStore: any) => {
    // Set individual ways scores
    ways.value.combativeness = hydrateStore.ways?.combativeness ?? ways.value.combativeness;
    ways.value.creativity = hydrateStore.ways?.creativity ?? ways.value.creativity;
    ways.value.awareness = hydrateStore.ways?.awareness ?? ways.value.awareness;
    ways.value.reason = hydrateStore.ways?.reason ?? ways.value.reason;
    ways.value.conviction = hydrateStore.ways?.conviction ?? ways.value.conviction;

    // Set domains
    if (hydrateStore.domains) {
      // Merge the hydrated data while preserving the existing structure
      Object.keys(domains.value).forEach((domainKey) => {
        const key = domainKey as keyof typeof domains.value;
        const hydratedDomain = hydrateStore.domains[key];
        if (hydratedDomain) {
          const currentDomain = domains.value[key];
          // Update individual properties to maintain type safety
          currentDomain.base = hydratedDomain.base ?? currentDomain.base;
          currentDomain.bonus = hydratedDomain.bonus ?? currentDomain.bonus;
          currentDomain.penalty = hydratedDomain.penalty ?? currentDomain.penalty;
          currentDomain.total = hydratedDomain.total ?? currentDomain.total;

          // Merge way object properties
          if (hydratedDomain.way) {
            currentDomain.way = {
              ...currentDomain.way,
              ...hydratedDomain.way,
            };
          }
        }
      });
    }

    // Set disciplines separately
    if (hydrateStore.disciplines) {
      disciplines.value = objectToArray(hydrateStore.disciplines) || disciplines.value;
    }

    // Recalculate all totals after hydration
    calculateDomainTotals();
  };

  return {
    ways,
    domains,
    disciplines,
    waysScores,
    combativeness,
    creativity,
    awareness,
    reason,
    conviction,

    // Way setter functions
    setCombativeness,
    setCreativity,
    setAwareness,
    setReason,
    setConviction,

    // Domain functions
    setDomainBase,
    setDomainBonus,
    setDomainPenalty,

    // Discipline functions
    addDiscipline,
    addCustomDiscipline,
    removeDiscipline,
    getDisciplineByName,

    dehydrate,
    hydrate,
  };
});
