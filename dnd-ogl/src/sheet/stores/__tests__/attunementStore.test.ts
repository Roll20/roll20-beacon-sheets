import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAttunementStore } from '../attunement/attunementStore';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { nextTick } from 'vue';

describe('attunementStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        
        const equipmentStore = useEquipmentStore();
        equipmentStore.add({ _id: 'item1', name: 'Magic Sword' });
        equipmentStore.add({ _id: 'item2', name: 'Shield of Protection' });
        equipmentStore.add({ _id: 'item3', name: 'Ring of Power' });
        equipmentStore.add({ _id: 'item4', name: 'Cloak of Invisibility' });
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            const store = useAttunementStore();
            expect(store.maxSlots).toBe(3);
            expect(store.attunedItemIds).toEqual([]);
            expect(store.availableSlots).toBe(3);
        });
    });

    describe('attuneItem', () => {
        it('should attune an item', () => {
            const store = useAttunementStore();
            store.attuneItem('item1');
            expect(store.attunedItemIds).toEqual(['item1']);
            expect(store.availableSlots).toBe(2);
        });

        it('should not attune an already attuned item', () => {
            const store = useAttunementStore();
            store.attuneItem('item1');
            store.attuneItem('item1');
            expect(store.attunedItemIds).toEqual(['item1']);
        });

        it('should not attune when no slots available', () => {
            const store = useAttunementStore();

            store.attuneItem('item1');
            store.attuneItem('item2');
            store.attuneItem('item3');
            
            store.attuneItem('item4');
            
            expect(store.attunedItemIds).toEqual(['item1', 'item2', 'item3']);
            expect(store.availableSlots).toBe(0);
        });
    });

    describe('unattuneItem', () => {
        it('should unattune an item', () => {
            const store = useAttunementStore();
            store.attuneItem('item1');
            store.unattuneItem('item1');
            expect(store.attunedItemIds).toEqual([]);
        });

        it('should handle unattuning non-attuned item', () => {
            const store = useAttunementStore();
            store.unattuneItem('item1');
            expect(store.attunedItemIds).toEqual([]);
        });
    });

    describe('isAttuned', () => {
        it('should return true for attuned items', () => {
            const store = useAttunementStore();
            store.attuneItem('item1');
            expect(store.isAttuned('item1')).toBe(true);
        });

        it('should return false for non-attuned items', () => {
            const store = useAttunementStore();
            expect(store.isAttuned('item1')).toBe(false);
        });
    });

    describe('attunedItemsWithDetails', () => {
        it('should resolve item details from EquipmentStore', () => {
            const attunement = useAttunementStore();
            const equipment = useEquipmentStore();

            const sword = equipment.getEmptyEquipment({ name: 'Magic Sword' });
            const shield = equipment.getEmptyEquipment({ name: 'Shield of Protection' });
            equipment.equipment.push(sword, shield);

            attunement.attuneItem(sword._id);

            const items = attunement.attunedItemsWithDetails;
            expect(items[0]).toMatchObject({ _id: sword._id, name: 'Magic Sword' });
            expect(items[1]).toBeNull();
            expect(items[2]).toBeNull();
        });

        it('should return null for slot if item ID does not exist in EquipmentStore', () => {
            const store = useAttunementStore();
            store.attuneItem('ghost-item-id');
            
            expect(store.attunedItemsWithDetails[0]).toBeNull();
        });
    });

    describe('maxSlots watcher', () => {
        it('should trim attunedItemIds when maxSlots decreases', async () => {
            const store = useAttunementStore();
            store.attuneItem('item1');
            store.attuneItem('item2');
            store.attuneItem('item3');
            
            store.maxSlots = 1;
            
            // Wait for watcher to fire
            await nextTick();
            
            expect(store.attunedItemIds).toEqual(['item1']);
            expect(store.availableSlots).toBe(0);
        });
    });

    describe('hydrate and dehydrate', () => {
        it('should dehydrate store state', () => {
            const store = useAttunementStore();
            store.maxSlots = 5;
            store.attuneItem('item1');
            
            const state = store.dehydrate();
            
            expect(state.attunement.maxSlots).toBe(5);
            expect(state.attunement.attunedItemIds).toEqual({ '0': 'item1' });
        });

        it('should hydrate store state', () => {
            const store = useAttunementStore();
            store.hydrate({
                attunement: {
                    maxSlots: 4,
                    attunedItemIds: { '0': 'item1', '1': 'item2' },
                },
            });
            expect(store.maxSlots).toBe(4);
            expect(store.attunedItemIds).toEqual(['item1', 'item2']);
        });

        it('should enforce maxSlots limit during hydration', () => {
            const store = useAttunementStore();
            
            const payload = {
                attunement: {
                    maxSlots: 1,
                    attunedItemIds: { '0': 'item1', '1': 'item2', '2': 'item3' },
                },
            };

            store.hydrate(payload);

            expect(store.maxSlots).toBe(1);
            expect(store.attunedItemIds).toHaveLength(1);
            expect(store.attunedItemIds).toEqual(['item1']);
        });

        it('should handle missing payload', () => {
            const store = useAttunementStore();
            store.hydrate({} as any);
            expect(store.maxSlots).toBe(3);
            expect(store.attunedItemIds).toEqual([]);
        });

        it('should use default values when properties are missing in payload', () => {
            const store = useAttunementStore();
            store.hydrate({
                attunement: {
                    maxSlots: undefined as any,
                    attunedItemIds: undefined as any,
                },
            });
            expect(store.maxSlots).toBe(3);
            expect(store.attunedItemIds).toEqual([]);
        });
    });
});