import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { config } from '@/config';
import { effectKeys } from '@/effects.config';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('abilitiesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with default abilities based on config', () => {
    const store = useAbilitiesStore();

    expect(store.abilities).toHaveLength(config.abilities.length);
    store.abilities.forEach((ability, index) => {
      expect(ability.score).toBe(10);
      expect(ability.label).toBe(config.abilities[index]);
      expect(ability._id).toBeDefined();
    });
  });

  it('should update an ability score', () => {
    const store = useAbilitiesStore();
    const ability = store.abilities.find((a) => a.label === 'strength')!;

    store.update(ability._id, { score: 15 });

    const updated = store.abilities.find((a) => a.label === 'strength')!;
    expect(updated.score).toBe(15);
  });

  describe('Modifiers Calculation (Math)', () => {
    it('should calculate ability modifiers correctly (Base 10)', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      ability.score = 10;
      expect(store.getAbilityModifier(ability).value.final).toBe(0);
    });

    it('should calculate ability modifiers correctly (Positive Even)', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      ability.score = 14;
      expect(store.getAbilityModifier(ability).value.final).toBe(2);
    });

    it('should calculate ability modifiers correctly (Positive Odd - Round Down)', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      ability.score = 15;
      expect(store.getAbilityModifier(ability).value.final).toBe(2);
    });

    it('should calculate ability modifiers correctly (Negative Even)', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      ability.score = 8;
      expect(store.getAbilityModifier(ability).value.final).toBe(-1);
    });

    it('should calculate ability modifiers correctly (Negative Odd - Round Down)', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      ability.score = 9;
      expect(store.getAbilityModifier(ability).value.final).toBe(-1);
    });
  });

  describe('Integration with EffectsStore', () => {
    it('should reflect score changes from effects', () => {
      const abilitiesStore = useAbilitiesStore();
      const effectsStore = useEffectsStore();

      const strAbility = abilitiesStore.abilities.find((a) => a.label === 'strength')!;
      strAbility.score = 10;

      effectsStore.addEffect({
        label: 'Gauntlets of Ogre Power',
        enabled: true,
        effects: [
          {
            _id: 'eff1',
            attribute: effectKeys['strength'],
            operation: 'add',
            value: 2,
            formula: '',
          },
        ],
      });

      const modifiedScore = abilitiesStore.getModifiedAbilityScore(strAbility);
      expect(modifiedScore.value.final).toBe(12);

      const modifier = abilitiesStore.getAbilityModifier(strAbility);
      expect(modifier.value.final).toBe(1);
    });

    it('should reflect check modifier changes from effects', () => {
      const abilitiesStore = useAbilitiesStore();
      const effectsStore = useEffectsStore();

      const dexAbility = abilitiesStore.abilities.find((a) => a.label === 'dexterity')!;
      dexAbility.score = 14;

      effectsStore.addEffect({
        label: 'Stone of Good Luck',
        enabled: true,
        effects: [
          {
            _id: 'eff2',
            attribute: effectKeys['dexterity-check'],
            operation: 'add',
            value: 1,
            formula: '',
          },
        ],
      });

      const checkMod = abilitiesStore.getAbilityCheckModifier(dexAbility);
      expect(checkMod.value.final).toBe(3);
    });
  });

  describe('Hydration & Dehydration', () => {
    it('should dehydrate store data correctly', () => {
      const store = useAbilitiesStore();
      const ability = store.abilities[0];
      store.update(ability._id, { score: 18 });

      const dehydrated = store.dehydrate();

      expect(dehydrated.abilities).toBeDefined();
      const dehydratedItem = dehydrated.abilities[ability._id];
      expect(dehydratedItem).toBeDefined();
      expect(dehydratedItem.score).toBe(18);
    });

    it('should replace entire array when hydrating', () => {
      const store = useAbilitiesStore();

      const mockData = {
        abilities: {
          'test-id': { _id: 'test-id', score: 20, label: 'strength' as const, arrayPosition: 0 },
        },
      };

      store.hydrate(mockData);

      expect(store.abilities).toHaveLength(1);
      expect(store.abilities[0]._id).toBe('test-id');
      expect(store.abilities[0].score).toBe(20);
    });

    it('should fallback to existing values if payload is empty', () => {
      const store = useAbilitiesStore();
      const originalLength = store.abilities.length;

      store.hydrate({ abilities: undefined as any });

      expect(store.abilities).toHaveLength(originalLength);
    });
  });
});
