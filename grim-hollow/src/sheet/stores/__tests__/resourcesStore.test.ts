import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useResourcesStore } from '../resources/resourcesStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useProgressionStore } from '../progression/progressionStore';

vi.mock('@/relay/relay', () => ({
    dispatchRef: { value: null },
    initValues: { character: { id: 'test-char-id' } },
}));

describe('resourcesStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('getEmptyResource', () => {
        it('should create an empty resource with default values', () => {
            const store = useResourcesStore();
            const resource = store.getEmptyResource();

            expect(resource).toMatchObject({
                name: '',
                count: 0,
                max: '',
                refreshOnShortRest: 'none',
                refreshOnLongRest: 'none',
                refreshOnDawn: 'none',
            });
            expect(resource._id).toBeDefined();
        });

        it('should apply patch values when provided', () => {
            const store = useResourcesStore();
            const resource = store.getEmptyResource({
                name: 'Spell Slots',
                max: '5',
                refreshOnShortRest: 'all',
            });

            expect(resource.name).toBe('Spell Slots');
            expect(resource.count).toBe(5);
            expect(resource.max).toBe('5');
            expect(resource.refreshOnShortRest).toBe('all');
        });

        it('should evaluate formula in max for initial count', () => {
            const store = useResourcesStore();
            const progression = useProgressionStore();
            progression.classes = [{ level: 5 } as any];

            const resource = store.getEmptyResource({
                name: 'Ki Points',
                max: '@{level}',
            });

            expect(resource.count).toBe(5);
        });
    });

    describe('add', () => {
        it('should add a new resource to userResources', () => {
            const store = useResourcesStore();
            store.add({ name: 'Hit Dice', max: '10' });

            expect(store.userResources).toHaveLength(1);
            expect(store.userResources[0].name).toBe('Hit Dice');
            expect(store.userResources[0]._id).toBeDefined();
        });
    });

    describe('update', () => {
        it('should update an existing resource', () => {
            const store = useResourcesStore();
            store.add({ name: 'Rage', max: '3' });
            const resourceId = store.userResources[0]._id;

            store.update({ _id: resourceId, count: 2 });

            expect(store.userResources[0].count).toBe(2);
        });

        it('should add a new resource if _id does not exist', () => {
            const store = useResourcesStore();
            store.update({ name: 'Ki Points', max: '5' });

            expect(store.userResources).toHaveLength(1);
            expect(store.userResources[0].name).toBe('Ki Points');
        });

        it('should update resource in effects store when sourceEffectId provided', () => {
            const store = useResourcesStore();
            const effectsStore = useEffectsStore();
            
            const effect = effectsStore.addEffect({
                label: 'Test Effect',
                resources: [{ 
                    _id: 'res-1', 
                    name: 'Original', 
                    count: 0, 
                    max: '1', 
                    refreshOnShortRest: 'none', 
                    refreshOnLongRest: 'none', 
                    refreshOnDawn: 'none',
                    refreshOnShortRestAmount: '',
                    refreshOnLongRestAmount: '',
                    refreshOnDawnAmount: '',
                }]
            });

            store.update({ 
                _id: 'res-1', 
                name: 'Updated Name', 
                sourceEffectId: effect._id 
            });

            expect(effectsStore.effects[0].resources![0].name).toBe('Updated Name');
        });
    });

    describe('remove', () => {
        it('should remove a resource from userResources', () => {
            const store = useResourcesStore();
            store.add({ name: 'Superiority Dice' });
            const resource = store.userResources[0];

            store.remove(resource);

            expect(store.userResources).toHaveLength(0);
        });

        it('should remove resource from effects store when sourceEffectId provided', () => {
            const store = useResourcesStore();
            const effectsStore = useEffectsStore();
            
            const effect = effectsStore.addEffect({
                label: 'Test Effect',
                resources: [{ 
                    _id: 'res-1', 
                    name: 'Effect Resource', 
                    count: 0, 
                    max: '1',
                    refreshOnShortRest: 'none', 
                    refreshOnLongRest: 'none', 
                    refreshOnDawn: 'none',
                    refreshOnShortRestAmount: '',
                    refreshOnLongRestAmount: '',
                    refreshOnDawnAmount: '',
                }]
            });

            store.remove({ 
                _id: 'res-1', 
                sourceEffectId: effect._id 
            } as any);

            expect(effectsStore.effects[0].resources).toHaveLength(0);
        });
    });

    describe('dehydrate and hydrate', () => {
        it('should dehydrate and hydrate resources correctly', () => {
            const store = useResourcesStore();
            store.add({
                name: 'Sorcery Points',
                max: '10',
                count: 5,
                refreshOnDawn: 'all',
            });

            const dehydrated = store.dehydrate();
            expect(dehydrated.resources.resources).toBeDefined();

            store.userResources = [];
            store.hydrate(dehydrated);

            expect(store.userResources).toHaveLength(1);
            expect(store.userResources[0].name).toBe('Sorcery Points');
            expect(store.userResources[0].refreshOnDawn).toBe('all');
        });

        it('should transform required field from indexed object to array', () => {
            const store = useResourcesStore();
            const payload = {
                resources: {
                    resources: {
                        'res-1': {
                            _id: 'res-1',
                            name: 'Magic Item Resource',
                            arrayPosition: 0, 
                            required: { '0': 'equipped', '1': 'attuned' }
                        }
                    }
                }
            };

            store.hydrate(payload as any);

            expect(store.userResources).toHaveLength(1);
            expect(store.userResources[0].required).toEqual(['equipped', 'attuned']);
        });

        it('should set required to undefined if missing in payload', () => {
            const store = useResourcesStore();
            const payload = {
                resources: {
                    resources: {
                        'res-1': {
                            _id: 'res-1',
                            name: 'Simple Resource',
                            arrayPosition: 0,
                            required: undefined
                        }
                    }
                }
            };

            store.hydrate(payload as any);

            expect(store.userResources).toHaveLength(1);
            expect(store.userResources[0].required).toBeUndefined();
        });

        it('should handle payload with missing resources object', () => {
            const store = useResourcesStore();
            store.add({ name: 'Existing Resource' });
            
            store.hydrate({} as any);
            expect(store.userResources).toEqual([]);
            
            store.add({ name: 'Existing Resource' });
            store.hydrate({ resources: {} } as any);
            expect(store.userResources).toEqual([]);
        });
    });

    describe('resources computed', () => {
        it('should combine userResources and resourcesFromEffects', () => {
            const store = useResourcesStore();
            const effectsStore = useEffectsStore();

            store.add({ name: 'User Resource' });

            effectsStore.addEffect({
                label: 'Feature',
                enabled: true,
                resources: [{ 
                    _id: 'eff-res', 
                    name: 'Effect Resource',
                    count: 0, 
                    max: '1',
                    refreshOnShortRest: 'none', 
                    refreshOnLongRest: 'none', 
                    refreshOnDawn: 'none',
                    refreshOnShortRestAmount: '',
                    refreshOnLongRestAmount: '',
                    refreshOnDawnAmount: '',
                }]
            });

            expect(store.resources).toHaveLength(2);
            expect(store.resources).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'User Resource' }),
                    expect.objectContaining({ name: 'Effect Resource' }),
                ])
            );
        });

        it('should respect effect enabled state', () => {
            const store = useResourcesStore();
            const effectsStore = useEffectsStore();

            effectsStore.addEffect({
                label: 'Disabled Feature',
                enabled: false,
                resources: [{ 
                    _id: 'eff-res', 
                    name: 'Hidden Resource',
                    count: 0, 
                    max: '1',
                    refreshOnShortRest: 'none', 
                    refreshOnLongRest: 'none', 
                    refreshOnDawn: 'none',
                    refreshOnShortRestAmount: '',
                    refreshOnLongRestAmount: '',
                    refreshOnDawnAmount: '',
                }]
            });

            expect(store.resources).toHaveLength(0);
        });
    });
});