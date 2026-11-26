export const DROP_LOG_CAP = 12;

const text = (value) => (value == null ? '' : String(value));

export const normalizeDrop = (event, now = () => new Date().toISOString()) => {
  const drop = event?.dropData ?? null;
  const coordinates = event?.coordinates ?? null;
  return {
    at: now(),
    pageName: text(drop?.pageName),
    categoryName: text(drop?.categoryName),
    expansionId: text(drop?.expansionId),
    keys: drop && typeof drop === 'object' ? Object.keys(drop) : [],
    coordinates:
      coordinates && typeof coordinates === 'object'
        ? { x: coordinates.x ?? null, y: coordinates.y ?? null }
        : null,
  };
};

export const recordDrop = (log, entry, cap = DROP_LOG_CAP) =>
  [entry, ...(Array.isArray(log) ? log : [])].slice(0, Math.max(1, cap));

export const dropSummary = (entry) => {
  const name = entry?.pageName || '(no page name)';
  const category = entry?.categoryName ? ` - ${entry.categoryName}` : '';
  const keys = entry?.keys?.length ? ` [${entry.keys.join(', ')}]` : ' [no keys]';
  return `${name}${category}${keys}`;
};
