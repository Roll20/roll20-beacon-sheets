import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropSubrace } from '../dropSubrace';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
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

describe('dropSubrace', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should drop subrace successfully if race is compatible', async () => {
    const progressionStore = useProgressionStore();
    const featuresStore = useFeaturesStore();
    const effectsStore = useEffectsStore();

    progressionStore.ancestry.name = 'Elf';
    progressionStore.ancestry.sourceBook = 10;

    const payload = {
      name: 'High Elf',
      'data-compatibility': [
        { name: 'Elf' }
      ]
    };

    const features = {
      'level-1': [
        {
          label: 'Cantrip',
          group: 'ancestry-features',
          description: 'You know one cantrip.',
          'data-effects': {
            label: 'Cantrip',
            enabled: true,
            effects: [{ attribute: 'intelligence', operation: 'add', value: 1 }]
          }
        }
      ]
    };

    const context: DropContext = {
      payload: payload as any,
      features: features as any,
      expansionId: 20,
    };

    await onDropSubrace(context);

    expect(progressionStore.ancestry.subrace).toBe('High Elf');
    expect(progressionStore.ancestry.subraceSourceBook).toBe(20);
    
    expect(featuresStore.features).toHaveLength(1);
    expect(featuresStore.features[0].label).toBe('Cantrip');
    
    expect(progressionStore.ancestry.subraceFeatureIds).toHaveLength(1);
    expect(progressionStore.ancestry.featureIds).toHaveLength(0);

    const effect = effectsStore.effects.find(e => e.label === 'Cantrip');
    expect(effect).toBeDefined();
    expect(effect?.effects[0].value).toBe(1);
  });

  it('should do nothing if race is incompatible', async () => {
    const progressionStore = useProgressionStore();
    
    progressionStore.ancestry.name = 'Dwarf';
    
    const payload = {
      name: 'High Elf',
      'data-compatibility': [
        { name: 'Elf' }
      ]
    };

    const context: DropContext = {
      payload: payload as any,
      features: {},
      expansionId: 20,
    };

    await onDropSubrace(context);

    expect(progressionStore.ancestry.subrace).toBe('');
  });

  it('should check sourceBook for compatibility if provided', async () => {
    const progressionStore = useProgressionStore();
    
    progressionStore.ancestry.name = 'Elf';
    progressionStore.ancestry.sourceBook = 10;
    
    const payload = {
      name: 'Special Elf',
      'data-compatibility': [
        { name: 'Elf', sourceBook: 999 } 
      ]
    };

    await onDropSubrace({ payload: payload as any, expansionId: 20 });

    expect(progressionStore.ancestry.subrace).toBe('');

    payload['data-compatibility'][0].sourceBook = 10;
    await onDropSubrace({ payload: payload as any, expansionId: 20 });

    expect(progressionStore.ancestry.subrace).toBe('Special Elf');
  });

  it('should remove existing subrace features before adding new ones', async () => {
    const progressionStore = useProgressionStore();
    const featuresStore = useFeaturesStore();

    progressionStore.ancestry.name = 'Gnome';
    
    progressionStore.ancestry.subrace = 'Rock Gnome';
    const oldFeature = featuresStore.getEmptyFeature({ label: 'Artificer Lore' });
    featuresStore.features.push(oldFeature);
    progressionStore.ancestry.subraceFeatureIds.push({ level: 1, id: oldFeature._id });

    const payload = {
      name: 'Forest Gnome',
      'data-compatibility': [{ name: 'Gnome' }]
    };
    
    const newFeatures = {
      'level-1': [{ label: 'Natural Illusionist', group: 'ancestry-features', description: '...' }]
    };

    await onDropSubrace({ 
      payload: payload as any, 
      features: newFeatures as any, 
      expansionId: 30 
    });

    expect(progressionStore.ancestry.subrace).toBe('Forest Gnome');
    
    expect(featuresStore.features.some(f => f.label === 'Artificer Lore')).toBe(false);
    
    expect(featuresStore.features.some(f => f.label === 'Natural Illusionist')).toBe(true);
    expect(progressionStore.ancestry.subraceFeatureIds).toHaveLength(1);
  });

  it('should handle invalid schema gracefuly', async () => {
    const progressionStore = useProgressionStore();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const payload = { 'data-compatibility': [] };

    await onDropSubrace({ payload: payload as any });

    expect(consoleSpy).toHaveBeenCalledWith("Invalid subrace data", expect.anything());
    expect(progressionStore.ancestry.subrace).toBe('');
  });
});