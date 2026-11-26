import type { Character } from '@roll20-official/beacon-sdk';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import { getCharacterData } from '@/sheet/stores';

export const rank = (character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  return calculateModifiedValue({
    attributes: ['rank'],
    baseValue: data.biography?.rank ?? 0,
    characterData: data,
  });
};
