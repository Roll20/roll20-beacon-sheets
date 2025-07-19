import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import levelTable from '@/system/levelTable';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import rollToChat from '@/utility/rollToChat';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useModifiersStore } from '../modifiers/modifiersStore';
import { useItemStore } from '../character/characterQualitiesStore';

// Type for All the Data coming from Firebase to hydrate this store.
export type AbilityScoresHydrate = {
  abilityScores: {
    Accuracy: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Communication: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Constitution: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Dexterity: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Fighting: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Intelligence: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Perception: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Strength: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
    Willpower: {
      base: number;
      current: number;
      partialAdvancement: boolean;
    };
  };
};
export type AbilityFocusList = {
  type:string;
  focus: boolean;
  doubleFocus: boolean;
  description: string;
}
export type AbilityScore = 'Accuracy' | 'Communication' | 'Constitution' | 'Dexterity' | 'Fighting' | 'Intelligence' | 'Perception' | 'Strength' | 'Willpower';

export const useAbilityScoreStore = defineStore('abilityScores', () => {
  // Initialize Base Ability Scores
  const AccuracyBase = ref(0);
  const CommunicationBase = ref(0);
  const ConstitutionBase = ref(0);
  const DexterityBase = ref(0);
  const FightingBase = ref(0);
  const IntelligenceBase = ref(0);
  const PerceptionBase = ref(0);
  const StrengthBase = ref(0);
  const WillpowerBase = ref(0);
  // Initialize Current Ability scores
  const AccuracyCurrent = ref(0);
  const CommunicationCurrent = ref(0);
  const ConstitutionCurrent = ref(0);
  const DexterityCurrent = ref(0);
  const FightingCurrent = ref(0);
  const IntelligenceCurrent = ref(0);
  const PerceptionCurrent = ref(0);
  const StrengthCurrent = ref(0);
  const WillpowerCurrent = ref(0);
  const AccuracyPartialAdvancement = ref(false);
  const CommunicationPartialAdvancement = ref(false);
  const ConstitutionPartialAdvancement = ref(false);
  const DexterityPartialAdvancement = ref(false);
  const FightingPartialAdvancement = ref(false);
  const IntelligencePartialAdvancement = ref(false);
  const PerceptionPartialAdvancement = ref(false);
  const StrengthPartialAdvancement = ref(false);
  const WillpowerPartialAdvancement = ref(false);
  // It can be very convenient to make a Getter/Setter computed prop like this to read/write data into store.
  // This will just read/write into the previously defined ability score fields.
  const abilityScores = computed({
    get() {
      return {
        Accuracy: { base: AccuracyBase.value,current: AccuracyCurrent.value, partialAdvancement: AccuracyPartialAdvancement.value },
        Communication: { base: CommunicationBase.value, current: CommunicationCurrent.value, partialAdvancement: CommunicationPartialAdvancement.value },
        Constitution: { base: ConstitutionBase.value, current: ConstitutionCurrent.value, partialAdvancement: ConstitutionPartialAdvancement.value },
        Dexterity: { base: DexterityBase.value, current: DexterityCurrent.value, partialAdvancement: DexterityPartialAdvancement.value },
        Fighting: { base: FightingBase.value, current: FightingCurrent.value, partialAdvancement: FightingPartialAdvancement.value },
        Intelligence: { base: IntelligenceBase.value, current: IntelligenceCurrent.value, partialAdvancement: IntelligencePartialAdvancement.value },
        Perception: { base: PerceptionBase.value, current: PerceptionCurrent.value, partialAdvancement: PerceptionPartialAdvancement.value },
        Strength: { base: StrengthBase.value, current: StrengthCurrent.value, partialAdvancement: StrengthPartialAdvancement.value },
        Willpower: { base: WillpowerBase.value, current: WillpowerCurrent.value, partialAdvancement: WillpowerPartialAdvancement.value },
      };
    },
    set(scores) {
      AccuracyBase.value = scores.Accuracy.base || AccuracyBase.value;
      CommunicationBase.value = scores.Communication.base || CommunicationBase.value;
      ConstitutionBase.value = scores.Constitution.base || ConstitutionBase.value;
      DexterityBase.value = scores.Dexterity.base || DexterityBase.value;
      FightingBase.value = scores.Fighting.base || FightingBase.value;
      IntelligenceBase.value = scores.Intelligence.base || IntelligenceBase.value;
      PerceptionBase.value = scores.Perception.base || PerceptionBase.value;
      StrengthBase.value = scores.Strength.base || StrengthBase.value;
      WillpowerBase.value = scores.Willpower.base || WillpowerBase.value;

      AccuracyCurrent.value = scores.Accuracy.current || AccuracyCurrent.value;
      CommunicationCurrent.value = scores.Communication.current || CommunicationCurrent.value;
      ConstitutionCurrent.value = scores.Constitution.current || ConstitutionCurrent.value;
      DexterityCurrent.value = scores.Dexterity.current || DexterityCurrent.value;
      FightingCurrent.value = scores.Fighting.current || FightingCurrent.value;
      IntelligenceCurrent.value = scores.Intelligence.current || IntelligenceCurrent.value;
      PerceptionCurrent.value = scores.Perception.current || PerceptionCurrent.value;
      StrengthCurrent.value = scores.Strength.current || StrengthCurrent.value;
      WillpowerCurrent.value = scores.Willpower.current || WillpowerCurrent.value;
    },
  });
  // Example for how to make basic roll + some modifiers using a custom roll template.
  const rollAbilityCheck = async (abilityScore: AbilityScore, proficient: boolean = false, abilityBonus?: number, focus?:any) => {
    // Score is the Ability Score value
    const score = abilityScores.value[abilityScore].base;
    const { level } = useCharacterStore();
    const mods = useModifiersStore();
    const modResult = mods.modifiers.filter(mod => mod.option === 'Ability' && mod.modifiedValue === abilityScore && !mod.abilityFocus && mod.enabled).reduce(function (acc, obj) { return acc + (obj.bonus || obj.penalty || 0); }, 0)
    
    // @ts-ignore
    const profBonus = proficient ? levelTable[level].profBonus || 0 : 0; // Dynamically determined based on Level.
    const subtitle = focus ? (focus.name === 'custom' ? focus.customName + ' Focus' : focus.name + ' Focus') : 'Ability Check'
    // Base components in any ability roll.
    const components = [
      { label: `Base Roll`, sides: 6, count:3, alwaysShowInBreakdown: true },
      { label: 'Ability Score', value: Number(score) },
      { label: 'Modifiers', value: (Number(abilityBonus) || 0) + (!proficient ? modResult : 0) },
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
      subtitle: subtitle,
      characterName: useMetaStore().name,
      traits: ['Ability', 'Basic'],
      allowHeroDie: false,
      rollType:'standard',
      components,
    });
  };
  function focusBonus(){
    const qualitiesStore = useItemStore();
    const focusArray = qualitiesStore.items.filter(item => item.type === 'Ability Focus');
    const obj = focusArray.find(obj => {
      return (obj.name.toLowerCase() === 'Initiative'.toLowerCase());
    });
    if (!obj) {
      return 0; // Return 0 if no matching focus is found
    }
    if (obj.doubleFocus) {
        return 4; // Return 4 if doubleFocus is true
      } else if (obj.focus) {
        return 2; // Return 2 if only focus is true
      } else {
        return 0;
      }
}
  const rollAbilityInitiative = async (abilityScore: AbilityScore, proficient: boolean = false) => {
    const score = abilityScores.value[abilityScore].base;
    // @ts-ignore

    // Base components in any ability roll.
    const components = [
      { label: `Base Roll`, sides: 6, count:3, alwaysShowInBreakdown: true },
      { label: 'Stat Mod', value: Number(score) },
      { label: 'Proficiency', value: Number(focusBonus()) }
    ];
    // Example of modifying the roll based on some rule.
    // In this case: if overburdened, apply a penalty based on the "encumbrancePenalty" setting.
    const { isOverburdened } = useInventoryStore();
    if (isOverburdened) {
      const encumbrancePenalty = useSettingsStore().encumbrancePenalty;
      components.push({ label: 'Overencumbered', value: encumbrancePenalty });
    }
    await rollToChat({
      title: 'Initiative',
      traits: [],
      allowHeroDie: false,
      components,
    });
  };
  // Dehydrate determines how fields in Firebase are updated when there's a change in this store.
  // Everything that needs to be saved to Firebase should be defined here.
  const dehydrate = () => {
    // We save our entire object with the base/current scores.
    return { abilityScores: abilityScores.value };
  };

  // Hydrate determines how the store is updated when we receive updates from Firebase
  const hydrate = (hydrateStore: AbilityScoresHydrate) => {
    abilityScores.value = hydrateStore.abilityScores;
  };

  return {
    abilityScores,

    // Expose these for convenience
    AccuracyBase,
    CommunicationBase,
    ConstitutionBase,
    DexterityBase,
    FightingBase,
    IntelligenceBase,
    PerceptionBase,
    StrengthBase,
    WillpowerBase,
    AccuracyCurrent,
    CommunicationCurrent,
    ConstitutionCurrent,
    DexterityCurrent,
    FightingCurrent,
    IntelligenceCurrent,
    PerceptionCurrent,
    StrengthCurrent,
    WillpowerCurrent,
    AccuracyPartialAdvancement,
    CommunicationPartialAdvancement,
    ConstitutionPartialAdvancement,
    DexterityPartialAdvancement,
    FightingPartialAdvancement,
    IntelligencePartialAdvancement,
    PerceptionPartialAdvancement,
    StrengthPartialAdvancement,
    WillpowerPartialAdvancement,
    rollAbilityCheck,
    rollAbilityInitiative,

    dehydrate,
    hydrate,
  };
});
