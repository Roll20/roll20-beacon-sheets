import type {
  AttributeKey,
  CharacterMakerStep,
  RollMode,
  SelectedAspect,
  SelectedBackgroundTrait,
  SelectedClass,
  StatMethod,
  StatRollSet,
  TechSetting,
} from '@/maker/types';

/**
 * The complete character-creation state. This is what the Pinia draft store holds,
 * what gets persisted to localStorage, what syncs to Beacon, and what JSON export emits.
 */
export interface CharacterDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;

  identity: {
    name: string;
    age: string;
    height: string;
  };

  stats: {
    method: StatMethod;
    rollMode: RollMode;
    rollSets: StatRollSet[];
    chosenRollSetId: string | null;
    /** Values assigned per attribute (base, before racial/background bonuses). */
    assigned: Record<AttributeKey, number | null>;
  };

  background: {
    selectedTraits: SelectedBackgroundTrait[];
  };

  equipment: {
    setting: TechSetting;
    selectedPackId: string | null;
    packChoices: Record<string, string>; // category -> chosen option
    selectedArmorId: string | null;
    selectedShieldId: string | null;
    selectedWeaponIds: string[];
    customItems: string[];
    startingWealth: number | null;
    /** Manual misc AC bonus for feature-based AC the engine can't auto-derive. */
    otherAcBonus: number;
  };

  philosophy: {
    selectedPhilosophyId: string | null;
    custom: {
      name: string;
      overview: string;
      featureName: string;
      featureDescription: string;
    } | null;
  };

  race: {
    selectedRaceId: string | null;
    selectedSubraceId: string | null;
    selectedSkills: string[];
  };

  classBuild: {
    startingLevel: number;
    classes: SelectedClass[];
    aspects: SelectedAspect[];
    useAverageHp: boolean;
    /** Skills chosen from the primary class's skill list. */
    classSkills: string[];
    /** Attribute Score Increase allocations from Growth milestones (attr key -> points). */
    growth: Record<string, number>;
  };

  artes: {
    selectedArteIds: string[];
    selectedConfluxIds: string[];
  };

  bio: {
    avatarImage: string | null;
    fullReferenceImage: string | null;
    description: string;
    lore: string;
    allies: string;
    enemies: string;
    /** The defining "How do you die?" answer chosen at creation. */
    howYouDie: string;
  };

  /** Play-time inventory (the inventory sheet): items, equipped slots, gear, carry weight. */
  inventory: {
    items: {
      id: string;
      name: string;
      amount: number;
      weight: number;
      /** Which list the item lives in. */
      container?: 'Inventory' | 'Treasure' | 'Potions' | 'Misc';
      /** Item category. */
      type?: 'Weapon' | 'Armor' | 'Gear' | 'Consumable' | 'Ring' | 'Other';
      /** Equipped slot name, or null/undefined if not equipped. */
      slot?: string | null;
      notes?: string;
    }[];
    /** Maximum carry weight (manual; the sheet's box). */
    maxCarry: number;
    /** Standard adventuring gear tracked on the sheet. */
    gear: { bedroll: boolean; water: number; rope: number; rations: number };
  };

  /**
   * Live resource tracking for actual play (the Play sheet). Maxes are derived
   * from the build; these hold the *current* spent/remaining values.
   * `null` current values mean "at full" (equal to the derived max).
   */
  play: {
    currentHp: number | null;
    tempHp: number;
    currentStamina: number | null;
    currentAether: number | null;
    /** Hit Dice already spent on Quick Rests. */
    hitDiceSpent: number;
    /** Death-save failures accrued while dying (6 = death). */
    deathFailures: number;
    /** Active condition names (from the Conditions reference). */
    conditions: string[];
  };

  currentStep: CharacterMakerStep;
  visitedSteps: CharacterMakerStep[];
}

export const STEP_ORDER: CharacterMakerStep[] = [
  'intro',
  'stats',
  'background',
  'equipment',
  'philosophy',
  'race',
  'class',
  'artes',
  'bio',
  'review',
];

export const STEP_LABELS: Record<CharacterMakerStep, string> = {
  intro: 'Intro',
  stats: 'Stats',
  background: 'Background',
  equipment: 'Equipment',
  philosophy: 'Philosophy',
  race: 'Race',
  class: 'Class',
  artes: 'Artes',
  bio: 'Bio',
  review: 'Review',
};

export const SCHEMA_VERSION = 2;

function emptyAssigned(): Record<AttributeKey, number | null> {
  return {
    might: null,
    instinct: null,
    focus: null,
    conviction: null,
    resonance: null,
    presence: null,
  };
}

export function createEmptyDraft(id: string): CharacterDraft {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    identity: { name: '', age: '', height: '' },
    stats: {
      method: 'rolling',
      rollMode: 'bestOfThree',
      rollSets: [],
      chosenRollSetId: null,
      assigned: emptyAssigned(),
    },
    background: { selectedTraits: [] },
    equipment: {
      setting: 'Medieval',
      selectedPackId: null,
      packChoices: {},
      selectedArmorId: null,
      selectedShieldId: null,
      selectedWeaponIds: [],
      customItems: [],
      startingWealth: null,
      otherAcBonus: 0,
    },
    philosophy: { selectedPhilosophyId: null, custom: null },
    race: { selectedRaceId: null, selectedSubraceId: null, selectedSkills: [] },
    classBuild: {
      startingLevel: 1,
      classes: [],
      aspects: [],
      useAverageHp: true,
      classSkills: [],
      growth: {},
    },
    artes: { selectedArteIds: [], selectedConfluxIds: [] },
    bio: {
      avatarImage: null,
      fullReferenceImage: null,
      description: '',
      lore: '',
      allies: '',
      enemies: '',
      howYouDie: '',
    },
    inventory: {
      items: [],
      maxCarry: 0,
      gear: { bedroll: false, water: 0, rope: 0, rations: 0 },
    },
    play: {
      currentHp: null,
      tempHp: 0,
      currentStamina: null,
      currentAether: null,
      hitDiceSpent: 0,
      deathFailures: 0,
      conditions: [],
    },
    currentStep: 'intro',
    visitedSteps: ['intro'],
  };
}
