import { normalizeKey, compact } from './shared.js';
import { readPayload, payloadKind, readPage, KIND_NAMES } from './payload.js';
import { CREATURE_SIZE_IDS } from '../rules/monsters.js';
import { STARSHIP_SIZE_IDS } from '../rules/starship.js';
import { NPC_SHIP_ABILITIES } from '../rules/starshipNpc.js';
import { ABILITY_IDS } from '../rules/skills.js';
import { parseTokenSize } from '../rules/tokens.js';

export { normalizeKey, compact };

export const propertyBag = (properties) => {
  const bag = {};
  for (const [key, value] of Object.entries(properties ?? {})) {
    const id = normalizeKey(key);
    if (id && !(id in bag)) bag[id] = value;
  }
  return bag;
};

export const pick = (bag, aliases) => {
  for (const alias of aliases) {
    const value = bag[normalizeKey(alias)];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
};

const MINUS = /[−–—]/g;

const clean = (value) => String(value ?? '').trim();

const numeric = (value) => clean(value).replace(MINUS, '-');

export const toInt = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : undefined;
  const match = numeric(value).match(/-?\d+/);
  return match ? parseInt(match[0], 10) : undefined;
};

export const toModifier = (value) => {
  if (typeof value === 'number') return Math.trunc(value);
  const text = numeric(value);
  const bracketed = text.match(/\(\s*([+-]?\d+)\s*\)/);
  if (bracketed) return parseInt(bracketed[1], 10);
  return toInt(text);
};

export const toDice = (value) => {
  const text = clean(value);
  const bracketed = text.match(/\(([^)]*\d+d\d+[^)]*)\)/i);
  if (bracketed) return bracketed[1].trim();
  return /\d+d\d+/i.test(text) ? text : undefined;
};

export const toText = (value) => {
  const text = clean(value);
  return text === '' ? undefined : text;
};

export const toSize = (value, allowed) => {
  const text = clean(value).toLowerCase();
  return allowed.find((id) => new RegExp(`\\b${id}\\b`).test(text));
};

export const CREATURE_ALIASES = {
  size: ['size', 'creature size'],
  tokenSize: ['token size'],
  creatureType: ['type', 'creature type', 'monster type'],
  tags: ['subtype', 'tags', 'tag'],
  alignment: ['alignment'],
  defense: ['defense', 'defence', 'ac', 'armor class', 'armour class'],
  defenseNote: ['defense note', 'ac note', 'armor type', 'armour type'],
  hp: ['hp', 'hit points', 'hitpoints', 'health'],
  speed: ['speed', 'movement'],
  initiative: ['initiative', 'init'],
  cr: ['cr', 'challenge', 'challenge rating'],
  senses: ['senses'],
  languages: ['languages', 'language'],
  resistances: ['resistances', 'damage resistances', 'resistance'],
  immunities: ['immunities', 'damage immunities', 'condition immunities'],
};

export const SHIP_ALIASES = {
  size: ['size', 'ship size', 'size category'],
  defense: ['defense', 'defence', 'ac', 'armor class'],
  speed: ['speed', 'intercept speed'],
  maneuverDefense: ['maneuver defense', 'manoeuvre defence', 'maneuver defence'],
  initiative: ['initiative', 'init'],
  hull: ['hull points', 'hlp', 'hull'],
  si: ['structural integrity', 'si'],
  piloting: ['piloting', 'piloting bonus'],
  maneuverSaveDC: ['maneuver save dc', 'maneuver dc', 'save dc'],
  sensorRange: ['sensor range', 'sensors'],
  passivePerception: ['passive perception', 'passive'],
};

export const entryKind = (entry) => {
  const read = readPayload(entry);
  if (read?.ok) {
    const kind = payloadKind(entry, read.payload);
    if (kind === 'creature' || kind === 'ship') return kind;
  }

  const bag = propertyBag(entry?.properties);
  const shipish = ['hull points', 'hlp', 'structural integrity', 'si', 'piloting', 'maneuver defense'];
  if (shipish.some((key) => bag[normalizeKey(key)] !== undefined)) return 'ship';

  const creatureish = ['hit points', 'hp', 'challenge', 'cr'];
  if (creatureish.some((key) => bag[normalizeKey(key)] !== undefined)) return 'creature';

  const category = normalizeKey(entry?.category?.name);
  if (category.includes('ship') || category.includes('vehicle')) return 'ship';
  if (category.includes('monster') || category.includes('npc') || category.includes('creature')) {
    return 'creature';
  }
  return null;
};

export const toEntryKind = (bag) => {
  const stated = normalizeKey(pick(bag, ['section', 'category', 'kind', 'type']) ?? '');
  if (stated.includes('reaction')) return 'reaction';
  if (stated.includes('trait') || stated.includes('feature')) return 'trait';
  if (stated.includes('action')) return 'action';
  const hasAttack = pick(bag, ['attack', 'to hit', 'attack bonus', 'damage']) !== undefined;
  return hasAttack ? 'action' : 'trait';
};

export const toChild = (child) => {
  const bag = propertyBag(child?.properties);
  const attackPower = toModifier(pick(bag, ['to hit', 'attack', 'attack bonus']));
  const damage = pick(bag, ['damage', 'hit', 'damage dice']);
  return {
    kind: toEntryKind(bag),
    entry: compact({
      name: toText(child?.name),
      text: toText(pick(bag, ['description', 'text', 'effect', 'content'])),
      isAttack: attackPower !== undefined ? true : undefined,
      attackPower,
      range: toText(pick(bag, ['range', 'reach', 'range/reach'])),
      damage: toText(toDice(damage) ?? damage),
      damageType: toText(pick(bag, ['damage type', 'type of damage'])),
    }),
  };
};

export const toChildren = (entry) => {
  const grouped = { traits: [], actions: [], reactions: [] };
  for (const child of entry?.children ?? []) {
    const { kind, entry: mapped } = toChild(child);
    grouped[`${kind}s`].push(mapped);
  }
  return grouped;
};

export const toCreature = (entry) => {
  const bag = propertyBag(entry?.properties);
  const at = (field) => pick(bag, CREATURE_ALIASES[field]);

  const hpValue = at('hp');
  const hp = toInt(hpValue);

  const abilities = compact(
    Object.fromEntries(ABILITY_IDS.map((id) => [id, toModifier(pick(bag, [id, id.slice(0, 3)]))])),
  );

  return {
    patch: compact({
      size: toSize(at('size'), CREATURE_SIZE_IDS),
      tokenSize: parseTokenSize(at('tokenSize')) ? toText(at('tokenSize')) : undefined,
      creatureType: toText(at('creatureType')),
      tags: toText(at('tags')),
      alignment: toText(at('alignment')),
      defense: toInt(at('defense')),
      defenseNote: toText(at('defenseNote')),
      hp: hp === undefined ? undefined : { current: hp, max: hp, temp: 0 },
      hitDice: toDice(hpValue),
      speed: toText(at('speed')),
      initiative: toModifier(at('initiative')),
      cr: toText(at('cr')),
      senses: toText(at('senses')),
      languages: toText(at('languages')),
      resistances: toText(at('resistances')),
      immunities: toText(at('immunities')),
      abilities: Object.keys(abilities).length ? abilities : undefined,
    }),
    name: toText(entry?.name),
    notes: toText(entry?.content),
    ...toChildren(entry),
  };
};

export const toNpcShip = (entry) => {
  const bag = propertyBag(entry?.properties);
  const at = (field) => pick(bag, SHIP_ALIASES[field]);

  const hull = toInt(at('hull'));
  const si = toInt(at('si'));

  const crew = compact(
    Object.fromEntries(
      NPC_SHIP_ABILITIES.map((slot) => {
        const raw = pick(bag, [slot.label, slot.id]);
        if (raw === undefined) return [slot.id, undefined];
        return [slot.id, { mod: toModifier(raw) ?? 0 }];
      }),
    ),
  );

  return {
    patch: compact({
      size: toSize(at('size'), STARSHIP_SIZE_IDS),
      defense: toInt(at('defense')),
      speed: toInt(at('speed')),
      maneuverDefense: toInt(at('maneuverDefense')),
      initiative: toModifier(at('initiative')),
      hull: hull === undefined ? undefined : { current: hull, max: hull },
      si: si === undefined ? undefined : { current: si, max: si },
      piloting: toModifier(at('piloting')),
      maneuverSaveDC: toInt(at('maneuverSaveDC')),
      sensorRange: toInt(at('sensorRange')),
      passivePerception: toInt(at('passivePerception')),
      crew: Object.keys(crew).length ? crew : undefined,
    }),
    name: toText(entry?.name),
    notes: toText(entry?.content),
    ...toChildren(entry),
  };
};

export const mapEntry = (entry, kind = entryKind(entry)) => {
  const page = readPage(entry);
  if (page) {
    if (!page.ok) return { error: page.error };
    if (page.kind !== 'creature' && page.kind !== 'ship') {
      return { error: `${KIND_NAMES[page.kind]} pages don't make a stat block - drop them onto a sheet.` };
    }
    return page.mapped;
  }
  return {
    source: 'aliases',
    ...(kind === 'ship' ? toNpcShip(entry) : toCreature(entry)),
    skills: [],
    saves: [],
    pending: {},
    warnings: [],
  };
};

export const parseEntry = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(String(text ?? ''));
  } catch (error) {
    return { ok: false, error: `That is not valid JSON: ${error.message}` };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Expected a JSON object describing one entry.' };
  }

  const entry =
    parsed.data?.ruleSystem?.page ??
    parsed.data?.ruleSystem ??
    parsed.page ??
    parsed.entry ??
    parsed;

  if (!entry || typeof entry !== 'object' || (!entry.name && !entry.properties)) {
    return { ok: false, error: 'No entry found - expected at least a name or properties.' };
  }
  return { ok: true, entry };
};

export const previewEntry = (entry, kind = entryKind(entry)) => {
  const ours = readPayload(entry) !== null;
  const mapped = mapEntry(entry, ours ? undefined : kind);
  if (mapped.error) return { error: mapped.error };

  const rows = Object.entries(mapped.patch).map(([field, value]) => ({
    field,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
  }));
  return {
    kind: (ours ? entryKind(entry) : kind) ?? 'creature',
    fixed: ours,
    guessed: !ours && entryKind(entry) === null,
    name: mapped.name ?? null,
    rows,
    counts: {
      skills: mapped.skills.length,
      saves: mapped.saves?.length ?? 0,
      traits: mapped.traits.length,
      actions: mapped.actions.length,
      specialActions: mapped.specialActions?.length ?? 0,
      reactions: mapped.reactions.length,
      legendary: mapped.legendary?.actions?.length ?? 0,
      boss: mapped.boss?.actions?.length ?? 0,
      techniques: (mapped.techniques?.groups ?? []).reduce((n, g) => n + g.list.length, 0),
    },
    pending: mapped.pending,
    warnings: mapped.warnings,
  };
};
