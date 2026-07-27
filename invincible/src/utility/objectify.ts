import { z } from 'zod';

export const arrayToObject = (array: { _id: string;[x: string]: any }[]) => {
  const isValidArray = array.every((item) => '_id' in item);
  if (!isValidArray) throw new Error('Tried to objectify an array, but not every item had ids');
  const newObject: Record<string, any> = {};
  array.forEach((item, index) => {
    const { _id, ...rest } = item;
    newObject[_id] = {
      ...rest,
      arrayPosition: index,
    };
  });
  return newObject;
};

export const objectToArray = (object: Record<string, any>) => {
  if (!object) return [];
  const items: any[] = [];
  Object.keys(object).forEach((key) => {
    const val = object[key];
    if (val && typeof val === 'object') {
      items.push({
        _id: key,
        ...val,
      });
    }
  });

  
  items.sort((a, b) => {
    const posA = a.arrayPosition;
    const posB = b.arrayPosition;
    const hasA = typeof posA === 'number' && !isNaN(posA);
    const hasB = typeof posB === 'number' && !isNaN(posB);
    if (hasA && hasB) return posA - posB;
    if (hasA) return -1;
    if (hasB) return 1;
    return 0;
  });

  
  return items.map(({ arrayPosition, ...rest }) => rest);
};

export const firebaseMapToArray = (object: Record<string, any>) => {
  if (!object) return [];
  const newArray: any[] = [];
  Object.keys(object).forEach((key) => {
    const idx = parseInt(key, 10);
    if (!isNaN(idx)) {
      newArray[idx] = object[key];
    }
  });
  return newArray.filter(item => item !== undefined && item !== null);
};

export const flexibleArray = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      if (!val.trim()) return [];
      try {
        const parsed = JSON.parse(val);
        val = parsed;
      } catch (e) {
        return [];
      }
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const keys = Object.keys(val);
      const values = Object.values(val);
      const isObjectifiedArray = values.length > 0 && values.every((item: any) => item && typeof item === 'object' && 'arrayPosition' in item);
      if (isObjectifiedArray) {
        val = objectToArray(val as Record<string, any>);
      } else {
        const isIndexMap = keys.length > 0 && keys.every(key => !isNaN(parseInt(key, 10)));
        if (isIndexMap) {
          val = firebaseMapToArray(val as Record<string, any>);
        } else {
          val = objectToArray(val as Record<string, any>);
        }
      }
    }
    if (Array.isArray(val)) {
      return val.filter((item) => item !== null && item !== undefined);
    }
    return val;
  }, z.array(itemSchema).default([]));
};

export const objectifiedArray = flexibleArray;

export const flexibleNumber = z.coerce.number().default(0);

export const flexibleString = z.preprocess(
  (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str === 'null' || str === 'undefined') return '';
    return str;
  },
  z.string().default('')
);

export const flexibleBoolean = z.preprocess(
  (val) => (val === null || val === undefined ? false : Boolean(val)),
  z.boolean().default(false)
);

export const nullableDefault = <T extends z.ZodTypeAny>(schema: T, defaultValue: any) => {
  return z.preprocess(
    (val) => (val === null || val === undefined ? defaultValue : val),
    schema.default(defaultValue)
  );
};
