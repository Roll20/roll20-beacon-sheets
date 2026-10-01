import { normalizeKey, compact } from './shared.js';
import { CREATURE_SIZE_IDS } from '../rules/monsters.js';
import { STARSHIP_SIZE_IDS } from '../rules/starship.js';
import { NPC_SHIP_ABILITY_IDS } from '../rules/starshipNpc.js';
import { ABILITY_IDS } from '../rules/skills.js';
import { DAMAGE_TYPES } from '../rules/damage.js';
import { COMPONENT_TYPES, MIN_RANK, MAX_RANK } from '../rules/techniques.js';
import { parseTokenSize } from '../rules/tokens.js';
import { MASTERY_FEATURES, WEAPON_KINDS } from '../rules/equipment.js';
import { WEAPON_PROPERTY_IDS, normalizeWeaponProperties, normalizeWeaponText } from '../rules/weapons.js';
import { ARMOR_CATEGORY_IDS } from '../rules/armor.js';

export const PAYLOAD_VERSION = 1;

export const CATEGORY_KINDS = {
  monsters: 'creature',
  npcships: 'ship',
  starships: 'starship',
  vehicles: 'vehicle',
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

const tokenSizeProperty = (page, warnings) => {
  const raw = property(page, 'Token Size');
  if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
  if (parseTokenSize(raw)) return String(raw).trim();
  warnings.push(`Token Size: expected a number or "width,height" - left alone.`);
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
      tokenSize: tokenSizeProperty(page, warnings),
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
    notes: check.text('description', payload.description),
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
    notes: check.text('description', payload.description),
    saves: toBonusLines('saves', payload.saves, check, warnings),
    skills: toBonusLines('skills', payload.skills, check, warnings),
    traits: toRows('traits', payload.traits, check, warnings),
    actions: toRows('actions', payload.actions, check, warnings),
    reactions: toRows('reactions', payload.reactions, check, warnings),
    pending: {},
    warnings,
  };
};

export const starshipFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const hullDie = check.text('hullDie', payload.hullDie);
  const weapons = (check.list('weapons', payload.weapons) ?? []).flatMap((w, i) => {
    const at = `weapons[${i}]`;
    if (!isObject(w)) {
      warnings.push(`${at}: skipped a weapon that is not an object.`);
      return [];
    }
    const damageType = check.text(`${at}.damageType`, w.damageType);
    const row = {
      name: check.text(`${at}.name`, w.name) ?? '',
      range: check.text(`${at}.range`, w.range) ?? '',
      damage: check.text(`${at}.damage`, w.damage) ?? '',
      damageType: damageType === undefined ? '' : damageLabel(damageType),
      addDexToDamage: !!check.bool(`${at}.addDexToDamage`, w.addDexToDamage),
      notes: check.text(`${at}.notes`, w.notes) ?? '',
    };
    const quantity = Math.max(1, check.int(`${at}.quantity`, w.quantity) ?? 1);
    return Array.from({ length: quantity }, () => ({ ...row }));
  });
  return {
    source: 'payload',
    name: check.text('name', page.name),
    stats: compact({
      size: check.oneOf('size', payload.size, STARSHIP_SIZE_IDS),
      crewCapacity: check.int('crewCapacity', payload.crewCapacity),
      actionStations: check.text('actionStations', payload.actionStations),
      baseDefense: check.int('baseDefense', payload.baseDefense),
      maneuverability: check.int('maneuverability', payload.maneuverability),
      defenseModifier: check.int('defenseModifier', payload.defenseModifier),
      baseHullPoints: check.int('baseHullPoints', payload.baseHullPoints),
      baseStructuralIntegrity: check.int('baseStructuralIntegrity', payload.baseStructuralIntegrity),
      hullDie: hullDie && /^d\d+$/.test(hullDie) ? hullDie : undefined,
      hullDiceTotal: check.int('hullDiceTotal', payload.hullDiceTotal),
      interceptSpeed: check.int('interceptSpeed', payload.interceptSpeed),
      sensorRange: check.int('sensorRange', payload.sensorRange),
      specialFeatures: check.prose('specialFeatures', payload.specialFeatures),
      defenseSystems: check.prose('defenseSystems', payload.defenseSystems),
      resistances: check.text('resistances', payload.resistances),
    }),
    weapons,
    warnings,
  };
};

export const vehicleFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const block = check.object('statBlock', payload.statBlock);
  const name = check.text('name', page.name);
  if (!block) return { source: 'payload', name, kind: 'vehicle', hasStatBlock: false, stats: {}, weapons: [], warnings };
  const saves = check.object('statBlock.saves', block.saves) ?? {};
  const ship = starshipFromPayload({ weapons: block.weapons }, page);
  warnings.push(...ship.warnings);
  return {
    source: 'payload',
    name,
    kind: 'vehicle',
    hasStatBlock: true,
    tokenSize: tokenSizeProperty(page, warnings),
    stats: compact({
      size: check.oneOf('statBlock.size', block.size, CREATURE_SIZE_IDS),
      crewCapacity: check.int('statBlock.seating', block.seating),
      actionStations: check.text('statBlock.stations', block.stations),
      baseDefense: check.int('statBlock.baseDefense', block.baseDefense),
      maneuverability: 0,
      baseHullPoints: check.int('statBlock.hp', block.hp),
      controlSpeed: check.text('statBlock.controlSpeed', block.controlSpeed),
      strSave: check.int('statBlock.saves.strength', saves.strength),
      conSave: check.int('statBlock.saves.constitution', saves.constitution),
      interceptSpeed: check.text('speed', payload.speed),
      immunities: check.text('statBlock.immunities', block.immunities),
      specialFeatures: check.prose('statBlock.specialFeatures', block.specialFeatures),
      defenseSystems: check.prose('statBlock.utility', block.utility),
    }),
    weapons: ship.weapons,
    warnings,
  };
};

const COMPONENT_TYPE_IDS = COMPONENT_TYPES.map((t) => t.id);

export const techniqueFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const box = check.object('fields', payload.fields) ?? {};

  const paragraphs = (field, value) => {
    const items = check.list(field, value);
    if (items === undefined) return undefined;
    if (!items.every((p) => typeof p === 'string')) {
      warnings.push(`${field}: expected a list of paragraphs - left alone.`);
      return undefined;
    }
    return items;
  };

  let rank = check.int('fields.rank', box.rank);
  if (rank !== undefined && (rank < MIN_RANK || rank > MAX_RANK)) {
    warnings.push(`fields.rank: expected ${MIN_RANK} to ${MAX_RANK} - left alone.`);
    rank = undefined;
  }

  const saveAbility =
    box.saveAbility === null ? null : check.oneOf('fields.saveAbility', box.saveAbility, ABILITY_IDS);
  let components;
  if (box.components === null) components = null;
  else {
    const c = check.object('fields.components', box.components);
    const type = c ? check.oneOf('fields.components.type', c.type, COMPONENT_TYPE_IDS) : undefined;
    if (type) components = { type, text: check.text('fields.components.text', c.text) ?? '' };
  }

  const label = (field, value) => {
    const id = check.text(field, value);
    return id === undefined ? undefined : damageLabel(id);
  };

  const fields = compact({
    name: check.text('fields.name', box.name) ?? check.text('name', page.name),
    rank,
    castingTime: check.text('fields.castingTime', box.castingTime),
    range: check.text('fields.range', box.range),
    duration: check.text('fields.duration', box.duration),
    concentration: check.bool('fields.concentration', box.concentration),
    attack: check.bool('fields.attack', box.attack),
    saveAbility,
    components,
    text: paragraphs('fields.text', box.text),
    boost: paragraphs('fields.boost', box.boost),
  });

  return {
    source: 'payload',
    id: check.text('id', payload.id),
    fields,
    extras: compact({
      damage: check.text('damage', payload.damage),
      damageType: label('damageType', payload.damageType),
      damage2: check.text('damage2', payload.damage2),
      damage2Type: label('damage2Type', payload.damage2Type),
      healing: check.text('healing', payload.healing),
      addAbilityMod: check.bool('addAbilityMod', payload.addAbilityMod),
      saveEffect: check.text('saveEffect', payload.saveEffect),
      boostDamage: check.text('boostDamage', payload.boostDamage),
      boostDamage2: check.text('boostDamage2', payload.boostDamage2),
      boostHealing: check.text('boostHealing', payload.boostHealing),
    }),
    name: fields.name,
    warnings,
  };
};

const ITEM_TYPES = ['weapon', 'armor', 'shield', 'consumable', 'accessory', 'gear', 'tool'];
const MASTERY_NAMES = Object.fromEntries(MASTERY_FEATURES.map((m) => [m.toLowerCase(), m]));

const toAttackRow = (payload, name, check, warnings) => {
  const a = check.object('attack', payload.attack);
  if (!a) return null;
  const properties = check.list('attack.properties', a.properties) ?? [];
  const unknown = properties.filter((p) => !WEAPON_PROPERTY_IDS.includes(p));
  if (unknown.length) warnings.push(`attack.properties: ${unknown.join(', ')} not known - left out.`);
  const mastery = check.text('attack.mastery', a.mastery);
  if (mastery && !MASTERY_NAMES[mastery.toLowerCase()]) warnings.push(`attack.mastery: ${mastery} not known - left out.`);
  return compact({
    name,
    type: check.text('type', payload.type),
    grade: payload.grade === undefined ? undefined : String(check.int('grade', payload.grade) ?? ''),
    kind: check.oneOf('attack.kind', a.kind, WEAPON_KINDS.map((k) => k.id)),
    range: check.text('attack.range', a.range),
    properties: normalizeWeaponProperties(properties.filter((p) => WEAPON_PROPERTY_IDS.includes(p))),
    thrownRange: check.text('attack.thrownRange', a.thrownRange),
    ammunitionType: check.text('attack.ammunitionType', a.ammunitionType),
    baseDamage: check.text('attack.damage', a.damage),
    damageType: check.text('attack.damageType', a.damageType),
    mastery: mastery ? MASTERY_NAMES[mastery.toLowerCase()] : undefined,
    text: normalizeWeaponText(check.list('text', payload.text) ?? []),
  });
};

export const itemFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  const itemType = check.oneOf('itemType', payload.itemType, ITEM_TYPES) ?? 'gear';
  const item = check.object('item', payload.item) ?? {};
  const name = check.text('item.name', item.name) ?? check.text('name', page.name) ?? '';
  const grade = payload.grade !== undefined ? check.int('grade', payload.grade) : check.int('item.grade', item.grade === '' ? undefined : item.grade);

  const equipment = compact({
    name,
    itemType,
    grade: grade === undefined ? '' : String(grade),
    quantity: check.int('item.quantity', item.quantity) ?? 1,
    weight: check.text('item.weight', item.weight) ?? '',
    text: check.prose('description', payload.description) ?? '',
  });
  if (itemType === 'armor') {
    const armor = check.object('armor', payload.armor) ?? {};
    equipment.category = check.oneOf('armor.armorType', armor.armorType, ARMOR_CATEGORY_IDS) ?? 'light';
    equipment.strength = armor.strength == null ? '' : String(check.int('armor.strength', armor.strength) ?? '');
    equipment.stealthDisadvantage = !!check.bool('armor.stealthDisadvantage', armor.stealthDisadvantage);
  }

  const contents = (check.list('contents', payload.contents) ?? [])
    .map((c, i) => {
      if (!isObject(c) || typeof c.name !== 'string' || !c.name.trim()) {
        warnings.push(`contents[${i}]: expected an item with a name - left out.`);
        return null;
      }
      return {
        name: c.name.trim(),
        itemType: 'gear',
        grade: '',
        quantity: check.int(`contents[${i}].quantity`, c.quantity) ?? 1,
        weight: check.text(`contents[${i}].weight`, c.weight) ?? '',
        text: '',
      };
    })
    .filter(Boolean);

  return {
    source: 'payload',
    itemType,
    name,
    equipment,
    attack: itemType === 'weapon' ? toAttackRow(payload, name, check, warnings) : null,
    contents,
    warnings,
  };
};

const PROFICIENCY_KINDS = ['weapon', 'armor', 'tool', 'vehicle', 'language'];

export const proficiencyFromPayload = (payload, page = {}) => {
  const warnings = [];
  const check = checker(warnings);
  return {
    source: 'payload',
    kind: check.oneOf('kind', payload.kind, PROFICIENCY_KINDS),
    id: check.text('id', payload.id),
    name: check.text('name', page.name) ?? '',
    parent: check.text('parent', payload.parent) ?? '',
    warnings,
  };
};

const choiceLabels = (choice) =>
  (Array.isArray(choice) ? choice : choice ? [choice] : [])
    .map((c) => (isObject(c) && typeof c.label === 'string' ? c.label : null))
    .filter(Boolean);

const originFeatures = (features, source) => {
  const rows = [];
  const choices = [];
  for (const entry of features?.['level-1'] ?? []) {
    if (!isObject(entry) || typeof entry.name !== 'string') continue;
    const text = Array.isArray(entry.text) ? entry.text.filter((p) => typeof p === 'string') : [];
    rows.push({ name: entry.name, text: text.join('\n\n'), group: 'origin', level: null, source });
    choices.push(...choiceLabels(entry.choice));
  }
  return { rows, choices };
};

const toProficiencyList = (value, field, warnings) =>
  (Array.isArray(value) ? value : []).filter((p) => {
    const ok = isObject(p) && typeof p.kind === 'string' && typeof p.id === 'string';
    if (!ok) warnings.push(`${field}: skipped an entry without a kind and id.`);
    return ok;
  });

export const speciesFromPayload = (payload, page = {}, features = null) => {
  const warnings = [];
  const check = checker(warnings);
  const id = check.text('id', payload.id) ?? '';
  const sizes = (Array.isArray(payload.size) ? payload.size : [payload.size]).filter((s) => typeof s === 'string');
  const { rows, choices } = originFeatures(features, `species:${id}`);
  if (sizes.length > 1) choices.unshift(`size (${sizes.join(' or ')})`);
  return {
    source: 'payload',
    name: check.text('species', payload.species) ?? check.text('name', page.name) ?? '',
    size: sizes.length === 1 ? sizes[0] : '',
    speed: check.int('speed', payload.speed),
    languages: (check.list('languages', payload.languages) ?? []).filter((l) => typeof l === 'string'),
    proficiencies: toProficiencyList(payload.proficiencies, 'proficiencies', warnings),
    features: rows,
    choices,
    warnings,
  };
};

export const backgroundFromPayload = (payload, page = {}, features = null) => {
  const warnings = [];
  const check = checker(warnings);
  const id = check.text('id', payload.id) ?? '';
  const ranks = check.object('skillRanks', payload.skillRanks) ?? {};
  const skillRanks = Object.fromEntries(
    Object.entries(ranks).filter(([, n]) => Number.isInteger(n) && n > 0),
  );
  const { rows } = originFeatures(features, `background:${id}`);
  const choices = [
    ...choiceLabels(payload.skillChoice),
    ...choiceLabels(payload.proficiencyChoices),
    ...(check.list('equipmentChoices', payload.equipmentChoices) ?? []).filter((c) => typeof c === 'string'),
  ];
  const equipment = (check.list('equipment', payload.equipment) ?? [])
    .filter((e) => isObject(e) && typeof e.name === 'string' && e.name.trim())
    .map((e) => ({
      name: e.name.trim(), itemType: 'gear', grade: '', quantity: Number.isInteger(e.quantity) ? e.quantity : 1,
      weight: typeof e.weight === 'string' || typeof e.weight === 'number' ? e.weight : '', text: '',
    }));
  return {
    source: 'payload',
    name: check.text('background', payload.background) ?? check.text('name', page.name) ?? '',
    skillRanks,
    proficiencies: toProficiencyList(payload.proficiencies, 'proficiencies', warnings),
    equipment,
    meseta: check.int('meseta', payload.meseta) ?? 0,
    features: rows,
    choices,
    warnings,
  };
};

const RESOURCE_KEYS = ['max', 'recovery', 'pool', 'unit', 'name'];

const levelFeatures = (features, prefix, warnings) => {
  const rows = [];
  const resources = [];
  const choices = [];
  const levels = Object.keys(features ?? {}).sort((a, b) => parseInt(a.slice(6), 10) - parseInt(b.slice(6), 10));
  for (const key of levels) {
    const level = parseInt(key.slice(6), 10);
    const source = `${prefix}:${key}`;
    for (const entry of features[key]) {
      if (!isObject(entry) || typeof entry.name !== 'string') {
        warnings.push(`data-features.${key}: skipped an entry without a name.`);
        continue;
      }
      if (entry.listed === false) {
        for (const label of choiceLabels(entry.choice)) choices.push({ level, label });
        continue;
      }
      const ref = typeof entry.id === 'string' ? entry.id : '';
      const text = Array.isArray(entry.text) ? entry.text.filter((p) => typeof p === 'string') : [];
      const options = (Array.isArray(entry.options) ? entry.options : [])
        .filter((o) => isObject(o) && typeof o.name === 'string')
        .map((o) => ({ name: o.name, text: typeof o.text === 'string' ? o.text : '' }));
      rows.push({
        name: entry.name, text: text.join('\n\n'), group: 'profession', level, source, ref, options, pick: '',
        rider: isObject(entry.rider) ? entry.rider : null,
        roll: isObject(entry.roll) ? entry.roll : null,
        move: isObject(entry.move) ? entry.move : null,
        techniques: Array.isArray(entry.techniques) ? entry.techniques : [],
      });
      for (const uses of Array.isArray(entry.uses) ? entry.uses : []) {
        if (!isObject(uses) || !isObject(uses.max)) continue;
        resources.push({
          source, ref, level,
          ...Object.fromEntries(RESOURCE_KEYS.filter((k) => k in uses).map((k) => [k, uses[k]])),
        });
      }
      if (options.length) choices.push({ level, label: entry.name });
      for (const label of choiceLabels(entry.choice)) choices.push({ level, label });
    }
  }
  return { rows, resources, choices };
};

export const professionFromPayload = (payload, page = {}, features = null) => {
  const warnings = [];
  const check = checker(warnings);
  const id = check.text('id', payload.id) ?? '';
  const stats = check.object('professionStats', payload.professionStats) ?? {};
  const { rows, resources, choices } = levelFeatures(features, `profession:${id}`, warnings);
  const kit = check.object('startingEquipment', payload.startingEquipment);
  const option = (key) => {
    const box = kit && isObject(kit[key]) ? kit[key] : null;
    if (!box) return null;
    return {
      items: (Array.isArray(box.items) ? box.items : [])
        .filter(isObject)
        .map((item) => itemFromPayload(item)),
      meseta: check.int(`startingEquipment.${key}.meseta`, box.meseta) ?? 0,
      choices: (Array.isArray(box.choices) ? box.choices : []).filter((c) => typeof c === 'string'),
    };
  };
  const a = option('a');
  const b = option('b');
  return {
    source: 'payload',
    id,
    name: check.text('profession', payload.profession) ?? check.text('name', page.name) ?? '',
    professionStats: {
      id,
      hitDie: check.int('professionStats.hitDie', stats.hitDie) ?? null,
      techAbility: stats.techAbility === null ? '' : check.oneOf('professionStats.techAbility', stats.techAbility, ABILITY_IDS) ?? '',
      levels: check.list('professionStats.levels', stats.levels) ?? null,
      columns: check.list('professionStats.columns', stats.columns) ?? [],
    },
    saveProficiencies: (check.list('saveProficiencies', payload.saveProficiencies) ?? []).filter((s) => ABILITY_IDS.includes(s)),
    proficiencies: toProficiencyList(payload.proficiencies, 'proficiencies', warnings),
    startChoices: [...choiceLabels(payload.skillChoice), ...choiceLabels(payload.proficiencyChoices)],
    startingEquipment: a || b ? { a, b } : null,
    pathLevel: check.int('pathLevel', payload.pathLevel) ?? null,
    features: rows,
    resources,
    choices,
    warnings,
  };
};

export const pathFromPayload = (payload, page = {}, features = null) => {
  const warnings = [];
  const check = checker(warnings);
  const id = check.text('id', payload.id) ?? '';
  const { rows, resources, choices } = levelFeatures(features, `path:${id}`, warnings);
  return {
    source: 'payload',
    id,
    name: check.text('path', payload.path) ?? check.text('name', page.name) ?? '',
    profession: check.text('profession', payload.profession) ?? '',
    features: rows,
    resources,
    choices,
    warnings,
  };
};

export const KIND_NAMES = {
  creature: 'Monsters',
  ship: 'NPC Ships',
  starship: 'Starships',
  vehicle: 'Vehicles',
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
  const mapper = {
    creature: creatureFromPayload,
    ship: npcShipFromPayload,
    technique: techniqueFromPayload,
    item: itemFromPayload,
    proficiency: proficiencyFromPayload,
    species: speciesFromPayload,
    background: backgroundFromPayload,
    profession: professionFromPayload,
    path: pathFromPayload,
    starship: starshipFromPayload,
    vehicle: vehicleFromPayload,
  }[pageKind];
  if (!mapper) {
    const what = KIND_NAMES[pageKind];
    return {
      ok: false,
      error: what
        ? `${what} pages can't be imported yet.`
        : 'This page does not say what it is - no category, and nothing in its payload to tell.',
    };
  }

  const mapped = mapper(read.payload, page, read.features);
  return { ok: true, kind: pageKind, mapped: { ...mapped, warnings: [...read.warnings, ...mapped.warnings] } };
};
