export const arrayToObject = (array: { _id: string; [x: string]: any }[]) => {
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
  const newArray: any[] = [];
  const objectIds = Object.keys(object) as (keyof typeof object)[];
  objectIds.forEach((key) => {
    if (object[key]) {
      const position = object[key].arrayPosition;
      const item = {
        _id: key,
        ...object[key],
        arrayPosition: undefined,
      };
      newArray[position] = item;
    }
  });
  return newArray.filter((x) => x); // Remove all undefined values in case of deletes
};

export const arrayToIndexedObject = <T>(arr: T[]): Record<string, T> =>{
  return arr.reduce((acc, val, idx) => {
    acc[idx] = val;
    return acc;
  }, {} as Record<string, T>);
};

export const indexedObjectToArray = <T>(obj: Record<string, T>): T[] => {
  if (!obj) return [];
  return Object.keys(obj)
    .map(k => [parseInt(k), obj[k]] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([, value]: [number, T]) => value);
};
