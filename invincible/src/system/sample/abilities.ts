import type { Character } from '@roll20-official/beacon-sdk';
import { getCharacterData } from '@/sheet/stores';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import type { CharacterData } from '@/schemas/hydrate/sheet';

const getAbilityScore = (ability: 'agility' | 'endurance' | 'health', character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  if (!data.sample?.[ability]) return { value: 0, modifiers: [], baseValue: 0 };

  return calculateModifiedValue({ attributes: [ability] as any[], baseValue: data.sample[ability], characterData: data });
};

export const agility = (character?: Character | CharacterData) => getAbilityScore('agility', character);
export const endurance = (character?: Character | CharacterData) => getAbilityScore('endurance', character);
export const health = (character?: Character | CharacterData) => getAbilityScore('health', character);