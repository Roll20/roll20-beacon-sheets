import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUnrankedProficienciesStore } from '../proficiencies/unrankedProficienciesStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { effectKeys } from '@/effects.config';
import type { Tag } from '../tags/tagsStore';

describe('useUnrankedProficienciesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty arrays', () => {
    const store = useUnrankedProficienciesStore();

    expect(store.languages).toEqual([]);
    expect(store.armor).toEqual([]);
    expect(store.weapons).toEqual([]);
  });

  it('sets proficiencies correctly', () => {
    const store = useUnrankedProficienciesStore();
    const mockData = {
      languages: [{ _id: '1', text: 'Common' }] as Tag[],
      armor: [{ _id: '2', text: 'Light Armor' }] as Tag[],
      weapons: [{ _id: '3', text: 'Simple Weapons' }] as Tag[],
    };

    store.setProficiencies(mockData);

    expect(store.languages).toEqual(mockData.languages);
    expect(store.armor).toEqual(mockData.armor);
    expect(store.weapons).toEqual(mockData.weapons);
  });

  describe('Integration with EffectsStore', () => {
    it('combines user tags with effect tags', () => {
      const store = useUnrankedProficienciesStore();
      const effectsStore = useEffectsStore();

      store.languages = [{ _id: '1', text: 'Common' }] as Tag[];

      effectsStore.addEffect({
        label: 'Elf Traits',
        enabled: true,
        effects: [
          {
            _id: 'eff1',
            attribute: effectKeys['languages'],
            operation: 'push',
            value: 'Elvish',
            formula: '',
          },
        ],
      });

      expect(store.combinedLanguages).toHaveLength(2);
      expect(store.combinedLanguages.map((t) => t.text)).toContain('Common');
      expect(store.combinedLanguages.map((t) => t.text)).toContain('Elvish');
    });

    it('avoids duplicate tags in combined proficiencies', () => {
      const store = useUnrankedProficienciesStore();
      const effectsStore = useEffectsStore();

      store.languages = [{ _id: '1', text: 'Common' }] as Tag[];

      effectsStore.addEffect({
        label: 'Human Traits',
        enabled: true,
        effects: [
          {
            _id: 'eff1',
            attribute: effectKeys['languages'],
            operation: 'push',
            value: 'Common',
            formula: '',
          },
        ],
      });

      expect(store.combinedLanguages).toHaveLength(1);
      expect(store.combinedLanguages[0].text).toBe('Common');
    });

    it('avoids duplicate tags in combined proficiencies (Case Insensitive)', () => {
      const store = useUnrankedProficienciesStore();
      const effectsStore = useEffectsStore();

      store.languages = [{ _id: '1', text: 'Common' }] as Tag[];

      effectsStore.addEffect({
        label: 'Human Traits',
        enabled: true,
        effects: [
          {
            _id: 'eff1',
            attribute: effectKeys['languages'],
            operation: 'push',
            value: 'common',
            formula: '',
          },
        ],
      });

      expect(store.combinedLanguages).toHaveLength(1);
      expect(store.combinedLanguages[0].text).toBe('Common');
    });

    it('handles armor and weapon proficiencies from effects', () => {
      const store = useUnrankedProficienciesStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Class Features',
        enabled: true,
        effects: [
          {
            _id: 'e1',
            attribute: effectKeys['armor-proficiencies'],
            operation: 'push',
            value: 'Light Armor',
            formula: '',
          },
          {
            _id: 'e2',
            attribute: effectKeys['weapon-proficiencies'],
            operation: 'push',
            value: 'Simple Weapons',
            formula: '',
          },
        ],
      });

      expect(store.combinedArmorProficiencies).toHaveLength(1);
      expect(store.combinedArmorProficiencies[0].text).toBe('Light Armor');

      expect(store.combinedWeaponProficiencies).toHaveLength(1);
      expect(store.combinedWeaponProficiencies[0].text).toBe('Simple Weapons');
    });
  });

  describe('Hydration', () => {
    it('dehydrates store data correctly', () => {
      const store = useUnrankedProficienciesStore();
      store.languages = [{ _id: '1', text: 'Common' }] as Tag[];
      store.armor = [{ _id: '2', text: 'Light' }] as Tag[];
      store.weapons = [{ _id: '3', text: 'Simple' }] as Tag[];

      const dehydrated = store.dehydrate();

      expect(dehydrated.unrankedProficiencies.languages).toBeDefined();
      expect(Object.values(dehydrated.unrankedProficiencies.languages)).toHaveLength(1);
    });

    it('hydrates store data correctly', () => {
      const store = useUnrankedProficienciesStore();
      const mockData = {
        unrankedProficiencies: {
          languages: { '1': { _id: '1', text: 'Common', arrayPosition: 0 } },
          armor: { '2': { _id: '2', text: 'Light', arrayPosition: 0 } },
          weapons: { '3': { _id: '3', text: 'Simple', arrayPosition: 0 } },
        },
      } as any;

      store.hydrate(mockData);

      expect(store.languages).toHaveLength(1);
      expect(store.languages[0].text).toBe('Common');
      expect(store.armor).toHaveLength(1);
      expect(store.weapons).toHaveLength(1);
    });

    it('handles missing payload in hydrate', () => {
      const store = useUnrankedProficienciesStore();
      store.languages = [{ _id: '1', text: 'Common' }] as Tag[];

      store.hydrate({} as any);

      expect(store.languages).toHaveLength(1);
    });
  });
});
