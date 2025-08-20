import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import levelTable from '@/system/levelTable';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import rollToChat from '@/utility/rollToChat';

export type WaysHydrate = {
  ways: {
    Combativeness: number;
    Creativity: number;
    Awareness: number;
    Reason: number;
    Conviction: number;
  };
  domainsAndDisciplines: {
	closeCombat: number; // Combativeness
	communication: number; // Creativity
	compassion: number; // Conviction
	craft: number; // Creativity
	erudition: number; // Reason
	feats: number; // Combativeness
	healing: number; // Reason
	inspiration: number; // Conviction
	leadership: number; // Conviction
	magic: number; // Reason
	monsters: number; // Awareness
	mountedCombat: number; // Combativeness
	naturalEnvironment: number; // Reason
	perception: number; // Awareness
	performance: number; // Creativity
	religion: number; // Conviction
	shootingAndThrowing: number; // Combativeness
	stealth: number; // Awareness
	travel: number; // Reason
	wyrdnessMysteries: number; // Creativity
  }
};

export type WaysScore = 'Combativeness' | 'Creativity' | 'Awareness' | 'Reason' | 'Conviction';

export const useWaysStore = defineStore('ways', () => {
  // Initialize Ways Scores
  const Combativeness = ref(0);
  const Creativity = ref(0);
  const Awareness = ref(0);
  const Reason = ref(0);
  const Conviction = ref(0);

  // Initialize Domains and Disciplines Scores
  const domainsAndDisciplines = ref({
	closeCombat: 0,
	communication: 0,
	compassion: 0,
	craft: 0,
	erudition: 0,
	feats: 0,
	healing: 0,
	inspiration: 0,
	leadership: 0,
	magic: 0,
	monsters: 0,
	mountedCombat: 0,
	naturalEnvironment: 0,
	perception: 0,
	performance: 0,
	religion: 0,
	shootingAndThrowing: 0,
	stealth: 0,
	travel: 0,
	wyrdnessMysteries: 0,
  });

  // Map each Way to its affected domains
  const mapWayToDomains = (way: WaysScore): string[] => {
	switch (way) {
		case 'Combativeness': return ['closeCombat', 'feats', 'mountedCombat', 'shootingAndThrowing'];
		case 'Creativity': return ['communication', 'craft', 'performance', 'wyrdnessMysteries'];
		case 'Awareness': return ['monsters', 'perception', 'stealth'];
		case 'Reason': return ['erudition', 'healing', 'magic', 'naturalEnvironment', 'travel'];
		case 'Conviction': return ['compassion', 'inspiration', 'leadership', 'religion'];
		default: return [];
	}
  };

  // Set a Way score and update all its affected domains
  const setWayScore = (way: WaysScore, score: number) => {
	// Set the Way score
	switch (way) {
		case 'Combativeness': Combativeness.value = score; break;
		case 'Creativity': Creativity.value = score; break;
		case 'Awareness': Awareness.value = score; break;
		case 'Reason': Reason.value = score; break;
		case 'Conviction': Conviction.value = score; break;
	}
	
	// Update all domains affected by this Way
	const affectedDomains = mapWayToDomains(way);
	affectedDomains.forEach(domain => {
		domainsAndDisciplines.value[domain as keyof typeof domainsAndDisciplines.value] = score;
	});
  };

  // Individual computed models for each way that use setWayScore
  const combativenessModel = computed({
    get: () => Combativeness.value,
    set: (value) => setWayScore('Combativeness', Number(value) || 0)
  });

  const creativityModel = computed({
    get: () => Creativity.value,
    set: (value) => setWayScore('Creativity', Number(value) || 0)
  });

  const awarenessModel = computed({
    get: () => Awareness.value,
    set: (value) => setWayScore('Awareness', Number(value) || 0)
  });

  const reasonModel = computed({
    get: () => Reason.value,
    set: (value) => setWayScore('Reason', Number(value) || 0)
  });

  const convictionModel = computed({
    get: () => Conviction.value,
    set: (value) => setWayScore('Conviction', Number(value) || 0)
  });

  // It can be very convenient to make a Getter/Setter computed prop like this to read/write data into store.
  // This will just read/write into the previously defined ability score fields.
  const waysScores = computed({
    get() {
      return {
        Combativeness: Combativeness.value,
        Creativity: Creativity.value,
        Awareness: Awareness.value,
        Reason: Reason.value,
        Conviction: Conviction.value,
		domainsAndDisciplines: domainsAndDisciplines.value,
      };
    },
    set(scores) {
      Combativeness.value = scores.Combativeness || Combativeness.value;
      Creativity.value = scores.Creativity || Creativity.value;
      Awareness.value = scores.Awareness || Awareness.value;
      Reason.value = scores.Reason || Reason.value;
      Conviction.value = scores.Conviction || Conviction.value;
	  domainsAndDisciplines.value = scores.domainsAndDisciplines || domainsAndDisciplines.value;
    },
  });
  // Example for how to make basic roll + some modifiers using a custom roll template.
  const rollAbilityCheck = async (way: WaysScore, proficient: boolean = false) => {
    const score = waysScores.value[way];
    const { level } = useCharacterStore();

    // @ts-ignore
    const profBonus = proficient ? levelTable[level].profBonus || 0 : 0; // Dynamically determined based on Level.

    // Base components in any ability roll.
    const components = [
      { label: `Base Roll`, sides: 20 },
      { label: 'Stat Mod', value: score },
      { label: 'Proficiency', value: profBonus },
    ];
    // Example of modifying the roll based on some rule.
    // In this case: if overburdened, apply a penalty based on the "encumbrancePenalty" setting.

    await rollToChat({
      title: `${way}`,
      subtitle: 'Ability Check',
      traits: ['Ability', 'Basic'],
      allowHeroDie: true,
      components,
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
	Combativeness.value = hydrateStore.ways.Combativeness || Combativeness.value;
	Creativity.value = hydrateStore.ways.Creativity || Creativity.value;
	Awareness.value = hydrateStore.ways.Awareness || Awareness.value;
	Reason.value = hydrateStore.ways.Reason || Reason.value;
	Conviction.value = hydrateStore.ways.Conviction || Conviction.value;
	
	// Set domains and disciplines
	domainsAndDisciplines.value = hydrateStore.domainsAndDisciplines || domainsAndDisciplines.value;
  };

  return {
    waysScores,

    // Expose these for convenience
    Combativeness,
    Creativity,
    Awareness,
    Reason,
    Conviction,
	domainsAndDisciplines,

    // Easy-to-use computed models
    combativenessModel,
    creativityModel,
    awarenessModel,
    reasonModel,
    convictionModel,

    rollAbilityCheck,
    setWayScore,

    dehydrate,
    hydrate,
  };
});
