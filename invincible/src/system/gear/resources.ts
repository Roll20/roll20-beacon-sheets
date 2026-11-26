import type { Character } from '@roll20-official/beacon-sdk';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { getCharacterData } from '@/sheet/stores';

export const resources =(character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  
  const modifiedResources = calculateModifiedValue({
    attributes: ['resources'],
    baseValue: data.gear?.resources ?? 0,
    characterData: data,
  });

  return modifiedResources;
};