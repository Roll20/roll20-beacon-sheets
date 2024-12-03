import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import type { CharacterHydrate } from '@/sheet/stores/character/characterStore';
import type { AbilityScoresHydrate } from '@/sheet/stores/abilityScores/abilityScoresStore';
import type { BioHydrate } from '@/sheet/stores/bio/bioStore';

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

export const getAbilityScores = ({ character }: { character: Character }, ...args: any) => {
  console.log('You can pass args to dot notation computed values', args);
  if (!character.attributes?.abilityScores) return {};
  return (character.attributes.abilityScores as AbilityScoresHydrate).abilityScores;
};

export const getBio = ({ character }: { character: Character }) => {
  if (!character.attributes?.bio) return {};
  return (character.attributes.bio as BioHydrate).bio;
};

export const getLife = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character.lifeCurrent;
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
  const oldValue =
    (character.attributes?.character as CharacterHydrate | undefined)?.character?.lifeCurrent ?? 0;
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

export const getHealthPoints = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character.health;
  return {
    current,
  };
}
export const setHealth = (
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character?.lifeCurrent ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        character: {
          character: {
            health: finalValue,
          },
        },
      },
    },
  });
};
export const getMagicPoints = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character.magic;
  return {
    current,
  };
}
export const setMagic = (
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character?.magic ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        character: {
          character: {
            magic: finalValue,
          },
        },
      },
    },
  });
};
export const getStuntPoints = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character.stunts;
  return {
    current,
  };
}
export const setStunts = (
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character?.stunts ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        character: {
          character: {
            stunts: finalValue,
          },
        },
      },
    },
  });
};