import { PC, NPC, CREATURE, NPC_SHIP } from '../sheetTypes.js';
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
    case 'item':
      return sheetType === PC ? { apply: 'item' } : { refuse: 'Items drop onto a player character.' };
    case 'proficiency':
      return sheetType === PC
        ? { apply: 'proficiency' }
        : { refuse: 'Proficiencies drop onto a player character.' };
    default:
      return { refuse: `${KIND_NAMES[kind] ?? 'Those'} pages can't be dropped yet.` };
  }
};

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
