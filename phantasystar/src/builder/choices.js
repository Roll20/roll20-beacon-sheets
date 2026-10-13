const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const levelOf = (key) => parseInt(String(key).slice(6), 10);

export const featuresOf = (option, level = 1) => {
  const groups = option?.features ?? {};
  return Object.keys(groups)
    .filter((key) => /^level-\d+$/.test(key) && levelOf(key) <= level)
    .sort((a, b) => levelOf(a) - levelOf(b))
    .flatMap((key) => (Array.isArray(groups[key]) ? groups[key] : [])
      .filter((e) => isObject(e) && typeof e.name === 'string' && e.listed !== false)
      .map((e) => ({
        id: typeof e.id === 'string' ? e.id : '',
        name: e.name,
        level: levelOf(key),
        text: Array.isArray(e.text) ? e.text.filter((p) => typeof p === 'string') : [],
        entry: e,
      })));
};

const SIZE_NAMES = { tiny: 'Tiny', small: 'Small', medium: 'Medium', large: 'Large', huge: 'Huge', gargantuan: 'Gargantuan' };

const named = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((o) => isObject(o) && typeof o.name === 'string' && o.name.trim())
    .map((o) => ({ value: o.name, name: o.name, text: typeof o.text === 'string' ? o.text : '' }));

const slug = (text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const capitalized = (text) => String(text ?? '').replace(/^\w/, (c) => c.toUpperCase());

const asList = (choice) => (Array.isArray(choice) ? choice : choice ? [choice] : []).filter(isObject);

const STEP_FOR_TYPE = { skills: 'skills', proficiency: 'skills', ability: 'abilities', technique: 'techniques' };

const laterChoice = (c, label) => ({
  label,
  step: STEP_FOR_TYPE[c.type] ?? '',
  ...(c.type === 'ability' ? { points: Number.isInteger(c.points) ? c.points : 1 } : {}),
  ...(c.type === 'ability' && Array.isArray(c.from) && c.from.length ? { from: c.from } : {}),
});

const PAYLOAD_CHOICES = [
  ['skillChoice', 'skills'],
  ['proficiencyChoices', 'skills'],
  ['equipmentChoices', 'equipment'],
];

export const choicesOf = (option, level = 1) => {
  const now = [];
  const later = [];
  const payload = option?.payload ?? {};

  if (Array.isArray(payload.size) && payload.size.length > 1) {
    now.push({
      key: 'size',
      label: 'Size',
      count: 1,
      options: payload.size.map((id) => ({ value: id, name: SIZE_NAMES[id] ?? id, text: '' })),
    });
  }

  for (const [field, step] of PAYLOAD_CHOICES) {
    for (const c of asList(payload[field])) if (typeof c.label === 'string') later.push({ label: c.label, step });
    if (field === 'equipmentChoices') {
      for (const c of Array.isArray(payload[field]) ? payload[field] : []) {
        if (typeof c === 'string' && c) later.push({ label: c, step });
      }
    }
  }
  if (isObject(payload.startingEquipment)) later.push({ label: 'Starting equipment', step: 'equipment' });

  for (const feature of featuresOf(option, level)) {
    const { entry } = feature;
    const options = named(entry.options);
    if (options.length) {
      now.push({
        key: `feature:${feature.id}`,
        label: feature.name,
        count: Number.isInteger(entry.pickCount) ? entry.pickCount : 1,
        options,
      });
    }
    const asked = asList(entry.choice).filter((c) => c.type === 'option' && named(c.options).length);
    for (const c of asList(entry.choice)) {
      const picks = named(c.options);
      if (c.type === 'option' && picks.length && !options.length) {
        const first = asked.indexOf(c) === 0;
        now.push({
          key: first ? `feature:${feature.id}` : `feature:${feature.id}:${slug(c.label)}`,
          label: asked.length > 1 ? `${feature.name}: ${capitalized(c.label)}` : feature.name,
          count: Number.isInteger(c.count) ? c.count : 1,
          options: picks,
        });
      } else if (typeof c.label === 'string') {
        later.push(laterChoice(c, `${feature.name}: ${c.label}`));
      }
    }
  }

  const groups = option?.features ?? {};
  for (const key of Object.keys(groups).filter((k) => /^level-\d+$/.test(k) && levelOf(k) <= level)) {
    for (const entry of Array.isArray(groups[key]) ? groups[key] : []) {
      if (!isObject(entry) || entry.listed !== false) continue;
      for (const c of asList(entry.choice)) {
        if (c.type === 'option' || typeof c.label !== 'string') continue;
        later.push(laterChoice(c, c.label));
      }
    }
  }

  return { now, later };
};

export const pathLevelOf = (option) =>
  Number.isInteger(option?.payload?.pathLevel) ? option.payload.pathLevel : null;

export const needsOf = (option, level = 1, { kind } = {}) => {
  const { now, later } = choicesOf(option, level);
  const needs = Object.fromEntries(now.map((c) => [c.key, c.count]));
  const pathLevel = pathLevelOf(option);
  if (kind === 'profession' && pathLevel != null && level >= pathLevel) needs.path = 1;
  const points = later.filter((c) => c.step === 'abilities').reduce((sum, c) => sum + c.points, 0);
  if (points) needs['later:abilities'] = points;
  const limited = later.filter((c) => c.step === 'abilities' && c.from).length;
  if (limited) needs['later:abilityPicks'] = limited;
  return needs;
};
