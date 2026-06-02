import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onInit, onChange, onDropOver, onTranslationsRequest, onSettingsChange, onSharedSettingsChange, onDragOver } from '../handlers/handlers';
import { initValues, beaconPulse } from '../relay';
import { drag } from '@/compendium/drop';
import type { Dispatch, InitArgs } from '@roll20-official/beacon-sdk';

vi.mock('@/compendium/drop', () => ({
  drag: vi.fn(),
}));

const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Relay Handlers', () => {
  const mockDispatch = {} as Dispatch;

  const mockCharacter = {
    id: 'char-123',
    attributes: {},
  };

  const mockSettings = {
    campaignId: 1,
    isGM: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    initValues.id = '';
    initValues.character = { attributes: {} } as any;
    initValues.settings = {} as any;
    initValues.compendiumDrop = null;
    beaconPulse.value = 0;
  });

  describe('onInit', () => {
    it('should initialize global values correctly', async () => {
      const args: InitArgs = {
        character: mockCharacter as any,
        settings: mockSettings as any,
        compendiumDropData: null,
        user: { id: 'user-1', display_name: 'Player' }
      };

      await onInit(args, mockDispatch);

      expect(initValues.id).toBe('char-123');
      expect(initValues.character).toEqual(mockCharacter);
      expect(initValues.settings).toEqual(mockSettings);
      expect(initValues.compendiumDrop).toBeNull();
    });

    it('should NOT trigger drag if compendiumDropData is missing', async () => {
      const args: InitArgs = {
        character: mockCharacter as any,
        settings: mockSettings as any,
        compendiumDropData: null,
        user: { id: 'user-1', display_name: 'Player' }
      };

      await onInit(args, mockDispatch);

      expect(drag).not.toHaveBeenCalled();
    });

    it('should NOT trigger drag if compendiumDropData category is not "Monsters"', async () => {
      const args: InitArgs = {
        character: mockCharacter as any,
        settings: mockSettings as any,
        compendiumDropData: {
          categoryName: 'Spells',
          pageName: 'Fireball',
          expansionId: 1
        },
        user: { id: 'user-1', display_name: 'Player' }
      };

      await onInit(args, mockDispatch);

      expect(drag).not.toHaveBeenCalled();
    });

    it('should trigger drag if compendiumDropData category is "Monsters"', async () => {
      const dropData = {
        categoryName: 'Monsters',
        pageName: 'Goblin',
        expansionId: 1
      };

      const args: InitArgs = {
        character: mockCharacter as any,
        settings: mockSettings as any,
        compendiumDropData: dropData,
        user: { id: 'user-1', display_name: 'Player' }
      };

      await onInit(args, mockDispatch);

      expect(initValues.compendiumDrop).toEqual(dropData);
      expect(drag).toHaveBeenCalledTimes(1);
      expect(drag).toHaveBeenCalledWith(
        { coordinates: { left: 0, top: 0 }, dropData },
        mockDispatch,
        true, // isNewSheet flag
        mockCharacter
      );
    });
  });

  describe('onChange', () => {
    it('should increment beaconPulse to trigger reactivity', async () => {
      const initialPulse = beaconPulse.value;

      await onChange({ character: { name: 'New Name' } });

      expect(beaconPulse.value).toBe(initialPulse + 1);
      expect(consoleSpy).toHaveBeenCalledWith('onChange -> Example Sheet Relay', { name: 'New Name' });
    });
  });

  describe('Passthrough Handlers', () => {
    it('onTranslationsRequest should return empty object', () => {
      expect(onTranslationsRequest()).toEqual({});
    });

    it('onDropOver should be aliased to drag', () => {
      expect(onDropOver).toBe(drag);
    });

    it('onSettingsChange and onSharedSettingsChange should be functions', () => {
      expect(typeof onSettingsChange).toBe('function');
      expect(typeof onSharedSettingsChange).toBe('function');
      
      expect(() => onSettingsChange()).not.toThrow();
      expect(() => onSharedSettingsChange()).not.toThrow();
    });

    it('onDragOver should be a function', () => {
      expect(typeof onDragOver).toBe('function');
      expect(() => onDragOver()).not.toThrow();
    });
  });
});