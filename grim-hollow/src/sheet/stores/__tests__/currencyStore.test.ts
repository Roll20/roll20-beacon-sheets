import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCurrencyStore } from '../currency/currencyStore';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { useTagsStore } from '../tags/tagsStore';
import { config } from '@/config';



describe('useCurrencyStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initialization', () => {
        it('should initialize with zero values for all currency types', () => {
            const store = useCurrencyStore();
            
            config.currencyTypes.forEach(currencyType => {
                expect(store.values[currencyType]).toBe(0);
            });
        });
    });

    describe('updateCurrency', () => {
        it('should add currency when add is true', () => {
            const store = useCurrencyStore();
            const currencyType = config.currencyTypes[0];
            
            store.updateCurrency({ [currencyType]: 100 }, true);
            
            expect(store.values[currencyType]).toBe(100);
        });

        it('should subtract currency when add is false', () => {
            const store = useCurrencyStore();
            const currencyType = config.currencyTypes[0];
            store.values[currencyType] = 100;
            
            store.updateCurrency({ [currencyType]: 30 }, false);
            
            expect(store.values[currencyType]).toBe(70);
        });

        it('should not go below zero', () => {
            const store = useCurrencyStore();
            const currencyType = config.currencyTypes[0];
            store.values[currencyType] = 50;
            
            store.updateCurrency({ [currencyType]: 100 }, false);
            
            expect(store.values[currencyType]).toBe(0);
        });

        it('should ignore invalid currency keys', () => {
            const store = useCurrencyStore();
            // @ts-ignore
            store.updateCurrency({ 'invalid-currency': 100 }, true);
            
            expect(store.values).not.toHaveProperty('invalid-currency');
            expect(store.values[config.currencyTypes[0]]).toBe(0);
        });

        it('should handle multiple currency updates', () => {
            const store = useCurrencyStore();
            const updates = config.currencyTypes.reduce((acc, curr, idx) => {
                acc[curr] = (idx + 1) * 10;
                return acc;
            }, {} as Record<string, number>);
            
            store.updateCurrency(updates, true);
            
            config.currencyTypes.forEach((type, idx) => {
                expect(store.values[type]).toBe((idx + 1) * 10);
            });
        });
    });

    describe('getCurrencyBreakdown (Integration)', () => {
        it('should calculate total from currencies', () => {
            const store = useCurrencyStore();
            
            store.values[config.currencyTypes[0]] = 100;
            store.values[config.currencyTypes[1]] = 50;
            
            const breakdown = store.getCurrencyBreakdown;
            
            expect(breakdown.totalResources).toBe(150);
        });

        it('should identify treasure items from equipment store integration', () => {
            const currencyStore = useCurrencyStore();
            const equipmentStore = useEquipmentStore();
            const tagsStore = useTagsStore();

            const item = equipmentStore.getEmptyEquipment({
                name: 'Golden Idol',
                value: { amount: 500, currency: 'gp' },
                quantity: 1,
            });
            equipmentStore.equipment.push(item);

            const tagGroup = tagsStore.getExistingOrCreate(item.tagId, 'equipment');
            tagsStore.update({
                _id: tagGroup._id,
                tags: [{ _id: 'tag-1', text: 'treasure', isDefault: true }]
            });

            const breakdown = currencyStore.getCurrencyBreakdown;
            
            expect(breakdown.treasureItems).toHaveLength(1);
            expect(breakdown.treasureItems[0].name).toBe('Golden Idol');
            expect(breakdown.treasureItems[0].value.amount).toBe(500);

            expect(breakdown.totalResources).toBe(0); 
        });

        it('should calculate treasure value based on quantity', () => {
            const currencyStore = useCurrencyStore();
            const equipmentStore = useEquipmentStore();
            const tagsStore = useTagsStore();

            const item = equipmentStore.getEmptyEquipment({
                name: 'Gem',
                value: { amount: 50, currency: 'gp' },
                quantity: 10,
            });
            equipmentStore.equipment.push(item);

            const tagGroup = tagsStore.getExistingOrCreate(item.tagId, 'equipment');
            tagsStore.update({
                _id: tagGroup._id,
                tags: [{ _id: 'tag-1', text: 'treasure' }]
            });

            const breakdown = currencyStore.getCurrencyBreakdown;
            expect(breakdown.treasureItems[0].value.amount).toBe(500);
        });

        it('should return breakdown for each currency type', () => {
            const store = useCurrencyStore();
            
            const breakdown = store.getCurrencyBreakdown;
            
            config.currencyTypes.forEach(type => {
                expect(breakdown.breakdown[type]).toHaveProperty('total');
            });
        });
    });

    describe('dehydrate', () => {
        it('should return current currency values', () => {
            const store = useCurrencyStore();
            store.values[config.currencyTypes[0]] = 100;
            
            const dehydrated = store.dehydrate();
            
            expect(dehydrated.currency.values[config.currencyTypes[0]]).toBe(100);
        });
    });

    describe('hydrate', () => {
        it('should restore currency values', () => {
            const store = useCurrencyStore();
            const hydrateData = {
                currency: {
                    values: { [config.currencyTypes[0]]: 200 } as any,
                },
            };
            
            store.hydrate(hydrateData);
            
            expect(store.values[config.currencyTypes[0]]).toBe(200);
        });

        it('should merge with initial values ensuring no keys are lost', () => {
            const store = useCurrencyStore();
            const hydrateData = {
                currency: {
                    values: { [config.currencyTypes[0]]: 150 } as any,
                },
            };
            
            store.hydrate(hydrateData);
            
            expect(store.values[config.currencyTypes[0]]).toBe(150);
            // Ensure other keys still exist
            config.currencyTypes.slice(1).forEach(type => {
                expect(store.values[type]).toBe(0);
            });
        });
    });
});