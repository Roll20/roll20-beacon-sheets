import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import type { CharacterHydrate } from '@/sheet/stores/character/characterStore';

/*
applyChange is a helper function that takes an old value and a new value and returns the new value.
It accounts for the possibility of the new value being a string with a + or - operator.
*/
const applyChange = (oldValue: number, newValue: number | string) => {
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

export const setLife = (
  {
    character,
    dispatch,
  }: {
    character: Character;
    dispatch: Dispatch;
  },
  ...args: any[]
) => {
  const newValue = args[0];
  const oldValue =
    (character.attributes?.character as CharacterHydrate | undefined)?.character?.healthCondition ??
    0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        character: {
          character: {
            healthCurrent: finalValue,
          },
        },
      },
    },
  });
};
