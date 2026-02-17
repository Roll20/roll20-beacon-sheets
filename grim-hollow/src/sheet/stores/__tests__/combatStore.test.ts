import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCombatStore } from '../combat/combatStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useProgressionStore } from '../progression/progressionStore';
import { config } from '@/config';
import { effectKeys } from '@/effects.config';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('useCombatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const abilitiesStore = useAbilitiesStore();
    abilitiesStore.abilities.forEach(a => a.score = 10);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const store = useCombatStore();

      expect(store.armorClass).toEqual({
        mode: 'automatic',
        base: 10,
        ability: 'dexterity',
      });
      expect(store.deathSaves.successes).toBe(0);
      expect(store.deathSaves.failures).toBe(0);
      expect(store.exhaustion).toBe(0);
      expect(store.inspiration).toBe(0);
      expect(store.life).toEqual({
        hitPoints: 0,
        temporary: 0,
      });
      expect(store.speed.walk).toEqual({ base: 30, description: '' });
    });
  });

  describe('Armor Class', () => {
    it('should calculate AC based on Dexterity (Automatic Mode)', () => {
      const store = useCombatStore();
      const abilitiesStore = useAbilitiesStore();

      expect(store.getArmorClass().value.final).toBe(10);

      const dex = abilitiesStore.abilities.find(a => a.label === 'dexterity')!;
      abilitiesStore.update(dex._id, { score: 14 });

      expect(store.getArmorClass().value.final).toBe(12);
    });

    it('should apply effects to AC', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Shield',
        enabled: true,
        effects: [{
          _id: 'e1',
          attribute: effectKeys['armor-class'],
          operation: 'add',
          value: 2,
          formula: ''
        }]
      });

      expect(store.getArmorClass().value.final).toBe(12);
    });

    it('should handle Manual Mode correctly', () => {
      const store = useCombatStore();
      store.armorClass.mode = 'manual';
      store.armorClass.base = 15;
      store.armorClass.ability = 'wisdom';

      const abilitiesStore = useAbilitiesStore();
      const wis = abilitiesStore.abilities.find(a => a.label === 'wisdom')!;
      abilitiesStore.update(wis._id, { score: 16 });

      expect(store.getArmorClass().value.final).toBe(18);
    });
  });

  describe('Hit Points', () => {
    it('should calculate Max HP based on Classes and Con', () => {
      const store = useCombatStore();
      const progressionStore = useProgressionStore();
      const abilitiesStore = useAbilitiesStore();

      const con = abilitiesStore.abilities.find(a => a.label === 'constitution')!;
      abilitiesStore.update(con._id, { score: 14 });

      // Add level 1 class with 10 hp
      const cls = progressionStore.getEmptyClass();
      cls.level = 1;
      cls.hitPoints = [10];
      progressionStore.classes.push(cls);

      //10 hp + (Con +2 * Level 1) = 12
      expect(store.getHitPointsMax().value.final).toBe(12);

      const storedClass = progressionStore.classes[0];
      storedClass.level = 2;
      storedClass.hitPoints = [10, 6];
      
      // class hp (16) + (Con +2 * Level 2) = 20
      expect(store.getHitPointsMax().value.final).toBe(20);
    });

    it('should apply effects to Max HP', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Tough',
        enabled: true,
        effects: [{
          _id: 'e2',
          attribute: effectKeys['hit-points-max'],
          operation: 'add',
          value: 5,
          formula: ''
        }]
      });

      expect(store.getHitPointsMax().value.final).toBe(5);
    });

    it('should calculate Temporary Hit Points', () => {
      const store = useCombatStore();

      store.life.temporary = 10;

      expect(store.getTemporaryHitPoints()).toBe(10);
    });

  });

  describe('Speed', () => {
    it('should return base speed if no effects', () => {
      const store = useCombatStore();
      expect(store.getSpeed('walk').value.final).toBe(30);
      expect(store.getSpeed('fly').value.final).toBe(0);
    });

    it('should modify specific speed types via effects', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Longstrider',
        enabled: true,
        effects: [{
          _id: 'e3',
          attribute: effectKeys['walk-speed'],
          operation: 'add',
          value: 10,
          formula: ''
        }]
      });

      expect(store.getSpeed('walk').value.final).toBe(40);
    });

    it('should not allow adding to speed if base is 0', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      expect(store.getSpeed('fly').value.final).toBe(0);

      effectsStore.addEffect({
        label: 'Bonus Movement',
        enabled: true,
        effects: [{
          _id: 'add-fly',
          attribute: effectKeys['fly-speed'],
          operation: 'add',
          value: 10,
          formula: ''
        }]
      });

      // Should still be 0 because we don't have a base fly speed
      expect(store.getSpeed('fly').value.final).toBe(0);
    });

    it('should allow adding to speed if effect Sets Base speed first', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      effectsStore.addEffect({
        label: 'Fly Spell',
        enabled: true,
        effects: [{
          _id: 'grant-fly',
          attribute: effectKeys['fly-speed'],
          operation: 'set-base',
          value: 60,
          formula: ''
        }]
      });

      effectsStore.addEffect({
        label: 'Bonus Movement',
        enabled: true,
        effects: [{
          _id: 'add-fly',
          attribute: effectKeys['fly-speed'],
          operation: 'add',
          value: 10,
          formula: ''
        }]
      });

      expect(store.getSpeed('fly').value.final).toBe(70);
    });

    it('should allow adding to speed if speed was manually set > 0', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      store.speed.swim.base = 30;

      effectsStore.addEffect({
        label: 'Swim Fins',
        enabled: true,
        effects: [{
          _id: 'add-swim',
          attribute: effectKeys['swim-speed'],
          operation: 'add',
          value: 10,
          formula: ''
        }]
      });

      expect(store.getSpeed('swim').value.final).toBe(40);
    });
  });

  describe('Death Saves Constraints', () => {
    it('should apply max successes/failures constraints', () => {
      const store = useCombatStore();
      const effectsStore = useEffectsStore();

      expect(store.getMaxSuccesses).toBe(3);

      effectsStore.addEffect({
        label: 'Cheat Death',
        enabled: true,
        effects: [{
          _id: 'e5',
          attribute: effectKeys['death-saves-successes-max'],
          operation: 'set',
          value: 10,
          formula: ''
        }]
      });

      expect(store.getMaxSuccesses).toBe(5);

      effectsStore.addEffect({
        label: 'Cheat Death',
        enabled: true,
        effects: [{
          _id: 'e6',
          attribute: effectKeys['death-saves-failures-max'],
          operation: 'set-final',
          value: -1,
          formula: ''
        }]
      });

      expect(store.getMaxFailures).toBe(1);
      
    });
  });

  describe('dehydrate and hydrate', () => {
    it('should dehydrate store state', () => {
      const store = useCombatStore();
      store.exhaustion = 2;
      store.inspiration = 1;

      const dehydrated = store.dehydrate();

      expect(dehydrated.combat.exhaustion).toBe(2);
      expect(dehydrated.combat.inspiration).toBe(1);
      expect(dehydrated.combat.armorClass).toEqual(store.armorClass);
    });

    it('should hydrate store state merging speeds correctly', () => {
      const store = useCombatStore();
      
      const payload = {
        combat: {
          armorClass: { mode: 'manual' as const, base: 15, ability: 'constitution' as const },
          // Partial speed update
          speed: { walk: { base: 45, description: 'Monk' } } as any,
          deathSaves: { successes: 1, failures: 2 },
          life: { hitPoints: 50, temporary: 10 },
          exhaustion: 3,
          inspiration: 1,
        },
      };

      store.hydrate(payload);

      expect(store.armorClass.mode).toBe('manual');
      expect(store.speed.walk.base).toBe(45);
      // Ensure 'fly' wasn't wiped out by partial hydration
      expect(store.speed.fly).toBeDefined();
      expect(store.speed.fly.base).toBe(0);
    });
  });
});