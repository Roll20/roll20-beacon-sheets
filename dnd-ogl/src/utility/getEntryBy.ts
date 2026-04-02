type Entry = {
  _id: string;
  label: string;
};
type ObjectAsArray = Array<Entry>;

const getEntryBy = (field: '_id' | 'label', value: string, pool: ObjectAsArray | Array<ObjectAsArray>): Entry | undefined => {
  const isNested = Array.isArray(pool[0]);

  const pools: Array<ObjectAsArray> = isNested
    ? (pool as Array<ObjectAsArray>)
    : [pool as ObjectAsArray];

  for (const list of pools) {
    const found = list.find(p => p[field] === value);
    if (found) return found;
  }
  return undefined;
};

export const getEntryById = (id: string, pool: ObjectAsArray | Array<ObjectAsArray>): Entry | undefined => {
  return getEntryBy(
    '_id',
    id,
    pool,
  );
};

export const getEntryByLabel = (label: string, pool: ObjectAsArray | Array<ObjectAsArray>): Entry | undefined => {
  return getEntryBy(
    'label',
    label,
    pool,
  );
};