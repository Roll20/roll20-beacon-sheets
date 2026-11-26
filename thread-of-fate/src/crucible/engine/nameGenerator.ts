/**
 * Deterministic name generation. Prefers the GM's own words - a prompt that says
 * "blackstone war beast" should produce something with "Blackstone" in it - and
 * only falls back to generated syllables when the prompt gave nothing to work with.
 */

import type { CrucibleEntityKind } from '@/crucible/schemas/crucibleCommon';
import type { Rng } from './seededRandom';

const TITLE_WORDS = [
  'Warden',
  'Herald',
  'Reaver',
  'Sentinel',
  'Harbinger',
  'Revenant',
  'Marauder',
  'Stalker',
  'Devourer',
  'Keeper',
  'Scourge',
  'Wraith',
  'Bulwark',
  'Ravager',
  'Oracle',
  'Executioner',
  'Chorister',
  'Hollow',
  'Remnant',
  'Vanguard',
];

const BOSS_EPITHETS = [
  'the Unbroken',
  'the Last Verse',
  'of the Red Tide',
  'the Thrice-Fallen',
  'Crown of Ash',
  'the Long Silence',
  'who Waits Below',
  'the Second Regicide',
  'Bearer of the Hollow Name',
  'the Unfinished',
];

const NPC_GIVEN = [
  'Maren',
  'Coll',
  'Ysolde',
  'Tavik',
  'Bren',
  'Ilsa',
  'Roshan',
  'Vessa',
  'Doran',
  'Nym',
  'Sabel',
  'Orrin',
  'Thessa',
  'Garrick',
  'Lune',
  'Perrin',
  'Ashen',
  'Wynn',
];

const NPC_FAMILY = [
  'Fallstar',
  'Ashgrove',
  'Vance',
  'Holloway',
  'Kerrin',
  'Duskwater',
  'Mercer',
  'Thorne',
  'Vint',
  'Coldiron',
  'Sable',
  'Rookwood',
  'Grieve',
  'Hallow',
];

const SYLLABLES_HEAD = [
  'Kar',
  'Vor',
  'Thal',
  'Mor',
  'Grix',
  'Sel',
  'Bran',
  'Zeph',
  'Ur',
  'Nach',
  'Ver',
  'Dro',
];
const SYLLABLES_TAIL = [
  'gath',
  'ren',
  'mos',
  'vek',
  'thar',
  'mir',
  'esh',
  'ock',
  'ulth',
  'ax',
  'orn',
  'ise',
];

const NOISE_WORDS = new Set([
  'make',
  'monster',
  'creature',
  'boss',
  'npc',
  'minion',
  'swarm',
  'hazard',
  'trap',
  'vehicle',
  'enemy',
  'thing',
  'guy',
  'dude',
  'encounter',
  'fight',
  'combat',
  'stat',
  'statblock',
  'block',
  'please',
  'really',
  'very',
  'quite',
  'kind',
  'sort',
  'type',
]);

const capitalize = (w: string) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w);

export interface NameOptions {
  themeWords: string[];
  descriptors: string[];
  typeName?: string;
  kind: CrucibleEntityKind;
  roleName?: string;
}

export function generateName(rng: Rng, options: NameOptions): string {
  const { kind } = options;
  const usable = options.themeWords
    .filter((w) => w.length > 2 && !NOISE_WORDS.has(w))
    .map(capitalize);

  // NPCs read as people, not as monsters.
  if (kind === 'npc') {
    const given = rng.pick(NPC_GIVEN) ?? 'Maren';
    const family = usable.length && rng.chance(0.4) ? usable[0] : rng.pick(NPC_FAMILY) ?? 'Vance';
    return `${given} ${family}`;
  }

  if (kind === 'hazard' || kind === 'trap' || kind === 'encounterObject') {
    const lead = usable.slice(0, 2).join(' ') || capitalize(options.descriptors[0] ?? 'Hidden');
    const noun = kind === 'trap' ? 'Trap' : 'Hazard';
    return `${lead} ${noun}`.trim();
  }

  if (kind === 'vehicle') {
    const lead =
      usable.slice(0, 2).join(' ') || rng.pick(['Ironkeel', 'Skyhawk', 'Longwake']) || 'Ironkeel';
    return `The ${lead}`;
  }

  // Monsters: build from the GM's own words wherever possible.
  const parts: string[] = [];
  if (options.descriptors.length && rng.chance(0.6)) parts.push(capitalize(options.descriptors[0]));
  parts.push(...usable.slice(0, 2));

  if (!parts.length && options.typeName) parts.push(options.typeName);
  if (!parts.length) {
    const head = rng.pick(SYLLABLES_HEAD) ?? 'Kar';
    const tail = rng.pick(SYLLABLES_TAIL) ?? 'gath';
    parts.push(`${head}${tail}`);
  }

  // Give it a role-flavoured noun if the prompt words are all adjectives.
  const looksLikeNoun = usable.some((w) =>
    (options.typeName ?? '').toLowerCase().includes(w.toLowerCase()),
  );
  if (parts.length < 2 || (!looksLikeNoun && rng.chance(0.5))) {
    parts.push(rng.pick(TITLE_WORDS) ?? 'Warden');
  }

  let name = parts.slice(0, 3).join(' ');

  if (kind === 'boss' || kind === 'mythicBoss') {
    name = `${name}, ${rng.pick(BOSS_EPITHETS) ?? 'the Unbroken'}`;
  }
  if (kind === 'swarm' && !/swarm|horde|flock/i.test(name)) {
    name = `${name} Swarm`;
  }
  if (kind === 'minion' && !/-/.test(name)) {
    name = `${name} ${rng.pick(['Grunt', 'Thrall', 'Levy', 'Rabble']) ?? 'Grunt'}`;
  }

  return name;
}
