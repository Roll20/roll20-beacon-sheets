import type { BackgroundTraitDef } from '@/maker/types';

/**
 * Background Point traits, transcribed from "Convergence Background.md".
 * A character has 30 BP at creation. Unless noted, each option may be taken once.
 */
export const BACKGROUND_TRAITS: BackgroundTraitDef[] = [
  {
    id: 'skill-training',
    name: 'Talent Training',
    summary: 'You were born skilled or practiced diligently in a particular field.',
    costOptions: [
      { cost: 1, label: 'Proficiency in 1 talent' },
      { cost: 2, label: 'Proficiency in 2 talents' },
      { cost: 4, label: 'Proficiency in 3 talents' },
    ],
    requires: 'skills',
  },
  {
    id: 'weapon-training',
    name: 'Weapon Training',
    summary: 'You were trained in the use of a set of particular weapons.',
    costOptions: [{ cost: 1, label: 'Trained in 2 specific weapons (per point)' }],
    perPoint: true,
    requires: 'weapon',
    affectsCombat: true,
  },
  {
    id: 'armor-training',
    name: 'Armor Training',
    summary: 'You were trained to wear and maintain a particular suit of armor or shield.',
    costOptions: [
      { cost: 1, label: 'Trained in 1 specific armor or shield' },
      { cost: 2, label: 'Trained in 2 armors/shields (or 1 armor + 1 shield)' },
    ],
    requires: 'armor',
    affectsCombat: true,
  },
  {
    id: 'linguistic-training',
    name: 'Linguistic Training',
    summary: 'You were taught, or taught yourself, a new language.',
    costOptions: [{ cost: 1, label: 'Speak, read, write & understand 1 language (per point)' }],
    perPoint: true,
    requires: 'language',
  },
  {
    id: 'tool-training',
    name: 'Tool Training',
    summary: 'You practiced a craft, mastered a game, or learned an instrument.',
    costOptions: [
      { cost: 1, label: 'Proficiency in 1 tool / gaming set / instrument (per point, max 5)' },
    ],
    perPoint: true,
    requires: 'tool',
  },
  {
    id: 'companion',
    name: 'Companion',
    summary: 'A trusty companion (pet, retainer, or other) of proficiency bonus 1 or lower.',
    costOptions: [{ cost: 4, label: 'Gain a companion' }],
    requires: 'text',
  },
  {
    id: 'genius',
    name: 'Genius',
    summary:
      'You learn much faster than most. When training during downtime, roll twice and take the higher, and add any relevant modifier twice.',
    costOptions: [{ cost: 7, label: 'Gain Genius' }],
  },
  {
    id: 'eidetic-memory',
    name: 'Eidetic Memory',
    summary: 'You remember even the most minute detail.',
    costOptions: [
      { cost: 4, label: 'Remember the last ~30 days perfectly' },
      { cost: 6, label: 'Remember the last ~12 months; advantage vs memory alteration' },
      { cost: 10, label: 'Never forget anything you know; advantage vs memory alteration' },
    ],
    affectsCombat: false,
  },
  {
    id: 'connection',
    name: 'Connection',
    summary: 'A connection to a group or individual that may grant privileges or information.',
    costOptions: [
      { cost: 2, label: 'Minor member of a group' },
      { cost: 3, label: 'Regular member / local contacts' },
      { cost: 4, label: 'Well-known member / influential contacts' },
      { cost: 5, label: 'High-ranking / worldwide org contacts' },
      { cost: 6, label: 'Leader / world-stage connections' },
    ],
    maxPurchases: 3,
    requires: 'text',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    summary: 'A mentor who trained you early in your career, with their own agenda.',
    costOptions: [
      { cost: 2, label: 'Unreliable or inexperienced mentor' },
      { cost: 4, label: 'Helpful yet eccentric guide' },
      { cost: 6, label: 'Good and noteworthy teacher' },
      { cost: 8, label: 'Wise, helpful, respectful elder' },
      { cost: 10, label: 'Powerful individual invested in your success' },
    ],
    requires: 'text',
  },
  {
    id: 'title',
    name: 'Title',
    summary: 'A title of distinction, noble, general, priest, etc.',
    costOptions: [
      { cost: 3, label: 'Minor Rank (soldier, squire, deacon...)' },
      { cost: 4, label: 'Low Rank (junior officer, knight...)' },
      { cost: 5, label: 'Medium Rank (captain, baron, mayor...)' },
      { cost: 6, label: 'High Rank (major, count, bishop...)' },
      { cost: 7, label: 'Command Staff (general, prince, senator...)' },
    ],
    requires: 'text',
  },
  {
    id: 'fame',
    name: 'Fame',
    summary: 'You are famous among the masses in a certain area, of mixed benefit.',
    costOptions: [
      { cost: 1, label: 'Known within a subculture / small region' },
      { cost: 2, label: 'Local celebrity' },
      { cost: 3, label: 'Recognized across multiple cities' },
      { cost: 4, label: 'National or international figure' },
      { cost: 6, label: 'Famous almost everywhere' },
    ],
    requires: 'text',
  },
  {
    id: 'rich',
    name: 'Rich',
    summary: 'A greater level of wealth than your peers, increasing starting money.',
    costOptions: [
      { cost: 1, label: 'Starting money x1.15' },
      { cost: 2, label: 'Starting money x1.30' },
      { cost: 3, label: 'Starting money x1.45' },
      { cost: 4, label: 'Starting money x1.60' },
    ],
  },
  {
    id: 'extra-discipline',
    name: 'Extra Discipline',
    summary:
      'You trained in a special Discipline you meet the prerequisites for. Cost is set by the Discipline.',
    costOptions: [{ cost: 1, label: 'Gain a Discipline (cost per Discipline, 1-10)' }],
    perPoint: true,
    requires: 'discipline',
    affectsCombat: true,
  },
  {
    id: 'blessing',
    name: 'Blessing',
    summary: 'Something supernatural has left a beneficial mark on you, with a strange quirk.',
    costOptions: [
      { cost: 2, label: 'Minor blessing' },
      { cost: 4, label: 'Modest blessing' },
      { cost: 6, label: 'Notable blessing' },
      { cost: 8, label: 'Strong blessing' },
      { cost: 10, label: 'Major blessing' },
    ],
    requires: 'text',
  },
  {
    id: 'enhanced-signature',
    name: 'Enhanced Signature',
    summary: "Your character's signature item is enhanced. (Rules in progress.)",
    costOptions: [{ cost: 1, label: 'Enhance a signature item (cost TBD)' }],
    perPoint: true,
    requires: 'text',
  },
];

/** Languages offered for Linguistic Training. Extend as the rulebook defines more. */
export const LANGUAGES = [
  'Common',
  'Elvish',
  'Dwarvish',
  'Halfling',
  'Infernal',
  'Abyssal',
  'Celestial',
  'Draconic',
  'Beasttongue',
  'Undercommon',
  'Primordial',
  'Sign Language',
];

/** Tool / instrument options for Tool Training (representative set, extend as needed). */
export const TOOLS = [
  "Smith's Tools",
  "Tinker's Tools",
  "Alchemist's Supplies",
  "Navigator's Tools",
  "Thieves' Tools",
  'Herbalism Kit',
  "Cook's Utensils",
  'Disguise Kit',
  'Gaming Set',
  'Musical Instrument',
];
