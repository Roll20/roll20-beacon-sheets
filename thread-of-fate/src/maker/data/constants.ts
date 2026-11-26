import type { AttributeKey } from '@/maker/types';

/** Product naming, from the build brief (Section 0.2). */
export const PRODUCT = {
  name: 'The Thread of Fate',
  openingCta: 'Forge Your Fate',
  finalReviewCta: 'Ready to Break Fate, Overture?',
  narrator: 'Naomi',
  /** Optional external feedback destination (email or form URL). Leave '' to hide the link. */
  feedbackLink: '',
};

/**
 * "How do you die?" ,  the defining question asked at character creation. The chosen
 * manner is recorded on the sheet as a thread of fate the character carries.
 */
export const DEATH_MANNERS: string[] = [
  'Violently',
  'Peacefully',
  'Alone',
  'Surrounded',
  'Forgotten',
  'Remembered',
  'Betrayed',
  'Sacrificed',
  'Consumed',
  'Transformed',
  'Defiant',
  'Afraid',
  'Willingly',
  'Accidentally',
  'Gloriously',
  'Shamefully',
  'Quietly',
  'Publicly',
  'Pointlessly',
  'Purposefully',
  'Slowly',
  'Instantly',
  'Wrongfully',
  'Inevitably',
  'Unnaturally',
  'Heroically',
  'Cruelly',
  'Beautifully',
  'Laughing',
  'Praying',
  'Screaming',
  'Unfinished',
  'Victorious',
  'Broken',
  'Unknown',
  'Undying',
];

/** Stat generation configuration. */
export const STAT_CONFIG = {
  rollFormula: '2d6+6',
  diceCount: 2,
  diceSides: 6,
  flatBonus: 6,
  /** Point-buy. */
  pointBuyBase: 8,
  pointBuyPoints: 30,
  pointBuyMin: 8,
  pointBuyMax: 18,
  /** Hard caps at creation (before racial/background bonuses). */
  minScore: 1,
  maxScoreAtCreation: 18,
};

/** Standard arrays (same total, distributed differently). */
export const STAT_ARRAYS: { id: string; label: string; values: number[] }[] = [
  { id: 'spiked', label: 'Spiked', values: [18, 15, 14, 12, 11, 8] },
  { id: 'balanced', label: 'Balanced', values: [16, 16, 14, 11, 11, 10] },
  { id: 'jack', label: 'Jack of All', values: [14, 14, 14, 12, 12, 12] },
  { id: 'even', label: 'Perfectly Even', values: [13, 13, 13, 13, 13, 13] },
];

/** Character level configuration. */
export const LEVEL_CONFIG = {
  min: 0,
  max: 60,
  multiclassUnlock: 10,
  maxClasses: 3,
  maxAspects: 4,
  aspectUnlock: 3,
};

export const BACKGROUND_CONFIG = {
  startingBP: 30,
};

export const TECH_SETTINGS = [
  'Neolithic',
  'Medieval',
  'Modern',
  'Sci-Fi',
  'All',
  'Custom',
] as const;

export const DEFAULT_TECH_SETTING = 'Medieval';

/** Naomi's guided, step-by-step instructions, keyed by step. */
export const NAOMI_LINES: Record<string, string> = {
  intro:
    "Welcome, little spark, you haven't quite taken form yet. When you're ready, press Forge Your Fate and we'll begin weaving your thread, one step at a time. I'll guide you the whole way.",
  stats:
    'Start by choosing a method up top, Rolling, Point Buy, Array, or Manual. Then assign a value to each of the six attributes; watch the modifiers update in the sidebar on the left.',
  background:
    'You have 30 Background Points. Click a trait, pick a cost, and spend them on who you were before the story. Keep an eye on the counter, most traits are flavor, but a few sharpen your edge.',
  equipment:
    'Pick your setting first (Medieval to start), then take a starting pack and choose your armor, shield, and a weapon or two. Add anything extra in Custom Items below.',
  philosophy:
    "Choose the lens you see the world through, it replaces alignment and grants real features. Read a few; when one fits, select it. This one is required, so don't skip me here!",
  race: 'Choose your race from the dropdown, then a subrace if it has them, and tick your racial talent proficiencies. Your senses, speed, and traits all flow from this.',
  class:
    'Set your starting level, then pick a class, it sets your hit dice, role, and the Aspects you unlock at level 3. Open Class Features to read everything you gain as you grow.',
  artes:
    "If your class grants Aether, choose your Artes here, filter by tier, source, or school, or just search by name. If you're not a caster, you can simply move on.",
  bio: 'Give yourself a name (required!), a face if you like, and a few lines of who you are. An avatar shows on your sheet; the rest fills your bio page.',
  review:
    "Almost there. I'll flag anything still missing in red, fix those, then press Ready to Break Fate, Overture? to step into the dawn and open your sheet.",
  overture:
    'And there you are, fully woven, taking form at last. Your sheet is ready for the table. Go be a legend.',
};

/** Naomi's screen anchor per step, so she moves and points as you go. */
export const NAOMI_POS: Record<string, 'bl' | 'br' | 'tl' | 'tr' | 'bc'> = {
  intro: 'bc',
  stats: 'bl',
  background: 'br',
  equipment: 'bl',
  philosophy: 'tr',
  race: 'br',
  class: 'bl',
  artes: 'tr',
  bio: 'br',
  review: 'bl',
  overture: 'bc',
};

export const SAVE_GROUPS: Record<string, [AttributeKey, AttributeKey]> = {
  Body: ['might', 'instinct'],
  Mind: ['focus', 'conviction'],
  Soul: ['resonance', 'presence'],
};
