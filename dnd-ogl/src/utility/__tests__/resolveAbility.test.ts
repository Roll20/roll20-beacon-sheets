import { describe, it, expect } from 'vitest';
import { resolveAbility } from '../resolveAbility';
import type { SpellSource } from '@/sheet/stores/spells/spellsStore';
import type { NpcSpellSource } from '@/sheet/stores/npc/npcStore';

describe('resolveAbility', () => {
    it('should return the ability key when it is not "spellcasting"', () => {
        const result = resolveAbility('intelligence', undefined, []);
        expect(result).toBe('intelligence');
    });

    it('should return "none" when abilityKey is undefined', () => {
        const result = resolveAbility(undefined, undefined, []);
        expect(result).toBe('none');
    });

    it('should return "none" when abilityKey is null', () => {
        const result = resolveAbility(null, undefined, []);
        expect(result).toBe('none');
    });

    it('should return source ability when abilityKey is "spellcasting" and source is found', () => {
        const sources: SpellSource[] = [
            { _id: 'source1', type: 'ability', ability: 'wisdom' } as SpellSource,
            { _id: 'source2', type: 'ability', ability: 'intelligence' } as SpellSource,
        ];
        const result = resolveAbility('spellcasting', 'source2', sources);
        expect(result).toBe('intelligence');
    });

    it('should return first source ability when abilityKey is "spellcasting" and sourceId not found', () => {
        const sources: SpellSource[] = [
            { _id: 'source1', type: 'ability', ability: 'charisma' } as SpellSource,
        ];
        const result = resolveAbility('spellcasting', 'nonexistent', sources);
        expect(result).toBe('charisma');
    });

    it('should return "none" when abilityKey is "spellcasting" and source type is not "ability"', () => {
        const sources: SpellSource[] = [
            { _id: 'source1', name: 'Innate Spellcasting', type: 'flat'} as SpellSource,
        ];
        const result = resolveAbility('spellcasting', 'source1', sources);
        expect(result).toBe('none');
    });

    it('should return "none" when abilityKey is "spellcasting" and sources array is empty', () => {
        const result = resolveAbility('spellcasting', undefined, []);
        expect(result).toBe('none');
    });

    it('should return first source ability when abilityKey is "spellcasting" and sourceId is undefined', () => {
        const sources: SpellSource[] = [
            { _id: 'source1', type: 'ability', ability: 'dexterity' } as SpellSource,
        ];
        const result = resolveAbility('spellcasting', undefined, sources);
        expect(result).toBe('dexterity');
    });
});