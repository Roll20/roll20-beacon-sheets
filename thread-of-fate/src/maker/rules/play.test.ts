import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createEmptyDraft } from '@/maker/draftModel';
import { useDraftStore } from '@/maker/store/draftStore';
import { playResources } from '@/maker/rules/playState';
import { rollHistory, rollAttribute, rollSave } from '@/maker/rules/rolls';

const FULL = { might: 16, instinct: 12, focus: 10, conviction: 14, resonance: 10, presence: 10 };

function level1(d = createEmptyDraft('t')) {
  d.classBuild.startingLevel = 1;
  d.classBuild.classes = [{ classId: 'reclaimer', level: 1 }];
  d.stats.assigned = { ...FULL };
  return d;
}

describe('playResources', () => {
  it('null current values read as the derived max', () => {
    const r = playResources(level1());
    expect(r.maxHp).toBeGreaterThan(0);
    expect(r.currentHp).toBe(r.maxHp);
    expect(r.currentStamina).toBe(r.maxStamina);
    expect(r.totalHitDice).toBe(1);
    expect(r.dying).toBe(false);
  });
});

describe('draft play actions', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('damage spends Temp HP first; healing caps at max', () => {
    const s = useDraftStore();
    s.reset();
    Object.assign(s.draft, level1(s.draft));
    const max = s.resources.maxHp;

    s.setTempHp(5);
    s.adjustHp(-3); // temp 5 -> 2, HP untouched
    expect(s.draft.play.tempHp).toBe(2);
    expect(s.resources.currentHp).toBe(max);

    s.adjustHp(-4); // temp 2 -> 0, HP -2
    expect(s.draft.play.tempHp).toBe(0);
    expect(s.resources.currentHp).toBe(max - 2);

    s.adjustHp(999); // cannot exceed max
    expect(s.resources.currentHp).toBe(max);
  });

  it('hit dice and death failures clamp; full rest restores', () => {
    const s = useDraftStore();
    s.reset();
    s.draft.classBuild.startingLevel = 3;
    s.draft.classBuild.classes = [{ classId: 'reclaimer', level: 3 }];
    s.draft.stats.assigned = { ...FULL };

    s.spendHitDie(9); // clamp to total (3)
    expect(s.resources.hitDiceSpent).toBe(3);
    s.setDeathFailures(99);
    expect(s.draft.play.deathFailures).toBe(6);

    s.adjustHp(-9999);
    expect(s.resources.dying).toBe(true);
    s.fullRest();
    expect(s.resources.currentHp).toBe(s.resources.maxHp);
    expect(s.draft.play.deathFailures).toBe(0);
    expect(s.resources.hitDiceSpent).toBeLessThan(3);
  });

  it('conditions toggle on and off', () => {
    const s = useDraftStore();
    s.reset();
    s.toggleCondition('Prone');
    expect(s.draft.play.conditions).toContain('Prone');
    s.toggleCondition('Prone');
    expect(s.draft.play.conditions).not.toContain('Prone');
  });
});

describe('roll helpers (offline fallback)', () => {
  it('records a roll in history and returns a numeric total', async () => {
    rollHistory.value = [];
    const d = level1();
    const total = await rollAttribute(d, 'might');
    expect(typeof total).toBe('number');
    expect(rollHistory.value[0].title).toContain('Might');
    await rollSave(d, 'Body');
    expect(rollHistory.value[0].title).toContain('Body');
    expect(rollHistory.value.length).toBe(2);
  });

  it('casting an attack Arte logs a cast card plus the attack and effect rolls', async () => {
    const { castArte } = await import('@/maker/rules/rolls');
    rollHistory.value = [];
    const d = level1();
    d.classBuild.classes = [{ classId: 'arcanist', level: 3 }];
    d.classBuild.startingLevel = 3;
    const arte = {
      id: 'flame-bolt',
      name: 'Flame Bolt',
      tier: 1,
      school: 'Pyromancy',
      sources: ['Arcane'],
      groups: ['Pyromancy'],
      aetherCost: 1,
      castingTime: 'Full Cast',
      range: '120 ft.',
      components: 'Verbal',
      duration: 'Instantaneous',
      description:
        'Make a ranged Arte attack against a creature. On a hit it takes 2d6 Fire damage.',
    };
    await castArte(d, arte);
    const titles = rollHistory.value.map((r) => r.title);
    expect(
      titles.some(
        (t) =>
          t.includes('Flame Bolt') && rollHistory.value.find((r) => r.title === t)?.kind === 'cast',
      ),
    ).toBe(true);
    expect(titles.some((t) => t.includes('Attack'))).toBe(true);
    expect(titles.some((t) => t.includes('Damage'))).toBe(true);
  });
});

describe('arte mechanics + advantage/disadvantage', () => {
  it('arteMechanics extracts attack, save, and effect dice', async () => {
    const { arteMechanics } = await import('@/maker/rules/arteMechanics');
    const atk = arteMechanics({
      description: 'Make a ranged Arte attack. On a hit it takes 2d6 Fire damage.',
    } as never);
    expect(atk.attack).toBe(true);
    expect(atk.dice).toEqual({ count: 2, sides: 6 });
    const sv = arteMechanics({
      description: 'Each creature makes a Body saving throw or takes 3d8 Force damage.',
    } as never);
    expect(sv.save).toBe('Body');
    expect(sv.dice).toEqual({ count: 3, sides: 8 });
    const heal = arteMechanics({ description: 'The target regains 1d8 hit points.' } as never);
    expect(heal.heals).toBe(true);
  });

  it('a disadvantage-imposing condition tags the roll DIS', async () => {
    rollHistory.value = [];
    const d = level1();
    d.play.conditions = ['Poisoned'];
    await rollAttribute(d, 'might');
    expect(rollHistory.value[0].subtitle).toContain('DIS');
  });
});
