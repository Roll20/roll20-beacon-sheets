import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSensesStore } from '../senses/sensesStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { config } from '@/config';
import { effectKeys } from '@/effects.config';

describe('useSensesStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('initializes manualSenses with all senses set to 0', () => {
        const store = useSensesStore();
        
        expect(store.manualSenses).toEqual({
            blindsight: 0,
            darkvision: 0,
            tremorsense: 0,
            truesight: 0,
        });
    });

    it('getSenseValue returns value modified by Effects Store', () => {
        const store = useSensesStore();
        const effectsStore = useEffectsStore();

        store.manualSenses.darkvision = 30;

        const baseValue = store.getSenseValue('darkvision');
        expect(baseValue.value.final).toBe(30);

        effectsStore.addEffect({
            label: 'Goggles of Night',
            enabled: true,
            effects: [
                { 
                    _id: 'eff1',
                    attribute: effectKeys['sense-darkvision'], 
                    operation: 'add', 
                    value: 60,
                    formula: ''
                }
            ]
        });

        const modifiedValue = store.getSenseValue('darkvision');
        expect(modifiedValue.value.final).toBe(90);
    });

    it('activeSenses filters senses with value > 0', () => {
        const store = useSensesStore();
        const effectsStore = useEffectsStore();

        store.manualSenses.blindsight = 10;
        
        effectsStore.addEffect({
            label: 'Spell',
            enabled: true,
            effects: [
                { 
                    _id: 'eff1',
                    attribute: effectKeys['sense-darkvision'], 
                    operation: 'set-base', 
                    value: 60,
                    formula: ''
                }
            ]
        });

        expect(store.activeSenses).toHaveLength(2);
        const keys = store.activeSenses.map(s => s.key);
        expect(keys).toContain('blindsight');
        expect(keys).toContain('darkvision');
        expect(keys).not.toContain('tremorsense');
    });

    it('dehydrate returns current state', () => {
        const store = useSensesStore();
        store.manualSenses.darkvision = 60;

        const dehydrated = store.dehydrate();

        expect(dehydrated).toEqual({
            senses: {
                manualSenses: expect.objectContaining({ darkvision: 60 }),
            },
        });
    });

    it('hydrate restores state from payload', () => {
        const store = useSensesStore();
        const payload = {
            senses: {
                manualSenses: { blindsight: 10, darkvision: 60, tremorsense: 0, truesight: 0 },
            },
        };

        store.hydrate(payload);

        expect(store.manualSenses.darkvision).toBe(60);
        expect(store.manualSenses.blindsight).toBe(10);
    });

    it('hydrate sanitizes input (ignores unknown keys)', () => {
        const store = useSensesStore();
        const payload = {
            senses: {
                manualSenses: { 
                    darkvision: 60, 
                    'unknown-sense': 100 
                },
            },
        } as any;

        store.hydrate(payload);

        expect(store.manualSenses.darkvision).toBe(60);
        expect((store.manualSenses as any)['unknown-sense']).toBeUndefined();
    });

    it('hydrate handles missing payload gracefully', () => {
        const store = useSensesStore();
        
        store.hydrate(null as any);
        store.hydrate({} as any);

        expect(store.manualSenses).toBeDefined();
    });
});