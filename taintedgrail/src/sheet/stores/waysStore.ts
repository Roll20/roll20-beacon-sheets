import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import levelTable from '@/system/levelTable';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import rollToChat from '@/utility/rollToChat';
import { domainToFriendlyName } from '@/utility/formattedNames';

export type WaysHydrate = {
  ways: {
    combativeness: number;
    creativity: number;
    awareness: number;
    reason: number;
    conviction: number;
  };

  domainsAndDisciplines: {
    closeCombat: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    communication: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    compassion: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    craft: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    erudition: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    feats: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    healing: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    inspiration: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    leadership: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    magic: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    monsters: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    mountedCombat: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    naturalEnvironment: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    perception: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    performance: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    religion: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    shootingAndThrowing: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    stealth: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    travel: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
    wyrdnessMysteries: {
      way: {};
      base: number;
      bonus: number;
      penalty: number;
      total: number;
      disciplines: [];
    };
  };
};

export type WaysScore = 'combativeness' | 'creativity' | 'awareness' | 'reason' | 'conviction';

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
  const domainsAndDisciplines = ref({
    closeCombat: {
      way: { title: 'combativeness', abbreviation: 'COMB' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    communication: {
      way: { title: 'creativity', abbreviation: 'CREA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    compassion: {
      way: { title: 'conviction', abbreviation: 'CONV' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    craft: {
      way: { title: 'creativity', abbreviation: 'CREA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    erudition: {
      way: { title: 'reason', abbreviation: 'REA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    feats: {
      way: { title: 'combativeness', abbreviation: 'COMB' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    healing: {
      way: { title: 'reason', abbreviation: 'REA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    inspiration: {
      way: { title: 'conviction', abbreviation: 'CONV' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    leadership: {
      way: { title: 'conviction', abbreviation: 'CONV' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    magic: {
      way: { title: 'reason', abbreviation: 'REA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    monsters: {
      way: { title: 'awareness', abbreviation: 'AWAR' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    mountedCombat: {
      way: { title: 'combativeness', abbreviation: 'COMB' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    naturalEnvironment: {
      way: { title: 'reason', abbreviation: 'REA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    perception: {
      way: { title: 'awareness', abbreviation: 'AWAR' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    performance: {
      way: { title: 'creativity', abbreviation: 'CREA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    religion: {
      way: { title: 'conviction', abbreviation: 'CONV' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    shootingAndThrowing: {
      way: { title: 'combativeness', abbreviation: 'COMB' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    stealth: {
      way: { title: 'awareness', abbreviation: 'AWAR' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    travel: {
      way: { title: 'reason', abbreviation: 'REA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
    wyrdnessMysteries: {
      way: { title: 'creativity', abbreviation: 'CREA' },
      base: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
      disciplines: [],
    },
  });

  // Set a Way score and update all its affected domains
  const setWayScore = (way: WaysScore, score: number) => {
    // Set the Way score
    switch (way) {
      case 'combativeness':
        ways.value.combativeness = score;
        break;
      case 'creativity':
        ways.value.creativity = score;
        break;
      case 'awareness':
        ways.value.awareness = score;
        break;
      case 'reason':
        ways.value.reason = score;
        break;
      case 'conviction':
        ways.value.conviction = score;
        break;
    }

    // Update all domains affected by this Way
    const affectedDomains = Object.values(domainsAndDisciplines.value).filter(
      (domain) => domain.way.title === way,
    );
    affectedDomains.forEach((domain) => {
      domain.total =
        domain.base + domain.bonus + ways.value[domain.way.title as WaysScore] - domain.penalty;
    });
  };

  // Individual computed models for each way that use setWayScore
  const combativenessModel = computed({
    get: () => ways.value.combativeness,
    set: (value) => setWayScore('combativeness', Number(value) || 0),
  });

  const creativityModel = computed({
    get: () => ways.value.creativity,
    set: (value) => setWayScore('creativity', Number(value) || 0),
  });

  const awarenessModel = computed({
    get: () => ways.value.awareness,
    set: (value) => setWayScore('awareness', Number(value) || 0),
  });

  const reasonModel = computed({
    get: () => ways.value.reason,
    set: (value) => setWayScore('reason', Number(value) || 0),
  });

  const convictionModel = computed({
    get: () => ways.value.conviction,
    set: (value) => setWayScore('conviction', Number(value) || 0),
  });

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
        domainsAndDisciplines: domainsAndDisciplines.value,
      };
    },
    set(scores) {
      ways.value.combativeness = scores.combativeness || ways.value.combativeness;
      ways.value.creativity = scores.creativity || ways.value.creativity;
      ways.value.awareness = scores.awareness || ways.value.awareness;
      ways.value.reason = scores.reason || ways.value.reason;
      ways.value.conviction = scores.conviction || ways.value.conviction;
      domainsAndDisciplines.value = scores.domainsAndDisciplines || domainsAndDisciplines.value;
    },
  });

  const rollWay = async (way: WaysScore) => {
    const score = ways.value[way];
    const { rollHealthScore } = useCharacterStore();
    const healthModifier = rollHealthScore();
    const friendlyName = way.slice(0, 1).toUpperCase() + way.slice(1); // Capitalize the first letter
    await rollToChat({
      title: `Way Roll: ${friendlyName}`,
      subtitle: '1d10 + Way - Health Modifier',
      allowHeroDie: false,
      components: [
        { label: 'Base', sides: 10 },
        { label: 'Way', value: score },
        { label: 'Health Modifier', value: -healthModifier },
      ],
    });
  };

  const rollDomain = async (domain: string) => {
    const { rollHealthScore } = useCharacterStore();

    const foundDomain =
      domainsAndDisciplines.value[domain as keyof typeof domainsAndDisciplines.value];
    const base = foundDomain.base;
    const bonus = foundDomain.bonus;
    const way = ways.value[foundDomain.way.title as WaysScore] || 0;
    const penalty = foundDomain.penalty;
    const healthModifier = rollHealthScore();

    const friendlyName = domainToFriendlyName(domain);

    await rollToChat({
      title: `Domain Roll: ${friendlyName}`,
      subtitle: '1d10 + Base + Bonus + Way - Penalty - Health Modifier',
      allowHeroDie: false,
      components: [
        { label: 'Base', value: base },
        { label: 'Bonus', value: bonus },
        { label: 'Way', value: way },
        { label: 'Penalty', value: penalty },
        { label: 'Health Modifier', value: -healthModifier },
      ],
    });
  };

  // Dehydrate determines how fields in Firebase are updated when there's a change in this store.
  // Everything that needs to be saved to Firebase should be defined here.
  const dehydrate = () => {
    // We save our entire object with the base/current scores.
    return { ways: waysScores.value, domainsAndDisciplines: domainsAndDisciplines.value };
  };

  // Hydrate determines how the store is updated when we receive updates from Firebase
  const hydrate = (hydrateStore: WaysHydrate) => {
    // Set individual ways scores
    ways.value.combativeness = hydrateStore.ways.combativeness || ways.value.combativeness;
    ways.value.creativity = hydrateStore.ways.creativity || ways.value.creativity;
    ways.value.awareness = hydrateStore.ways.awareness || ways.value.awareness;
    ways.value.reason = hydrateStore.ways.reason || ways.value.reason;
    ways.value.conviction = hydrateStore.ways.conviction || ways.value.conviction;

    // Set domains and disciplines
    if (hydrateStore.domainsAndDisciplines) {
      // Merge the hydrated data while preserving the existing structure
      Object.keys(domainsAndDisciplines.value).forEach((domainKey) => {
        const key = domainKey as keyof typeof domainsAndDisciplines.value;
        const hydratedDomain = hydrateStore.domainsAndDisciplines[key];
        if (hydratedDomain) {
          domainsAndDisciplines.value[key] = {
            ...domainsAndDisciplines.value[key],
            ...hydratedDomain,
            // Ensure way object has the required structure
            way: {
              ...domainsAndDisciplines.value[key].way,
              ...hydratedDomain.way,
            },
          };
        }
      });
    }
  };

  return {
    waysScores,

    // Expose these for convenience
    combativeness: ways.value.combativeness,
    creativity: ways.value.creativity,
    awareness: ways.value.awareness,
    reason: ways.value.reason,
    conviction: ways.value.conviction,
    domainsAndDisciplines,

    // Easy-to-use computed models
    combativenessModel,
    creativityModel,
    awarenessModel,
    reasonModel,
    convictionModel,

    rollWay,
    rollDomain,
    setWayScore,

    dehydrate,
    hydrate,
  };
});
