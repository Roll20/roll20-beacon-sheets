import type { AttributeRecord } from '@/maker/types';
import type { CharacterDraft } from '@/maker/draftModel';
import { ATTRIBUTE_KEYS } from '@/maker/data/attributes';
import { classById, raceById, subraceById, armorById, shieldById } from '@/maker/data';
import { emptyAttributes, finalScores, modifier, modifiers, racialBonuses } from './stats';
import {
  classHealth,
  level0Health,
  level0QuickRestHeal,
  level0Stamina,
  stamina as staminaCalc,
  hitDiceList,
  proficiencyBonus,
  saveBonus,
  concentrationSave,
  type SaveGroup,
} from './character';

/** Base (assigned) attribute scores from the draft, treating null as 0. */
export function baseScores(draft: CharacterDraft): AttributeRecord {
  return ATTRIBUTE_KEYS.reduce((acc, k) => {
    acc[k] = draft.stats.assigned[k] ?? 0;
    return acc;
  }, {} as AttributeRecord);
}

export function selectedRace(draft: CharacterDraft) {
  return draft.race.selectedRaceId ? raceById[draft.race.selectedRaceId] : undefined;
}

export function selectedSubrace(draft: CharacterDraft) {
  if (!draft.race.selectedRaceId || !draft.race.selectedSubraceId) return undefined;
  return subraceById(draft.race.selectedRaceId, draft.race.selectedSubraceId);
}

export function draftRacialBonuses(draft: CharacterDraft): AttributeRecord {
  return racialBonuses(selectedRace(draft), selectedSubrace(draft));
}

/** Growth (Attribute Score Increase) milestone levels. */
export const GROWTH_MILESTONES = [4, 6, 8, 12, 14, 17];

/** 2 ASI points per Growth milestone reached at the character's level. */
export function growthPointsAvailable(level: number): number {
  return GROWTH_MILESTONES.filter((m) => level >= m).length * 2;
}

/** Points the player has allocated across attributes. */
export function growthAllocated(draft: CharacterDraft): number {
  return Object.values(draft.classBuild.growth ?? {}).reduce((s, v) => s + (v || 0), 0);
}

export function draftGrowthBonuses(draft: CharacterDraft): AttributeRecord {
  const out = emptyAttributes();
  Object.entries(draft.classBuild.growth ?? {}).forEach(([k, v]) => {
    if (k in out) out[k as keyof AttributeRecord] += v || 0;
  });
  return out;
}

/** Final attribute scores (assigned + racial/subrace bonuses + Growth ASIs). */
export function draftFinalScores(draft: CharacterDraft): AttributeRecord {
  return finalScores(baseScores(draft), draftRacialBonuses(draft), draftGrowthBonuses(draft));
}

export function draftModifiers(draft: CharacterDraft): AttributeRecord {
  return modifiers(draftFinalScores(draft));
}

export function totalLevel(draft: CharacterDraft): number {
  if (draft.classBuild.startingLevel === 0) return 0;
  return draft.classBuild.classes.reduce((sum, c) => sum + c.level, 0);
}

function classLevelPairs(draft: CharacterDraft) {
  return draft.classBuild.classes
    .map((c) => ({ cls: classById[c.classId], level: c.level }))
    .filter((c) => c.cls);
}

export interface DraftDerived {
  health: number;
  stamina: number;
  armorClass: number;
  quickRestHeal: number;
  hitDice: string[];
  level: number;
  proficiencyBonus: number;
  saves: { body: number; mind: number; soul: number; concentration: number };
  saveProficiencies: SaveGroup[];
  movementSpeed: string;
}

/** Which Body/Mind/Soul saves the character is proficient in (union across classes). */
export function saveProficiencies(draft: CharacterDraft): SaveGroup[] {
  const set = new Set<SaveGroup>();
  classLevelPairs(draft).forEach(({ cls }) =>
    (cls.saves ?? []).forEach((s) => {
      if (s === 'Body' || s === 'Mind' || s === 'Soul') set.add(s);
    }),
  );
  return [...set];
}

/** Flat + per-level HP bonuses from racial features (e.g. Dwarf "Built Like a Dwarf"). */
function racialHpBonus(draft: CharacterDraft): { perLevel: number; flat: number } {
  if (draft.race.selectedRaceId === 'dwarves') return { perLevel: 1, flat: 1 };
  return { perLevel: 0, flat: 0 };
}

/**
 * Full AC: armor (bonus + attribute cap) or unarmored, racial natural armor,
 * shield, racial flat bonuses (Constructed +2, Hell-Folk Halfbreed +1/2 Presence),
 * and any manual misc bonus.
 */
export function draftArmorClass(
  draft: CharacterDraft,
  scores: AttributeRecord,
  pb: number,
): number {
  const halfPb = Math.floor(pb / 2);
  const insMod = modifier(scores.instinct);
  const armor = draft.equipment.selectedArmorId ? armorById[draft.equipment.selectedArmorId] : null;
  const shield = draft.equipment.selectedShieldId
    ? shieldById[draft.equipment.selectedShieldId]
    : null;
  const raceId = draft.race.selectedRaceId;
  const subId = draft.race.selectedSubraceId;

  let base = armor
    ? 10 + Math.min(insMod, armor.attributeCap ?? Infinity) + halfPb + armor.acBonus
    : 10 + insMod + halfPb;

  if (!armor) {
    if (raceId === 'awakened-animal')
      base = Math.max(base, 12 + modifier(scores.conviction) + halfPb); // Toughened Hide
    if (subId === 'lizard-folk') base = Math.max(base, 13 + insMod + halfPb); // Scaled Hide
  }

  let flat = 0;
  if (raceId === 'constructed') flat += 2; // Integrated Protection
  if (subId === 'halfbreed') flat += Math.floor(modifier(scores.presence) / 2); // Smokin' Sick Style

  return base + (shield?.shieldAc ?? 0) + flat + (draft.equipment.otherAcBonus ?? 0);
}

export function draftDerived(draft: CharacterDraft): DraftDerived {
  const scores = draftFinalScores(draft);
  const level = totalLevel(draft);
  const pairs = classLevelPairs(draft);
  const pb = proficiencyBonus(level);
  const profSaves = saveProficiencies(draft);

  const ac = draftArmorClass(draft, scores, pb);

  const saves = {
    body: saveBonus(scores, pb, 'Body', profSaves.includes('Body')),
    mind: saveBonus(scores, pb, 'Mind', profSaves.includes('Mind')),
    soul: saveBonus(scores, pb, 'Soul', profSaves.includes('Soul')),
    concentration: concentrationSave(scores, pb),
  };
  const movementSpeed = selectedRace(draft)?.movementSpeed ?? '30 feet';

  if (draft.classBuild.startingLevel === 0 || pairs.length === 0) {
    return {
      health: level0Health(scores),
      stamina: level0Stamina(scores),
      armorClass: ac,
      quickRestHeal: level0QuickRestHeal(scores),
      hitDice: [],
      level,
      proficiencyBonus: pb,
      saves,
      saveProficiencies: profSaves,
      movementSpeed,
    };
  }

  const hpBonus = racialHpBonus(draft);
  return {
    health: classHealth(
      scores,
      pairs,
      draft.classBuild.useAverageHp,
      hpBonus.perLevel,
      hpBonus.flat,
    ),
    stamina: staminaCalc(scores, pairs),
    armorClass: ac,
    quickRestHeal: 0,
    hitDice: hitDiceList(pairs),
    level,
    proficiencyBonus: pb,
    saves,
    saveProficiencies: profSaves,
    movementSpeed,
  };
}

/** Whether the build includes any caster class (so the Artes step matters). */
export function hasCasterAccess(draft: CharacterDraft): boolean {
  return classLevelPairs(draft).some((c) => c.cls.casterType && c.cls.casterType !== 'Non-Caster');
}
