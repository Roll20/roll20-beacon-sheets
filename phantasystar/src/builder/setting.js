export const SETTINGS = [
  { id: 'classic', name: 'Classic' },
  { id: 'pso', name: 'PSO' },
  { id: 'any', name: 'Any' },
];

export const DEFAULT_SETTING = 'classic';

const valid = (id) => (SETTINGS.some((s) => s.id === id) ? id : '');

export const builderSetting = (draft, gameSetting) => valid(draft?.setting) || valid(gameSetting) || DEFAULT_SETTING;

export const pageSettings = (option) => {
  const listed = option?.payload?.settings;
  const raw = Array.isArray(listed) && listed.length
    ? listed
    : String(option?.properties?.Setting ?? '').split(',');
  return raw.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
};

export const inSetting = (option, setting) => {
  if (setting === 'any') return true;
  const settings = pageSettings(option);
  return !settings.length || settings.includes('all') || settings.includes(setting);
};

export const settingNames = (option) =>
  pageSettings(option).map((id) => SETTINGS.find((s) => s.id === id)?.name ?? id).join(', ');
