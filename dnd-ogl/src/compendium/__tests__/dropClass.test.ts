import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropClass, dropClassFeatures } from '../dropClass';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
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

describe('dropClass', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should successfully drop a new class without spellcasting', async () => {
    const progressionStore = useProgressionStore();
    const featuresStore = useFeaturesStore();
    
    const payload = {
      name: 'Fighter',
      hitDie: '1d10',
      subclassUnlockLevel: 3,
    };

    const features = {
      'level-1': [
        { label: 'Fighting Style', description: 'Choose a style', group: 'class-features' },
        { label: 'Second Wind', description: 'Regain HP', group: 'class-features' }
      ]
    };

    const context: DropContext = {
      payload,
      features: features as any,
      expansionId: 123,
    };

    await onDropClass(context);

    expect(progressionStore.classes).toHaveLength(1);
    const newClass = progressionStore.classes[0];
    expect(newClass.name).toBe('Fighter');
    expect(newClass.level).toBe(1);
    expect(newClass.hitDie).toBe('1d10');
    
    expect(featuresStore.features).toHaveLength(2);
    expect(featuresStore.features.some(f => f.label === 'Fighting Style')).toBe(true);
    expect(featuresStore.features.some(f => f.label === 'Second Wind')).toBe(true);
    
    expect(newClass.featureIds.length).toBe(2);
  });

  it('should successfully drop a class with spellcasting', async () => {
    const progressionStore = useProgressionStore();
    const spellsStore = useSpellsStore();

    const payload = {
      name: 'Wizard',
      hitDie: '1d6',
      subclassUnlockLevel: 2,
      spellcasting: 'full',
      'data-spellSource': {
        name: 'Wizard Spellcasting',
        type: 'ability',
        ability: 'intelligence',
        isPrepared: true
      }
    };

    const context: DropContext = {
      payload: payload as any,
      features: {},
      expansionId: 456,
    };

    await onDropClass(context);

    const newClass = progressionStore.classes[0];
    expect(newClass.name).toBe('Wizard');
    expect(newClass.spellcasting).toBe('full');
    expect(newClass.spellSourceId).toBeTruthy();

    const source = spellsStore.sources.find(s => s._id === newClass.spellSourceId);
    expect(source).toBeDefined();
    expect(source?.name).toBe('Wizard Spellcasting');
    // @ts-ignore
    expect(source?.ability).toBe('intelligence');
  });

  it('should parse $ownerlevel in features correctly', async () => {
    const featuresStore = useFeaturesStore();
    const effectsStore = useEffectsStore();
    
    const payload = { name: 'Monk', hitDie: '1d8', subclassUnlockLevel: 3 };
    const features = {
      'level-1': [
        { 
          label: 'Ki Points', 
          description: 'You have [[$ownerlevel]] Ki points.',
          group: 'class-features',
          'data-effects': {
             label: 'Ki',
             enabled: true,
             effects: [{ attribute: 'ki', operation: 'set', value: '$ownerlevel' }]
          } 
        }
      ]
    };

    await onDropClass({ payload, features: features as any, expansionId: 789 });

    const feature = featuresStore.features.find(f => f.label === 'Ki Points');
    expect(feature).toBeDefined();

    const expectedFormula = '@{monk-level}';
    
    expect(feature?.description).toContain(expectedFormula);
    expect(feature?.description).not.toContain('$ownerlevel');

    const effect = effectsStore.effects.find(e => e._id === feature?.effectId);
    const singleEffect = effect?.effects.find(e => e.attribute === 'ki');
    expect(singleEffect?.value).toBe(expectedFormula);
  });

  it('should not add class if schema validation fails', async () => {
    const progressionStore = useProgressionStore();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const payload = { name: 'Invalid Class' }; 

    await onDropClass({ payload: payload as any });

    expect(progressionStore.classes).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid class data', expect.anything());
  });

  it('should respect onlyExpired flag and skip non-expired features', async () => {
    const featuresStore = useFeaturesStore();
    
    const updatedClass = { 
      name: 'TestClass', 
      level: 5,
      featureIds: [],
      subclassFeatureIds: [] 
    };
    
    const previousLevels = [3, 4]; 

    const features = {
      'level-3': [
        { 
          label: 'Expired Feature', 
          validUntilLevel: 3, 
          group: 'class-features', 
          description: 'Desc' 
        }, 
        { 
          label: 'Permanent Feature', 
          group: 'class-features', 
          description: 'Desc' 
        }, 
        { 
          label: 'Future Expire', 
          validUntilLevel: 5, 
          group: 'class-features', 
          description: 'Desc' 
        } 
      ]
    };

    await dropClassFeatures({
      features: features as any,
      updatedClass,
      levelOverride: 3,
      onlyExpired: true,
      previousLevels
    });

    const droppedFeatures = featuresStore.features;
    
    expect(droppedFeatures.some(f => f.label === 'Expired Feature')).toBe(true);
    expect(droppedFeatures.some(f => f.label === 'Permanent Feature')).toBe(false);
    expect(droppedFeatures.some(f => f.label === 'Future Expire')).toBe(false);
  });

  it('should extract tags and spells from feature payload', async () => {
    const tagsStore = useTagsStore();
    const effectsStore = useEffectsStore();
    const featuresStore = useFeaturesStore();

    const payload = { name: 'Sorcerer', hitDie: '1d6' };
    const features = {
      'level-1': [
        {
          label: 'Magic Feature',
          description: 'A magical feature',
          group: 'class-features',
          'data-tags': ['magic', 'fire'],
          'data-spells': [{ name: 'Fireball', level: 3 }] 
        }
      ]
    };

    await onDropClass({
      payload: payload as any,
      features: features as any,
      expansionId: 999
    });

    const feature = featuresStore.features.find(f => f.label === 'Magic Feature');
    expect(feature).toBeDefined();

    const tagGroup = tagsStore.tagGroups.find(g => g._id === feature?.tagId);
    expect(tagGroup).toBeDefined();
    expect(tagGroup?.tags.map(t => t.text)).toContain('magic');
    expect(tagGroup?.tags.map(t => t.text)).toContain('fire');

    const effect = effectsStore.effects.find(e => e._id === feature?.effectId);
    expect(effect).toBeDefined();
    
    expect(effect?.spells).toHaveLength(1);
    expect(effect?.spells?.[0].name).toBe('Fireball');
  });
});