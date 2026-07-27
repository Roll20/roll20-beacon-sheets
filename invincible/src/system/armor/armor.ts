import type { Character } from '@roll20-official/beacon-sdk';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import { getCharacterData } from '@/sheet/stores';

export const armor = (character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  return calculateModifiedValue({
    attributes: ['armor'],
    baseValue: data.combat?.armor ?? 0,
    characterData: data,
  });
};