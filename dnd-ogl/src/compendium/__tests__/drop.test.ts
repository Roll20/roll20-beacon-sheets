import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const { onDropEquipment } = await import('../dropEquipment');
const { onDropSpell } = await import('../dropSpell');
const { onDropClass } = await import('../dropClass');
const { setToken } = await import('../dropMonster');

import { drag, dropHandlers } from '../drop';
import type { Dispatch } from '@roll20-official/beacon-sdk';

vi.mock('../dropEquipment', () => ({
  onDropEquipment: vi.fn(),
}));
vi.mock('../dropSpell', () => ({
  onDropSpell: vi.fn(),
}));
vi.mock('../dnd-transformers', () => ({
  transformers: {
    Spells: vi.fn(() => ({ name: 'Transformed Spell', transformed: true })),
  },
}));

vi.mock('../dropMonster', () => ({
  onDropMonster: vi.fn(),
  setToken: vi.fn(),
}));

vi.mock('../dropClass', () => ({
  onDropClass: vi.fn(),
}));

describe('Compendium Drop', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockDispatch = {
    compendiumRequest: vi.fn(),
    updateTokensByCharacter: vi.fn(),
  } as unknown as Dispatch;

  const mockCharacter = { id: 'char-123' } as any;

  const createMockResponse = (pages: any[]) => ({
    data: {
      ruleSystem: {
        category: {
          pages: pages,
        },
      },
    },
  });

  it('should handle a native data-payload drop correctly', async () => {
    const payload = {
      name: 'Test Item',
      weight: 5,
      'data-tags': ['rare'],
      'data-effects': { label: 'Effect' },
    };

    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: 'page-1',
          name: 'Test Item',
          book: { itemId: '10' },
          properties: {
            'data-payload': JSON.stringify(payload),
          },
        },
      ]),
    );

    const dropData = {
      pageName: 'Test Item',
      categoryName: 'Items',
      expansionId: 10,
    };

    await drag({ dropData } as any, mockDispatch);

    expect(mockDispatch.compendiumRequest).toHaveBeenCalled();
    const query = (mockDispatch.compendiumRequest as any).mock.calls[0][0].query;
    expect(query).toContain('category(name: "Items")');
    expect(query).toContain('pages(name: "Test Item")');

    // Verify Routing to onDropEquipment
    expect(onDropEquipment).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ name: 'Test Item', weight: 5 }), // tags/effects stripped from payload
        tags: ['rare'],
        effects: { label: 'Effect' },
        expansionId: 10,
      }),
    );
  });

  it('should fallback to transformers if data-payload is missing', async () => {
    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: 'page-1',
          name: 'Legacy Spell',
          book: { itemId: '5' },
          properties: {
            Level: '3',
          },
        },
      ]),
    );

    const dropData = {
      pageName: 'Legacy Spell',
      categoryName: 'Spells',
      expansionId: 5,
    };

    await drag({ dropData } as any, mockDispatch);

    // Check if transformer was called
    expect(onDropSpell).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ name: 'Transformed Spell', transformed: true }),
      }),
    );
  });

  it('should select the correct page based on expansionId', async () => {
    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: 'page-phb',
          name: 'Fireball',
          book: { itemId: '1' },
          properties: { 'data-payload': JSON.stringify({ name: 'Fireball PHB' }) },
        },
        {
          id: 'page-srd',
          name: 'Fireball',
          book: { itemId: '2' },
          properties: { 'data-payload': JSON.stringify({ name: 'Fireball SRD' }) },
        },
      ]),
    );

    const dropData = {
      pageName: 'Fireball',
      categoryName: 'Spells',
      expansionId: 2,
    };

    await drag({ dropData } as any, mockDispatch);

    expect(onDropSpell).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { name: 'Fireball SRD' },
      }),
    );
  });

  it('should throw error if network request fails', async () => {
    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue({
      errors: [{ message: 'Server Error' }],
    });

    const dropData = { pageName: 'Error', categoryName: 'Items', expansionId: 1 };

    await expect(drag({ dropData } as any, mockDispatch)).rejects.toThrow(
      'Expected a compendium request',
    );
  });

  it('should not call handler if page is empty/missing', async () => {
    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(createMockResponse([]));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const dropData = { pageName: 'Missing', categoryName: 'Items', expansionId: 1 };
    await drag({ dropData } as any, mockDispatch);

    expect(onDropEquipment).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should extract data-features correctly', async () => {
    const payload = {
      name: 'Class',
      'data-features': { 'level-1': [{ name: 'Feat 1' }] },
    };

    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: '1',
          name: 'Class',
          book: { itemId: '1' },
          properties: { 'data-payload': JSON.stringify(payload) },
        },
      ]),
    );

    const dropData = { pageName: 'Class', categoryName: 'Classes', expansionId: 1 };
    await drag({ dropData } as any, mockDispatch);

    expect(onDropClass).toHaveBeenCalledWith(
      expect.objectContaining({
        features: { 'level-1': [{ name: 'Feat 1' }] },
        payload: expect.not.objectContaining({ 'data-features': expect.anything() }),
      }),
    );
  });

  it('should set token after delay if isNewSheet is true', async () => {
    const payload = { name: 'Monster' };
    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: '1',
          name: 'Monster',
          book: { itemId: '1' },
          properties: { 'data-payload': JSON.stringify(payload) },
        },
      ]),
    );

    const dropData = { pageName: 'Monster', categoryName: 'Monsters', expansionId: 1 };

    const dragPromise = drag({ dropData } as any, mockDispatch, true, mockCharacter);

    for (let i = 0; i < 20; i++) {
      await Promise.resolve();
    }

    vi.advanceTimersByTime(2000);

    await dragPromise;

    expect(setToken).toHaveBeenCalledWith(
      expect.objectContaining({
        characterId: 'char-123',
        payload: expect.objectContaining({ name: 'Monster' }),
        dispatch: mockDispatch,
      }),
    );
  });

  it('should extract data-spells correctly', async () => {
    const payload = {
      name: 'Spell Container',
      'data-spells': [{ name: 'Firebolt' }],
    };

    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: '1',
          name: 'Container',
          book: { itemId: '1' },
          properties: { 'data-payload': JSON.stringify(payload) },
        },
      ]),
    );

    const dropData = { pageName: 'Container', categoryName: 'Items', expansionId: 1 };
    await drag({ dropData } as any, mockDispatch);

    expect(onDropEquipment).toHaveBeenCalledWith(
      expect.objectContaining({
        spells: [{ name: 'Firebolt' }],
        payload: expect.not.objectContaining({ 'data-spells': expect.anything() }),
      }),
    );
  });

  it('should log error if item format is unknown and no transformer exists', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: '1',
          name: 'Unknown',
          book: { itemId: '1' },
          properties: { SomeLegacyProp: 'Value' },
        },
      ]),
    );

    const dropData = {
      pageName: 'Unknown',
      categoryName: 'UnknownCategory' as any,
      expansionId: 1,
    };

    // @ts-ignore
    dropHandlers['UnknownCategory'] = vi.fn();

    await drag({ dropData } as any, mockDispatch);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Item is not in native format and no transformer was found'),
    );

    // @ts-ignore
    delete dropHandlers['UnknownCategory'];
    consoleSpy.mockRestore();
  });

  it('should detect npcId from DOM when coordinates are provided', async () => {
    document.elementsFromPoint = vi.fn();
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-npc-id', 'npc-123');
    
    vi.spyOn(document, 'elementsFromPoint').mockReturnValue([mockElement]);

    mockDispatch.compendiumRequest = vi.fn().mockResolvedValue(
      createMockResponse([
        {
          id: 'page-spell',
          name: 'Magic Missile',
          book: { itemId: '1' },
          properties: { 'data-payload': JSON.stringify({ name: 'Magic Missile' }) },
        },
      ]),
    );

    const dropData = { pageName: 'Magic Missile', categoryName: 'Spells', expansionId: 1 };
    const coordinates = { left: 100, top: 100 };

    await drag({ dropData, coordinates } as any, mockDispatch);

    expect(onDropSpell).toHaveBeenCalledWith(
      expect.objectContaining({
        npcId: 'npc-123',
        payload: expect.objectContaining({ name: 'Magic Missile' }),
      }),
    );
  });
});
