import type { Character } from '@roll20-official/beacon-sdk';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { calculateAttributeValue, type AttributeValue } from './attributeRule';

export const fighting = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('fighting', character);

export const agility = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('agility', character);

export const strength = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('strength', character);

export const reason = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('reason', character);

export const intuition = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('intuition', character);

export const presence = (character?: Character | CharacterData): AttributeValue =>
  calculateAttributeValue('presence', character);
