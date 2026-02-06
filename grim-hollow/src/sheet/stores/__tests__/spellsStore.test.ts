import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSpellsStore } from '../spells/spellsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useProgressionStore } from '../progression/progressionStore';
import { config } from '@/config';
import { effectKeys } from '@/effects.config';
import { useMetaStore } from '../meta/metaStore';
import { useTagsStore } from '../tags/tagsStore';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
  initValues: { character: { id: 'test-char-id' } },
}));

describe('spellsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    const abilitiesStore = useAbilitiesStore();
    const intAbility = abilitiesStore.abilities.find((a) => a.label === 'intelligence')!;
    abilitiesStore.update(intAbility._id, { score: 16 });
  });

  describe('getEmptySpell', () => {
    it('should create a spell with default values', () => {
      const store = useSpellsStore();
      const spell = store.getEmptySpell({});

      expect(spell).toMatchObject({
        name: '',
        level: 0,
        school: config.spellSchools[0],
        isAttack: false,
        attackAbility: 'spellcasting',
        saving: 'none',
      });
      expect(spell._id).toBeDefined();
    });

    it('should apply patch values', () => {
      const store = useSpellsStore();
      const spell = store.getEmptySpell({ name: 'Fireball', level: 3, isAttack: false });

      expect(spell.name).toBe('Fireball');
      expect(spell.level).toBe(3);
      expect(spell.attackAbility).toBe('none');
    });
  });

  describe('getEmptySource', () => {
    it('should create an ability-based source', () => {
      const store = useSpellsStore();
      const source = store.getEmptySource({ type: 'ability', ability: 'intelligence' });

      expect(source).toMatchObject({
        type: 'ability',
        ability: 'intelligence',
        name: '',
      });
    });

    it('should create a flat-based source', () => {
      const store = useSpellsStore();
      const source = store.getEmptySource({ type: 'flat', flat: 15 });

      expect(source).toMatchObject({
        type: 'flat',
        flat: 15,
        name: '',
      });
    });

    it('should default to ability type if type is invalid/missing in patch', () => {
      const store = useSpellsStore();
      // @ts-ignore - testing fallback
      const source = store.getEmptySource({ type: 'invalid' });
      expect(source.type).toBe('ability');
      // @ts-ignore
      expect(source.ability).toBe(config.abilities[0]);
    });
  });

  describe('Add/Update/Delete', () => {
    it('should add a new source', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'ability', ability: 'intelligence', name: 'Wizard' });

      expect(store.userSources).toHaveLength(1);
      expect(store.userSources[0].name).toBe('Wizard');
    });

    it('should update existing source', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'ability', ability: 'intelligence', name: 'Wizard' });
      const sourceId = store.userSources[0]._id;

      store.updateSource({ _id: sourceId, name: 'Sorcerer' });

      expect(store.userSources).toHaveLength(1);
      expect(store.userSources[0].name).toBe('Sorcerer');
    });

    it('should remove source and cascade delete spells', () => {
      const store = useSpellsStore();
      store.updateSource({ name: 'Source 1' });
      const source = store.userSources[0];

      store.updateSpell({ name: 'Spell 1', spellSourceId: source._id });
      expect(store.userSpells).toHaveLength(1);

      store.removeSource(source);

      expect(store.userSources).toHaveLength(0);
      expect(store.userSpells).toHaveLength(0);
    });

    it('should add and update a spell', () => {
      const store = useSpellsStore();
      store.updateSpell({ name: 'Magic Missile' });
      expect(store.userSpells[0].name).toBe('Magic Missile');

      const spellId = store.userSpells[0]._id;
      store.updateSpell({ _id: spellId, name: 'Fireball' });
      expect(store.userSpells[0].name).toBe('Fireball');
    });

    it('should remove spell and cleanup tags and effects', () => {
      const store = useSpellsStore();
      const tagsStore = useTagsStore();
      const effectsStore = useEffectsStore();

      const removeTagSpy = vi.spyOn(tagsStore, 'remove');
      const removeEffectSpy = vi.spyOn(effectsStore, 'remove');

      store.updateSpell({ name: 'Complex Spell' });
      const spell = store.userSpells[0];

      store.removeSpell(spell);

      expect(store.userSpells).toHaveLength(0);
      expect(removeEffectSpy).toHaveBeenCalledWith(spell.effectId);
      expect(removeTagSpy).toHaveBeenCalledWith(spell.tagId);
    });
  });

  describe('Effect-Derived Item Management', () => {
    it('should delegate updateSpell to effectsStore if sourceEffectId is present', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();
      const spy = vi.spyOn(effectsStore, 'updateItemWithinEffect');

      const patch = { _id: 's1', name: 'Updated', sourceEffectId: 'e1' };
      store.updateSpell(patch);

      expect(spy).toHaveBeenCalledWith({
        effectId: 'e1',
        itemKey: 'spells',
        itemPatch: patch,
      });
    });

    it('should delegate removeSpell to effectsStore if sourceEffectId is present', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();
      const spy = vi.spyOn(effectsStore, 'removeItemFromEffect');

      const spell = store.getEmptySpell({ _id: 's1', sourceEffectId: 'e1' });
      // @ts-ignore
      store.removeSpell(spell);

      expect(spy).toHaveBeenCalledWith({
        effectId: 'e1',
        itemKey: 'spells',
        itemId: 's1',
      });
    });

    it('should delegate updateSource to effectsStore if sourceEffectId is present', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();
      const spy = vi.spyOn(effectsStore, 'updateItemWithinEffect');

      const patch = { _id: 'src1', name: 'Updated', sourceEffectId: 'e1' };
      store.updateSource(patch as any);

      expect(spy).toHaveBeenCalledWith({
        effectId: 'e1',
        itemKey: 'spellSources',
        itemPatch: patch,
      });
    });

    it('should delegate removeSource to effectsStore if sourceEffectId is present', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();
      const spy = vi.spyOn(effectsStore, 'removeItemFromEffect');

      const source = store.getEmptySource({ _id: 'src1' });
      (source as any).sourceEffectId = 'e1';

      store.removeSource(source);

      expect(spy).toHaveBeenCalledWith({
        effectId: 'e1',
        itemKey: 'spellSources',
        itemId: 'src1',
      });
    });
  });

  describe('Calculations', () => {
    it('should track last spell attack result', () => {
      const store = useSpellsStore();
      store.setLastSpellAttackResult('s1', 'crit-success');

      expect(store.lastSpellAttack).toEqual({
        spellId: 's1',
        resultType: 'crit-success',
      });
    });

    it('should calculate Spell Crit Range', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();

      const spell = store.getEmptySpell({
        name: 'Crit Spell',
        isAttack: true,
        critRange: 20,
        attackType: 'ranged',
      });
      store.updateSpell(spell);

      effectsStore.addEffect({
        label: 'Sniper',
        enabled: true,
        effects: [
          {
            _id: 'c1',
            attribute: effectKeys['ranged-spell-crit-range'],
            operation: 'set-min',
            value: 19,
            formula: '',
          },
        ],
      });

      const crit = store.getSpellCritRange(store.userSpells[0]);
      expect(crit.value.final).toBe(19);
    });

    it('getSourceAttackBonus should return 0 for unknown source type', () => {
      const store = useSpellsStore();
      const source = store.getEmptySource({ name: 'Bad Source' });
      // @ts-ignore
      source.type = 'unknown';
      store.userSources.push(source);

      const bonus = store.getSourceAttackBonus(source._id);
      expect(bonus.value.final).toBe(0);
    });

    it('getSourceDC should return 0 for unknown source type', () => {
      const store = useSpellsStore();
      const source = store.getEmptySource({ name: 'Bad Source' });
      // @ts-ignore
      source.type = 'unknown';
      store.userSources.push(source);

      const dc = store.getSourceDC(source._id);
      expect(dc.value.final).toBe(0);
    });

    it('should calculate Source DC (Ability Based)', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      progressionStore.updateClass({ name: 'Wizard', level: 1 });

      // Int is 16 from beforeEach
      store.updateSource({ type: 'ability', ability: 'intelligence', name: 'Wizard' });
      const sourceId = store.userSources[0]._id;

      const dc = store.getSourceDC(sourceId);
      expect(dc.value.final).toBe(13);
    });

    it('getSpellDamage should return empty structure if no damage defined', () => {
      const store = useSpellsStore();
      const spell = store.getEmptySpell({ name: 'Utility Spell', damage: [] });

      const result = store.getSpellDamage(spell);

      expect(result.value.final).toEqual([]);
      expect(result.value.modifiers).toEqual([]);
    });

    it('getSourceAttackBonus should return flat value for flat sources', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'flat', flat: 5, name: 'Flat Wand' });
      const source = store.userSources.find((s) => s.name === 'Flat Wand')!;

      const bonus = store.getSourceAttackBonus(source._id);

      expect(bonus.value.final).toBe(5);
    });

    it('getSourceAttackBonus should return calculated value for ability sources', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();
      progressionStore.updateClass({ name: 'Wizard', level: 1 });

      store.updateSource({ type: 'ability', ability: 'intelligence' }); // Int +3
      const source = store.userSources[0];

      const bonus = store.getSourceAttackBonus(source._id);
      expect(bonus.value.final).toBe(5);
    });

    it('getSourceAttackBonus should return 0 for invalid source id', () => {
      const store = useSpellsStore();
      const bonus = store.getSourceAttackBonus('non-existent');
      expect(bonus.value.final).toBe(0);
    });

    it('getSourceDC should return 0 for invalid source id', () => {
      const store = useSpellsStore();
      const dc = store.getSourceDC('non-existent');
      expect(dc.value.final).toBe(0);
    });

    it('getSpellAttackBonus should use flat source value if spell uses spellcasting ability', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'flat', flat: 4, name: 'Flat Item' });
      const source = store.userSources.find((s) => s.name === 'Flat Item')!;

      const spell = store.getEmptySpell({
        name: 'Item Spell',
        spellSourceId: source._id,
        attackAbility: 'spellcasting',
      });

      const bonus = store.getSpellAttackBonus(spell);

      expect(bonus.value.final).toBe(4);
    });

    it('should calculate Source DC (Flat)', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'flat', flat: 5, name: 'Item' });
      const dc = store.getSourceDC(store.userSources[0]._id);
      expect(dc.value.final).toBe(13);
    });

    it('should calculate Spell Attack Bonus', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();
      progressionStore.updateClass({ name: 'Wizard', level: 1 });

      store.updateSource({ type: 'ability', ability: 'intelligence' });
      const sourceId = store.userSources[0]._id;

      const spell = store.getEmptySpell({
        name: 'Bolt',
        attackAbility: 'spellcasting',
        isAttack: true,
        spellSourceId: sourceId,
      });
      store.updateSpell(spell);

      // PB(2) + Int(3)
      const bonus = store.getSpellAttackBonus(store.userSpells[0]);
      expect(bonus.value.final).toBe(5);
    });

    it('should include effect modifiers in Attack Bonus', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();
      const progressionStore = useProgressionStore();
      progressionStore.updateClass({ name: 'Wizard', level: 1 });

      store.updateSource({ type: 'ability', ability: 'intelligence' });
      const sourceId = store.userSources[0]._id;

      const spell = store.getEmptySpell({ name: 'Bolt', spellSourceId: sourceId, isAttack: true });
      store.updateSpell(spell);

      effectsStore.addEffect({
        label: 'Wand +1',
        enabled: true,
        effects: [
          {
            _id: '1',
            attribute: effectKeys['spell-attack'],
            operation: 'add',
            value: 1,
            formula: '',
          },
        ],
      });

      // 5 + 1
      const bonus = store.getSpellAttackBonus(store.userSpells[0]);
      expect(bonus.value.final).toBe(6);
    });

    it('should calculate Spell Damage with Ability Modifier', () => {
      const store = useSpellsStore();
      store.updateSource({ type: 'ability', ability: 'intelligence' });
      const sourceId = store.userSources[0]._id;

      const spell = store.getEmptySpell({
        name: 'Firebolt',
        spellSourceId: sourceId,
        damage: [{ damage: '1d10', type: 'fire', ability: 'spellcasting', critDamage: '1d10' }],
      });
      store.updateSpell(spell);

      const damage = store.getSpellDamage(store.userSpells[0]);

      // 1d10 and 3
      expect(damage.value.final).toContain('1d10');
      expect(damage.value.final).toContain(3);
    });
  });

  describe('Spell Slots', () => {
    it('should calculate slots for Single Class (Full Caster)', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      // Level 3 Full Caster -> 4 Lvl 1 slots, 2 Lvl 2 slots
      progressionStore.updateClass({ name: 'Wizard', level: 3, spellcasting: 'full' });

      const slots = store.getSlots;
      expect(slots.standard[0]).toBe(4);
      expect(slots.standard[1]).toBe(2);
      expect(slots.standard[2]).toBe(0);
    });

    it('should handle invalid caster type in multiclass calculation', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      progressionStore.updateClass({ name: 'Wizard', level: 1, spellcasting: 'full' });
      const invalidClass = progressionStore.getEmptyClass();
      invalidClass.name = 'Homebrew';
      invalidClass.level = 5;
      // @ts-ignore
      invalidClass.spellcasting = 'unknown-type';
      progressionStore.classes.push(invalidClass);

      const slots = store.getSlots;
      // Should treat unknown type as 0 levels, so total level is 1 (Wizard)
      expect(slots.standard[0]).toBe(2);
    });

    it('should correctly calculate multiclass pact slots ignoring non-pact classes', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      progressionStore.updateClass({ name: 'Warlock', level: 2, spellcasting: 'pact' });
      progressionStore.updateClass({ name: 'Wizard', level: 2, spellcasting: 'full' });

      const slots = store.getSlots;

      // Pact slots should only come from Warlock (2 slots)
      expect(slots.pact[0]).toBe(2);
    });

    it('should calculate slots for Multiclass (Full + Full)', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      // Wizard 3 + Cleric 2 = Level 5 Caster
      // Lvl 5 Slots: 4, 3, 2
      progressionStore.updateClass({ name: 'Wizard', level: 3, spellcasting: 'full' });
      progressionStore.updateClass({ name: 'Cleric', level: 2, spellcasting: 'full' });

      const slots = store.getSlots;
      expect(slots.standard[0]).toBe(4);
      expect(slots.standard[1]).toBe(3);
      expect(slots.standard[2]).toBe(2);
    });

    it('should calculate slots for Pact Magic', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      // Warlock 2 -> 2 slots of Level 1
      progressionStore.updateClass({ name: 'Warlock', level: 2, spellcasting: 'pact' });

      const warlockClass = progressionStore.classes.find((c) => c.name === 'Warlock');
      expect(warlockClass).toBeDefined();
      const warlockId = warlockClass!._id;

      let slots = store.getSlots;
      expect(slots.pact[0]).toBe(2);
      expect(slots.pact[1]).toBe(0);

      progressionStore.updateClass({ _id: warlockId, level: 11 });

      slots = store.getSlots;

      // Warlock 2 -> 3 slots of Level 5
      expect(slots.pact[4]).toBe(3);

      // Lower level slots should be 0
      expect(slots.pact[0]).toBe(0);

      // Make sure no standard slots were generated
      expect(slots.standard.every((s) => s === 0)).toBe(true);
    });

    it('should handle non-pact caster asking for pact slots (Single class)', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      progressionStore.updateClass({ name: 'Wizard', level: 5, spellcasting: 'full' });

      const slots = store.getSlots;
      expect(slots.pact[0]).toBe(0);
    });

    it('should use manual slot values when mode is manual', () => {
      const store = useSpellsStore();

      store.slots.mode = 'manual';
      store.slots.total.standard[0] = 5;
      store.slots.total.pact[0] = 2;

      const slots = store.getSlots;

      expect(slots.standard[0]).toBe(5);
      expect(slots.pact[0]).toBe(2);
    });

    it('should ignore non-caster classes in multiclass calculation', () => {
      const store = useSpellsStore();
      const progressionStore = useProgressionStore();

      progressionStore.updateClass({ name: 'Fighter', level: 5, spellcasting: 'none' });

      progressionStore.updateClass({ name: 'Wizard', level: 3, spellcasting: 'full' });

      // Level 3 caster, ignoring the fighter
      const slots = store.getSlots;

      expect(slots.standard[0]).toBe(4);
      expect(slots.standard[1]).toBe(2);
      expect(slots.standard[2]).toBe(0);
    });
  });

  describe('Effects Integration', () => {
    it('should include spells provided by effects', () => {
      const store = useSpellsStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Ring of Spell Storing',
        enabled: true,
        spells: [store.getEmptySpell({ name: 'Stored Fireball' })],
      });

      expect(store.spells.length).toBe(1);
      expect(store.spells[0].name).toBe('Stored Fireball');
      expect(store.spells[0].isFromEffect).toBe(true);
    });
  });

  describe('Chat Integration', () => {
    it('should send spell info to chat', async () => {
      const store = useSpellsStore();
      const metaStore = useMetaStore();
      metaStore.name = 'Test Character';

      const dispatchPost = vi.fn();
      const { dispatchRef } = await import('@/relay/relay');
      dispatchRef.value = { post: dispatchPost } as any;

      const spell = store.getEmptySpell({ name: 'Fireball', description: { default: 'Boom' } });
      store.updateSpell(spell);

      await store.sendSpellInfoToChat(spell._id, (k) => k);

      expect(dispatchPost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('Fireball'),
        }),
      );
    });

    it('should do nothing if spell id is invalid', async () => {
      const store = useSpellsStore();
      const dispatchPost = vi.fn();
      const { dispatchRef } = await import('@/relay/relay');
      dispatchRef.value = { post: dispatchPost } as any;

      await store.sendSpellInfoToChat('invalid-id', (k) => k);

      expect(dispatchPost).not.toHaveBeenCalled();
    });
  });

  describe('Hydration & Dehydration', () => {
    it('should not wipe existing spells if payload is missing key', () => {
      const store = useSpellsStore();
      store.updateSpell({ name: 'Existing Spell' });

      store.hydrate({} as any);

      expect(store.userSpells).toHaveLength(1);
      expect(store.userSpells[0].name).toBe('Existing Spell');
    });

    it('should hydrate sources without requirements correctly', () => {
      const store = useSpellsStore();
      const mockData = {
        sources: {
          src1: {
            _id: 'src1',
            name: 'Src1',
            type: 'ability',
            ability: 'intelligence',
            arrayPosition: 0,
          },
        },
      };

      store.hydrate(mockData as any);

      expect(store.userSources).toHaveLength(1);
      expect(store.userSources[0].required).toBeUndefined();
    });

    it('should hydrate spells correctly', () => {
      const store = useSpellsStore();
      const mockSpell = store.getEmptySpell({ name: 'Hydrated Spell' });

      store.hydrate({
        spells: {
          [mockSpell._id]: { ...mockSpell, arrayPosition: 0 },
        },
      } as any);

      expect(store.userSpells).toHaveLength(1);
      expect(store.userSpells[0].name).toBe('Hydrated Spell');
    });

    it('should hydrate complex spell arrays', () => {
      const store = useSpellsStore();
      const mockData = {
        spells: {
          s1: {
            _id: 's1',
            name: 'Complex Spell',
            arrayPosition: 0,
            components: { '0': 'verbal', '1': 'somatic' },
            damage: { '0': { damage: '1d6', type: 'fire' } },
            upcast: { '0': { level: 2, damage: [] } },
          },
        },
      };

      store.hydrate(mockData as any);

      const spell = store.userSpells[0];
      expect(spell.components).toEqual(['verbal', 'somatic']);
      expect(spell.damage[0].type).toBe('fire');
      expect(spell.upcast).toHaveLength(1);
    });

    it('should dehydrate required fields correctly', () => {
      const store = useSpellsStore();
      store.updateSpell({
        name: 'Spell With Req',
        required: ['equipped'],
      });
      store.updateSource({
        name: 'Source With Req',
        type: 'ability',
        ability: 'wisdom',
        required: ['attuned'],
      });

      const data = store.dehydrate();

      const spell = Object.values(data.spells)[0];
      const source = Object.values(data.sources)[0];

      expect(spell.required).toBeDefined();
      expect(Object.values(spell.required as object)).toContain('equipped');

      expect(source.required).toBeDefined();
      expect(Object.values(source.required as object)).toContain('attuned');
    });

    it('should hydrate complex fields', () => {
      const store = useSpellsStore();
      const mockData = {
        spells: {
          s1: { _id: 's1', name: 'S1', arrayPosition: 0, required: { '0': 'equipped' } },
        },
        sources: {
          src1: { _id: 'src1', name: 'Src1', arrayPosition: 0, required: { '0': 'attuned' } },
        },
        slots: {
          mode: 'manual',
          total: { standard: { '0': 4 }, pact: { '0': 2 } },
          used: { '0': 1 },
        },
      };

      store.hydrate(mockData as any);

      expect(store.userSpells[0].required).toEqual(['equipped']);
      expect(store.userSources[0].required).toEqual(['attuned']);
      expect(store.slots.mode).toBe('manual');
      expect(store.slots.total.standard[0]).toBe(4);
    });
  });
});
