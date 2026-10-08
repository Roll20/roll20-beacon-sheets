import { describe, it, expect, vi } from 'vitest';
import {
  isEarlier,
  rollInitiativeAction,
  clearInitiativeAction,
  resolveDuplicatesAction,
  type InitiativeMap,
  type RollInfo
} from '../../system/initiative/initiative';

describe('initiative helper functions', () => {
  describe('isEarlier', () => {
    it('ranks earlier timestamp first', () => {
      const rollA: RollInfo = { charId: 'char2', value: 5, timestamp: 100, index: 1 };
      const rollB: RollInfo = { charId: 'char1', value: 5, timestamp: 200, index: 0 };
      expect(isEarlier(rollA, rollB)).toBe(true);
      expect(isEarlier(rollB, rollA)).toBe(false);
    });

    it('ranks alphabetically smaller character ID first if timestamps are equal', () => {
      const rollA: RollInfo = { charId: 'char1', value: 5, timestamp: 100, index: 1 };
      const rollB: RollInfo = { charId: 'char2', value: 5, timestamp: 100, index: 0 };
      expect(isEarlier(rollA, rollB)).toBe(true);
      expect(isEarlier(rollB, rollA)).toBe(false);
    });

    it('ranks smaller index first if timestamps and character IDs are equal', () => {
      const rollA: RollInfo = { charId: 'char1', value: 5, timestamp: 100, index: 0 };
      const rollB: RollInfo = { charId: 'char1', value: 5, timestamp: 100, index: 1 };
      expect(isEarlier(rollA, rollB)).toBe(true);
      expect(isEarlier(rollB, rollA)).toBe(false);
    });
  });

  describe('rollInitiativeAction', () => {
    it('rolls a number and appends to character list', async () => {
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 7 } } }
        })
      };

      const map: InitiativeMap = {};
      const updated = await rollInitiativeAction('hero1', map, dispatch);

      expect(updated['hero1']).toBeDefined();
      expect(updated['hero1'].initiative).toEqual([7]);
      expect(typeof updated['hero1'].timestamp).toBe('number');
    });

    it('avoids already taken numbers by other characters', async () => {
      
      const map: InitiativeMap = {
        hero2: { timestamp: 100, initiative: [5, 6] }
      };

      
      
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 6 } } }
        })
      };

      const updated = await rollInitiativeAction('hero1', map, dispatch);
      expect(updated['hero1'].initiative).toEqual([8]);
      expect(dispatch.roll).toHaveBeenCalledWith({ rolls: { init: '1d8' } });
    });

    it('avoids already taken numbers by the same character', async () => {
      const map: InitiativeMap = {
        hero1: { timestamp: 100, initiative: [3] }
      };

      
      
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 8 } } }
        })
      };

      const updated = await rollInitiativeAction('hero1', map, dispatch);
      expect(updated['hero1'].initiative).toEqual([3, 9]);
      expect(dispatch.roll).toHaveBeenCalledWith({ rolls: { init: '1d9' } });
    });

    it('falls back gracefully to any free number if roll fails', async () => {
      const map: InitiativeMap = {
        hero2: { timestamp: 100, initiative: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      };

      
      const dispatch = {
        roll: vi.fn().mockRejectedValue(new Error('Roll failed'))
      };

      const updated = await rollInitiativeAction('hero1', map, dispatch);
      expect(updated['hero1'].initiative).toEqual([10]);
    });
  });

  describe('clearInitiativeAction', () => {
    it('clears character initiative list in map by setting it to null', () => {
      const map: InitiativeMap = {
        hero1: { timestamp: 100, initiative: [5] },
        hero2: { timestamp: 100, initiative: [8] }
      };

      const updated = clearInitiativeAction('hero1', map);
      expect(updated['hero1']).toBeNull();
      expect(updated['hero2'].initiative).toEqual([8]);
    });
  });

  describe('resolveDuplicatesAction', () => {
    it('does nothing if no duplicates exist', async () => {
      const map: InitiativeMap = {
        hero1: { timestamp: 100, initiative: [4] },
        hero2: { timestamp: 200, initiative: [7] }
      };

      const { changed, updatedMap } = await resolveDuplicatesAction('hero1', map, null);
      expect(changed).toBe(false);
      expect(updatedMap).toEqual(map);
    });

    it('rerolls duplicate initiative if other character rolled earlier (earlier timestamp)', async () => {
      
      
      const map: InitiativeMap = {
        hero1: { timestamp: 200, initiative: [5] },
        hero2: { timestamp: 100, initiative: [5] }
      };

      
      
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 7 } } }
        })
      };

      const { changed, updatedMap } = await resolveDuplicatesAction('hero1', map, dispatch);
      expect(changed).toBe(true);
      expect(updatedMap['hero1'].initiative).toEqual([8]);
      expect(updatedMap['hero1'].timestamp).toBe(200); 
      expect(updatedMap['hero2'].initiative).toEqual([5]); 
      expect(dispatch.roll).toHaveBeenCalledWith({ rolls: { init: '1d9' } });
    });

    it('does not reroll duplicate initiative if we rolled earlier (earlier timestamp)', async () => {
      
      
      const map: InitiativeMap = {
        hero1: { timestamp: 100, initiative: [5] },
        hero2: { timestamp: 200, initiative: [5] }
      };

      const { changed, updatedMap } = await resolveDuplicatesAction('hero1', map, null);
      expect(changed).toBe(false);
      expect(updatedMap).toEqual(map);
    });

    it('rerolls duplicate initiative if timestamps are equal but character ID is later alphabetically', async () => {
      
      
      const map: InitiativeMap = {
        heroA: { timestamp: 100, initiative: [5] },
        heroB: { timestamp: 100, initiative: [5] }
      };

      
      
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 8 } } }
        })
      };

      const { changed, updatedMap } = await resolveDuplicatesAction('heroB', map, dispatch);
      expect(changed).toBe(true);
      expect(updatedMap['heroB'].initiative).toEqual([9]);
      expect(updatedMap['heroA'].initiative).toEqual([5]);
      expect(dispatch.roll).toHaveBeenCalledWith({ rolls: { init: '1d9' } });
    });

    it('rerolls internal duplicates (same character having rolled same number twice)', async () => {
      
      const map: InitiativeMap = {
        hero1: { timestamp: 100, initiative: [5, 5] }
      };

      
      
      const dispatch = {
        roll: vi.fn().mockResolvedValue({
          results: { init: { results: { result: 4 } } }
        })
      };

      const { changed, updatedMap } = await resolveDuplicatesAction('hero1', map, dispatch);
      expect(changed).toBe(true);
      expect(updatedMap['hero1'].initiative).toEqual([5, 4]);
      expect(dispatch.roll).toHaveBeenCalledWith({ rolls: { init: '1d9' } });
    });
  });
});
