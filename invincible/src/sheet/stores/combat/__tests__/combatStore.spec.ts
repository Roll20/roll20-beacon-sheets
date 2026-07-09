import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { combatStore, modifiedHealthMax, modifiedResolveMax } from '../combatStore';
import { abilitiesStore } from '../../abilities/abilitiesStore';

describe('combatStore - Critical Injuries', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default values', () => {
    const store = combatStore();
    expect(store.health).toBe(2);
    expect(store.criticalInjuries).toHaveLength(0);
  });

  it('rolls a critical injury and assigns proper IDs', () => {
    const store = combatStore();
    store.rollCriticalInjury(0);

    expect(store.criticalInjuries).toHaveLength(1);
    const injury = store.criticalInjuries[0];
    expect(injury._id).toBeDefined();
    expect(typeof injury._id).toBe('string');
    expect(injury.roll).toBeDefined();
    expect(typeof injury.roll).toBe('number');
    expect(injury.name).toBeDefined();
    expect(injury.description).toBeDefined();

    if (injury.effects && injury.effects.value.length > 0) {
      expect(injury.effects.value[0]._id).toBeDefined();
      expect(typeof injury.effects.value[0]._id).toBe('string');
    }
  });

  it('applies the worst modifier and disables less severe modifiers', () => {
    const store = combatStore();

    
    store.criticalInjuries.push({
      _id: 'injury1',
      roll: 2,
      name: 'Bruised!',
      description: 'Test bruised',
      healingTime: 'A few hours',
      effects: {
        label: 'Bruised!',
        disabled: false,
        value: [
          {
            _id: 'eff1',
            attribute: 'fighting',
            value: 2,
            operation: 'subtract',
            disabled: false
          }
        ]
      }
    });

    
    store.criticalInjuries.push({
      _id: 'injury2',
      roll: 3,
      name: 'Scratched!',
      description: 'Test scratched',
      healingTime: 'A few hours',
      effects: {
        label: 'Scratched!',
        disabled: false,
        value: [
          {
            _id: 'eff2',
            attribute: 'fighting',
            value: 1,
            operation: 'subtract',
            disabled: false
          }
        ]
      }
    });

    store.normalizeCriticalInjuries();

    
    expect(store.criticalInjuries[0].effects.value[0].disabled).toBe(false);
    
    expect(store.criticalInjuries[1].effects.value[0].disabled).toBe(true);
  });

  it('implements shift-up behavior on rolling equal or lower than the worst existing crit', () => {
    const store = combatStore();

    
    store.criticalInjuries.push({
      _id: 'injury1',
      roll: 6,
      name: 'Battered!',
      description: 'Test battered',
      healingTime: 'A few weeks',
      effects: {
        label: 'Battered!',
        disabled: false,
        value: []
      }
    });

    
    
    const originalRandom = Math.random;
    Math.random = () => 0;

    try {
      
      
      
      store.rollCriticalInjury(0);

      expect(store.criticalInjuries).toHaveLength(2);
      const newCrit = store.criticalInjuries[1];
      expect(newCrit.roll).toBe(7); 
    } finally {
      Math.random = originalRandom;
    }
  });

  it('triggers critical injuries automatically on health drop to or below 0', async () => {
    const store = combatStore();
    expect(store.criticalInjuries).toHaveLength(0);

    
    store.health = 0;
    
    await nextTick();
    expect(store.criticalInjuries).toHaveLength(1);
    expect(store.health).toBe(0);

    
    store.health = -2;
    await nextTick();
    expect(store.criticalInjuries).toHaveLength(2);
    expect(store.health).toBe(0); 
  });

  it('resolves rolls higher than 13 to the last entry in the criticalInjuries table', () => {
    const store = combatStore();
    
    store.rollCriticalInjury(30);

    expect(store.criticalInjuries).toHaveLength(1);
    const injury = store.criticalInjuries[0];
    expect(injury.name).toBe('Torn apart!');
  });

  it('sorts critical injuries by roll value ascending', () => {
    const store = combatStore();

    store.criticalInjuries.push({
      _id: 'injury1',
      roll: 7,
      name: 'Crushed arm!',
      description: '',
      healingTime: '',
      effects: { value: [] }
    });

    store.criticalInjuries.push({
      _id: 'injury2',
      roll: 3,
      name: 'Bloodied!',
      description: '',
      healingTime: '',
      effects: { value: [] }
    });

    store.normalizeCriticalInjuries();

    expect(store.criticalInjuries[0].roll).toBe(3);
    expect(store.criticalInjuries[1].roll).toBe(7);
  });

  it('prefers keeping the injury at the end of the list active in case of tie penalties', () => {
    const store = combatStore();

    
    store.criticalInjuries.push({
      _id: 'injury1',
      roll: 2,
      name: 'Bruised!',
      description: 'Test bruised',
      healingTime: 'A few hours',
      effects: {
        label: 'Bruised!',
        disabled: false,
        value: [
          {
            _id: 'eff1',
            attribute: 'fighting',
            value: 2,
            operation: 'subtract',
            disabled: false
          }
        ]
      }
    });

    
    store.criticalInjuries.push({
      _id: 'injury2',
      roll: 4,
      name: 'Beaten up!',
      description: 'Test beaten up',
      healingTime: 'A few days',
      effects: {
        label: 'Beaten up!',
        disabled: false,
        value: [
          {
            _id: 'eff2',
            attribute: 'fighting',
            value: 2,
            operation: 'subtract',
            disabled: false
          }
        ]
      }
    });

    store.normalizeCriticalInjuries();

    
    expect(store.criticalInjuries[0].effects.value[0].disabled).toBe(true);
    expect(store.criticalInjuries[1].effects.value[0].disabled).toBe(false);
  });

  it('scales current health up when max health is increased', async () => {
    const abStore = abilitiesStore();
    const store = combatStore();

    
    await nextTick();

    
    expect(modifiedHealthMax.value).toBe(2);

    store.health = 1;
    await nextTick();

    
    abStore.fighting = 3;
    abStore.agility = 3;
    abStore.strength = 4;

    await nextTick();

    expect(modifiedHealthMax.value).toBe(5);
    expect(store.health).toBe(4); 
  });

  it('scales current resolve up when max resolve is increased', async () => {
    const abStore = abilitiesStore();
    const store = combatStore();

    
    await nextTick();

    
    expect(modifiedResolveMax.value).toBe(2);

    store.resolve = 1;
    await nextTick();

    
    abStore.reason = 3;
    abStore.intuition = 3;
    abStore.presence = 4;

    await nextTick();

    expect(modifiedResolveMax.value).toBe(5);
    expect(store.resolve).toBe(4); 
  });
});
