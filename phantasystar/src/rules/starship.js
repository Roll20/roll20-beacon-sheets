const int = (v) => Math.trunc(Number(v) || 0);

export const STARSHIP_SIZES = [
  { id: 'solitary', name: 'Solitary', space: '½ by ½' },
  { id: 'small', name: 'Small', space: '1 by 1' },
  { id: 'medium', name: 'Medium', space: '1 by 1' },
  { id: 'large', name: 'Large', space: '2 by 2' },
];

export const STARSHIP_SIZE_IDS = STARSHIP_SIZES.map((s) => s.id);

export const getStarshipSize = (id) => STARSHIP_SIZES.find((s) => s.id === id) ?? null;

export const UNIT_FEET = 50;

export const unitsToFeet = (units) => int(units) * UNIT_FEET;

export const CREW_ROLES = [
  { id: 'pilot', name: 'Pilot', abilities: ['dexterity', 'wisdom'] },
  { id: 'copilot', name: 'Co-Pilot', abilities: ['dexterity', 'wisdom'] },
  { id: 'technician1', name: 'Technician 1', abilities: ['intelligence', 'wisdom'] },
  { id: 'technician2', name: 'Technician 2', abilities: ['intelligence', 'wisdom'] },
];

export const CREW_ROLE_IDS = CREW_ROLES.map((r) => r.id);

export const vehicleBonus = (saveBonus, proficient) => (proficient ? int(saveBonus) : 0);

const MEMBER_STATS = ['dexterity', 'intelligence', 'wisdom', 'saveBonus'];

export const blankCrewMember = (id, name = '') => ({
  _id: id,
  name,
  dexterity: 0,
  intelligence: 0,
  wisdom: 0,
  saveBonus: 0,
  proficient: false,
});

export const normalizeCrewMember = (row = {}) => {
  const member = blankCrewMember(row._id, row.name ?? '');
  for (const key of MEMBER_STATS) member[key] = int(row[key]);
  member.proficient = !!row.proficient;
  return member;
};

export const seatStats = (member) => ({
  memberId: member?._id ?? '',
  name: member?.name ?? '',
  dexterity: int(member?.dexterity),
  intelligence: int(member?.intelligence),
  wisdom: int(member?.wisdom),
  saveBonus: int(member?.saveBonus),
  proficient: !!member?.proficient,
});

const isBlankMember = (m) => MEMBER_STATS.every((k) => int(m[k]) === 0) && !m.proficient;

const nameKey = (name) => String(name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

export const assignCrewMember = (roster, { name = '', stats = {} } = {}, makeId, fallbackName = '') => {
  const typed = String(name ?? '').trim();
  const hasStats = MEMBER_STATS.some((k) => int(stats[k]) !== 0) || !!stats.proficient;
  if (!typed && !hasStats) return '';

  const label = typed || fallbackName;
  let member = roster.find((m) => nameKey(m.name) === nameKey(label));

  if (!member) {
    member = blankCrewMember(makeId(), label);
    roster.push(member);
  }
  if (isBlankMember(member)) {
    for (const k of MEMBER_STATS) if (k in stats) member[k] = int(stats[k]);
    if ('proficient' in stats) member.proficient = !!stats.proficient;
  }
  return member._id;
};

export const pilotingBonus = (dexMod, saveBonus = 0, proficient = false) =>
  int(dexMod) + vehicleBonus(saveBonus, proficient);

export const maneuverSaveDC = (dexMod, saveBonus = 0, proficient = false) =>
  8 + pilotingBonus(dexMod, saveBonus, proficient);

export const maneuverDefense = (wisMod, saveBonus = 0, proficient = false, misc = 0) =>
  8 + int(wisMod) + vehicleBonus(saveBonus, proficient) + int(misc);

export const maneuverDefenseSeat = (pilot, copilot) => (copilot?.memberId ? copilot : pilot);

export const crewSaveBonus = (member, abilityId) =>
  int(member?.[abilityId]) + vehicleBonus(member?.saveBonus, member?.proficient);

export const shipDefense = ({
  baseDefense = 0,
  maneuverability = 0,
  pilotDexMod = 0,
  misc = 0,
} = {}) => int(baseDefense) + int(maneuverability) + int(pilotDexMod) + int(misc);

export const maxHullPoints = (baseHullPoints, defenseModifier, technicianIntMod) =>
  int(baseHullPoints) + int(defenseModifier) * int(technicianIntMod);

export const maxStructuralIntegrity = (baseSi, technicianWisMod) =>
  int(baseSi) + int(technicianWisMod);

export const weaponAttackPower = (gunnerDexMod, gunnerSaveBonus = 0, proficient = true) =>
  int(gunnerDexMod) + vehicleBonus(gunnerSaveBonus, proficient);

export const PATCH_REPAIR_MAX_DICE = 2;

export const patchRepairFormula = ({
  hullDie = 'd10',
  dice = PATCH_REPAIR_MAX_DICE,
  siSpent = 0,
  technicianWisMod = 0,
} = {}) => {
  const die = String(hullDie).trim().replace(/^d?/i, 'd');
  const count = Math.max(1, int(dice) + Math.max(0, int(siSpent)));
  const mod = int(technicianWisMod);
  if (mod === 0) return `${count}${die}`;
  return `${count}${die} ${mod > 0 ? '+' : '-'} ${Math.abs(mod)}`;
};

export const zeroHullSaveDC = (currentSi) => 15 - int(currentSi);

export const SI_REPAIR_COST_PER_POINT = 1000;

export const siRepairCost = (points) => Math.max(0, int(points)) * SI_REPAIR_COST_PER_POINT;

export const siLossThreshold = (maxHlp) => Math.ceil(Math.max(0, int(maxHlp)) / 2);

export const STARSHIP_PRICES = [
  { id: 'small-starfighter', name: 'Small Starfighter', cost: 8000 },
  { id: 'starfighter', name: 'Starfighter', cost: 12000 },
  { id: 'light-freighter', name: 'Light Freighter', cost: 35000 },
  { id: 'heavy-freighter', name: 'Heavy Freighter', cost: 60000 },
];
