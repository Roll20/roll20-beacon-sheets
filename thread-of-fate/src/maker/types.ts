/**
 * Core domain types for the Convergence character maker ("The Thread of Fate").
 * These describe both the static game data and the live CharacterDraft.
 */

// ---------------------------------------------------------------------------
// Attributes & Skills
// ---------------------------------------------------------------------------

export type AttributeKey = 'might' | 'instinct' | 'focus' | 'conviction' | 'resonance' | 'presence';

export type AttributeCategory = 'Body' | 'Mind' | 'Soul';

export interface AttributeDef {
  key: AttributeKey;
  label: string;
  category: AttributeCategory;
  /** Short "presides over" summary pulled from the rules. */
  description: string;
}

export interface SkillDef {
  id: string;
  name: string;
  attribute: AttributeKey;
  description: string;
}

// ---------------------------------------------------------------------------
// Roles & Classes
// ---------------------------------------------------------------------------

export interface RoleDef {
  id: string;
  name: string;
  description: string;
}

export interface ClassFeature {
  id: string;
  name: string;
  level?: number;
  description: string;
  /** True when the full mechanical text still needs importing from the rulebook. */
  todo?: boolean;
}

export interface ClassDef {
  id: string;
  name: string;
  /** The two attributes the class is built around. */
  attributes: [AttributeKey, AttributeKey];
  roles: string[];
  range: 'Frontline' | 'Midrange' | 'Long Range';
  /** Hit die size, e.g. 10 for 1d10. */
  hitDie: number;
  summary: string;
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  /** Dev-doc "Ideal Range", e.g. "Close - Mid Range". */
  idealRange?: string;
  /** Design keyword traits, e.g. ["Burst DPS", "Damage Ramp"]. */
  traits?: string[];
  /** Saving-throw proficiency groups, e.g. ["Body"]. */
  saves?: string[];
  /** Number of class skill proficiencies and the list to choose from. */
  skillChoices?: { count: number; options: string[] };
  /** HP gained per additional level (text form), e.g. "1d10 (or 6) + Might + Conviction". */
  hpPerLevel?: string;
  features: ClassFeature[];
  /** Aspect ids selectable by this class (by role). */
  aspectsAvailable?: string[];
  /** Caster progression, if any. */
  casterType?: CasterType;
  /** Source list this class casts from (Arcane/Divine/Eldritch/Paracausal). */
  arteSource?: string;
  /** Casting attribute for this class. */
  castingAttribute?: AttributeKey;
  todo?: boolean;
}

export type CasterType = 'Non-Caster' | 'Low-Caster' | 'Mid-Caster' | 'High-Caster';

export interface AspectFeature {
  level: number;
  name: string;
  quote?: string;
  description: string;
}

export interface AspectDef {
  id: string;
  name: string;
  /** Primary role section this aspect appears under in the listing. */
  role: string;
  /** Role names this aspect is available to (e.g. ["Tank", "Bruiser"]). */
  availableTo: string[];
  prerequisite?: string;
  /** Flavor / lore text. */
  flavor: string;
  features: AspectFeature[];
  todo?: boolean;
}

// ---------------------------------------------------------------------------
// Races
// ---------------------------------------------------------------------------

export interface RacialTrait {
  name: string;
  description: string;
}

export interface AttributeBonus {
  attribute: AttributeKey;
  bonus: number;
}

export interface SubraceDef {
  id: string;
  name: string;
  traits: RacialTrait[];
  attributeBonuses: AttributeBonus[];
  todo?: boolean;
}

export interface RaceDef {
  id: string;
  name: string;
  bio: string;
  classificationTags: string[];
  averageLifespan: string;
  sizeClass: string;
  senses: string;
  movementSpeed: string;
  biologicalNeeds: string;
  /** Number of skill proficiencies granted and the list to choose from. */
  skillChoices?: { count: number; options: string[] };
  traits: RacialTrait[];
  subraces: SubraceDef[];
}

// ---------------------------------------------------------------------------
// Philosophies
// ---------------------------------------------------------------------------

export interface PhilosophyFeature {
  name: string;
  description: string;
  todo?: boolean;
}

export interface PhilosophyDef {
  id: string;
  name: string;
  /** The in-universe label, e.g. "The Absurdist". */
  title: string;
  quote: string;
  overview: string;
  features: PhilosophyFeature[];
  /** Skill proficiencies granted (Expertise if already proficient). */
  grantsSkills?: string[];
}

// ---------------------------------------------------------------------------
// Background Points
// ---------------------------------------------------------------------------

export interface BackgroundCostOption {
  cost: number;
  label: string;
}

export type BackgroundSelectionKind =
  | 'none'
  | 'text'
  | 'skills'
  | 'discipline'
  | 'language'
  | 'weapon'
  | 'armor'
  | 'tool';

export interface BackgroundTraitDef {
  id: string;
  name: string;
  summary: string;
  /** Cost tiers; if `perPoint` is true the cost is chosen freely (min..max). */
  costOptions: BackgroundCostOption[];
  perPoint?: boolean;
  /** How many separate times this trait may be purchased. */
  maxPurchases?: number;
  /** What extra player input a purchase requires. */
  requires?: BackgroundSelectionKind;
  affectsCombat?: boolean;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export type TechSetting = 'Neolithic' | 'Medieval' | 'Modern' | 'Sci-Fi' | 'All' | 'Custom';

export interface ArmorDef {
  id: string;
  name: string;
  type: 'Light' | 'Medium' | 'Heavy';
  acBonus: number;
  attributeCap: number | null;
  checkPenalty: string | null;
  setting: TechSetting[];
}

export interface ShieldDef {
  id: string;
  name: string;
  shieldAc: number;
  mightRequirement: number | null;
  checkPenalty: string | null;
  donningAction: string;
  basicProperty: string;
  masterProperty?: string;
  setting: TechSetting[];
}

export interface WeaponDef {
  id: string;
  name: string;
  damageTypes: string;
  damage: string;
  proficiency: string;
  groups: string[];
  properties: string;
  setting: TechSetting[];
}

export interface EquipmentPackItem {
  category: string;
  options: string[];
}

export interface EquipmentPackDef {
  id: string;
  name: string;
  description: string;
  items: EquipmentPackItem[];
  setting: TechSetting[];
}

export interface DisciplineDef {
  id: string;
  name: string;
  cost: number;
  prerequisite?: string;
  description: string;
  todo?: boolean;
}

// ---------------------------------------------------------------------------
// Artes
// ---------------------------------------------------------------------------

export interface ArteDef {
  id: string;
  name: string;
  tier: number;
  school: string;
  /** Source lists this Arte appears on (Arcane, Divine, Eldritch, Paracausal). */
  sources: string[];
  /** Artes-Groups (Pyromancy, Healing, etc.). */
  groups: string[];
  aetherCost: number;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  todo?: boolean;
}

// ---------------------------------------------------------------------------
// Stat generation
// ---------------------------------------------------------------------------

export type StatMethod = 'rolling' | 'pointBuy' | 'array' | 'manual';
export type RollMode = 'oneChance' | 'bestOfThree';

export interface StatRollSet {
  id: string;
  values: number[];
}

// ---------------------------------------------------------------------------
// The live character draft
// ---------------------------------------------------------------------------

export type CharacterMakerStep =
  | 'intro'
  | 'stats'
  | 'background'
  | 'equipment'
  | 'philosophy'
  | 'race'
  | 'class'
  | 'artes'
  | 'bio'
  | 'review';

export interface SelectedBackgroundTrait {
  uid: string;
  traitId: string;
  cost: number;
  /** Free-form or structured detail captured for the trait. */
  detail: string;
}

export interface SelectedClass {
  classId: string;
  level: number;
}

export interface SelectedAspect {
  aspectId: string;
}

export interface ValidationWarning {
  step: CharacterMakerStep;
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export type AttributeRecord = Record<AttributeKey, number>;
