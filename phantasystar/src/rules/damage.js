export const DAMAGE_TYPES = [
  { id: 'physical', name: 'Physical' },
  { id: 'acid', name: 'Acid' },
  { id: 'cold', name: 'Cold' },
  { id: 'fire', name: 'Fire' },
  { id: 'force', name: 'Force' },
  { id: 'lightning', name: 'Lightning' },
  { id: 'necrotic', name: 'Necrotic' },
  { id: 'poison', name: 'Poison' },
  { id: 'psychic', name: 'Psychic' },
  { id: 'radiant', name: 'Radiant' },
  { id: 'spirit', name: 'Spirit' },
];

export const DAMAGE_TYPE_IDS = DAMAGE_TYPES.map((t) => t.id);

const splitList = (text) =>
  String(text ?? '')
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

export const normalizeResistances = (value) => {
  const out = Object.fromEntries(DAMAGE_TYPE_IDS.map((id) => [id, false]));
  out.other = '';

  if (value == null) return out;

  if (typeof value === 'string') {
    const leftover = [];
    for (const part of splitList(value)) {
      const match = DAMAGE_TYPES.find((t) => t.name.toLowerCase() === part.toLowerCase());
      if (match) out[match.id] = true;
      else leftover.push(part);
    }
    out.other = leftover.join(', ');
    return out;
  }

  if (typeof value === 'object') {
    for (const id of DAMAGE_TYPE_IDS) out[id] = !!value[id];
    out.other = typeof value.other === 'string' ? value.other : '';
  }

  return out;
};

export const resistanceLabels = (value) => {
  const res = normalizeResistances(value);
  return [
    ...DAMAGE_TYPES.filter((t) => res[t.id]).map((t) => t.name),
    ...splitList(res.other),
  ];
};
