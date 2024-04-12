export const arrayToObject = (array) => {
  const isValidArray = array.every((item) => '_id' in item);

  if (!isValidArray) throw new Error('Tried to objectify an array, but not every item had ids');

  const newObject = {};

  array.forEach((item, index) => {
    const { _id, ...rest } = item;

    newObject[_id] = {
      ...rest,
      arrayPosition: index,
    };
  });

  return newObject;
};

export const objectToArray = (object) => {
  if (!object) return [];

  const newArray = [];
  const objectIds = Object.keys(object);

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

  return newArray.filter((x) => x);
};
