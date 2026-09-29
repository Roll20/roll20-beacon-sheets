export const WEAPON_TYPES = [
  { id: 'axes', name: 'Axes' },
  { id: 'bows', name: 'Bows' },
  { id: 'claws', name: 'Claws' },
  { id: 'fists', name: 'Fists', parent: 'claws' },
  { id: 'daggers', name: 'Daggers' },
  { id: 'fangs', name: 'Fangs', parent: 'daggers' },
  { id: 'greatswords', name: 'Greatswords' },
  { id: 'partisans', name: 'Partisans', parent: 'greatswords' },
  { id: 'pistols', name: 'Pistols' },
  { id: 'gunblades', name: 'Gunblades', parent: 'pistols' },
  { id: 'rifles', name: 'Rifles' },
  { id: 'vulcans', name: 'Vulcans', parent: 'rifles' },
  { id: 'rods', name: 'Rods' },
  { id: 'slashers', name: 'Slashers' },
  { id: 'swords', name: 'Swords' },
  { id: 'double_sabers', name: 'Double Sabers', parent: 'swords' },
];

export const WEAPON_TYPE_IDS = WEAPON_TYPES.map((w) => w.id);

export const getWeaponType = (id) => WEAPON_TYPES.find((w) => w.id === id) ?? null;

export const ARMOR_PROFICIENCIES = [
  { id: 'light_armor', name: 'Light' },
  { id: 'medium_armor', name: 'Medium' },
  { id: 'heavy_armor', name: 'Heavy' },
  { id: 'shields', name: 'Shields' },
];

export const ARMOR_PROFICIENCY_IDS = ARMOR_PROFICIENCIES.map((a) => a.id);

export const TOOLS = [
  { id: 'alchemists_supplies', name: 'Alchemist’s Supplies' },
  { id: 'cartographers_tools', name: 'Cartographer’s Tools' },
  { id: 'cooking_supplies', name: 'Cooking Supplies' },
  { id: 'cybersmiths_tools', name: 'Cybersmith’s Tools' },
  { id: 'demolition_tools', name: 'Demolition Tools' },
  { id: 'digital_technicians_tools', name: 'Digital Technician’s Tools' },
  { id: 'gunsmiths_tools', name: 'Gunsmith’s Tools' },
  { id: 'metalworkers_tools', name: 'Metalworker’s Tools' },
  { id: 'tailoring_supplies', name: 'Tailoring Supplies' },
  { id: 'disguise_kit', name: 'Disguise Kit' },
  { id: 'forgery_kit', name: 'Forgery Kit' },
  { id: 'gaming_set', name: 'Gaming Set' },
  { id: 'hackers_kit', name: 'Hacker’s Kit' },
  { id: 'infiltration_tools', name: 'Infiltration Tools' },
  { id: 'musical_instrument', name: 'Musical Instrument' },
];

export const TOOL_IDS = TOOLS.map((t) => t.id);

export const VEHICLES = [
  { id: 'beast_mounts', name: 'Beast Mounts' },
  { id: 'groundcraft', name: 'Groundcraft' },
  { id: 'watercraft', name: 'Watercraft' },
  { id: 'space', name: 'Space' },
];

export const VEHICLE_IDS = VEHICLES.map((v) => v.id);

const KINDS = {
  armor: ARMOR_PROFICIENCY_IDS,
  weapon: WEAPON_TYPE_IDS,
  mastery: WEAPON_TYPE_IDS,
  tool: TOOL_IDS,
  vehicle: VEHICLE_IDS,
};

const flags = (ids, from = {}) => Object.fromEntries(ids.map((id) => [id, !!from?.[id]]));

const splitList = (text) =>
  String(text ?? '')
    .split(/[,;\n]+|\band\b/i)
    .map((part) => part.trim())
    .filter(Boolean);

const simplify = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const matchName = (part, list) => {
  const wanted = simplify(part);
  return list.find((entry) => {
    const name = simplify(entry.name);
    return wanted === name || wanted === name.replace(/s$/, '') || `${wanted}s` === name;
  });
};

const fromOldShape = (old) => {
  const out = emptyProficiencies();
  out.armor.light_armor = !!old.armorLight;
  out.armor.medium_armor = !!old.armorMedium;
  out.armor.heavy_armor = !!old.armorHeavy;
  out.armor.shields = !!old.shields;

  const leftover = { weapon: [], tool: [] };
  for (const part of splitList(old.weapons)) {
    const match = matchName(part, WEAPON_TYPES);
    if (match) out.weapon[match.id] = true;
    else leftover.weapon.push(part);
  }
  for (const part of splitList(old.tools)) {
    const tool = matchName(part, TOOLS);
    const vehicle = matchName(part.replace(/^vehicles?\s*\(?|\)$/gi, ''), VEHICLES);
    if (tool) out.tool[tool.id] = true;
    else if (vehicle) out.vehicle[vehicle.id] = true;
    else leftover.tool.push(part);
  }
  out.otherWeapons = leftover.weapon.join(', ');
  out.otherTools = leftover.tool.join(', ');
  return out;
};

export const CUSTOM_PROFICIENCY_KINDS = ['weapon', 'tool', 'vehicle'];

const BUILT_IN = { weapon: WEAPON_TYPES, tool: TOOLS, vehicle: VEHICLES };

export const emptyProficiencies = () => ({
  ...Object.fromEntries(Object.entries(KINDS).map(([kind, ids]) => [kind, flags(ids)])),
  custom: [],
  otherWeapons: '',
  otherTools: '',
});

export const proficiencyId = (name) =>
  simplify(name).replace(/ /g, '_');

export const normalizeCustomProficiency = (row = {}) => {
  if (!row || typeof row !== 'object') return null;
  const kind = CUSTOM_PROFICIENCY_KINDS.includes(row.kind) ? row.kind : null;
  const name = typeof row.name === 'string' ? row.name : '';
  const id = typeof row.id === 'string' && row.id ? row.id : proficiencyId(name);
  if (!kind || !id) return null;
  return {
    ...(row._id ? { _id: row._id } : {}),
    kind,
    id,
    name,
    parent: kind === 'weapon' && typeof row.parent === 'string' ? row.parent : '',
    mastery: kind === 'weapon' && !!row.mastery,
  };
};

export const normalizeProficiencies = (value) => {
  if (!value || typeof value !== 'object') return emptyProficiencies();

  const isNewShape = Object.keys(KINDS).some((kind) => value[kind] && typeof value[kind] === 'object');
  if (!isNewShape) return fromOldShape(value);

  const out = emptyProficiencies();
  for (const [kind, ids] of Object.entries(KINDS)) out[kind] = flags(ids, value[kind]);
  out.custom = (Array.isArray(value.custom) ? value.custom : [])
    .map(normalizeCustomProficiency)
    .filter(Boolean);
  out.otherWeapons = typeof value.otherWeapons === 'string' ? value.otherWeapons : '';
  out.otherTools = typeof value.otherTools === 'string' ? value.otherTools : '';
  return out;
};

export const planProficiency = (proficiencies, { kind, name = '', id = '', parent = '' } = {}) => {
  if (!CUSTOM_PROFICIENCY_KINDS.includes(kind)) return null;
  const wantedId = id || proficiencyId(name);
  if (!wantedId) return null;
  const builtIn = BUILT_IN[kind].find((e) => e.id === wantedId) ?? matchName(name, BUILT_IN[kind]);
  if (builtIn) return { builtIn: builtIn.id };
  if ((proficiencies?.custom ?? []).some((c) => c.kind === kind && c.id === wantedId)) return null;
  return { custom: normalizeCustomProficiency({ kind, id: wantedId, name: name.trim() || wantedId, parent }) };
};

const customOf = (proficiencies, kind) => (proficiencies?.custom ?? []).filter((c) => c.kind === kind);

export const weaponTypesFor = (proficiencies) => [
  ...WEAPON_TYPES,
  ...customOf(proficiencies, 'weapon').map((c) => ({ id: c.id, name: c.name, parent: c.parent || undefined, custom: true })),
];

export const findWeaponType = (proficiencies, typeId) =>
  weaponTypesFor(proficiencies).find((w) => w.id === typeId) ?? null;

const holdsWeapon = (proficiencies, id) =>
  !!proficiencies?.weapon?.[id] || customOf(proficiencies, 'weapon').some((c) => c.id === id);

const mastersWeapon = (proficiencies, id) =>
  !!proficiencies?.mastery?.[id] || customOf(proficiencies, 'weapon').some((c) => c.id === id && c.mastery);

export const isWeaponProficient = (proficiencies, typeId) => {
  const type = findWeaponType(proficiencies, typeId);
  if (!type) return false;
  return holdsWeapon(proficiencies, type.id) || (!!type.parent && holdsWeapon(proficiencies, type.parent));
};

export const hasWeaponMastery = (proficiencies, typeId) => {
  const type = findWeaponType(proficiencies, typeId);
  if (!type || !isWeaponProficient(proficiencies, typeId)) return false;
  return mastersWeapon(proficiencies, type.id) || (!!type.parent && mastersWeapon(proficiencies, type.parent));
};

export const weaponProficiencyList = (proficiencies) => [
  ...WEAPON_TYPES.filter((w) => proficiencies?.weapon?.[w.id]).map((w) => ({
    ...w,
    mastered: !!proficiencies?.mastery?.[w.id],
  })),
  ...customOf(proficiencies, 'weapon').map((c) => ({ id: c.id, name: c.name, mastered: c.mastery })),
];

export const toolProficiencyLabels = (proficiencies) => [
  ...TOOLS.filter((t) => proficiencies?.tool?.[t.id]).map((t) => t.name),
  ...customOf(proficiencies, 'tool').map((c) => c.name),
  ...VEHICLES.filter((v) => proficiencies?.vehicle?.[v.id]).map((v) => `Vehicles (${v.name})`),
  ...customOf(proficiencies, 'vehicle').map((c) => `Vehicles (${c.name})`),
];
