import type { Character } from '@roll20-official/beacon-sdk';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import { getCharacterData } from '@/sheet/stores';

export const reputation_formula = '@{rank}';

export const reputation = (character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  const repFormula = data.biography?.reputation ?? reputation_formula;
  return calculateModifiedValue({
    attributes: ['reputation'],
    baseValue: repFormula,
    characterData: data,
  });
};
