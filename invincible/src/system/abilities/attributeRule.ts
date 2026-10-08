import type { Character } from '@roll20-official/beacon-sdk';
import { getCharacterData } from '@/sheet/stores';
import { calculateModifiedValue, type ModifiedValue } from '../effects/calculateModifiedValue';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import i18n from '@/i18n/i18n';
import type { AbilityName } from '@/schemas/hydrate/abilities';

const t = i18n.global?.t || ((key: string) => key);

const SCORE_DESCRIPTIONS: Record<number, string> = {
  1: 'poor',
  2: 'typical',
  3: 'good',
  4: 'great',
  5: 'extraordinary',
  6: 'incredible',
  7: 'amazing',
  8: 'spectacular',
  9: 'phenomenal',
  10: 'astounding',
  11: 'tremendous',
  12: 'invincible',
};

export type AttributeValue = ModifiedValue & {
  description: string;
  key: AbilityName;
  value: number;
};

export const calculateAttributeValue = (
  abilityKey: keyof NonNullable<CharacterData['abilities']>,
  character?: Character | CharacterData,
): AttributeValue => {
  const data = getCharacterData(character);
  const abilityData = data.abilities?.[abilityKey];

  const empty: AttributeValue = {
    value: 0,
    modifiers: [],
    baseValue: 0,
    description: t('score_description.unknown'),
    key: abilityKey,
  };

  if (!abilityData) return empty;

  const modified = calculateModifiedValue({
    attributes: [abilityKey as any],
    baseValue: abilityData,
    characterData: data,
  });

  const score = Number(modified.value);
  const descriptionKey = SCORE_DESCRIPTIONS[score];
  const description = descriptionKey ? descriptionKey : 'unknown';
  const key = abilityKey;

  return { ...modified, description, key, value: Number(modified.value) ?? 0 };
};
