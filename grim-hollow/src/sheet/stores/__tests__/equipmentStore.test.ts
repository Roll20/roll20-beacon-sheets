import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { useAttunementStore } from '../attunement/attunementStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { useTagsStore } from '../tags/tagsStore';


describe('equipmentStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('getEmptyEquipment', () => {
        it('should create equipment with default values', () => {
            const store = useEquipmentStore();
            const equipment = store.getEmptyEquipment({});

            expect(equipment._id).toBeDefined();
            expect(equipment.name).toBe('New Item');
            expect(equipment.weight).toBe(0);
            expect(equipment.quantity).toBe(1);
            expect(equipment.type).toBe('equipment');
            expect(equipment.equipped).toBe(false);
            expect(equipment.isAttuned).toBe(false);
            expect(equipment.effectId).toBeDefined();
            expect(equipment.tagId).toBeDefined();
            expect(equipment.description).toBe('');
        });

        it('should merge patch values with defaults', () => {
            const store = useEquipmentStore();
            const equipment = store.getEmptyEquipment({
                name: 'Sword',
                weight: 3,
                quantity: 2,
            });

            expect(equipment.name).toBe('Sword');
            expect(equipment.weight).toBe(3);
            expect(equipment.quantity).toBe(2);
            expect(equipment.type).toBe('equipment');
        });
    });

    describe('update', () => {
        it('should add new item if _id not found', () => {
            const store = useEquipmentStore();
            store.update({ name: 'Shield' });

            expect(store.equipment.length).toBe(1);
            expect(store.equipment[0].name).toBe('Shield');
        });

        it('should update existing item', () => {
            const store = useEquipmentStore();
            const item = store.add({ name: 'Axe' });

            store.update({ _id: item._id, name: 'Battle Axe', weight: 5 });

            expect(store.equipment[0].name).toBe('Battle Axe');
            expect(store.equipment[0].weight).toBe(5);
        });
    });

    describe('remove', () => {
        it('should remove item and cleanup dependencies in other stores', () => {
            const store = useEquipmentStore();
            const attunementStore = useAttunementStore();
            const effectsStore = useEffectsStore();
            const tagsStore = useTagsStore();

            const item = store.add({ name: 'Magic Wand', isAttuned: true });
            
            attunementStore.attunedItemIds.push(item._id); 
            effectsStore.addEffect({ _id: item.effectId, label: 'Wand Effect' });
            tagsStore.update({ _id: item.tagId, tags: [] });

            expect(attunementStore.attunedItemIds).toContain(item._id);
            expect(effectsStore.effects.find(e => e._id === item.effectId)).toBeDefined();
            expect(tagsStore.tagGroups.find(t => t._id === item.tagId)).toBeDefined();

            store.remove(item._id);

            expect(store.equipment.length).toBe(0);
            expect(attunementStore.attunedItemIds).not.toContain(item._id);
            expect(effectsStore.effects.find(e => e._id === item.effectId)).toBeUndefined(); 
            expect(tagsStore.tagGroups.find(t => t._id === item.tagId)).toBeUndefined(); 
        });
    });

    describe('getTotalWeight', () => {
        it('should calculate total weight of all equipment', () => {
            const store = useEquipmentStore();
            store.add({ weight: 5, quantity: 2 }); // 10
            store.add({ weight: 3, quantity: 1 }); // 3

            expect(store.getTotalWeight).toBe(13);
        });

        it('should handle floating point weights', () => {
            const store = useEquipmentStore();
            store.add({ weight: 0.5, quantity: 10 }); // 5
            store.add({ weight: 1.25, quantity: 4 }); // 5

            expect(store.getTotalWeight).toBe(10);
        });

        it('should handle zero quantity', () => {
            const store = useEquipmentStore();
            store.add({ weight: 10, quantity: 0 });

            expect(store.getTotalWeight).toBe(0);
        });
    });

    describe('hydrate/dehydrate', () => {
        it('should serialize and deserialize equipment', () => {
            const store = useEquipmentStore();
            const item = store.add({ name: 'Potion' });

            const dehydrated = store.dehydrate();
            expect(dehydrated.equipment[item._id].name).toBe(item.name);
            expect(dehydrated.equipment[item._id].arrayPosition).toBeDefined();

            store.equipment = [];
            store.hydrate(dehydrated);

            expect(store.equipment.length).toBe(1);
            expect(store.equipment[0].name).toBe('Potion');
            expect(store.equipment[0]._id).toBe(item._id);
        });

        it('should replace existing equipment on hydrate (Full Replacement)', () => {
            const store = useEquipmentStore();
            store.add({ name: 'Old Item' });

            const mockHydrateData = {
                equipment: {
                    'new-id': {
                        name: 'New Item',
                        weight: 1,
                        quantity: 1,
                        type: 'equipment' as const,
                        equipped: false,
                        isAttuned: false,
                        effectId: 'e1',
                        tagId: 't1',
                        description: '',
                        arrayPosition: 0
                    }
                }
            };

            store.hydrate(mockHydrateData);

            expect(store.equipment).toHaveLength(1);
            expect(store.equipment[0].name).toBe('New Item');
            expect(store.equipment[0]._id).toBe('new-id');
        });
    });
});