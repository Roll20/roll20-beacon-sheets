import { objectToArray } from "./objectify";

export const normalizeArrays = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeArrays);

  const values = Object.values(obj);
  const isObjectifiedArray =
    values.length > 0 &&
    values.every((item: any) => item && typeof item === 'object' && 'arrayPosition' in item);

  if (isObjectifiedArray) {
    return objectToArray(obj).map(normalizeArrays);
  }

  const result: any = {};
  for (const key in obj) {
    result[key] = normalizeArrays(obj[key]);
  }
  return result;
};