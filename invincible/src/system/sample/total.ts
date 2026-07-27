import { getCharacterData } from '@/sheet/stores';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import type { Character } from '@roll20-official/beacon-sdk';
import type { CharacterData } from '@/schemas/hydrate/sheet';

export const total = (character?: Character | CharacterData): ModifiedValue => {
  const data = getCharacterData(character);
  if (!data.sample?.previousScores) return { value: 0, modifiers: [], baseValue: 0 };

  const baseTotal = data.sample.previousScores
    .reduce((acc: number, item: { label: string, score: number }) => acc + (item.score || 0), 0);

  return calculateModifiedValue({ attributes: ['total'] as any[], baseValue: baseTotal, characterData: data });
};