/**
 * Player rules reference (from "Convergence Playtest Rules.md" + Action Economy).
 * Surfaced in-app via the Rules Reference modal and on the PDF reference page,
 * the brief's "quick reference cards" for accessibility.
 */

export interface RefEntry {
  name: string;
  text: string;
}

export const CONDITIONS: RefEntry[] = [
  {
    name: 'Blinded',
    text: "Can't see; auto-fails sight checks. Attacks against it have Advantage; its attacks have Disadvantage.",
  },
  {
    name: 'Bleeding (1-X)',
    text: 'Takes ongoing damage (default Slashing) equal to the stack at the start of its turns. Absorbs and negates incoming healing by the same amount.',
  },
  {
    name: 'Burning',
    text: '1d8 Fire at the start of each turn; spreads on contact. Douse as an action, fall prone, or be doused to end it.',
  },
  {
    name: 'Charmed',
    text: "Can't attack or harm the charmer; the charmer has Advantage on social checks with it.",
  },
  { name: 'Deafened', text: "Can't hear; auto-fails hearing checks." },
  {
    name: 'Doomed (1-2)',
    text: "Doomed 1: can't regain HP. Doomed 2: can't regain HP or gain temp HP, and Disadvantage on Death saves.",
  },
  {
    name: 'Enraged',
    text: "Melee attacks (and attacks against it) have Advantage; may be forced to attack the nearest creature; can't be charmed (except by the rage's source).",
  },
  {
    name: 'Fatigued (1-10)',
    text: 'Penalty equal to the value on all checks, attacks, and saves. Gaining a level past 10 kills the creature.',
  },
  {
    name: 'Frightened',
    text: "Disadvantage on checks/attacks while the source is in sight; can't willingly move closer to it.",
  },
  {
    name: 'Grappled',
    text: "Speed 0; ends if the grappler is Incapacitated or it leaves the grapple's reach.",
  },
  { name: 'Incapacitated', text: "Can't take actions or reactions." },
  {
    name: 'Invisible',
    text: 'Impossible to see without magic/special sense; counts as hidden. Location still given away by noise/tracks.',
  },
  {
    name: 'Paralyzed',
    text: "Incapacitated, can't move/speak, auto-fails Body saves. Attacks have Advantage; hits within 5 ft. are crits.",
  },
  {
    name: 'Petrified',
    text: 'Turned to stone: Incapacitated, unaware, auto-fails Body saves, resistant to all damage, immune to poison/disease; weight x10, stops aging.',
  },
  { name: 'Poisoned', text: 'Disadvantage on attacks and checks.' },
  {
    name: 'Prone',
    text: 'Can only crawl (half speed) or stand. Disadvantage on attacks; attacks within 5 ft. have Advantage, beyond have Disadvantage.',
  },
  {
    name: 'Restrained',
    text: 'Speed 0; attacks against have Advantage; its attacks have Disadvantage.',
  },
  { name: 'Severed', text: "Can't use Arcane or Divine magic or abilities." },
  {
    name: 'Stunned',
    text: "Incapacitated, can't move, speaks falteringly; Disadvantage on Body saves; attacks against have Advantage.",
  },
  {
    name: 'Sluggish (1-3)',
    text: '1: no reactions. 2: + lose 1 Action Point. 3: + only one attack per Attack action and all speeds halved.',
  },
  {
    name: 'Surprised',
    text: "Can't move or act on its first turn, and can't take reactions until that turn ends.",
  },
  {
    name: 'Taunted',
    text: 'Must target the taunter, prioritizing it (unless a far greater threat appears).',
  },
  {
    name: 'Unconscious',
    text: 'Incapacitated, drops held items, falls prone, auto-fails Body saves; attacks have Advantage; hits within 5 ft. are crits.',
  },
];

export const DAMAGE_TYPES: RefEntry[] = [
  { name: 'Acid', text: 'Corrosive sprays, acid breath, dissolving fluids.' },
  { name: 'Bludgeoning', text: 'Blunt force, hammers, falling, constriction.' },
  { name: 'Cold', text: 'Chilling frost, ice.' },
  { name: 'Fire', text: 'Flame and heat.' },
  { name: 'Force', text: 'Pure magical/raw energy (most Artes).' },
  { name: 'Lightning', text: 'Electrical energy.' },
  { name: 'Necrotic', text: 'Withering of matter and spirit.' },
  { name: 'Piercing', text: 'Puncturing, spears, bites, arrows.' },
  { name: 'Poison', text: 'Venom, toxins, most disease.' },
  { name: 'Psychic', text: 'Mental harm, psionics.' },
  { name: 'Radiant', text: 'Holy light, purifying magic.' },
  { name: 'Slashing', text: 'Cutting, swords, axes, claws.' },
  { name: 'Thunder', text: 'Concussive sound and pressure.' },
  { name: 'True', text: 'Cannot be resisted, reduced, or stopped by any means.' },
];

export const ACTIONS: RefEntry[] = [
  {
    name: 'Turn',
    text: '3 Action Points + 1 Reaction + your Movement each turn. Action Points refresh at the start of your turn.',
  },
  {
    name: 'Attack (2 AP)',
    text: 'Attack with a weapon or unarmed strike. Includes special attacks: Grapple, Shove.',
  },
  {
    name: 'Cast (1-3+ AP)',
    text: 'Full Cast (2 AP), Quick Cast (1 AP), or Array Cast (3+ AP, combine with allied casters).',
  },
  {
    name: 'Quick Action (1 AP)',
    text: "Interface (manipulate an object), Off-strike, Survey (read a foe's statblock), Disengage, Escape (a grapple), drink a potion, use a scroll.",
  },
  {
    name: 'Focused Action (2+ AP)',
    text: 'Dash, Dodge, Hide, Assist (give an ally Advantage), or Collab (let an ally spend their AP on your turn).',
  },
  {
    name: 'Reaction (1/round)',
    text: 'Attack an Opening (when a foe leaves your reach), Counter-Cast, or a class Reaction feature.',
  },
  {
    name: 'Movement',
    text: 'Move up to one chosen speed; split it around your actions. Never exceed your highest speed in a turn.',
  },
];

export const STAMINA_TECHNIQUES: RefEntry[] = [
  {
    name: 'Stamina pool',
    text: '= Might mod + half your highest Hit Die. Spend to reroll a d20, swap 1:1 for Action Points or other resources, or fuel techniques.',
  },
  { name: 'Cleaving (1)', text: "Apply your attack in a 90-degree cone at the weapon's range." },
  { name: 'Lunging (1)', text: 'Dash 15 ft. as part of an attack, even with no movement left.' },
  {
    name: 'Distracting (2)',
    text: 'Body/Mind Save (6 + PB + Presence) or the target is Taunted until end of its next turn.',
  },
  { name: 'Forceful (2)', text: 'Body Save (6 + PB + Might) or shove 10 ft. / knock prone.' },
  {
    name: 'Pinning (2)',
    text: 'Body Save (6 + PB + Might) or Pinned (grappled, both movements 0).',
  },
  { name: 'Disarming (3)', text: 'Body Save (8 + PB + Instinct) or drop a held item.' },
  {
    name: 'Digging Too Deep',
    text: 'Emptying your Stamina gives 1 Fatigue; each point spent past 0 gives another. Over 10 Fatigue = death.',
  },
];

export const SENSES_REF: RefEntry[] = [
  { name: 'Blindsense', text: '"See" without eyes within range (incl. invisible creatures).' },
  { name: 'Darkvision', text: 'See in darkness as low-light, low-light as bright, within range.' },
  { name: 'Devilsight', text: 'See in darkness/low-light as bright, even magical darkness.' },
  { name: 'Tremorsense', text: 'Sense creatures touching a connected solid surface within range.' },
  {
    name: 'Truesight',
    text: 'See through darkness, invisibility, illusions, and shapechanging within range.',
  },
];

export const RESTS_REF: RefEntry[] = [
  {
    name: 'Quick Rest (1 hour)',
    text: 'Spend Hit Dice (roll + higher of Might/Conviction mod) to heal. Light activity only.',
  },
  {
    name: 'Full Rest (8 hours)',
    text: 'Regain all HP and half your Hit Dice (min 1). One per 24 hours.',
  },
  {
    name: 'Dropping to 0 HP',
    text: 'Fall Unconscious and roll Death Saves (DC 10) at the start of each turn, 6 failures = death; nat 20 = wake at 1 HP; nat 1 = two failures.',
  },
  {
    name: 'Instant Death',
    text: 'A single instance of damage that overflows 0 HP by >= twice your max HP kills outright.',
  },
  {
    name: 'Stabilizing',
    text: 'Focused Action + DC 10 Medicine check stabilizes a dying creature (regains 1 HP after 1d4 hours).',
  },
];

export const CRAFTING_REF: RefEntry[] = [
  {
    name: '1. Blueprint',
    text: 'Pick what to make and choose materials for its slots (at minimum the Core, Frame, and Form). Finalize the Blueprint over 1 hour during a Quick/Full Rest, it can be saved, sold, or shared.',
  },
  {
    name: '2. Tools & Facilities',
    text: "Each item type needs specific tools and often a facility: Weapons/Armor -> Arms-Smithing Tools + Forge; Equipment/Gadgets -> Tinkering Tools + Workshop; Potions -> Alchemical Kit + Laboratory; Vehicles/Constructs -> Engineer's Gear + Garage; Food -> Chef's Kit + Kitchen.",
  },
  {
    name: '3. Materials',
    text: 'Fill the blueprint slots with materials, different materials and placements grant different effects, AC, HP, and properties to the finished craft.',
  },
  {
    name: '4. Make the Craft',
    text: 'During a Full Rest, with the right tools/facility, make the Craft Check (using the relevant tool). On success it completes; with time left in the rest you may craft again.',
  },
  {
    name: 'Enchantment',
    text: '30-minute process + a Tinkering Check to affix an Enchantment (up to 3 per item, no duplicates), spending the listed materials/Aether. Only the creator can remove one (DC 6 + Material Grade + Enhancement Bonus).',
  },
  {
    name: 'Broken Items',
    text: "An item at 0 HP is Broken, its features, enchantments, and bonuses go inert until repaired; used as a weapon it's improvised (1 + Might mod damage).",
  },
  {
    name: 'Toxicity',
    text: 'Capacity = 5 + Might mod (min 1). Elixirs and hazardous materials apply Toxicity. Thresholds add penalties: 1+ Disadvantage on Toxicity Checks; 3+ Disadvantage on Body Saves and -3 healing; 5+ -10 ft. speed.',
  },
];

export interface ReferenceSection {
  id: string;
  title: string;
  entries: RefEntry[];
}

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  { id: 'conditions', title: 'Conditions', entries: CONDITIONS },
  { id: 'actions', title: 'Action Economy', entries: ACTIONS },
  { id: 'stamina', title: 'Stamina', entries: STAMINA_TECHNIQUES },
  { id: 'damage', title: 'Damage Types', entries: DAMAGE_TYPES },
  { id: 'senses', title: 'Senses', entries: SENSES_REF },
  { id: 'rests', title: 'Rests & Dying', entries: RESTS_REF },
  { id: 'crafting', title: 'Crafting', entries: CRAFTING_REF },
];
