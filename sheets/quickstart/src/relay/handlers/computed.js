/*
applyChange is a helper function that takes an old value and a new value and returns the new value.
It accounts for the possibility of the new value being a string with a + or - operator.
*/
const applyChange = (oldValue, newValue) => {
  if (typeof newValue === 'string') newValue = newValue.trim();
  const operator = typeof newValue === 'string' ? newValue[0] : false;
  if (typeof newValue === 'string' && (operator === '-' || operator === '+')) {
    const intValue = parseInt(newValue.substring(1));
    if (isNaN(intValue)) return oldValue;
    if (operator === '+') return oldValue + intValue;
    if (operator === '-') return oldValue - intValue;
    else return oldValue;
  } else {
    const intValue = typeof newValue === 'string' ? parseInt(newValue) : newValue;
    if (isNaN(intValue)) return oldValue;
    return intValue;
  }
};

export const getName = ({ character }, ...args) => {
  return character.meta?.name;
};
