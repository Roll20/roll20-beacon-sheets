import { normalizeKey, compact } from './shared.js';
import { CREATURE_SIZE_IDS } from '../rules/monsters.js';
import { STARSHIP_SIZE_IDS } from '../rules/starship.js';
import { NPC_SHIP_ABILITY_IDS } from '../rules/starshipNpc.js';
import { ABILITY_IDS } from '../rules/skills.js';
import { DAMAGE_TYPES } from '../rules/damage.js';

export const PAYLOAD_VERSION = 1;

export const CATEGORY_KINDS = {
  monsters: 'creature',
  npcships: 'ship',
  starships: 'starship',
  techniques: 'technique',
  items: 'item',
  proficiencies: 'proficiency',
  species: 'species',
  backgrounds: 'background',
  professions: 'profession',
  paths: 'path',
  feats: 'feat',
  rules: 'rule',
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const property = (page, name) => {
  const wanted = normalizeKey(name);
  for (const [key, value] of Object.entries(page?.properties ?? {})) {
    if (normalizeKey(key) === wanted) return value;
  }
  return undefined;
};

const parseProperty = (raw) => (typeof raw === 'string' ? JSON.parse(raw) : raw);

export const readPayload = (page) => {
  const raw = property(page, 'data-payload');
  if (raw === undefined || raw === null || raw === '') return null;

  let payload;
  try {
    payload = parseProperty(raw);
  } catch (error) {
    return { ok: false, error: `The page's data-payload is not valid JSON: ${error.message}` };
  }
  if (!isObject(payload)) {
    return { ok: false, error: "The page's data-payload is not a JSON object." };
  }

  const { v } = payload;
  if (!Number.isInteger(v) || v < 1) {
    return { ok: false, error: 'The page\'s data-payload has no version ("v").' };
  }
  if (v > PAYLOAD_VERSION) {
    return {
      ok: false,
      error: `This page was made for a newer version of the sheet (payload v${v}; this sheet reads v${PAYLOAD_VERSION}).`,
    };
  }

  const warnings = [];
  let features = null;
  const rawFeatures = property(page, 'data-features');
  if (rawFeatures !== undefined && rawFeatures !== null && rawFeatures !== '') {
    try {
      const parsed = parseProperty(rawFeatures);
      const levelsOk =
        isObject(parsed) &&
        Object.entries(parsed).every(([key, list]) => /^level-\d+$/.test(key) && Array.isArray(list));
      if (levelsOk) features = parsed;
      else warnings.push('data-features: expected lists under "level-1", "level-2"… - ignored.');
    } catch (error) {
      warnings.push(`data-features: not valid JSON (${error.message}) - ignored.`);
    }
  }

  return { ok: true, v, payload, features, warnings };
};

export const payloadKind = (page, payload) => {
  const stated = isObject(payload) ? CATEGORY_KINDS[normalizeKey(payload.category)] : undefined;
  if (stated) return stated;
  const byCategory = CATEGORY_KINDS[normalizeKey(page?.category?.name ?? page?.categoryName)];
  if (byCategory) return byCategory;
  if (!isObject(payload)) return null;
  if ('hull' in payload || 'crew' in payload || 'maneuverDefense' in payload) return 'ship';
  if ('cr' in payload || 'abilities' in payload || 'hitDice' in payload) return 'creature';
  return null;
};

const checker = (warnings) => {
  const wrong = (field, expected) => {
    warnings.push(`${field}: expected ${expected} - left alone.`);
    return undefined;
  };
  const missing = (value) => value === undefined || value === null;

  const int = (field, value) => {
    if (missing(value)) return undefined;
    if (Number.isInteger(value)) return value;
    if (typeof value === 'string' && /^[+-]?\d+$/.test(value.trim())) return parseInt(value, 10);
    return wrong(field, 'a whole number');
  };

  const text = (field, value) => {
    if (missing(value)) return undefined;
    if (typeof value === 'number') return String(value);
    if (typeof value !== 'string') return wrong(field, 'text');
    return value.trim() === '' ? undefined : value;
  };

  const prose = (field, value) => {
    if (Array.isArray(value)) {
      if (!value.every((p) => typeof p === 'string')) return wrong(field, 'text or a list of paragraphs');
      return text(field, value.join('\n\n'));
    }
    return text(field, value);
  };

  const bool = (field, value) => {
    if (missing(value)) return undefined;
    return typeof value === 'boolean' ? value : wrong(field, 'true or false');
  };

  const oneOf = (field, value, ids) => {
    if (missing(value)) return undefined;
    return ids.includes(value) ? value : wrong(field, `one of ${ids.join(', ')}`);
  };

  const list = (field, value) => {
    if (missing(value)) return undefined;
    return Array.isArray(value) ? value : wrong(field, 'a list');
  };

  const object = (field, value) => {
    if (missing(value)) return undefined;
    return isObject(value) ? value : wrong(field, 'an object');
  };

  const pool = (field, value, extra = {}) => {
    const box = object(field, value);
    if (!box) return undefined;
    const max = int(`${field}.max`, box.max);
    return max === undefined ? undefined : { current: max, max, ...extra };
  };

  return { int, text, prose, bool, oneOf, list, object, pool };
};

const damageLabel = (value) => DAMAGE_TYPES.find((t) => t.id === value)?.name ?? value;

const toRow = (entry, where, check, warnings) => {
  if (!isObject(entry)) {
    warnings.push(`${where}: skipped an entry that is not an object.`);
    return null;
  }
  const name = check.text(`${where}.name`, entry.name);
  const attackPower = check.int(`${where}.attackPower`, entry.attackPower);
  const isAttack = check.bool(`${where}.isAttack`, entry.isAttack);
  const damageType = check.text(`${where}.damageType`, entry.damageType);
  return compact({
    name,
    text: check.prose(`${where}.text`, entry.text),
    isAttack: isAttack ?? (attackPower !== undefined ? true : undefined),
    attackPower,
    range: check.text(`${where}.range`, entry.range),
    damage: check.text(`${where}.damage`, entry.damage),
    damageType: damageType === undefined ? undefined : damageLabel(damageType),
    cost: check.int(`${where}.cost`, entry.cost),
    technique: check.text(`${where}.technique`, entry.technique),
  });
};

const toRows = (field, value, check, warnings) =>
  (check.list(field, value) ?? [])
    .map((entry, i) => toRow(entry, `${field}[${i}]`, check, warnings))
    .filter(Boolean);

const toBonusLines = (field, value, check, warnings) =>
  (check.list(field, value) ?? [])
    .map((line, i) => {
      if (!isObject(line)) {
        warnings.push(`${field}[${i}]: skipped a line that is not an object.`);
        return null;
      }
      const name = check.text(`${field}[${i}].name`, line.name);
      if (name === undefined) return null;
      return { name, bonus: check.int(`${field}[${i}].bonus`, line.bonus) ?? 0 };
    })
    .filter(Boolean);

const byIds = (field, value, ids, read, check, warnings) => {
  const box = check.object(field, value);
  if (!box) return undefined;
  const out = {};
  for (const [id, raw] of Object.entries(box)) {
    if (!ids.includes(id)) {
      warnings.push(`${field}.${id}: not a known id - ignored.`);
      continue;
    }
    const got = read(`${field}.${id}`, raw);
    if (got !== undefined) out[id] = got;
  }
  return Object.keys(out).length ? out : undefined;
};

const toActionBlock = (field, value, check, warnings, { withUses }) => {
  const box = check.object(field, value);
  if (!box) return null;
  return compact({
    uses: withUses ? check.int(`${field}.uses`, box.uses) : undefined,
    text: check.prose(`${field}.text`, box.text),
    actions: toRows(`${field}.actions`, box.actions, check, warnings),
  });
};

const nameFromId = (id) =>
  String(id).split('_').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

const toTechniques = (payload, check, warnings, entryLists) => {
  const box = check.object('techniques', payload.techniques);
  const groups = [];
  if (box) {
    (check.list('techniques.groups', box.groups) ?? []).forEach((group, g) => {
      const where = `techniques.groups[${g}]`;
      if (!isObject(group)) {
        warnings.push(`${where}: skipped a group that is not an object.`);
        return;
      }
      const uses = group.uses === 'at_will' ? 'at_will' : check.int(`${where}.uses`, group.uses);
      const list = (check.list(`${where}.list`, group.list) ?? [])
        .map((tech, i) => {
          const at = `${where}.list[${i}]`;
          if (!isObject(tech)) {
            warnings.push(`${at}: skipped a technique that is not an object.`);
            return null;
          }
          const id = check.text(`${at}.id`, tech.id);
          const name = check.text(`${at}.name`, tech.name) ?? (id ? nameFromId(id) : undefined);
          if (!id && !name) return null;
          return compact({
            id,
            name,
            rank: check.int(`${at}.rank`, tech.rank),
            damage: check.text(`${at}.damage`, tech.damage),
            note: check.text(`${at}.note`, tech.note),
          });
        })
        .filter(Boolean);
      groups.push({ uses: uses ?? 'at_will', list });
    });
  }

  const listed = new Set(groups.flatMap((g) => g.list.map((t) => t.id)));
  const extra = [...new Set(entryLists.flat().map((e) => e.technique).filter(Boolean))]
    .filter((id) => !listed.has(id))
    .map((id) => ({ id, name: nameFromId(id) }));

  if (!box && !extra.length) return null;
  return compact({
    ability: box ? check.text('techniques.ability', box.ability) : undefined,
    attack: box ? check.int('techniques.attack', box.attack) : undefined,
    saveDC: box ? check.int('techniques.saveDC', box.saveDC) : undefined,
    note: box ? check.text('techniques.note', box.note) : undefined,
    groups,
    extra,
  });
};

export const creatureFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const hp = check.pool('hp', payload.hp, { temp: 0 });

  return {
    source: 'payload',
    patch: compact({
      size: check.oneOf('size', payload.size, CREATURE_SIZE_IDS),
      creatureType: check.text('creatureType', payload.creatureType),
      tags: check.text('tags', payload.tags),
      alignment: check.text('alignment', payload.alignment),
      defense: check.int('defense', payload.defense),
      defenseNote: check.text('defenseNote', payload.defenseNote),
      hp,
      hitDice: check.text('hitDice', payload.hitDice),
      speed: check.text('speed', payload.speed),
      initiative: check.int('initiative', payload.initiative),
      abilities: byIds('abilities', payload.abilities, ABILITY_IDS, check.int, check, warnings),
      saveProficiencies: byIds(
        'saveProficiencies', payload.saveProficiencies, ABILITY_IDS, check.bool, check, warnings,
      ),
      cr: check.text('cr', payload.cr),
      senses: check.text('senses', payload.senses),
      languages: check.text('languages', payload.languages),
      resistances: check.text('resistances', payload.resistances),
      immunities: check.text('immunities', payload.immunities),
    }),
    name: check.text('name', page.name),
    notes: check.text('content', page.content),
    skills: toBonusLines('skills', payload.skills, check, warnings),
    ...creatureSections(payload, check, warnings),
    pending: {},
    warnings,
  };
};

const creatureSections = (payload, check, warnings) => {
  const traits = toRows('traits', payload.traits, check, warnings);
  const actions = toRows('actions', payload.actions, check, warnings);
  const specialActions = toRows('specialActions', payload.specialActions, check, warnings);
  const reactions = toRows('reactions', payload.reactions, check, warnings);
  const legendary = toActionBlock('legendary', payload.legendary, check, warnings, { withUses: true });
  const boss = toActionBlock('boss', payload.boss, check, warnings, { withUses: false });
  const techniques = toTechniques(payload, check, warnings, [
    traits, actions, specialActions, reactions, legendary?.actions ?? [], boss?.actions ?? [],
  ]);
  return { traits, actions, specialActions, reactions, legendary, boss, techniques };
};

export const npcShipFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const crewSlot = (field, raw) => {
    const slot = check.object(field, raw);
    if (!slot) return undefined;
    const mod = check.int(`${field}.mod`, slot.mod);
    return mod === undefined ? undefined : { mod };
  };

  return {
    source: 'payload',
    patch: compact({
      size: check.oneOf('size', payload.size, STARSHIP_SIZE_IDS),
      defense: check.int('defense', payload.defense),
      speed: check.int('speed', payload.speed),
      hull: check.pool('hull', payload.hull),
      si: check.pool('si', payload.si),
      maneuverDefense: check.int('maneuverDefense', payload.maneuverDefense),
      initiative: check.int('initiative', payload.initiative),
      crew: byIds('crew', payload.crew, NPC_SHIP_ABILITY_IDS, crewSlot, check, warnings),
      piloting: check.int('piloting', payload.piloting),
      maneuverSaveDC: check.int('maneuverSaveDC', payload.maneuverSaveDC),
      sensorRange: check.int('sensorRange', payload.sensorRange),
      passivePerception: check.int('passivePerception', payload.passivePerception),
    }),
    name: check.text('name', page.name),
    notes: check.text('content', page.content),
    saves: toBonusLines('saves', payload.saves, check, warnings),
    skills: toBonusLines('skills', payload.skills, check, warnings),
    traits: toRows('traits', payload.traits, check, warnings),
    actions: toRows('actions', payload.actions, check, warnings),
    reactions: toRows('reactions', payload.reactions, check, warnings),
    pending: {},
    warnings,
  };
};

const KIND_NAMES = {
  starship: 'Starships',
  technique: 'Techniques',
  item: 'Items',
  proficiency: 'Proficiencies',
  species: 'Species',
  background: 'Backgrounds',
  profession: 'Professions',
  path: 'Paths',
  feat: 'Feats',
  rule: 'Rules',
};

export const readPage = (page, kind) => {
  const read = readPayload(page);
  if (!read) return null;
  if (!read.ok) return read;

  const pageKind = kind ?? payloadKind(page, read.payload);
  const mapper = { creature: creatureFromPayload, ship: npcShipFromPayload }[pageKind];
  if (!mapper) {
    const what = KIND_NAMES[pageKind];
    return {
      ok: false,
      error: what
        ? `${what} pages can't be imported yet.`
        : 'This page does not say what it is - no category, and nothing in its payload to tell.',
    };
  }

  const mapped = mapper(read.payload, page);
  return { ok: true, kind: pageKind, mapped: { ...mapped, warnings: [...read.warnings, ...mapped.warnings] } };
};
