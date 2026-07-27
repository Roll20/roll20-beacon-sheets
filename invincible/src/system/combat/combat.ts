import type { Character } from '@roll20-official/beacon-sdk';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { getCharacterData } from '@/sheet/stores';

export const health_max_formula = 'ceil((@{fighting} + @{agility} + @{strength}) / 2)';
export const resolve_max_formula = 'ceil((@{reason} + @{intuition} + @{presence}) / 2)';
export const slugfest_damage_formula = 'ceil(@{strength} / 2)';

export const health = (character?: Character | CharacterData): number => {
  const data = getCharacterData(character);
  return data.combat?.health ?? 0;
};

export const health_max =(character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  const healthMaxFormula = data.combat?.healthMax ?? health_max_formula;
  
  const healthMax = calculateModifiedValue({
    attributes: ['health_max'],
    baseValue: healthMaxFormula,
    characterData: data,
  });

  return healthMax;
};

export const resolve = (character?: Character | CharacterData): number => {
  const data = getCharacterData(character);
  return data.combat?.resolve ?? 0;
};

export const resolve_max = (character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  const resolveMaxFormula = data.combat?.resolveMax ?? resolve_max_formula;
  
  const resolveMax = calculateModifiedValue({
    attributes: ['resolve_max'],
    baseValue: resolveMaxFormula,
    characterData: data,
  });

  return resolveMax;
};

export const slugfest_damage =(character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  const slugfestFormula = data.combat?.slugfestDamage ?? slugfest_damage_formula;
  
  const slugfestDamage = calculateModifiedValue({
    attributes: ['slugfest_damage'],
    baseValue: slugfestFormula,
    characterData: data,
  });

  return slugfestDamage;
};