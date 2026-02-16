import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { type AbilitiesHydrate } from '@/sheet/stores/abilities/abilitiesStore';
import { type Context } from '../relay';
import type { ProgressionHydrate } from '@/sheet/stores/progression/progressionStore';
import type { ProficienciesHydrate, RankedProficiency } from '@/sheet/stores/proficiencies/proficienciesStore';
import { getModifiedValue } from './effects';
import { proficiencyLevelsValues } from '@/sheet/stores/proficiencies/proficienciesStore';
import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import { type CombatHydrate } from '@/sheet/stores/combat/combatStore';

export const getHitPoints = ({ character }: { character: Character }): { current: number; max: number } => {
  const combat = character.attributes?.combat;
  const progression = character.attributes?.progression;

  const max = typeof progression === 'object' && progression !== null && 'classes' in progression
    ? Object.values((progression as ProgressionHydrate).classes).reduce((total, cls) => {
        return total + Object.values(cls.hitPoints).reduce((sum, hp) => sum + hp, 0);
      }, 0) + (getAbilityModifier({ character }, 'constitution') * getLevel({ character }))
    : 0;
  const modifiedMax = getModifiedValue(max, 'hit-points-max', undefined, character);
  const current = typeof combat === 'object' && combat !== null && 'life' in combat 
    ? (combat.life as any)?.hitPoints || 0 
    : 0;
  
  return {
    current: modifiedMax > 0 ? current : 0,
    max: modifiedMax
  };
};

export const getTempHitPoints = ({ character }: { character: Character }): number => {
  const combat = character.attributes?.combat as CombatHydrate | undefined;

  const tempHp = combat?.life?.temporary || 0;

  return tempHp;
};

export const setTempHitPoints = (
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
  const oldValue = getTempHitPoints({ character });
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        combat: {
          life: {
            temporary: finalValue,
          },
        }
      },
    },
  });
};

export const getArmorClass = ({ character }: { character: Character }): number => {
  const combat = character.attributes?.combat as CombatHydrate | undefined;
  const baseAc = combat?.armorClass.base || 10;
  const abilityMod = getAbilityModifier({ character }, combat?.armorClass.ability || 'dexterity');
  const modifiedAc = getModifiedValue(baseAc + abilityMod, 'armor-class', undefined, character);
  return modifiedAc;
};

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

export const setHitPoints = (
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
  const oldValue = getHitPoints({ character }).current;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        combat: {
          life: {
            hitPoints: finalValue,
          },
        }
      },
    },
  });
};

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
  return getModifiedValue(pb, 'proficiency-bonus', undefined, character);
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
    : Math.ceil((score - 10) / 2);
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
