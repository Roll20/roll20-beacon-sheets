import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { onDropBackground, dropBackgroundFeatures } from '../dropBackground';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: {} },
  initValues: { character: { id: 'char-123' } },
}));

describe('dropBackground', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('onDropBackground', () => {
    it('should successfully drop a background and set progression store data', async () => {
      const progressionStore = useProgressionStore();
      const payload = {
        name: 'Acolyte',
        description: 'You have spent your life in the service of a temple.',
      };
      
      const features = {
        'level-1': [
          { 
            label: 'Shelter of the Faithful', 
            description: 'Feature desc',
            group: 'background-features' 
          }
        ]
      };

      await onDropBackground({
        payload,
        features: features as any,
        expansionId: 123,
      });

      expect(progressionStore.background.name).toBe('Acolyte');
      expect(progressionStore.background.sourceBook).toBe(123);
      expect(progressionStore.background.compendiumData).toBe(JSON.stringify(features));
      
      expect(progressionStore.background.featureIds).toHaveLength(1);
    });

    it('should handle background drop without features', async () => {
      const progressionStore = useProgressionStore();
      const payload = { name: 'Hermit' };

      await onDropBackground({
        payload,
        features: undefined,
        expansionId: 456,
      });

      expect(progressionStore.background.name).toBe('Hermit');
      expect(progressionStore.background.compendiumData).toBeNull();
    });

    it('should log error and return early if payload is invalid', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const progressionStore = useProgressionStore();
      
      const invalidPayload = {
        description: 'This payload is invalid',
      };

      await onDropBackground({
        payload: invalidPayload,
        features: undefined,
        expansionId: 1,
      });

      expect(consoleSpy).toHaveBeenCalledWith('Invalid subclass data', expect.any(Object));
      
      expect(progressionStore.background.name).toBe('');
      expect(progressionStore.background.sourceBook).toBe(-1);
    });
  });

  describe('dropBackgroundFeatures', () => {
    it('should process features for the correct level', async () => {
      const progressionStore = useProgressionStore();
      progressionStore.background.name = 'Soldier'; 

      const features = {
        'level-1': [
          { label: 'Rank', description: 'Desc', group: 'background-features' }
        ],
        'level-5': [
          { label: 'Future', description: 'Desc', group: 'background-features' }
        ]
      };

      await dropBackgroundFeatures({
        features: features as any,
        levelOverride: 1
      });

      expect(progressionStore.background.featureIds).toHaveLength(1);
      const addedFeatureId = progressionStore.background.featureIds[0].id;
      
      const featuresStore = useFeaturesStore();
      const feature = featuresStore.features.find(f => f._id === addedFeatureId);
      expect(feature).toBeDefined();
      expect(feature?.label).toBe('Rank');

      const allFeatures = featuresStore.features;
      const futureFeature = allFeatures.find(f => f.label === 'Future');
      expect(futureFeature).toBeUndefined();
    });

    it('should process "onlyExpired" logic correctly', async () => {
      const progressionStore = useProgressionStore();
      const featuresStore = useFeaturesStore();
      
      const features = {
        'level-1': [
          { label: 'Permanent', description: 'Desc', group: 'background-features' },
          { label: 'Temporary', description: 'Desc', group: 'background-features', validUntilLevel: 3 }
        ]
      };

      await dropBackgroundFeatures({
        features: features as any,
        levelOverride: 1,
        onlyExpired: true,
        previousLevels: [3]
      });

      const perm = featuresStore.features.find(f => f.label === 'Permanent');
      expect(perm).toBeUndefined();

      const temp = featuresStore.features.find(f => f.label === 'Temporary');
      expect(temp).toBeDefined();
      
      const linkedTemp = progressionStore.background.featureIds.find(fid => fid.id === temp?._id);
      expect(linkedTemp).toBeDefined();
      expect(linkedTemp?.expirantionLevel).toBe(3);
    });

    it('should extract effects and tags before creating feature', async () => {
      const progressionStore = useProgressionStore();
      const featuresStore = useFeaturesStore();
      const effectsStore = useEffectsStore();
      const tagsStore = useTagsStore();

      progressionStore.background.name = 'Noble';

      const rawFeature = {
        label: 'Position of Privilege',
        description: 'Desc',
        group: 'background-features',
        'data-effects': { 
          label: 'Effect Label',
          effects: [{ attribute: 'strength-score', operation: 'add', value: 1 }] 
        },
        'data-tags': ['noble-tag'],
      };

      const features = {
        'level-1': [rawFeature]
      };

      await dropBackgroundFeatures({
        features: features as any,
        levelOverride: 1
      });

      const feature = featuresStore.features.find(f => f.label === 'Position of Privilege');
      expect(feature).toBeDefined();

      const effect = effectsStore.effects.find(e => e._id === feature?.effectId);
      expect(effect).toBeDefined();
      expect(effect?.effects[0].attribute).toBe('strength-score');

      const tagGroup = tagsStore.tagGroups.find(g => g._id === feature?.tagId);
      expect(tagGroup).toBeDefined();
      expect(tagGroup?.tags[0].text).toBe('noble-tag');
    });
  });
});