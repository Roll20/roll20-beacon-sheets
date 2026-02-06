import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFeaturesStore } from '../features/faturesStore';
import { useTagsStore } from '../tags/tagsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';

describe('useFeaturesStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('getEmptyFeature', () => {
        it('should create a feature with default values and unique IDs', () => {
            const store = useFeaturesStore();
            const feature = store.getEmptyFeature({});

            expect(feature._id).toBeDefined();
            expect(feature.label).toBe('');
            expect(feature.group).toBe('others');
            expect(feature.source).toBe('');
            expect(feature.description).toBe('');
            expect(feature.effectId).toBeDefined();
            expect(feature.tagId).toBeDefined();
        });

        it('should merge patch with default values', () => {
            const store = useFeaturesStore();
            const feature = store.getEmptyFeature({ label: 'Test Feature', group: 'class-features' });

            expect(feature.label).toBe('Test Feature');
            expect(feature.group).toBe('class-features');
            expect(feature.source).toBe('');
        });
    });

    describe('update', () => {
        it('should add new feature when id is not provided', () => {
            const store = useFeaturesStore();
            store.update({ label: 'New Feature' });

            expect(store.features).toHaveLength(1);
            expect(store.features[0].label).toBe('New Feature');
        });

        it('should update existing feature when id matches', () => {
            const store = useFeaturesStore();
            store.update({ label: 'Feature 1' });
            const featureId = store.features[0]._id;

            store.update({ _id: featureId, label: 'Updated Feature' });

            expect(store.features).toHaveLength(1);
            expect(store.features[0].label).toBe('Updated Feature');
        });

        it('should create new feature if id provided does not match existing', () => {
            const store = useFeaturesStore();
            store.update({ _id: 'non-existent-id', label: 'Another Feature' });

            expect(store.features).toHaveLength(1);
            expect(store.features[0]._id).toBe('non-existent-id');
        });
    });

    describe('remove', () => {
        it('should remove feature and cleanup dependencies (Effects & Tags)', () => {
            const featuresStore = useFeaturesStore();
            const effectsStore = useEffectsStore();
            const tagsStore = useTagsStore();

            featuresStore.update({ 
                _id: 'feat-1', 
                label: 'Feature with Dependencies',
                effectId: 'effect-1',
                tagId: 'tag-1'
            });

            effectsStore.addEffect({
                _id: 'effect-1',
                label: 'Feature Effect',
                effects: [{ attribute: 'strength', operation: 'add', value: 1, _id: 'sub-1', formula: '' }]
            });

            tagsStore.update({
                _id: 'tag-1',
                tags: [{ text: 'Test Tag', _id: 't1' }]
            });

            expect(featuresStore.features).toHaveLength(1);
            expect(effectsStore.effects).toHaveLength(1);
            expect(tagsStore.tagGroups).toHaveLength(1);

            featuresStore.remove('feat-1');

            expect(featuresStore.features).toHaveLength(0);
            expect(effectsStore.effects).toHaveLength(0);
            expect(tagsStore.tagGroups).toHaveLength(0);
        });

        it('should verify effect removal by id works even if other effects exist', () => {
            const featuresStore = useFeaturesStore();
            const effectsStore = useEffectsStore();

            featuresStore.update({ _id: 'feat-1', effectId: 'eff-1' });
            effectsStore.addEffect({ _id: 'eff-1', label: 'Effect 1' });
            effectsStore.addEffect({ _id: 'eff-2', label: 'Effect 2' }); // Should stay

            featuresStore.remove('feat-1');

            expect(effectsStore.effects.find(e => e._id === 'eff-1')).toBeUndefined();
            expect(effectsStore.effects.find(e => e._id === 'eff-2')).toBeDefined();
        });
    });

    describe('getFeatureTags', () => {
        it('should retrieve tags from the real tagsStore', () => {
            const featuresStore = useFeaturesStore();
            const tagsStore = useTagsStore();

            tagsStore.update({
                _id: 'tag-group-1',
                tags: [{ _id: 't1', text: 'Fire' }, { _id: 't2', text: 'Magical' }]
            });

            const tags = featuresStore.getFeatureTags('tag-group-1');

            expect(tags).toHaveLength(2);
            expect(tags[0].text).toBe('Fire');
        });

        it('should return empty array if tag group does not exist', () => {
            const featuresStore = useFeaturesStore();
            const tags = featuresStore.getFeatureTags('non-existent-group');
            expect(tags).toEqual([]);
        });
    });

    describe('hydrate/dehydrate', () => {
        it('should dehydrate store data', () => {
            const store = useFeaturesStore();
            store.update({ _id: 'f1', label: 'Feature 1' });
            
            const dehydrated = store.dehydrate();
            
            expect(dehydrated.features.features).toBeDefined();
            expect(dehydrated.features.features['f1']).toBeDefined();
            expect(dehydrated.features.features['f1'].label).toBe('Feature 1');
        });

        it('should hydrate store data correctly', () => {
            const store = useFeaturesStore();
            const mockFeature = store.getEmptyFeature({ _id: 'f1', label: 'Hydrated Feature' });
            
            const mockFeatureWithPos = { ...mockFeature, arrayPosition: 0 };

            store.hydrate({
                features: {
                    features: { 'f1': mockFeatureWithPos as any }
                }
            });

            expect(store.features).toHaveLength(1);
            expect(store.features[0].label).toBe('Hydrated Feature');
        });

        it('should not wipe existing features if payload is missing features key', () => {
            const store = useFeaturesStore();
            store.update({ label: 'Existing Feature' });

            store.hydrate({ features: {} } as any);

            expect(store.features).toHaveLength(1);
            expect(store.features[0].label).toBe('Existing Feature');
        });

        it('should replace features if payload contains empty features object', () => {
            const store = useFeaturesStore();
            store.update({ label: 'Existing Feature' });

            store.hydrate({ features: { features: {} } } as any);

            expect(store.features).toHaveLength(0);
        });
    });
});