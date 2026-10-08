export const normalizeKey = (key) => String(key ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const compact = (object) => {
  const out = {};
  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
};
