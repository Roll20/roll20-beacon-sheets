import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDefenseStore } from '../defenses/defenseStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import type { Tag } from '../tags/tagsStore';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import { v4 as uuidv4 } from 'uuid';

describe('defenseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty defense arrays', () => {
    const store = useDefenseStore();

    expect(store.conditionImmunities).toEqual([]);
    expect(store.damageResistances).toEqual([]);
    expect(store.damageImmunities).toEqual([]);
    expect(store.damageVulnerabilities).toEqual([]);
  });

  it('sets defenses correctly via action', () => {
    const store = useDefenseStore();
    const testData = {
      conditionImmunities: [{ _id: '1', text: 'charmed' }],
      damageResistances: [{ _id: '2', text: 'fire' }],
      damageImmunities: [{ _id: '3', text: 'poison' }],
      damageVulnerabilities: [{ _id: '4', text: 'cold' }],
    };

    store.setDefenses(testData);

    expect(store.conditionImmunities).toEqual(testData.conditionImmunities);
    expect(store.damageResistances).toEqual(testData.damageResistances);
    expect(store.damageImmunities).toEqual(testData.damageImmunities);
    expect(store.damageVulnerabilities).toEqual(testData.damageVulnerabilities);
  });

  describe('Integration with Effects', () => {
    it('combines user tags with effect tags', () => {
      const store = useDefenseStore();
      const effectsStore = useEffectsStore();

      store.damageResistances = [{ _id: '1', text: 'fire' }];

      effectsStore.addEffect({
        label: 'Ring of Warmth',
        enabled: true,
        effects: [
          {
            _id: uuidv4(),
            attribute: 'damage-resistances', 
            operation: 'push',
            value: 'cold',
            formula: '',
          },
        ],
      });

      expect(store.combinedDamageResistances).toHaveLength(2);
      expect(store.combinedDamageResistances).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: 'fire' }),
          expect.objectContaining({ text: 'cold', isFromEffect: true }),
        ])
      );
    });

    it('deduplicates tags if user and effect specify the same defense', () => {
      const store = useDefenseStore();
      const effectsStore = useEffectsStore();

      store.damageResistances = [{ _id: '1', text: 'fire' }];

      effectsStore.addEffect({
        label: 'Ring of Fire Resistance',
        enabled: true,
        effects: [
          {
            _id: uuidv4(),
            attribute: 'damage-resistances',
            operation: 'push',
            value: 'fire',
            formula: '',
          },
        ],
      });

      expect(store.combinedDamageResistances).toHaveLength(1);
      expect(store.combinedDamageResistances[0].text).toBe('fire');
    });
  });

  describe('Display Logic (Filtering)', () => {
    it('hides resistance if immunity exists (User vs User)', () => {
      const store = useDefenseStore();

      store.damageResistances = [{ _id: '1', text: 'fire' }];
      store.damageImmunities = [{ _id: '2', text: 'fire' }];

      expect(store.displayDamageImmunities).toHaveLength(1);
      expect(store.displayDamageImmunities[0].text).toBe('fire');

      expect(store.displayDamageResistances).toHaveLength(0);
    });

    it('hides resistance if immunity exists (Effect vs User)', () => {
      const store = useDefenseStore();
      const effectsStore = useEffectsStore();

      store.damageResistances = [{ _id: '1', text: 'fire' }];

      effectsStore.addEffect({
        label: 'Potion of Fire Immunity',
        enabled: true,
        effects: [
          {
            _id: uuidv4(),
            attribute: 'damage-immunities',
            operation: 'push',
            value: 'fire',
            formula: '',
          },
        ],
      });

      expect(store.displayDamageImmunities).toHaveLength(1);
      expect(store.displayDamageImmunities[0].text).toBe('fire');
      
      expect(store.displayDamageResistances).toHaveLength(0);
    });

    it('hides resistance if vulnerability exists', () => {
      const store = useDefenseStore();
      
      store.damageResistances = [{ _id: '1', text: 'cold' }];
      store.damageVulnerabilities = [{ _id: '2', text: 'cold' }];

      expect(store.displayDamageResistances).toHaveLength(0);
      expect(store.displayDamageVulnerabilities).toHaveLength(0);
    });
  });

  describe('Hydration', () => {
    it('dehydrates correctly', () => {
      const store = useDefenseStore();
      const testData = {
        conditionImmunities: [{ _id: '1', text: 'charmed' }],
        damageResistances: [{ _id: '2', text: 'fire' }],
        damageImmunities: [],
        damageVulnerabilities: [],
      };

      store.setDefenses(testData);
      const dehydrated = store.dehydrate();

      expect(dehydrated.defenses.conditionImmunities['1']).toMatchObject({ text: 'charmed' });
      expect(dehydrated.defenses.conditionImmunities['1']).not.toHaveProperty('_id');
      
      expect(dehydrated.defenses.damageResistances['2']).toMatchObject({ text: 'fire' });
      expect(dehydrated.defenses.damageResistances['2']).not.toHaveProperty('_id');
    });

    it('hydrates correctly', () => {
      const store = useDefenseStore();
      const payload = {
        defenses: {
          conditionImmunities: { 
            '1': { _id: '1', text: 'charmed', arrayPosition: 0 } 
          },
          damageResistances: { 
            '2': { _id: '2', text: 'fire', arrayPosition: 0 } 
          },
          damageImmunities: {},
          damageVulnerabilities: {},
        },
      };

      store.hydrate(payload as any);

      expect(store.conditionImmunities).toHaveLength(1);
      expect(store.conditionImmunities[0].text).toBe('charmed');
      expect(store.damageResistances).toHaveLength(1);
      expect(store.damageResistances[0].text).toBe('fire');
    });

    it('handles hydrate with empty payload', () => {
      const store = useDefenseStore();
      store.damageResistances = [{ _id: '1', text: 'fire' }];
      
      store.hydrate({} as any);
      expect(store.damageResistances).toHaveLength(1);
    });
  });
});