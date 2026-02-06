import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropSubclass } from '../dropSubclass';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import type { DropContext } from '../drop';

vi.mock('../hydrateSpells', () => ({
  hydrateSpells: vi.fn((spells) => Promise.resolve(spells)),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { 
    value: { 
      compendiumRequest: vi.fn().mockResolvedValue({ 
        data: { ruleSystem: { category: { pages: [] } } } 
      }) 
    } 
  },
  initValues: { character: { id: 'test-char-id' } },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe('dropSubclass', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const createBaseClass = (name: string, level: number, subclassUnlockLevel: number = 3) => {
    const store = useProgressionStore();
    const newClass = store.getEmptyClass();
    newClass.name = name;
    newClass.level = level;
    newClass.subclassUnlockLevel = subclassUnlockLevel;
    newClass.sourceBook = 100; 
    store.classes.push(newClass);
    return newClass;
  };

  it('should successfully drop a subclass on a compatible class', async () => {
    const progressionStore = useProgressionStore();
    createBaseClass('Rogue', 3, 3); // Rogue Level 3, unlocks at 3

    const payload = {
      name: 'Thief',
      'data-compatibility': [{ name: 'Rogue', sourceBook: 100 }]
    };

    const features = {
      'level-3': [{ label: 'Fast Hands', group: 'class-features', description: 'Quick fingers' }]
    };

    const context: DropContext = {
      payload,
      features: features as any,
      expansionId: 200,
    };

    await onDropSubclass(context);

    const updatedClass = progressionStore.classes[0];
    expect(updatedClass.subclass).toBe('Thief');
    expect(updatedClass.subclassSourceBook).toBe(200);
    expect(updatedClass.compendiumData.subclass).toContain('Fast Hands');
  });

  it('should fail if no compatible class exists', async () => {
    const progressionStore = useProgressionStore();
    createBaseClass('Fighter', 3, 3);

    const payload = {
      name: 'Thief',
      'data-compatibility': [{ name: 'Rogue' }]
    };

    await onDropSubclass({
      payload,
      features: {},
      expansionId: 200,
    });

    const fighter = progressionStore.classes[0];
    expect(fighter.subclass).toBe('');
  });

  it('should fail if class level is too low to unlock subclass', async () => {
    const progressionStore = useProgressionStore();
    createBaseClass('Rogue', 2, 3); // Level 2, but unlocks at 3

    const payload = {
      name: 'Thief',
      'data-compatibility': [{ name: 'Rogue' }]
    };

    await onDropSubclass({
      payload,
      features: {},
      expansionId: 200,
    });

    const rogue = progressionStore.classes[0];
    expect(rogue.subclass).toBe('');
  });

  it('should replace an existing subclass', async () => {
    const progressionStore = useProgressionStore();
    const rogue = createBaseClass('Rogue', 5, 3);
    
    rogue.subclass = 'Thief';
    rogue.subclassFeatureIds = [{ level: 3, id: 'old-feature' }];

    const payload = {
      name: 'Assassin',
      'data-compatibility': [{ name: 'Rogue' }]
    };

    await onDropSubclass({
      payload,
      features: {},
      expansionId: 300,
    });

    expect(rogue.subclass).toBe('Assassin');
    expect(rogue.subclassSourceBook).toBe(300);
    expect(rogue.subclassFeatureIds).toEqual([]);
  });

  it('should handle subclass spellcasting (ex: Arcane Trickster)', async () => {
    const progressionStore = useProgressionStore();
    const spellsStore = useSpellsStore();
    
    createBaseClass('Rogue', 3, 3);

    const payload = {
      name: 'Arcane Trickster',
      'data-compatibility': [{ name: 'Rogue' }],
      spellcasting: 'third',
      'data-spellSource': {
        name: 'Rogue Spellcasting',
        type: 'ability',
        ability: 'intelligence'
      }
    };

    await onDropSubclass({
      payload: payload as any,
      features: {},
      expansionId: 400,
    });

    const rogue = progressionStore.classes[0];
    
    expect(rogue.subclass).toBe('Arcane Trickster');
    expect(rogue.spellcasting).toBe('third');
    expect(rogue.spellSourceId).toBeDefined();

    const source = spellsStore.sources.find(s => s._id === rogue.spellSourceId);
    expect(source).toBeDefined();
    expect(source?.name).toBe('Rogue Spellcasting');
    // @ts-ignore
    expect(source?.ability).toBe('intelligence');
  });

  it('should replace existing spell source when switching subclasses', async () => {
    const progressionStore = useProgressionStore();
    const spellsStore = useSpellsStore();
    
    const rogue = createBaseClass('Rogue', 3, 3);
    const oldSource = spellsStore.getEmptySource({ name: 'Old Magic' });
    spellsStore.updateSource(oldSource);
    rogue.subclass = 'Arcane Trickster';
    rogue.spellcasting = 'third';
    rogue.spellSourceId = oldSource._id;

    const payload = {
      name: 'Shadow Caster',
      'data-compatibility': [{ name: 'Rogue' }],
      spellcasting: 'third',
      'data-spellSource': {
        name: 'Shadow Magic',
        type: 'ability',
        ability: 'charisma'
      }
    };

    await onDropSubclass({
      payload: payload as any,
      features: {},
      expansionId: 500,
    });

    expect(spellsStore.sources.find(s => s._id === oldSource._id)).toBeUndefined();

    const newSourceId = progressionStore.classes[0].spellSourceId;
    const newSource = spellsStore.sources.find(s => s._id === newSourceId);
    
    expect(newSource).toBeDefined();
    expect(newSource?.name).toBe('Shadow Magic');
    // @ts-ignore
    expect(newSource?.ability).toBe('charisma');
  });

  it('should log error for invalid payload', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const payload = { 'data-compatibility': [] };

    await onDropSubclass({
      payload: payload as any,
      features: {},
      expansionId: 100
    });

    expect(consoleSpy).toHaveBeenCalledWith("Invalid subclass data", expect.anything());
  });
});