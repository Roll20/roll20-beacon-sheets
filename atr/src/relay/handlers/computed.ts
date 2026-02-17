import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { type AbilitiesHydrate } from '@/sheet/stores/abilities/abilitiesStore';
import { type Context } from '../relay';
import type { ProgressionHydrate } from '@/sheet/stores/progression/progressionStore';
import type { ProficienciesHydrate, RankedProficiency } from '@/sheet/stores/proficiencies/proficienciesStore';
import { getModifiedValue } from './effects';
import { proficiencyLevelsValues } from '@/sheet/stores/proficiencies/proficienciesStore';
import { get } from 'lodash';


export const getLevel = ({ character }: Context): number => {
  const classes = 
    !character.attributes?.progression || 
    !character.attributes.progression.hasOwnProperty('classes') 
      ? {}
      : (character.attributes.progression as ProgressionHydrate).classes;

  const level = Object.values(classes).reduce((level, cls) => level + (cls.level || 0), 0);
  return level;
};

export const getProficiencyBonus = ({ character }: Context): number => {
  const level = getLevel({ character });
  const pb = level === 0
    ? 0
    : Math.ceil(level/4) + 1;
  return getModifiedValue(pb, 'proficiency', undefined, character);
};

export const getAbilityScore = ({ character }: Context, ability: AbilityKey):number => {
  const abilities = 
    !character.attributes?.abilities || 
    !character.attributes.abilities.hasOwnProperty('abilities') 
      ? {}
      : (character.attributes.abilities as AbilitiesHydrate).abilities;
  
  const existing = Object.values(abilities).find((ab) => ab.label === ability);
  return existing ? getModifiedValue(existing.score, ability, undefined, character) : 0;
};

export const getAbilityModifier = ({ character }: Context, ability: AbilityKey):number => {
  const score = getAbilityScore({ character }, ability);
  const modifier = score === 0
    ? 0
    : Math.floor((score - 10) / 2);
  return modifier;
};

const getSkill = ({ character }: Context, skill: string): RankedProficiency | undefined => {
  const skills =
    !character.attributes?.proficiencies ||
    !character.attributes.proficiencies.hasOwnProperty('ranked')
      ? {}
      : (character.attributes.proficiencies as ProficienciesHydrate).ranked;

  const existing = Object.values(skills).find((s) => s.label === skill);
  return existing;
};

export const getSkillProficiency = ({ character }: Context, skill: string): number => {
  const existing = getSkill({ character }, skill); 
  if(!existing) return 0;

  const isAutomatic = existing.level === -1;
  if(isAutomatic) {
    return getModifiedValue(0, `${skill}-proficiency`, proficiencyLevelsValues, character);
  } else {
    return existing.level;
  }
};

export const getSkillModifier = ({ character }: Context, skill: string): number => {
  const existing = getSkill({ character }, skill); 
  if(!existing) return 0;

  const pb = getProficiencyBonus({ character });
  const proficiency = getSkillProficiency({ character }, skill);
  const abilityMod = getAbilityModifier({ character }, existing.ability);

  const baseMod = abilityMod + (pb * proficiency);
  return getModifiedValue(baseMod, `${skill}-modifier`, undefined, character);
};

export const getInitiative = ({ character }: Context) => getSkillModifier({ character }, 'initiative');

/*
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
*/
