export const FEATURE_GROUPS = [
  { id: 'origin', name: 'Origin' },
  { id: 'profession', name: 'Profession' },
  { id: 'feat', name: 'Feats' },
];

export const FEATURE_GROUP_IDS = FEATURE_GROUPS.map((g) => g.id);

export const DEFAULT_FEATURE_GROUP = 'profession';

const toLevel = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 20 ? n : null;
};

export const normalizeFeature = (row = {}) => ({
  name: typeof row.name === 'string' ? row.name : '',
  text: typeof row.text === 'string' ? row.text : '',
  group: FEATURE_GROUP_IDS.includes(row.group) ? row.group : DEFAULT_FEATURE_GROUP,
  level: toLevel(row.level),
  source: typeof row.source === 'string' ? row.source : '',
  ...(row._id ? { _id: row._id } : {}),
});

const originRank = (source) => {
  if (source.startsWith('species:')) return 0;
  if (source.startsWith('background:')) return 1;
  return 2;
};

export const sortFeatures = (features = []) => {
  const groupRank = (f) => {
    const i = FEATURE_GROUP_IDS.indexOf(f.group);
    return i < 0 ? FEATURE_GROUP_IDS.indexOf(DEFAULT_FEATURE_GROUP) : i;
  };
  return features
    .map((feature, index) => ({ feature, index }))
    .sort((a, b) => {
      const fa = a.feature;
      const fb = b.feature;
      return (
        groupRank(fa) - groupRank(fb) ||
        (fa.group === 'origin' ? originRank(fa.source ?? '') - originRank(fb.source ?? '') : 0) ||
        (fa.level ?? 99) - (fb.level ?? 99) ||
        a.index - b.index
      );
    })
    .map(({ feature }) => feature);
};

export const groupFeatures = (features = []) => {
  const sorted = sortFeatures(features);
  return FEATURE_GROUPS.map((group) => ({
    ...group,
    features: sorted.filter((f) => (FEATURE_GROUP_IDS.includes(f.group) ? f.group : DEFAULT_FEATURE_GROUP) === group.id),
  })).filter((group) => group.features.length);
};

export const featuresFromText = ({ originFeatures = '', professionFeatures = '' } = {}) =>
  [
    { name: 'Origin Features', text: originFeatures, group: 'origin' },
    { name: 'Profession Features', text: professionFeatures, group: 'profession' },
  ]
    .filter((f) => typeof f.text === 'string' && f.text.trim() !== '')
    .map((f) => normalizeFeature({ ...f, text: f.text.trim() }));
