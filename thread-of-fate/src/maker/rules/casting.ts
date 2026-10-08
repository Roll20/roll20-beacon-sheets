import type { AttributeKey, CasterType } from '@/maker/types';
import type { CharacterDraft } from '@/maker/draftModel';
import { classById } from '@/maker/data';
import { draftModifiers } from './selectors';
import { proficiencyBonus } from './character';
import { totalLevel } from './selectors';

/**
 * Caster math per the Spellcasting overview:
 *  Caster-Level: High = Class Level, Mid = 1/2, Low = 1/3.
 *  Max Arte Tier = 1/2 Caster-Level, rounded up (min 1).
 *  Aether gained: Low = 1 every other level, Mid = 1/level, High = 2/level.
 *  Arte Save DC = 6 + casting attr mod + PB + Resonance mod.
 *  Arte Attack  = casting attr mod + PB + Focus mod.
 */

export function casterLevelOf(classLevel: number, type: CasterType): number {
  switch (type) {
    case 'High-Caster':
      return classLevel;
    case 'Mid-Caster':
      return Math.floor(classLevel / 2);
    case 'Low-Caster':
      return Math.floor(classLevel / 3);
    default:
      return 0;
  }
}

export function maxTierOf(casterLevel: number): number {
  return casterLevel > 0 ? Math.max(1, Math.ceil(casterLevel / 2)) : 0;
}

export function aetherOf(classLevel: number, type: CasterType): number {
  switch (type) {
    case 'High-Caster':
      return classLevel * 2;
    case 'Mid-Caster':
      return classLevel;
    case 'Low-Caster':
      return Math.ceil(classLevel / 2);
    default:
      return 0;
  }
}

export interface CasterInfo {
  isCaster: boolean;
  sources: string[];
  castingAttribute: AttributeKey | null;
  casterLevel: number;
  maxTier: number;
  aether: number;
  arteSaveDC: number;
  arteAttack: number;
}

/** Aggregate casting capability across all caster classes in the build. */
export function casterInfo(draft: CharacterDraft): CasterInfo {
  const mods = draftModifiers(draft);
  const pb = proficiencyBonus(totalLevel(draft));

  const casters = draft.classBuild.classes
    .map((c) => ({ cls: classById[c.classId], level: c.level }))
    .filter((c) => c.cls && c.cls.casterType && c.cls.casterType !== 'Non-Caster');

  if (!casters.length) {
    return {
      isCaster: false,
      sources: [],
      castingAttribute: null,
      casterLevel: 0,
      maxTier: 0,
      aether: 0,
      arteSaveDC: 0,
      arteAttack: 0,
    };
  }

  const sources = [...new Set(casters.map((c) => c.cls.arteSource).filter(Boolean) as string[])];
  let aether = 0;
  let bestCasterLevel = 0;
  let castingAttribute: AttributeKey | null = null;
  let bestForAttr = -1;
  for (const { cls, level } of casters) {
    const type = cls.casterType as CasterType;
    aether += aetherOf(level, type);
    const cl = casterLevelOf(level, type);
    bestCasterLevel = Math.max(bestCasterLevel, cl);
    if (cl > bestForAttr && cls.castingAttribute) {
      bestForAttr = cl;
      castingAttribute = cls.castingAttribute;
    }
  }

  const attrMod = castingAttribute ? mods[castingAttribute] : 0;
  return {
    isCaster: true,
    sources,
    castingAttribute,
    casterLevel: bestCasterLevel,
    maxTier: maxTierOf(bestCasterLevel),
    aether,
    arteSaveDC: 6 + attrMod + pb + mods.resonance,
    arteAttack: attrMod + pb + mods.focus,
  };
}
