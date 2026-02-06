import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConditionsStore } from '../conditions/conditionsStore';

describe('conditionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('activeConditions', () => {
    it('should initialize with empty array', () => {
      const store = useConditionsStore();
      expect(store.activeConditions).toEqual([]);
    });
  });

  describe('isConditionActive', () => {
    it('should return false when condition is not active', () => {
      const store = useConditionsStore();
      expect(store.isConditionActive('blinded')).toBe(false);
    });

    it('should return true when condition is active', () => {
      const store = useConditionsStore();
      store.activeConditions.push('blinded');
      expect(store.isConditionActive('blinded')).toBe(true);
    });
  });

  describe('toggleCondition', () => {
    it('should add condition when not active', () => {
      const store = useConditionsStore();
      store.toggleCondition('poisoned');
      expect(store.activeConditions).toContain('poisoned');
    });

    it('should remove condition when active', () => {
      const store = useConditionsStore();
      store.activeConditions.push('poisoned');
      store.toggleCondition('poisoned');
      expect(store.activeConditions).not.toContain('poisoned');
    });

    it('should toggle condition multiple times', () => {
      const store = useConditionsStore();
      store.toggleCondition('stunned');
      expect(store.activeConditions).toContain('stunned');
      store.toggleCondition('stunned');
      expect(store.activeConditions).not.toContain('stunned');
      store.toggleCondition('stunned');
      expect(store.activeConditions).toContain('stunned');
    });

    it('should clean up duplicates if they exist when toggling off', () => {
      const store = useConditionsStore();
      store.activeConditions.push('stunned', 'stunned');

      store.toggleCondition('stunned');
      expect(store.activeConditions).not.toContain('stunned');
      expect(store.activeConditions.length).toBe(0);
    });
  });

  describe('setActiveConditions', () => {
    it('should replace all active conditions', () => {
      const store = useConditionsStore();
      store.setActiveConditions(['blinded', 'deafened']);
      expect(store.activeConditions).toEqual(['blinded', 'deafened']);
    });

    it('should clear existing conditions', () => {
      const store = useConditionsStore();
      store.activeConditions.push('poisoned');
      store.setActiveConditions(['stunned']);
      expect(store.activeConditions).toEqual(['stunned']);
    });

    it('should deduplicate input conditions', () => {
      const store = useConditionsStore();
      store.setActiveConditions(['blinded', 'blinded', 'stunned']);
      expect(store.activeConditions).toEqual(['blinded', 'stunned']);
    });
  });

  describe('dehydrate', () => {
    it('should convert active conditions to indexed object', () => {
      const store = useConditionsStore();
      store.setActiveConditions(['blinded', 'deafened']);
      const result = store.dehydrate();
      expect(result).toEqual({
        conditions: {
          activeConditions: { '0': 'blinded', '1': 'deafened' },
        },
      });
    });

    it('should handle empty conditions', () => {
      const store = useConditionsStore();
      const result = store.dehydrate();
      expect(result).toEqual({
        conditions: {
          activeConditions: {},
        },
      });
    });
  });

  describe('hydrate', () => {
    it('should restore active conditions from indexed object', () => {
      const store = useConditionsStore();
      store.hydrate({
        conditions: {
          activeConditions: { '0': 'paralyzed', '1': 'frightened' },
        },
      });
      expect(store.activeConditions).toEqual(['paralyzed', 'frightened']);
    });

    it('should overwrite existing state when hydrating', () => {
      const store = useConditionsStore();
      store.activeConditions = ['old-condition'];

      store.hydrate({
        conditions: {
          activeConditions: { '0': 'new-condition' },
        },
      });

      expect(store.activeConditions).toEqual(['new-condition']);
      expect(store.activeConditions).not.toContain('old-condition');
    });

    it('should handle missing conditions payload', () => {
      const store = useConditionsStore();
      store.activeConditions.push('blinded');
      store.hydrate({} as any);
      expect(store.activeConditions).toEqual(['blinded']);
    });

    it('should handle null payload', () => {
      const store = useConditionsStore();
      store.activeConditions.push('blinded');
      store.hydrate(null as any);
      expect(store.activeConditions).toEqual(['blinded']);
    });

    it('should set empty array when activeConditions is undefined', () => {
      const store = useConditionsStore();
      store.hydrate({
        conditions: {
          activeConditions: undefined as any,
        },
      });
      expect(store.activeConditions).toEqual([]);
    });
  });
});
