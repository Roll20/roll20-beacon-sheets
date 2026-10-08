import type { WeaponDef } from '@/maker/types';
import type { CharacterDraft } from '@/maker/draftModel';
import { draftModifiers, totalLevel } from './selectors';
import { proficiencyBonus } from './character';
import { formatModifier } from './stats';

export interface WeaponLine {
  attribute: 'Might' | 'Instinct';
  attackBonus: number;
  attackText: string;
  damageText: string;
}

/**
 * Computes a weapon's attack bonus and damage for the sheet.
 * Attack = Proficiency Bonus (assumed Trained) + attribute mod.
 * Finesse/Ranged weapons use Instinct (unless Brawn forces Might).
 */
export function weaponLine(draft: CharacterDraft, weapon: WeaponDef): WeaponLine {
  const mods = draftModifiers(draft);
  const pb = proficiencyBonus(totalLevel(draft));
  const usesInstinct =
    /\b(Finesse|Ranged)\b/i.test(weapon.properties) && !/\bBrawn\b/i.test(weapon.properties);
  const attribute = usesInstinct ? 'Instinct' : 'Might';
  const attrMod = usesInstinct ? mods.instinct : mods.might;
  const attackBonus = pb + attrMod;
  return {
    attribute,
    attackBonus,
    attackText: formatModifier(attackBonus),
    damageText: `${weapon.damage}${attrMod ? ` ${formatModifier(attrMod)}` : ''} ${
      weapon.damageTypes
    }`,
  };
}
