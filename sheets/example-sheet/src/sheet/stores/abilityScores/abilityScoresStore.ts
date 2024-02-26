import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import levelTable from '@/system/levelTable';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import rollToChat from '@/utility/rollToChat';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

// Type for All the Data coming from Firebase to hydrate this store.
export type AbilityScoresHydrate = {
  abilityScores: {
    Strength: {
      base: number;
      current: number;
    };
    Endurance: {
      base: number;
      current: number;
    };
    Agility: {
      base: number;
      current: number;
    };
    Charisma: {
      base: number;
      current: number;
    };
    Aura: {
      base: number;
      current: number;
    };
    Thought: {
      base: number;
      current: number;
    };
  };
};

export type AbilityScore = 'Strength' | 'Endurance' | 'Agility' | 'Charisma' | 'Aura' | 'Thought';

export const useAbilityScoreStore = defineStore('abilityScores', () => {
  // Base Abilities
  const StrengthBase = ref(0);
  const EnduranceBase = ref(0);
  const AgilityBase = ref(0);
  const CharismaBase = ref(0);
  const AuraBase = ref(0);
  const ThoughtBase = ref(0);
  // Current Abilities
  const StrengthCurrent = ref(0);
  const EnduranceCurrent = ref(0);
  const AgilityCurrent = ref(0);
  const CharismaCurrent = ref(0);
  const AuraCurrent = ref(0);
  const ThoughtCurrent = ref(0);

  // It can be very convenient to make a Getter/Setter computed prop like this to read/write data into store.
  const abilityScores = computed({
    get() {
      return {
        Strength: { base: StrengthBase.value, current: StrengthCurrent.value },
        Endurance: { base: EnduranceBase.value, current: EnduranceCurrent.value },
        Agility: { base: AgilityBase.value, current: AgilityCurrent.value },
        Charisma: { base: CharismaBase.value, current: CharismaCurrent.value },
        Aura: { base: AuraBase.value, current: AuraCurrent.value },
        Thought: { base: ThoughtBase.value, current: ThoughtCurrent.value },
      };
    },
    set(scores) {
      StrengthBase.value = scores.Strength.base || StrengthBase.value;
      EnduranceBase.value = scores.Endurance.base || EnduranceBase.value;
      AgilityBase.value = scores.Agility.base || AgilityBase.value;
      CharismaBase.value = scores.Charisma.base || CharismaBase.value;
      AuraBase.value = scores.Aura.base || AuraBase.value;
      ThoughtBase.value = scores.Thought.base || ThoughtBase.value;

      StrengthCurrent.value = scores.Strength.current || StrengthCurrent.value;
      EnduranceCurrent.value = scores.Endurance.current || EnduranceCurrent.value;
      AgilityCurrent.value = scores.Agility.current || AgilityCurrent.value;
      CharismaCurrent.value = scores.Charisma.current || CharismaCurrent.value;
      AuraCurrent.value = scores.Aura.current || AuraCurrent.value;
      ThoughtCurrent.value = scores.Thought.current || ThoughtCurrent.value;
    },
  });
  // Example for how to make basic roll + some modifiers using a custom roll template
  const rollAbilityCheck = async (abilityScore: AbilityScore, proficient: boolean = false) => {
    const score = abilityScores.value[abilityScore].current;
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
    const { isOverburdened } = useInventoryStore();
    if (isOverburdened) {
      const encumbrancePenalty = useSettingsStore().encumbrancePenalty;
      components.push({ label: 'Overencumbered', value: encumbrancePenalty });
    }
    await rollToChat({
      title: `${abilityScore}`,
      subtitle: 'Ability Check',
      traits: ['Ability', 'Basic'],
      allowHeroDie: true,
      components,
    });
  };

  // Dehydrate determines how fields in Firebase are updated when there's a change in this store.
  const dehydrate = () => {
    return { abilityScores: abilityScores.value };
  };

  // Hydrate determines how the store is updated when we receive updates from Firebase
  const hydrate = (hydrateStore: AbilityScoresHydrate) => {
    abilityScores.value = hydrateStore.abilityScores;
  };

  return {
    abilityScores,

    // Expose these for convenience
    StrengthBase,
    EnduranceBase,
    AgilityBase,
    CharismaBase,
    AuraBase,
    ThoughtBase,
    StrengthCurrent,
    EnduranceCurrent,
    AgilityCurrent,
    CharismaCurrent,
    AuraCurrent,
    ThoughtCurrent,

    rollAbilityCheck,

    dehydrate,
    hydrate,
  };
});
