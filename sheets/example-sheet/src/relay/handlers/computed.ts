import type { Character, Dispatch } from '@roll20/charsheet-relay-sdk';

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

export const getAbilityScores = ({ character }: { character: Character }, ...args) => {
  console.log('You can pass args to dot notation computed values', args);
  if (!character.attributes?.abilityScores) return {};
  return character.attributes.abilityScores.abilityScores;
};

export const getBio = ({ character }: { character: Character }) => {
  if (!character.attributes?.bio) return {};
  return character.attributes.bio.bio;
};

export const getLife = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = character.attributes.character.character.lifeCurrent;
  return {
    current,
  };
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
  const oldValue = character.attributes?.character?.character?.lifeCurrent ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        character: {
          character: {
            lifeCurrent: finalValue,
          },
        },
      },
    },
  });
};
