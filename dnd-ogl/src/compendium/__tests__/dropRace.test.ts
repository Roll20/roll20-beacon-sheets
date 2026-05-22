import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropRace, dropAncestryFeatures } from '../dropRace';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
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

describe('dropRace', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('onDropRace', () => {
    it('should successfully drop a race and populate store', async () => {
      const progressionStore = useProgressionStore();
      const featuresStore = useFeaturesStore();

      const payload = {
        name: 'Elf',
      };

      const features = {
        'level-1': [
          { 
            label: 'Darkvision', 
            description: 'See in dark', 
            group: 'ancestry-features',
            'data-effects': {
              label: 'Darkvision',
              enabled: true,
              effects: [{ attribute: 'sense-darkvision', operation: 'set-base', value: 60 }]
            }
          },
          { 
            label: 'Keen Senses', 
            description: 'Perception proficiency', 
            group: 'ancestry-features' 
          }
        ]
      };

      const context: DropContext = {
        payload,
        features: features as any,
        expansionId: 101,
      };

      await onDropRace(context);

      expect(progressionStore.ancestry.name).toBe('Elf');
      expect(progressionStore.ancestry.sourceBook).toBe(101);
      
      expect(JSON.parse(progressionStore.ancestry.compendiumData.race!)).toEqual(features);

      expect(featuresStore.features).toHaveLength(2);
      expect(featuresStore.features.find(f => f.label === 'Darkvision')).toBeDefined();
      expect(featuresStore.features.find(f => f.label === 'Keen Senses')).toBeDefined();

      expect(progressionStore.ancestry.featureIds).toHaveLength(2);
    });

    it('should clear existing race and subrace data before dropping new race', async () => {
      const progressionStore = useProgressionStore();
      
      progressionStore.ancestry.name = 'Dwarf';
      progressionStore.ancestry.subrace = 'Hill Dwarf';
      progressionStore.ancestry.featureIds = [{ level: 1, id: 'old-feat' }];
      
      const payload = { name: 'Human' };
      const context: DropContext = {
        payload,
        features: {},
        expansionId: 202,
      };

      await onDropRace(context);

      expect(progressionStore.ancestry.name).toBe('Human');
      expect(progressionStore.ancestry.subrace).toBe('');
      expect(progressionStore.ancestry.featureIds).toEqual([]); 
    });

    it('should log error and abort if payload validation fails', async () => {
      const progressionStore = useProgressionStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const payload = {}; 

      await onDropRace({ payload: payload as any });

      expect(progressionStore.ancestry.name).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith("Invalid subclass data", expect.anything());
    });
  });

  describe('dropAncestryFeatures', () => {
    it('should only drop features matching the level override', async () => {
      const featuresStore = useFeaturesStore();
      
      const features = {
        'level-1': [{ label: 'Lvl 1 Trait', group: 'ancestry-features', description: 'Desc' }],
        'level-3': [{ label: 'Lvl 3 Trait', group: 'ancestry-features', description: 'Desc' }],
        'level-5': [{ label: 'Lvl 5 Trait', group: 'ancestry-features', description: 'Desc' }]
      };

      // Drop only level 3 features
      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 3
      });

      expect(featuresStore.features).toHaveLength(1);
      expect(featuresStore.features[0].label).toBe('Lvl 3 Trait');
    });

    it('should handle subrace updates correctly', async () => {
      const progressionStore = useProgressionStore();
      const featuresStore = useFeaturesStore();

      const features = {
        'level-1': [{ label: 'Subrace Trait', group: 'ancestry-features', description: 'Desc' }]
      };

      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 1,
        updateSubrace: true
      });

      expect(featuresStore.features).toHaveLength(1);
      
      expect(progressionStore.ancestry.subraceFeatureIds).toHaveLength(1);
      expect(progressionStore.ancestry.featureIds).toHaveLength(0);
    });

    it('should cascade source name correctly', async () => {
      const featuresStore = useFeaturesStore();
      
      const features = {
        'level-5': [{ label: 'Ancestral Gift', group: 'ancestry-features', description: 'Desc' }]
      };

      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 5,
        cascade: { source: 'High Elf' }
      });

      const droppedFeature = featuresStore.features[0];
      expect(droppedFeature.source).toBe('5th-level High Elf');
    });

    it('should respect onlyExpired flag', async () => {
      const featuresStore = useFeaturesStore();
      
      const features = {
        'level-1': [
          { 
            label: 'Temporary Trait', 
            validUntilLevel: 4, 
            group: 'ancestry-features', 
            description: 'Desc' 
          },
          { 
            label: 'Permanent Trait', 
            group: 'ancestry-features', 
            description: 'Desc' 
          }
        ]
      };

      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 1,
        onlyExpired: true,
        previousLevels: [1, 2, 3, 4]
      });

      expect(featuresStore.features).toHaveLength(1);
      expect(featuresStore.features[0].label).toBe('Temporary Trait');
    });

    it('should extract effects and tags from features', async () => {
      const tagsStore = useTagsStore();
      const effectsStore = useEffectsStore();
      const featuresStore = useFeaturesStore();

      const features = {
        'level-1': [
          {
            label: 'Powerful Build',
            description: 'You count as one size larger.',
            group: 'ancestry-features',
            'data-tags': ['size', 'strength'],
            'data-effects': {
              label: 'Powerful Build',
              enabled: true,
              effects: [{ attribute: 'carry-capacity', operation: 'multiply', value: 2 }]
            }
          }
        ]
      };

      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 1
      });

      const feature = featuresStore.features[0];
      expect(feature).toBeDefined();

      const tagGroup = tagsStore.tagGroups.find(g => g._id === feature.tagId);
      expect(tagGroup).toBeDefined();
      expect(tagGroup?.tags.map(t => t.text)).toEqual(expect.arrayContaining(['size', 'strength']));

      const effect = effectsStore.effects.find(e => e._id === feature.effectId);
      expect(effect).toBeDefined();
      expect(effect?.effects[0].attribute).toBe('carry-capacity');
    });

    it('should extract spells from feature payload', async () => {
      const featuresStore = useFeaturesStore();
      const effectsStore = useEffectsStore();

      const features = {
        'level-1': [
          {
            label: 'Innate Magic',
            description: 'You know a cantrip.',
            group: 'ancestry-features',
            'data-spells': [{ name: 'Dancing Lights', level: 0 }]
          }
        ]
      };

      await dropAncestryFeatures({
        features: features as any,
        levelOverride: 1
      });

      const feature = featuresStore.features.find(f => f.label === 'Innate Magic');
      expect(feature).toBeDefined();

      const effect = effectsStore.effects.find(e => e._id === feature?.effectId);
      expect(effect).toBeDefined();
      expect(effect?.spells).toHaveLength(1);
      expect(effect?.spells?.[0].name).toBe('Dancing Lights');
    });
  });
});