const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const names = (value) => String(value ?? '').split('|').filter(Boolean);

export const kitOf = (profession) => profession?.payload?.startingEquipment ?? profession?.startingEquipment ?? null;

export const equipmentPicks = ({ professionName = '', kitPicks = [], backgroundName = '', backgroundPicks = [] } = {}, chosen = {}) => {
  const out = [];
  const add = (key, source, pick) => {
    if (!isObject(pick) || pick.type === 'gear') return;
    const count = Number.isInteger(pick.count) ? pick.count : 1;
    if (pick.type === 'option') {
      const options = (pick.options ?? []).filter((o) => isObject(o) && o.name);
      out.push({ key, source, label: pick.label ?? '', type: 'option', count: 1, options: options.map((o) => o.name) });
      const option = options.find((o) => o.name === chosen[key]);
      (option?.picks ?? []).forEach((p, j) => add(`${key}:${j}`, source, p));
      return;
    }
    out.push({
      key, source, label: pick.label ?? '', type: pick.type, count,
      from: Array.isArray(pick.from) ? pick.from : null, plain: !!pick.plain,
    });
  };
  kitPicks.forEach((p, i) => add(`profession:${professionName}:kit:${i}`, professionName, p));
  backgroundPicks.forEach((p, i) => add(`background:${backgroundName}:gear:${i}`, backgroundName, p));
  return out;
};

export const optionItems = ({ professionName = '', kitPicks = [] } = {}, chosen = {}) =>
  kitPicks.flatMap((pick, i) => {
    if (!isObject(pick) || pick.type !== 'option') return [];
    const option = (pick.options ?? []).find((o) => o?.name === chosen[`profession:${professionName}:kit:${i}`]);
    return Array.isArray(option?.items) ? option.items : [];
  });

export const kitGear = (kitPicks = []) =>
  kitPicks.filter((p) => isObject(p) && p.type === 'gear').flatMap((p) => p.items ?? []).filter((g) => g?.name);

export const starterWeapon = (option) => {
  const p = option?.payload;
  if (p?.itemType !== 'weapon' || Number(p.grade) !== 0) return null;
  return { name: option.pageName, type: p.type ?? '', weaponType: option.properties?.['Weapon Type'] ?? '', setting: option.properties?.Setting ?? '' };
};

export const equipmentComplete = (kit, picks, chosen = {}) =>
  !!kit && picks.every((p) => names(chosen[p.key]).length >= p.count);

export const equipmentBasis = (draft) =>
  [draft?.profession?.pageName ?? '', draft?.background?.pageName ?? ''].join('|');
