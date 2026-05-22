import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useRollDialogStore } from '../dialogs/rollDialogStore';
import type { D20RollArgs, DamageRollArgs } from '@/utility/roll';

describe('useRollDialogStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should initialize with closed state', () => {
        const store = useRollDialogStore();
        expect(store.isOpen).toBe(false);
        expect(store.rollType).toBeNull();
        expect(store.rollArgs).toBeNull();
        expect(store.additionalBonus).toBe('');
    });

    describe('open', () => {
        it('should open dialog with d20 roll type and default mode', () => {
            const store = useRollDialogStore();
            const args: D20RollArgs = { rollName: 'Attack', subtitle: 'Str', bonuses: [] };

            store.open('d20', args);

            expect(store.isOpen).toBe(true);
            expect(store.rollType).toBe('d20');
            expect(store.rollArgs).toStrictEqual(args);
            expect(store.additionalBonus).toBe('');
            expect(store.selectedMode).toBe(0); 
        });

        it('should open dialog with damage roll type and default crit mode false', () => {
            const store = useRollDialogStore();
            const args: DamageRollArgs = { rollName: 'Damage', subtitle: 'Slash', t: (k) => k };

            store.open('damage', args);

            expect(store.isOpen).toBe(true);
            expect(store.rollType).toBe('damage');
            expect(store.rollArgs).toStrictEqual(args);
            expect(store.additionalBonus).toBe('');
            expect(store.selectedMode).toBe(false); 
        });

        it('should reset additionalBonus when opening a new dialog', () => {
            const store = useRollDialogStore();
            store.additionalBonus = '1d4'; // Simulate leftover data
            const args: D20RollArgs = { rollName: 'Check', subtitle: '', bonuses: [] };

            store.open('d20', args);

            expect(store.additionalBonus).toBe('');
        });

        it('should replace rollArgs when opening a new dialog', () => {
            const store = useRollDialogStore();
            const firstArgs: D20RollArgs = { rollName: 'First', subtitle: '', bonuses: [] };
            const secondArgs: D20RollArgs = { rollName: 'Second', subtitle: '', bonuses: [] };

            store.open('d20', firstArgs);
            expect(store.rollArgs).toStrictEqual(firstArgs);

            store.open('d20', secondArgs);
            expect(store.rollArgs).toStrictEqual(secondArgs);
        });
    });

    describe('close', () => {
        it('should close dialog and reset state', () => {
            const store = useRollDialogStore();
            const args: D20RollArgs = { rollName: 'Test', subtitle: '', bonuses: [] };
            
            store.open('d20', args);
            store.additionalBonus = '5';
            store.selectedMode = 1;

            store.close();

            expect(store.isOpen).toBe(false);
            expect(store.rollType).toBeNull();
            expect(store.rollArgs).toBeNull();
            expect(store.selectedMode).toBe(0);
            expect(store.additionalBonus).toBe('');
        });
    });

    describe('User Interaction (Changing variables to simulate user input)', () => {
        it('should allow modifying additionalBonus', () => {
            const store = useRollDialogStore();
            store.open('d20', { rollName: 'Test', subtitle: '', bonuses: [] });

            store.additionalBonus = '1d6 + 2';
            expect(store.additionalBonus).toBe('1d6 + 2');
        });

        it('should allow modifying selectedMode', () => {
            const store = useRollDialogStore();
            store.open('d20', { rollName: 'Test', subtitle: '', bonuses: [] });

            store.selectedMode = 1;
            expect(store.selectedMode).toBe(1);

            store.selectedMode = -1;
            expect(store.selectedMode).toBe(-1);
        });
    });
});