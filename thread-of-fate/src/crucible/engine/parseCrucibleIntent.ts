/**
 * Deterministic intent parser: one sentence in, a structured build order out.
 *
 * There is no model call here - this package ships inside a Roll20 iframe with no
 * server and no network egress (docs/CRUCIBLE_AUDIT.md section 6.1). Everything below is
 * tokenisation, registry keyword matching, and numeric extraction. The upside is
 * that it is fast, offline, and reproducible; the cost is that it understands the
 * Convergence vocabulary rather than English in general, so every field it deduces
 * is recorded as an assumption the GM can see and overrule.
 *
 *   "Make me a level 8 blackstone war beast for 4 level 7 players"
 *     -> kind monster, level 8, role bruiser, party 4 x level 7, theme "blackstone"
 */

import type {
  CrucibleDepth,
  CrucibleEntityKind,
  EncounterDifficulty,
} from '@/crucible/schemas/crucibleCommon';
import { CREATURE_SIZES } from '@/crucible/data/registries/creatureSizes.registry';
import { CREATURE_ROLES } from '@/crucible/data/registries/creatureRoles.registry';
import { CREATURE_TYPES } from '@/crucible/data/registries/creatureTypes.registry';
import { CREATURE_TAGS } from '@/crucible/data/registries/creatureTags.registry';
import { CREATURE_TEMPLATES } from '@/crucible/data/registries/creatureTemplates.registry';
import { HAZARD_TYPES } from '@/crucible/data/registries/hazardTypes.registry';
import { ENCOUNTER_ENVIRONMENTS } from '@/crucible/data/registries/encounterEnvironments.registry';
import { NPC_ARCHETYPES } from '@/crucible/data/registries/npcArchetypes.registry';
import { NPC_MOTIVATIONS } from '@/crucible/data/registries/npcMotivations.registry';
import { hashString } from './seededRandom';

export interface IntentMatch {
  /** What was matched. */
  value: string;
  /** The prompt substring that triggered it. */
  evidence: string;
  /** 0-1. Explicit numbers score 1; a single keyword scores lower. */
  confidence: number;
}

export interface CrucibleIntent {
  prompt: string;
  seed: number;
  /** Everything below is null when the prompt did not say. */
  kind: IntentMatch | null;
  depth: CrucibleDepth;
  level: IntentMatch | null;
  threatRating: IntentMatch | null;
  sizeId: IntentMatch | null;
  roleIds: IntentMatch[];
  creatureTypeId: IntentMatch | null;
  tagNames: IntentMatch[];
  templateIds: IntentMatch[];
  hazardTypeId: IntentMatch | null;
  environmentId: IntentMatch | null;
  npcArchetypeId: IntentMatch | null;
  npcMotivationId: IntentMatch | null;
  difficulty: IntentMatch | null;
  partySize: IntentMatch | null;
  partyLevel: IntentMatch | null;
  /** How many of the creature the GM wants. */
  count: IntentMatch | null;
  /** Proper-noun-ish words that read as a name or a theme. */
  themeWords: string[];
  properName: string | null;
  /** Adjectives that shape flavour, e.g. "terrifying", "ancient". */
  descriptors: string[];
  /** Whether the prompt reads as social rather than combat. */
  socialLean: boolean;
  /** Every raw token, for debugging the parse in the UI. */
  tokens: string[];
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

const KIND_KEYWORDS: { kind: CrucibleEntityKind; words: string[] }[] = [
  {
    kind: 'mythicBoss',
    words: [
      'mythic',
      'godslayer',
      'world-ending',
      'demigod',
      'archfiend',
      'overgod',
      'eldergod',
      'outergod',
    ],
  },
  {
    kind: 'boss',
    words: [
      'boss',
      'warlord',
      'archmage',
      'lich',
      'dragon lord',
      'final',
      'chieftain',
      'overlord',
      'tyrant',
      'apex predator',
    ],
  },
  {
    kind: 'minion',
    words: [
      'minion',
      'mook',
      'grunt',
      'fodder',
      'chaff',
      'rabble',
      'lackey',
      'underling',
      'thrall',
    ],
  },
  { kind: 'swarm', words: ['swarm', 'horde', 'flock', 'colony', 'infestation', 'cloud of'] },
  { kind: 'summon', words: ['summon', 'summoned', 'conjured', 'familiar', 'elemental servant'] },
  {
    kind: 'companion',
    words: ['companion', 'animal companion', 'mount', 'steed', 'pet', 'sidekick'],
  },
  { kind: 'trap', words: ['trap', 'snare', 'pitfall', 'tripwire', 'deadfall'] },
  {
    kind: 'hazard',
    words: ['hazard', 'environmental', 'gas', 'collapse', 'quicksand', 'lava', 'storm front'],
  },
  {
    kind: 'vehicle',
    words: ['vehicle', 'ship', 'airship', 'wagon', 'tank', 'skiff', 'carriage', 'skyhawk', 'ark'],
  },
  {
    kind: 'npc',
    words: [
      'npc',
      'merchant',
      'shopkeeper',
      'innkeeper',
      'noble',
      'guard captain',
      'priest',
      'scholar',
      'informant',
      'contact',
      'villager',
      'bartender',
      'blacksmith',
    ],
  },
  { kind: 'monster', words: ['monster', 'creature', 'beast', 'enemy', 'foe', 'predator'] },
];

const DIFFICULTY_KEYWORDS: { value: EncounterDifficulty; words: string[] }[] = [
  { value: 'easy', words: ['easy', 'trivial', 'warm-up', 'warmup', 'pushover', 'simple'] },
  { value: 'medium', words: ['medium', 'moderate', 'standard', 'normal', 'fair'] },
  { value: 'hard', words: ['hard', 'tough', 'challenging', 'dangerous', 'serious', 'brutal'] },
  {
    value: 'deadly',
    words: ['deadly', 'lethal', 'tpk', 'terrifying', 'nightmare', 'overwhelming', 'unwinnable'],
  },
];

/** Words that suggest a purely social NPC with no statblock. */
const SOCIAL_WORDS = [
  'suspicious',
  'friendly',
  'secretly',
  'knows',
  'rumour',
  'rumor',
  'gossip',
  'negotiate',
  'bargain',
  'quest',
  'hires',
  'informant',
  'talks',
  'trader',
  'merchant',
  'broker',
  'patron',
];

const DESCRIPTOR_WORDS = [
  'ancient',
  'terrifying',
  'feral',
  'corrupted',
  'blessed',
  'cursed',
  'undead',
  'burning',
  'frozen',
  'spectral',
  'armored',
  'armoured',
  'winged',
  'venomous',
  'massive',
  'towering',
  'wretched',
  'noble',
  'starving',
  'ravenous',
  'silent',
  'screaming',
  'hollow',
  'gilded',
  'ruined',
  'broken',
  'radiant',
  'shadowed',
  'twisted',
  'grotesque',
  'elegant',
  'brutal',
  'desperate',
  'proud',
  'weary',
  'cruel',
  'kindly',
  'paranoid',
  'ambitious',
  'devout',
];

const STOP_WORDS = new Set([
  'make',
  'me',
  'a',
  'an',
  'the',
  'for',
  'of',
  'and',
  'with',
  'that',
  'who',
  'which',
  'to',
  'is',
  'are',
  'was',
  'were',
  'be',
  'it',
  'its',
  'my',
  'our',
  'their',
  'his',
  'her',
  'them',
  'party',
  'players',
  'player',
  'pcs',
  'pc',
  'level',
  'levels',
  'lvl',
  'create',
  'build',
  'generate',
  'give',
  'need',
  'want',
  'please',
  'some',
  'something',
  'at',
  'in',
  'on',
  'by',
  'up',
  'from',
  'as',
  'like',
  'about',
  'i',
  'we',
  'you',
  'can',
  'could',
  'would',
  'should',
]);

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  dozen: 12,
  twenty: 20,
  thirty: 30,
  fifty: 50,
  hundred: 100,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Whole-word regex that tolerates a plural "s"/"es" on the last word. */
const wordRe = (needle: string) =>
  new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:e?s)?\\b`);

function firstKeyword(haystack: string, words: string[]): { word: string; index: number } | null {
  let best: { word: string; index: number } | null = null;
  for (const word of words) {
    const needle = word.toLowerCase();
    const m = wordRe(needle).exec(haystack);
    if (!m) continue;
    const idx = m.index;
    if (!best || idx < best.index || needle.length > best.word.length) {
      best = { word, index: idx };
    }
  }
  return best;
}

function toNumber(raw: string): number | null {
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  return NUMBER_WORDS[raw.toLowerCase()] ?? null;
}

/** Score a registry entry by how many of its keywords appear in the prompt. */
function keywordScore(
  text: string,
  keywords: string[] | undefined,
): { hits: string[]; score: number } {
  if (!keywords?.length) return { hits: [], score: 0 };
  const hits: string[] = [];
  for (const kw of keywords) {
    const needle = kw.toLowerCase();
    if (!needle) continue;
    if (needle.includes(' ')) {
      if (text.includes(needle)) hits.push(kw);
    } else if (wordRe(needle).test(text)) {
      hits.push(kw);
    }
  }
  // Longer keywords are stronger evidence than short generic ones.
  const score = hits.reduce((s, h) => s + Math.min(1, 0.35 + h.length / 24), 0);
  return { hits, score };
}

function bestByKeywords<T extends { id: string; keywords?: string[] }>(
  text: string,
  items: T[],
): { item: T; hits: string[]; score: number } | null {
  let best: { item: T; hits: string[]; score: number } | null = null;
  for (const item of items) {
    const { hits, score } = keywordScore(text, item.keywords);
    if (score > 0 && (!best || score > best.score)) best = { item, hits, score };
  }
  return best;
}

const match = (value: string, evidence: string, confidence: number): IntentMatch => ({
  value,
  evidence,
  confidence: Math.max(0, Math.min(1, confidence)),
});

// ---------------------------------------------------------------------------
// The parser
// ---------------------------------------------------------------------------

export function parseCrucibleIntent(prompt: string): CrucibleIntent {
  const raw = prompt ?? '';
  const text = normalise(raw);
  const tokens = text.split(' ').filter(Boolean);

  const intent: CrucibleIntent = {
    prompt: raw,
    seed: hashString(raw.trim().toLowerCase()),
    kind: null,
    depth: 'spark',
    level: null,
    threatRating: null,
    sizeId: null,
    roleIds: [],
    creatureTypeId: null,
    tagNames: [],
    templateIds: [],
    hazardTypeId: null,
    environmentId: null,
    npcArchetypeId: null,
    npcMotivationId: null,
    difficulty: null,
    partySize: null,
    partyLevel: null,
    count: null,
    themeWords: [],
    properName: null,
    descriptors: [],
    socialLean: false,
    tokens,
  };

  if (!text) return intent;

  // --- Party: "for 4 level 7 players" / "for a party of five level 3 PCs" ----
  const partyPatterns = [
    /for\s+(?:a\s+)?(?:party\s+of\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:level\s*)?(\d+)?\s*(?:level\s*(\d+))?\s*(?:players?|pcs?|characters?|adventurers?|heroes)/,
    /for\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:players?|pcs?|characters?|adventurers?)/,
    /party\s+of\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/,
  ];
  for (const pattern of partyPatterns) {
    const m = text.match(pattern);
    if (!m) continue;
    const size = toNumber(m[1]);
    if (size != null) intent.partySize = match(String(size), m[0], 1);
    const lvl = toNumber(m[3] ?? m[2] ?? '');
    if (lvl != null) intent.partyLevel = match(String(lvl), m[0], 1);
    break;
  }
  // "level 7 party" / "level 7 players" without a size.
  if (!intent.partyLevel) {
    const m = text.match(/level\s*(\d+)\s+(?:players?|pcs?|party|characters?|adventurers?)/);
    if (m) intent.partyLevel = match(m[1], m[0], 1);
  }

  // --- Level / Threat Rating of the creature itself --------------------------
  // Take the FIRST "level N" that is not part of the party phrase.
  const partyEvidence = (intent.partySize?.evidence ?? '') + (intent.partyLevel?.evidence ?? '');
  const levelMatches = [...text.matchAll(/(?:level|lvl)\s*(\d+)/g)];
  for (const m of levelMatches) {
    if (partyEvidence.includes(m[0])) continue;
    intent.level = match(m[1], m[0], 1);
    break;
  }
  const trMatch = text.match(/(?:threat\s*rating|tr|challenge\s*rating|cr)\s*(\d+)/);
  if (trMatch) intent.threatRating = match(trMatch[1], trMatch[0], 1);

  // --- Count: "a pack of 6", "3 goblins", "six of them" ----------------------
  const countMatch =
    text.match(
      /(?:pack|group|band|gang|squad|patrol|nest|pair|trio)\s+of\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|dozen)/,
    ) ||
    text.match(
      /^(?:make|create|build|generate)?\s*(?:me\s+)?(\d+|two|three|four|five|six|seven|eight|nine|ten|dozen)\s+\w/,
    );
  if (countMatch) {
    const n = toNumber(countMatch[1]);
    if (n != null && n > 1) intent.count = match(String(n), countMatch[0], 0.8);
  }
  if (!intent.count && /\bpair\s+of\b/.test(text)) intent.count = match('2', 'pair of', 0.9);
  if (!intent.count && /\btrio\s+of\b/.test(text)) intent.count = match('3', 'trio of', 0.9);

  // --- Difficulty ------------------------------------------------------------
  for (const entry of DIFFICULTY_KEYWORDS) {
    const hit = firstKeyword(text, entry.words);
    if (hit) {
      intent.difficulty = match(entry.value, hit.word, 0.8);
      break;
    }
  }

  // --- Size ------------------------------------------------------------------
  const sizeHit = firstKeyword(
    text,
    CREATURE_SIZES.map((s) => s.name.toLowerCase()),
  );
  if (sizeHit) {
    const size = CREATURE_SIZES.find((s) => s.name.toLowerCase() === sizeHit.word);
    // "medium" also appears as a difficulty word; only trust it as a size when
    // it sits directly before a noun rather than describing the encounter.
    const ambiguous = size?.id === 'medium' && intent.difficulty?.value === 'medium';
    if (size && !ambiguous) intent.sizeId = match(size.id, sizeHit.word, 0.85);
  }
  // Common size synonyms.
  if (!intent.sizeId) {
    const synonyms: [string, string[]][] = [
      ['huge', ['enormous', 'massive', 'towering', 'giant']],
      ['gargantuan', ['gargantuan', 'kaiju', 'titan', 'leviathan']],
      ['large', ['big', 'hulking', 'oversized']],
      ['tiny', ['tiny', 'minuscule', 'diminutive']],
      ['small', ['small', 'little']],
    ];
    for (const [sizeId, words] of synonyms) {
      const hit = firstKeyword(text, words);
      if (hit) {
        intent.sizeId = match(sizeId, hit.word, 0.6);
        break;
      }
    }
  }

  // --- Kind ------------------------------------------------------------------
  for (const entry of KIND_KEYWORDS) {
    const hit = firstKeyword(text, entry.words);
    if (hit) {
      intent.kind = match(entry.kind, hit.word, entry.kind === 'monster' ? 0.5 : 0.85);
      break;
    }
  }

  // --- Roles (may be several) ------------------------------------------------
  const roleScores = CREATURE_ROLES.map((r) => ({ role: r, ...keywordScore(text, r.keywords) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  for (const entry of roleScores.slice(0, 2)) {
    intent.roleIds.push(match(entry.role.id, entry.hits.join(', '), Math.min(1, entry.score)));
  }

  // --- Creature type and tags ------------------------------------------------
  const typeHit = bestByKeywords(text, CREATURE_TYPES);
  if (typeHit) {
    intent.creatureTypeId = match(
      typeHit.item.id,
      typeHit.hits.join(', '),
      Math.min(1, typeHit.score),
    );
  }
  const tagScores = CREATURE_TAGS.map((t) => ({ tag: t, ...keywordScore(text, t.keywords) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
  for (const entry of tagScores.slice(0, 3)) {
    intent.tagNames.push(match(entry.tag.name, entry.hits.join(', '), Math.min(1, entry.score)));
  }

  // --- Templates -------------------------------------------------------------
  const templateScores = CREATURE_TEMPLATES.map((t) => ({
    tpl: t,
    ...keywordScore(text, t.keywords),
  }))
    .filter((t) => t.score >= 0.6)
    .sort((a, b) => b.score - a.score);
  for (const entry of templateScores.slice(0, 2)) {
    intent.templateIds.push(match(entry.tpl.id, entry.hits.join(', '), Math.min(1, entry.score)));
  }

  // --- Hazards, environments, NPC archetypes and motivations ------------------
  const hazardHit = bestByKeywords(text, HAZARD_TYPES);
  if (hazardHit) {
    intent.hazardTypeId = match(
      hazardHit.item.id,
      hazardHit.hits.join(', '),
      Math.min(1, hazardHit.score),
    );
  }
  const envHit = bestByKeywords(text, ENCOUNTER_ENVIRONMENTS);
  if (envHit) {
    intent.environmentId = match(envHit.item.id, envHit.hits.join(', '), Math.min(1, envHit.score));
  }
  const archetypeHit = bestByKeywords(text, NPC_ARCHETYPES);
  if (archetypeHit) {
    intent.npcArchetypeId = match(
      archetypeHit.item.id,
      archetypeHit.hits.join(', '),
      Math.min(1, archetypeHit.score),
    );
  }
  const motivationHit = bestByKeywords(text, NPC_MOTIVATIONS);
  if (motivationHit) {
    intent.npcMotivationId = match(
      motivationHit.item.id,
      motivationHit.hits.join(', '),
      Math.min(1, motivationHit.score),
    );
  }

  // --- Social lean -----------------------------------------------------------
  const socialHits = SOCIAL_WORDS.filter((w) => text.includes(w)).length;
  const combatHits = ['attack', 'fight', 'combat', 'kill', 'battle', 'encounter', 'boss'].filter(
    (w) => text.includes(w),
  ).length;
  intent.socialLean = socialHits > combatHits && !intent.threatRating;

  // --- Kind fallbacks --------------------------------------------------------
  if (!intent.kind) {
    if (intent.hazardTypeId) intent.kind = match('hazard', intent.hazardTypeId.evidence, 0.6);
    else if (intent.npcArchetypeId) intent.kind = match('npc', intent.npcArchetypeId.evidence, 0.6);
    else if (intent.socialLean) intent.kind = match('npc', 'social phrasing', 0.5);
  }

  // --- Descriptors and theme -------------------------------------------------
  intent.descriptors = DESCRIPTOR_WORDS.filter((w) => tokens.includes(w));

  const claimed = new Set<string>();
  const claim = (evidence: string | undefined) => {
    if (!evidence) return;
    normalise(evidence)
      .split(' ')
      .forEach((w) => claimed.add(w));
  };
  claim(intent.kind?.evidence);
  claim(intent.sizeId?.evidence);
  claim(intent.difficulty?.evidence);
  claim(intent.partySize?.evidence);
  claim(intent.partyLevel?.evidence);
  claim(intent.level?.evidence);
  claim(intent.threatRating?.evidence);
  intent.roleIds.forEach((r) => claim(r.evidence));
  intent.descriptors.forEach((d) => claimed.add(d));
  // Tag/template evidence is deliberately NOT claimed - those words ("blackstone",
  // "undead") are the creature's theme and should still feed the name generator.

  intent.themeWords = tokens.filter(
    (t) => !STOP_WORDS.has(t) && !claimed.has(t) && !/^\d+$/.test(t) && t.length > 2,
  );

  // A capitalised word in the original that is not sentence-initial reads as a name.
  const properTokens = raw
    .split(/\s+/)
    .slice(1)
    .filter((w) => /^[A-Z][a-z'-]{2,}$/.test(w.replace(/[^A-Za-z'-]/g, '')))
    .map((w) => w.replace(/[^A-Za-z'-]/g, ''));
  if (properTokens.length) intent.properName = properTokens.join(' ');

  // --- Depth -----------------------------------------------------------------
  const explicitFields =
    [
      intent.kind,
      intent.level,
      intent.threatRating,
      intent.sizeId,
      intent.partySize,
      intent.partyLevel,
      intent.difficulty,
    ].filter((f) => f && f.confidence >= 0.8).length + intent.roleIds.length;
  intent.depth = explicitFields >= 4 ? 'forge' : explicitFields >= 2 ? 'ember' : 'spark';

  return intent;
}

/** Which fields the parser had to guess - feeds the Assumptions panel. */
export function unresolvedFields(intent: CrucibleIntent): string[] {
  const missing: string[] = [];
  if (!intent.kind) missing.push('kind');
  if (!intent.level && !intent.threatRating) missing.push('level');
  if (!intent.sizeId) missing.push('size');
  if (!intent.roleIds.length) missing.push('role');
  if (!intent.partySize) missing.push('party size');
  if (!intent.partyLevel) missing.push('party level');
  if (!intent.difficulty) missing.push('difficulty');
  return missing;
}
