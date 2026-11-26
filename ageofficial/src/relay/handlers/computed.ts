import type { Character, Dispatch } from "@roll20-official/beacon-sdk";
import type { CharacterHydrate } from "@/sheet/stores/character/characterStore";
import type { AbilityScoresHydrate } from "@/sheet/stores/abilityScores/abilityScoresStore";
import type { BioHydrate } from "@/sheet/stores/bio/bioStore";

/*
applyChange is a helper function that takes an old value and a new value and returns the new value.
It accounts for the possibility of the new value being a string with a + or - operator.
*/
const applyChange = (oldValue: number, newValue: number | string) => {
  if (typeof newValue === "string") newValue = newValue.trim();
  const operator = typeof newValue === "string" ? newValue[0] : false;
  if (typeof newValue === "string" && (operator === "-" || operator === "+")) {
    const intValue = parseInt(newValue.substring(1));
    if (isNaN(intValue)) return oldValue;
    if (operator === "+") return oldValue + intValue;
    if (operator === "-") return oldValue - intValue;
    else return oldValue;
  } else {
    const intValue =
      typeof newValue === "string" ? parseInt(newValue) : newValue;
    if (isNaN(intValue)) return oldValue;
    return intValue;
  }
};

export const getAbilityScores = (
  { character }: { character: Character },
  ...args: any
) => {
  if (!character.attributes?.abilityScores) return {};
  return (character.attributes.abilityScores as AbilityScoresHydrate)
    .abilityScores;
};

export const getBio = ({ character }: { character: Character }) => {
  if (!character.attributes?.bio) return {};
  return (character.attributes.bio as BioHydrate).bio;
};

export const getLife = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character
    .lifeCurrent;
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character
      ?.lifeCurrent ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: "TOKENCHANGE",
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
  const current = (character.attributes.character as CharacterHydrate).character
    .health;
  const max = (character.attributes.character as CharacterHydrate).character
    .healthMax;
  return {
    current,
    max,
  };
};
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character
      ?.lifeCurrent ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: "TOKENCHANGE",
        character: {
          character: {
            health: finalValue,
          },
        },
      },
    },
  });
};
type PoolKey = "magic" | "eldritchPoints" | "psychicPoints";
type PoolMaxKey = "magicMax" | "eldritchPointsMax" | "psychicPointsMax";

const poolAccessors = (currentKey: PoolKey, maxKey: PoolMaxKey) => ({
  get: ({ character }: { character: Character }) => {
    if (!character.attributes?.character) return {};
    const stored = (character.attributes.character as CharacterHydrate).character;
    return { current: stored[currentKey], max: stored[maxKey] };
  },
  set: (
    { character, dispatch }: { character: Character; dispatch: Dispatch },
    ...args: any[]
  ) => {
    const oldValue =
      (character.attributes?.character as CharacterHydrate | undefined)?.character?.[
        currentKey
      ] ?? 0;
    dispatch.update({
      character: {
        id: character.id,
        attributes: {
          updateId: "TOKENCHANGE",
          character: {
            character: {
              [currentKey]: applyChange(oldValue, args[0]),
            },
          },
        },
      },
    });
  },
});

const magicPool = poolAccessors("magic", "magicMax");
export const getMagicPoints = magicPool.get;
export const setMagic = magicPool.set;
const eldritchPool = poolAccessors("eldritchPoints", "eldritchPointsMax");
export const getEldritchPoints = eldritchPool.get;
export const setEldritchPoints = eldritchPool.set;
const psychicPool = poolAccessors("psychicPoints", "psychicPointsMax");
export const getPsychicPoints = psychicPool.get;
export const setPsychicPoints = psychicPool.set;
export const getStuntPoints = ({ character }: { character: Character }) => {
  if (!character.attributes?.character) return {};
  const current = (character.attributes.character as CharacterHydrate).character
    .stunts;
  return {
    current,
  };
};
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
    (character.attributes?.character as CharacterHydrate | undefined)?.character
      ?.stunts ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: "TOKENCHANGE",
        character: {
          character: {
            stunts: finalValue,
          },
        },
      },
    },
  });
};
