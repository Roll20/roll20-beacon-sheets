import { describe, it, expect } from 'vitest';
import { modifier, pointBuyRemaining, pointBuySpent, isValidPointBuy } from './stats';
import { rollStat, rollStatArray } from './dice';
import {
  level0Health,
  level0Stamina,
  level0QuickRestHeal,
  classHealth,
  stamina,
  armorClass,
  proficiencyBonus,
  saveBonus,
  concentrationSave,
} from './character';
import { bpRemaining, isOverspent, canPurchase } from './backgroundPoints';
import { validateDraft, isReadyToStart } from './validation';
import { createEmptyDraft } from '@/maker/draftModel';
import { classById } from '@/maker/data';
import type { AttributeRecord } from '@/maker/types';

const scores = (m = 10, i = 10, f = 10, c = 10, r = 10, p = 10): AttributeRecord => ({
  might: m,
  instinct: i,
  focus: f,
  conviction: c,
  resonance: r,
  presence: p,
});

describe('modifier formula floor((score-10)/2)', () => {
  it('matches known values', () => {
    expect(modifier(10)).toBe(0);
    expect(modifier(11)).toBe(0);
    expect(modifier(12)).toBe(1);
    expect(modifier(8)).toBe(-1);
    expect(modifier(6)).toBe(-2);
    expect(modifier(18)).toBe(4);
    expect(modifier(1)).toBe(-5);
  });
});

describe('dice', () => {
  it('rollStat is always within 8..18', () => {
    for (let n = 0; n < 500; n++) {
      const v = rollStat();
      expect(v).toBeGreaterThanOrEqual(8);
      expect(v).toBeLessThanOrEqual(18);
    }
  });
  it('rollStatArray returns 6 values', () => {
    expect(rollStatArray()).toHaveLength(6);
  });
});

describe('point buy', () => {
  it('all-8 spends 0 of 30', () => {
    const s = scores(8, 8, 8, 8, 8, 8);
    expect(pointBuySpent(s)).toBe(0);
    expect(pointBuyRemaining(s)).toBe(30);
    expect(isValidPointBuy(s)).toBe(true);
  });
  it('flags overspend', () => {
    const s = scores(18, 18, 18, 8, 8, 8); // 10+10+10 = 30 exactly
    expect(pointBuySpent(s)).toBe(30);
    expect(isValidPointBuy(s)).toBe(true);
    const over = scores(18, 18, 18, 18, 8, 8); // 40
    expect(isValidPointBuy(over)).toBe(false);
  });
});

describe('level 0 derived stats', () => {
  it('HP = 1 + Might + Conviction mods (min 1)', () => {
    expect(level0Health(scores(14, 10, 10, 14, 10, 10))).toBe(1 + 2 + 2);
    expect(level0Health(scores(6, 10, 10, 6, 10, 10))).toBe(1); // would be -3, clamped
  });
  it('stamina = 1 + Might mod (min 1)', () => {
    expect(level0Stamina(scores(16))).toBe(1 + 3);
    expect(level0Stamina(scores(4))).toBe(1);
  });
  it('quick rest heal = max(1, higher of Might/Conviction mod)', () => {
    expect(level0QuickRestHeal(scores(16, 10, 10, 12))).toBe(3);
    expect(level0QuickRestHeal(scores(8, 10, 10, 8))).toBe(1);
  });
});

describe('class HP & stamina (Reclaimer d10)', () => {
  const reclaimer = classById['reclaimer'];
  it('level 1 uses hit die max + Might + Conviction', () => {
    const hp = classHealth(scores(14, 10, 10, 12), [{ cls: reclaimer, level: 1 }]);
    expect(hp).toBe(10 + 2 + 1);
  });
  it('additional levels add average (rounded up) + mods', () => {
    const hp = classHealth(scores(14, 10, 10, 12), [{ cls: reclaimer, level: 2 }], true);
    // L1: 10+2+1=13 ; L2 avg of d10 = ceil(11/2)=6 +2+1 = 9 ; total 22
    expect(hp).toBe(13 + 9);
  });
  it('stamina = Might mod + floor(maxHitDie/2)', () => {
    expect(stamina(scores(16), [{ cls: reclaimer, level: 3 }])).toBe(3 + 5);
  });
});

describe('proficiency bonus', () => {
  it('is +1 at level 0-3, then +1 every 3 levels', () => {
    expect(proficiencyBonus(0)).toBe(1);
    expect(proficiencyBonus(1)).toBe(1);
    expect(proficiencyBonus(3)).toBe(1);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(7)).toBe(3);
    expect(proficiencyBonus(10)).toBe(4);
    expect(proficiencyBonus(60)).toBe(20);
  });
});

describe('armor class', () => {
  it('base 10 + Instinct mod + floor(half prof) + armor', () => {
    expect(armorClass(scores(10, 14), 2, 2)).toBe(10 + 2 + 1 + 2);
  });
  it('respects the armor attribute cap and adds shield', () => {
    // Instinct 18 (+4) but cap 2; pb 4 -> half 2; armor 6; shield 3
    expect(armorClass(scores(10, 18), 4, 6, 2, 3)).toBe(10 + 2 + 2 + 6 + 3);
  });
});

describe('saving throws', () => {
  it('Body = Might + Instinct mods (+PB only if proficient)', () => {
    const s = scores(16, 14); // +3, +2
    expect(saveBonus(s, 3, 'Body', false)).toBe(3 + 2);
    expect(saveBonus(s, 3, 'Body', true)).toBe(3 + 2 + 3);
  });
  it('Concentration = Focus + Resonance + PB', () => {
    expect(concentrationSave(scores(10, 10, 14, 10, 12), 3)).toBe(2 + 1 + 3);
  });
});

describe('background points', () => {
  it('starts at 30 and tracks overspend', () => {
    expect(bpRemaining([])).toBe(30);
    const sel = [
      { uid: '1', traitId: 'mentor', cost: 10, detail: 'x' },
      { uid: '2', traitId: 'blessing', cost: 10, detail: 'y' },
      { uid: '3', traitId: 'title', cost: 7, detail: 'z' },
      { uid: '4', traitId: 'fame', cost: 6, detail: 'w' },
    ];
    expect(bpRemaining(sel)).toBe(-3);
    expect(isOverspent(sel)).toBe(true);
  });
  it('single-take traits cannot be repurchased', () => {
    const sel = [{ uid: '1', traitId: 'genius', cost: 7, detail: '' }];
    expect(canPurchase(sel, 'genius')).toBe(false);
    expect(canPurchase([], 'genius')).toBe(true);
  });
  it('connection can be taken up to 3 times', () => {
    const two = [
      { uid: '1', traitId: 'connection', cost: 2, detail: 'a' },
      { uid: '2', traitId: 'connection', cost: 2, detail: 'b' },
    ];
    expect(canPurchase(two, 'connection')).toBe(true);
    const three = [...two, { uid: '3', traitId: 'connection', cost: 2, detail: 'c' }];
    expect(canPurchase(three, 'connection')).toBe(false);
  });
});

describe('skill proficiency aggregation', () => {
  it('merges sources and grants Expertise when a Philosophy doubles up', async () => {
    const { skillProficiencies, skillRows } = await import('./proficiency');
    const d = createEmptyDraft('t');
    d.classBuild.startingLevel = 4; // PB +2
    d.classBuild.classes = [{ classId: 'reclaimer', level: 4 }];
    d.stats.assigned = {
      might: 16,
      instinct: 10,
      focus: 10,
      conviction: 10,
      resonance: 10,
      presence: 14,
    };
    d.race.selectedSkills = ['Athletics', 'Intimidation'];
    d.classBuild.classSkills = ['Perception'];
    d.philosophy.selectedPhilosophyId = 'nihilism'; // grants Deception, Intimidation, Performance
    const profs = skillProficiencies(d);
    expect(profs['Athletics']).toBe('proficient');
    expect(profs['Intimidation']).toBe('expert'); // race proficient + philosophy => expertise
    expect(profs['Deception']).toBe('proficient');
    expect(profs['Perception']).toBe('proficient');
    expect(profs['Arcana']).toBe('none');
    // Athletics (Might +3) proficient at PB +2 => +5
    const ath = skillRows(d).find((r) => r.name === 'Athletics')!;
    expect(ath.bonus).toBe(3 + 2);
  });
});

describe('AC with racial natural armor', () => {
  it('Lizard-Folk natural armor and Constructed +2 (unarmored)', async () => {
    const { draftArmorClass } = await import('./selectors');
    const sc = scores(10, 16); // Instinct +3
    const liz = createEmptyDraft('t');
    liz.race.selectedRaceId = 'beastmen';
    liz.race.selectedSubraceId = 'lizard-folk';
    expect(draftArmorClass(liz, sc, 2)).toBe(13 + 3 + 1); // 13 + Instinct + half PB

    const con = createEmptyDraft('t');
    con.race.selectedRaceId = 'constructed';
    expect(draftArmorClass(con, sc, 2)).toBe(10 + 3 + 1 + 2); // base + Integrated Protection
  });

  it('Awakened Animal hide, Hell-Folk Halfbreed half-Presence, and misc bonus', async () => {
    const { draftArmorClass } = await import('./selectors');
    // Awakened: 12 + Conviction(+3) + halfPB(1) when unarmored
    const awk = createEmptyDraft('t');
    awk.race.selectedRaceId = 'awakened-animal';
    expect(draftArmorClass(awk, scores(10, 10, 10, 16), 2)).toBe(12 + 3 + 1);

    // Halfbreed: 10 + Instinct(+3) + halfPB(1) + floor(Presence(+2)/2)=1
    const hb = createEmptyDraft('t');
    hb.race.selectedRaceId = 'hell-folk';
    hb.race.selectedSubraceId = 'halfbreed';
    expect(draftArmorClass(hb, scores(10, 16, 10, 10, 10, 14), 2)).toBe(10 + 3 + 1 + 1);

    // Manual misc AC adds on top
    const plain = createEmptyDraft('t');
    plain.equipment.otherAcBonus = 2;
    expect(draftArmorClass(plain, scores(10, 16), 2)).toBe(10 + 3 + 1 + 2);
  });
});

describe('caster math', () => {
  it('caster level, max tier, and aether by caster type', async () => {
    const { casterLevelOf, maxTierOf, aetherOf } = await import('./casting');
    expect(casterLevelOf(10, 'High-Caster')).toBe(10);
    expect(casterLevelOf(10, 'Mid-Caster')).toBe(5);
    expect(casterLevelOf(9, 'Low-Caster')).toBe(3);
    expect(maxTierOf(10)).toBe(5);
    expect(maxTierOf(5)).toBe(3);
    expect(aetherOf(10, 'High-Caster')).toBe(20);
    expect(aetherOf(7, 'Low-Caster')).toBe(4);
  });
  it('casterInfo gates a Hierophant to Divine + accessible tier', async () => {
    const { casterInfo } = await import('./casting');
    const d = createEmptyDraft('t');
    d.classBuild.startingLevel = 10;
    d.classBuild.classes = [{ classId: 'hierophant', level: 10 }];
    d.stats.assigned = {
      might: 10,
      instinct: 10,
      focus: 14,
      conviction: 16,
      resonance: 12,
      presence: 10,
    };
    const info = casterInfo(d);
    expect(info.isCaster).toBe(true);
    expect(info.sources).toContain('Divine');
    expect(info.casterLevel).toBe(10);
    expect(info.maxTier).toBe(5);
  });
});

describe('validation', () => {
  it('a fresh draft has errors and is not ready', () => {
    const d = createEmptyDraft('test');
    const warnings = validateDraft(d);
    expect(warnings.some((x) => x.code === 'no-philosophy')).toBe(true);
    expect(warnings.some((x) => x.code === 'no-race')).toBe(true);
    expect(isReadyToStart(warnings)).toBe(false);
  });

  it('a fully-filled level-1 Reclaimer is ready', () => {
    const d = createEmptyDraft('test');
    d.identity.name = 'Tiberius';
    d.stats.method = 'array';
    d.stats.chosenRollSetId = 'set';
    d.stats.assigned = {
      might: 16,
      instinct: 14,
      focus: 12,
      conviction: 14,
      resonance: 8,
      presence: 11,
    };
    d.philosophy.selectedPhilosophyId = 'idealism';
    d.race.selectedRaceId = 'orcs';
    d.race.selectedSubraceId = 'wartorn';
    d.race.selectedSkills = ['Athletics', 'Intimidation'];
    d.classBuild.startingLevel = 1;
    d.classBuild.classes = [{ classId: 'reclaimer', level: 1 }];
    const warnings = validateDraft(d);
    expect(isReadyToStart(warnings)).toBe(true);
  });

  it('flags early multiclassing', () => {
    const d = createEmptyDraft('test');
    d.classBuild.startingLevel = 5;
    d.classBuild.classes = [
      { classId: 'reclaimer', level: 3 },
      { classId: 'lancer', level: 2 },
    ];
    const warnings = validateDraft(d);
    expect(warnings.some((x) => x.code === 'early-multiclass')).toBe(true);
  });
});
