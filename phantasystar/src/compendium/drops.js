import { PC, NPC, CREATURE, NPC_SHIP, STARSHIP } from '../sheetTypes.js';
import { KIND_NAMES } from './payload.js';

export const dropPlan = (kind, { sheetType, npcMode } = {}) => {
  const creatureSheet = sheetType === NPC && npcMode === CREATURE;
  const shipSheet = sheetType === NPC && npcMode === NPC_SHIP;
  switch (kind) {
    case 'technique':
      return sheetType === PC ? { apply: 'technique' } : { refuse: 'Techniques drop onto a player character.' };
    case 'creature':
      return creatureSheet
        ? { apply: 'creature' }
        : { refuse: 'Monsters drop onto a creature NPC, or onto the map.' };
    case 'ship':
      return shipSheet ? { apply: 'ship' } : { refuse: 'NPC Ships drop onto an NPC ship.' };
    case 'starship':
      return sheetType === STARSHIP
        ? { apply: 'starship' }
        : { refuse: 'Starships drop onto a starship, or onto the map.' };
    case 'vehicle':
      if (sheetType === PC) return { apply: 'vehicleList' };
      return sheetType === STARSHIP
        ? { apply: 'vehicle' }
        : { refuse: 'Vehicles drop onto a character, a starship sheet, or the map.' };
    case 'item':
      return sheetType === PC ? { apply: 'item' } : { refuse: 'Items drop onto a player character.' };
    case 'proficiency':
      return sheetType === PC
        ? { apply: 'proficiency' }
        : { refuse: 'Proficiencies drop onto a player character.' };
    case 'species':
    case 'background':
    case 'profession':
    case 'path':
      return sheetType === PC
        ? { apply: kind }
        : { refuse: `${KIND_NAMES[kind]} drop onto a player character.` };
    default:
      return { refuse: `${KIND_NAMES[kind] ?? 'Those'} pages can't be dropped yet.` };
  }
};

export const BACKGROUND_MAX_RANK = 3;

export const backgroundRanks = (skills = {}, skillRanks = {}, levelCap = BACKGROUND_MAX_RANK) => {
  const cap = Math.min(BACKGROUND_MAX_RANK, levelCap);
  const set = {};
  let leftover = 0;
  for (const [id, add] of Object.entries(skillRanks)) {
    if (!skills[id]) continue;
    const now = parseInt(skills[id].ranks, 10) || 0;
    const next = Math.min(cap, now + add);
    if (next > now) set[id] = next;
    leftover += add - Math.max(0, next - now);
  }
  return { set, leftover };
};

const titled = (id) => String(id ?? '').split('_').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export const professionDrop = ({ profession = '', professionStats = {} } = {}, mapped = {}) => {
  const haveId = professionStats?.id || '';
  const haveName = String(profession ?? '').trim();
  if (!haveId && !haveName) return { mode: 'new' };
  if (haveId === mapped.id) return { mode: 'refresh' };
  if (!haveId && sameName(haveName, mapped.name)) return { mode: 'new' };
  return { refuse: `Already a ${haveName || titled(haveId)}. Remove the profession to change it.` };
};

export const pathDrop = ({ profession = '', professionStats = {}, path = '' } = {}, mapped = {}) => {
  const haveProfession = professionStats?.id || String(profession ?? '').trim();
  if (!haveProfession) return { refuse: 'Paths drop onto a character with a profession.' };
  const ours = professionStats?.id ? professionStats.id === mapped.profession : sameName(profession, titled(mapped.profession));
  if (!ours) return { refuse: `${mapped.name} is a ${titled(mapped.profession)} path.` };
  const haveId = professionStats?.pathId || '';
  const haveName = String(path ?? '').trim();
  if (!haveId && !haveName) return { mode: 'new' };
  if (haveId === mapped.id) return { mode: 'refresh' };
  if (!haveId && sameName(haveName, mapped.name)) return { mode: 'new' };
  return { refuse: `Already on the ${haveName || titled(haveId)} path. Remove it to change it.` };
};

export const mergeLevelFeatures = (features = [], incoming = [], prefix = '', newId = () => '') => {
  const ours = (f) => String(f.source ?? '').startsWith(prefix);
  const before = new Map(features.filter(ours).map((f) => [`${f.source}|${f.ref}`, f]));
  const added = incoming.map((row) => {
    const prev = before.get(`${row.source}|${row.ref}`);
    return {
      ...row,
      _id: prev?._id ?? newId(),
      pick: prev?.pick || row.pick || '',
      riderOn: prev?.riderOn === true,
      granted: prev?.granted ?? '',
    };
  });
  return [...features.filter((f) => !ours(f)), ...added];
};

export const mergeLevelResources = (resources = [], incoming = [], features = [], newId = () => '') => {
  const featureId = new Map(features.map((f) => [`${f.source}|${f.ref}`, f._id]));
  const out = resources.filter((r) => features.some((f) => f._id === r.feature));
  for (const row of incoming) {
    const feature = featureId.get(`${row.source}|${row.ref}`);
    if (!feature) continue;
    const name = row.name ?? '';
    const prev = out.find((r) => r.feature === feature && (r.name ?? '') === name);
    const fresh = { feature, name, max: row.max, recovery: row.recovery, pool: !!row.pool, unit: row.unit ?? '' };
    if (prev) Object.assign(prev, fresh);
    else out.push({ _id: newId(), ...fresh, maxOverride: null, used: 0 });
  }
  return out;
};

export const choicesAtLevel = (choices = [], level = 1) =>
  choices.filter((c) => !c.level || c.level <= level).map((c) => c.label);

export const sameName = (a, b) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

export const refreshTechnique = (entry, { fields = {}, extras = {} } = {}) => ({
  ...entry,
  ...extras,
  fields: { ...entry.fields, ...fields },
});

const STACKS = ['consumable', 'gear'];

export const equipmentPlan = (equipment = [], rows = []) => {
  const plan = [];
  const bumps = new Map();
  for (const row of rows) {
    const by = Math.max(1, parseInt(row.quantity, 10) || 1);
    const existing = STACKS.includes(row.itemType)
      ? equipment.find((e) => STACKS.includes(e.itemType) && sameName(e.name, row.name))
      : null;
    if (!existing) {
      plan.push({ add: row });
      continue;
    }
    if (!bumps.has(existing)) {
      const step = { bump: existing._id, by: 0 };
      bumps.set(existing, step);
      plan.push(step);
    }
    bumps.get(existing).by += by;
  }
  return plan;
};

export const isBlankCreature = ({ hp, cr, traits, actions } = {}) =>
  !(hp?.max > 0) && !String(cr ?? '').trim() && !traits?.length && !actions?.length;

export const isBlankShip = ({ hull, traits, actions } = {}) =>
  !(hull?.max > 0) && !traits?.length && !actions?.length;
