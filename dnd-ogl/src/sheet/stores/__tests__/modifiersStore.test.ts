import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { useTagsStore } from '../tags/tagsStore';
import { effectKeys } from '@/effects.config';
import { v4 as uuidv4 } from 'uuid';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('useEffectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('addEffect', () => {
    it('should add a new effect to the store', () => {
      const store = useEffectsStore();
      const effect = store.addEffect({ label: 'Test Effect', description: 'Test Description' });

      expect(store.effects).toHaveLength(1);
      expect(effect.label).toBe('Test Effect');
      expect(effect.description).toBe('Test Description');
      expect(effect._id).toBeDefined();
    });

    it('should create effect with default values', () => {
      const store = useEffectsStore();
      const effect = store.addEffect({});

      expect(effect.label).toBe('');
      expect(effect.enabled).toBe(true);
      expect(effect.effects).toEqual([]);
      expect(effect.actions).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing effect', () => {
      const store = useEffectsStore();
      const effect = store.addEffect({ label: 'Original' });

      store.update({ _id: effect._id, label: 'Updated' });

      expect(store.effects[0].label).toBe('Updated');
    });

    it('should create a new effect if _id does not exist', () => {
      const store = useEffectsStore();
      store.update({ label: 'New Effect' });

      expect(store.effects).toHaveLength(1);
      expect(store.effects[0].label).toBe('New Effect');
    });

    it('should assign UUIDs to nested items (actions, spells, resources, spellSources)', () => {
      const store = useEffectsStore();
      store.update({
        label: 'Test',
        actions: [{ name: 'Action 1' } as any],
        resources: [{ name: 'Resource 1' } as any],
        spells: [{ name: 'Spell 1' } as any],
        spellSources: [{ name: 'Source 1' } as any],
        effects: [{ attribute: 'test', operation: 'add' as const, value: 1, formula: '' } as any],
      });

      const effect = store.effects[0];
      expect(effect.actions![0]._id).toBeDefined();
      expect(effect.resources![0]._id).toBeDefined();
      expect(effect.spells![0]._id).toBeDefined();
      expect(effect.spellSources![0]._id).toBeDefined();
      expect(effect.effects[0]._id).toBeDefined();
    });
  });

  describe('Removal and Cleanup', () => {
    it('should remove an effect and clean up associated tags', () => {
      const store = useEffectsStore();
      const tagsStore = useTagsStore();

      const effect = store.addEffect({
        label: 'Effect with Action',
        actions: [{ name: 'Fireball', tagId: 'tag-123' } as any],
      });

      tagsStore.tagGroups.push({ _id: 'tag-123', tags: [] });

      store.remove(effect._id);

      expect(store.effects).toHaveLength(0);
      expect(tagsStore.tagGroups.find((g) => g._id === 'tag-123')).toBeUndefined();
    });

    it('should clean up tags when removing an effect containing a spell with a tagId', () => {
      const store = useEffectsStore();
      const tagsStore = useTagsStore();
      const removeTagSpy = vi.spyOn(tagsStore, 'remove');

      const spellTagId = 'tag-spell-123';
      const effect = store.addEffect({
        label: 'Spell Container',
        spells: [
          {
            name: 'Test Spell',
            tagId: spellTagId,
          } as any,
        ],
      });

      store.remove(effect._id);

      expect(removeTagSpy).toHaveBeenCalledWith(spellTagId);
    });
  });

  describe('getExistingOrCreate', () => {
    it('should return existing effect if found', () => {
      const store = useEffectsStore();
      const effect = store.addEffect({ label: 'Existing' });

      const result = store.getExistingOrCreate({ _id: effect._id });

      expect(result).toStrictEqual(effect);
      expect(store.effects).toHaveLength(1);
    });

    it('should create new effect if not found', () => {
      const store = useEffectsStore();
      const result = store.getExistingOrCreate({ _id: 'new-id', label: 'New' });

      expect(result.label).toBe('New');
      expect(store.effects).toHaveLength(1);
    });
  });

  describe('getActiveEffectLabels', () => {
    it('should return labels of active effects modifying a specific attribute', () => {
      const store = useEffectsStore();

      // Active
      store.addEffect({
        label: 'Rage',
        enabled: true,
        effects: [{ _id: '1', attribute: 'strength', operation: 'add', value: 2, formula: '' }],
      });

      // Inactive
      store.addEffect({
        label: 'Potion',
        enabled: false,
        effects: [{ _id: '2', attribute: 'strength', operation: 'add', value: 2, formula: '' }],
      });

      // Different attribute
      store.addEffect({
        label: 'Dexterity Buff',
        enabled: true,
        effects: [{ _id: '3', attribute: 'dexterity', operation: 'add', value: 2, formula: '' }],
      });

      const labels = store.getActiveEffectLabels('strength');
      expect(labels).toEqual(['Rage']);
      expect(labels).not.toContain('Potion');
      expect(labels).not.toContain('Dexterity Buff');
    });
  });

  describe('visibleEffects', () => {
    it('should only return toggleable effects', () => {
      const store = useEffectsStore();

      store.addEffect({ label: 'Hidden', toggleable: false });
      store.addEffect({ label: 'Visible', toggleable: true });

      expect(store.visibleEffects).toHaveLength(1);
      expect(store.visibleEffects[0].label).toBe('Visible');
    });
  });

  describe('Requirements (Equipment)', () => {
    it('should calculate value based on "equipped" requirement', () => {
      const effectsStore = useEffectsStore();
      const equipmentStore = useEquipmentStore();

      const effect = effectsStore.addEffect({
        label: 'Shield',
        enabled: true,
        effects: [
          {
            _id: uuidv4(),
            attribute: 'armor-class',
            operation: 'add',
            value: 2,
            formula: '',
            required: ['equipped'],
          },
        ],
      });

      const item = equipmentStore.getEmptyEquipment({
        name: 'Shield',
        effectId: effect._id,
        equipped: false,
      });
      equipmentStore.equipment.push(item);

      let ac = effectsStore.getModifiedValue(10, 'armor-class');
      expect(ac.value.final).toBe(10);

      // Equip Item
      item.equipped = true;

      ac = effectsStore.getModifiedValue(10, 'armor-class');
      expect(ac.value.final).toBe(12);
    });

    it('should calculate value based on "attuned" requirement', () => {
      const effectsStore = useEffectsStore();
      const equipmentStore = useEquipmentStore();

      const effect = effectsStore.addEffect({
        label: 'Ring of Protection',
        enabled: true,
        effects: [
          {
            _id: uuidv4(),
            attribute: 'saving',
            operation: 'add',
            value: 1,
            formula: '',
            required: ['attuned', 'equipped'], 
          },
        ],
      });

      const item = equipmentStore.getEmptyEquipment({
        name: 'Ring',
        effectId: effect._id,
        equipped: true,
        isAttuned: false,
      });
      equipmentStore.equipment.push(item);

      let save = effectsStore.getModifiedValue(0, 'saving');
      expect(save.value.final).toBe(0);

      // Attune
      item.isAttuned = true;

      save = effectsStore.getModifiedValue(0, 'saving');
      expect(save.value.final).toBe(1);
    });
  });

  describe('Calculations', () => {
    it('should handle operation priorities', () => {
      const store = useEffectsStore();

      // Base 10
      // Effect 1: Set Base 15 (Priority 1)
      // Effect 2: Add 2 (Priority 2)
      // Effect 3: Set 20 (Priority 4)

      store.addEffect({
        label: 'Base Set',
        effects: [
          { _id: uuidv4(), attribute: 'test', operation: 'set-base', value: 15, formula: '' },
        ],
      });

      store.addEffect({
        label: 'Add',
        effects: [{ _id: uuidv4(), attribute: 'test', operation: 'add', value: 2, formula: '' }],
      });

      // 15 + 2
      let result = store.getModifiedValue(10, 'test');
      expect(result.value.final).toBe(17);

      store.addEffect({
        label: 'Hard Set',
        effects: [{ _id: uuidv4(), attribute: 'test', operation: 'set', value: 20, formula: '' }],
      });

      result = store.getModifiedValue(10, 'test');
      expect(result.value.final).toBe(20);
    });
  });

  describe('Hydration and Dehydration', () => {
    it('should dehydrate structures with requirements and components', () => {
      const store = useEffectsStore();

      store.addEffect({
        label: 'Complex',
        resources: [
          {
            name: 'Res',
            required: ['equipped'],
          } as any,
        ],
        spellSources: [
          {
            name: 'Source',
            required: ['attuned'], 
          } as any,
        ],
        spells: [
          {
            name: 'Spell',
            required: ['equipped'],
            components: ['verbal'],
            damage: [{ damage: '1d6' }],
          } as any,
        ],
      });

      const dehydrated = store.dehydrate();
      const effectValues = Object.values(dehydrated.effects);
      const dehydratedEffect = effectValues[0];

      const res = Object.values(dehydratedEffect.resources!)[0];
      expect(res.required).toBeDefined();
      expect(res.required!['0']).toBe('equipped');

      const source = Object.values(dehydratedEffect.spellSources!)[0];
      expect(source.required).toBeDefined();
      expect(source.required!['0']).toBe('attuned');

      const spell = Object.values(dehydratedEffect.spells!)[0];
      expect(spell.required).toBeDefined();
      expect(spell.required!['0']).toBe('equipped');
      expect(spell.components).toBeDefined();
      expect(spell.components!['0']).toBe('verbal');
    });

    it('should dehydrate structures without requirements', () => {
      const store = useEffectsStore();

      store.addEffect({
        label: 'Simple',
        resources: [{ name: 'Res' } as any],
        spellSources: [{ name: 'Source' } as any],
        spells: [{ name: 'Spell' } as any],
      });

      const dehydrated = store.dehydrate();
      const effect = Object.values(dehydrated.effects)[0];

      const res = Object.values(effect.resources!)[0];
      expect(res.required).toBeUndefined();

      const source = Object.values(effect.spellSources!)[0];
      expect(source.required).toBeUndefined();

      const spell = Object.values(effect.spells!)[0];
      expect(spell.required).toBeUndefined();
      expect(spell.components).toBeUndefined();
    });

    it('should handle dehydrating and hydrating single effects with array values and requirements', () => {
      const store = useEffectsStore();
      store.addEffect({
        label: 'Array Value',
        effects: [
          {
            _id: 'e1',
            attribute: 'test',
            operation: 'push',
            value: ['a', 'b'],
            formula: '',
            required: ['equipped'],
          },
        ],
      });

      const dehydrated = store.dehydrate();
      const effect = Object.values(dehydrated.effects)[0];
      const singleEffect = Object.values(effect.effects!)[0];

      expect(singleEffect.value).toEqual({ '0': 'a', '1': 'b' });
      expect(singleEffect.required).toEqual({ '0': 'equipped' });

      store.effects = [];
      store.hydrate(dehydrated);
      const hydratedEffect = store.effects[0].effects[0];

      expect(hydratedEffect.value).toEqual(['a', 'b']);
      expect(hydratedEffect.required).toEqual(['equipped']);
    });

    it('should dehydrate empty sub-collections as undefined', () => {
      const store = useEffectsStore();
      store.addEffect({
        label: 'Empty Collections',
        actions: [],
        resources: [],
        spellSources: [],
        spells: [],
        pickers: [],
      });
      const dehydrated = store.dehydrate();
      const effect = Object.values(dehydrated.effects)[0];

      expect(effect.actions).toBeUndefined();
      expect(effect.resources).toBeUndefined();
      expect(effect.spellSources).toBeUndefined();
      expect(effect.spells).toBeUndefined();
      expect(effect.pickers).toBeUndefined();
    });


    it('should dehydrate and hydrate effects with complex nested objects', () => {
      const store = useEffectsStore();
      const complexAction = {
        _id: 'act1',
        name: 'Complex Action',
        damage: [{ damage: '1d6', type: 'fire', ability: 'none' }],
        required: ['equipped'],
      } as any;

      const complexPicker = {
        label: 'Complex Picker',
        options: [{ label: 'Option A', value: '1' }],
      } as any;

      store.addEffect({
        label: 'Complex',
        actions: [complexAction],
        pickers: [complexPicker],
      });

      const dehydrated = store.dehydrate();
      const effect = Object.values(dehydrated.effects)[0];
      const actionDehydrated = Object.values(effect.actions!)[0];
      const pickerDehydrated = Object.values(effect.pickers!)[0];

      expect(actionDehydrated.damage).toBeDefined();
      expect(actionDehydrated.required).toBeDefined();
      expect(pickerDehydrated.options).toBeDefined();

      store.effects = [];
      store.hydrate(dehydrated);
      const hydratedEffect = store.effects[0];

      expect(hydratedEffect.actions![0].damage).toHaveLength(1);
      expect(hydratedEffect.actions![0].required).toEqual(['equipped']);
      expect(hydratedEffect.pickers![0].options).toHaveLength(1);
    });

    it('should hydrate picker without options safely', () => {
      const store = useEffectsStore();
      const json = {
        effects: {
          eff1: {
            _id: 'eff1',
            label: 'No Options',
            arrayPosition: 0,
            effects: {},
            pickers: {
              '0': { label: 'Empty Picker' },
            },
          },
        },
      };

      store.hydrate(json as any);
      expect(store.effects[0].pickers![0].options).toEqual([]);
    });
  });
});
