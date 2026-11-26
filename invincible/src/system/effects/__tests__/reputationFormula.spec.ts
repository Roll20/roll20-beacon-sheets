import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { characterStore } from '@/sheet/stores';
import { ruleSets } from '@/system';

describe('Reputation and Rank system rules', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('calculates rank based on biography.rank', () => {
    const store = characterStore();
    store.biography.rank = 2;

    const rankVal = ruleSets.rank();
    expect(rankVal.value).toBe(2);
    expect(rankVal.baseValue).toBe(2);
  });

  it('calculates reputation using base formula @{rank}', () => {
    const store = characterStore();
    store.biography.rank = 3;

    
    const repVal = ruleSets.reputation();
    expect(repVal.value).toBe(3);
    expect(repVal.baseValue).toBe('@{rank}');
  });

  it('applies modifiers to reputation on top of rank', () => {
    const store = characterStore();
    store.biography.rank = 3;

    
    store.effects.updateEffect({
      _id: 'reputation_custom',
      attribute: 'reputation',
      value: 2,
      operation: 'add',
      label: 'Custom Adjustment'
    });

    const repVal = ruleSets.reputation();
    
    expect(repVal.value).toBe(5);
    expect(repVal.modifiers).toHaveLength(1);
    expect(repVal.modifiers[0]).toEqual({
      name: 'Custom Adjustment',
      value: 2
    });
  });
});
