import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { hydrateSpells } from '../hydrateSpells';
import { transformers } from '../dnd-transformers'; 

const mockCompendiumRequest = vi.fn();
vi.mock('@/relay/relay', () => ({
  dispatchRef: {
    value: {
      compendiumRequest: (...args: any[]) => mockCompendiumRequest(...args),
    },
  },
}));

vi.mock('../dnd-transformers', () => ({
  transformers: {
    Spells: vi.fn(),
  },
}));

// Mock drop.ts to break circular dependencies
vi.mock('../drop', () => ({
  createPageRequest: vi.fn((category, name) => `query-${category}-${name}`),
}));

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});


describe('hydrateSpells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  it('should return empty array for empty or invalid input', async () => {
    expect(await hydrateSpells([])).toEqual([]);
    expect(await hydrateSpells(null as any)).toEqual([]);
    expect(await hydrateSpells(undefined as any)).toEqual([]);
  });

  it('should hydrate a spell using data-payload (Modern format)', async () => {
    const spellStub = { name: 'Fireball', level: 3 };
    const mockPayload = { 
      name: 'Fireball', 
      description: { default: 'Boom' }, 
      damage: [{ formula: '8d6' }] 
    };

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-1',
                name: 'Fireball',
                book: { itemId: '5' },
                properties: {
                  'data-payload': JSON.stringify(mockPayload),
                },
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(mockCompendiumRequest).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Fireball',
      level: 3, 
      description: { default: 'Boom' }, 
    });
  });

  it('should hydrate a spell using transformers (Legacy format)', async () => {
    const spellStub = { name: 'Magic Missile' };
    const mockProperties = {
      Level: '1',
      School: 'Evocation',
    };
    
    const transformedData = {
      name: 'Magic Missile',
      school: 'evocation',
      range: '120 feet',
    };

    (transformers.Spells as any).mockReturnValue(transformedData);

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-2',
                name: 'Magic Missile',
                book: { itemId: '5' },
                properties: mockProperties,
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(transformers.Spells).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Magic Missile' }),
      expect.anything(),
      expect.objectContaining(mockProperties)
    );
    expect(result[0]).toMatchObject(transformedData);
  });

  it('should prioritize book ID "5" (SRD) when multiple pages exist', async () => {
    const spellStub = { name: 'Shield' };
    const mockPayloadSRD = { name: 'Shield', source: 'SRD' };
    const mockPayloadOther = { name: 'Shield', source: 'Other' };

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-other',
                name: 'Shield',
                book: { itemId: '999' },
                properties: { 'data-payload': JSON.stringify(mockPayloadOther) },
              },
              {
                id: 'page-srd',
                name: 'Shield',
                book: { itemId: '5' },
                properties: { 'data-payload': JSON.stringify(mockPayloadSRD) },
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('SRD');
  });

  it('should fallback to the first available page if book ID "5" is not found', async () => {
    const spellStub = { name: 'Custom Spell' };
    const mockPayload = { name: 'Custom Spell', source: 'Homebrew' };

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-1',
                name: 'Custom Spell',
                book: { itemId: '10' },
                properties: { 'data-payload': JSON.stringify(mockPayload) },
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('Homebrew');
  });

  it('should skip hydration and warn if compendium request fails or returns no pages', async () => {
    const spellStub = { name: 'Unknown Spell' };

    mockCompendiumRequest.mockResolvedValueOnce({
      errors: ['Some GraphQL Error'],
    });

    const result1 = await hydrateSpells([spellStub]);
    expect(result1).toHaveLength(0);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not find compendium spell'));

    mockCompendiumRequest.mockResolvedValueOnce({
      data: { ruleSystem: { category: { pages: null } } },
    });

    const result2 = await hydrateSpells([spellStub]);
    expect(result2).toHaveLength(0);
  });

  it('should fallback to stub data if legacy transformation fails (missing transformer)', async () => {
    const spellStub = { name: 'Legacy Spell' };
    
    const originalTransformer = transformers.Spells;
    // @ts-ignore
    delete transformers.Spells;

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-legacy',
                name: 'Legacy Spell',
                book: { itemId: '5' },
                properties: { someProp: 'val' },
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(spellStub); 
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not transform legacy spell'));

    transformers.Spells = originalTransformer;
  });

  it('should allow stub properties to override hydrated properties', async () => {
    const spellStub = { name: 'Fireball', level: 9 };
    const mockPayload = { name: 'Fireball', level: 3 };

    mockCompendiumRequest.mockResolvedValue({
      data: {
        ruleSystem: {
          category: {
            pages: [
              {
                id: 'page-1',
                book: { itemId: '5' },
                properties: { 'data-payload': JSON.stringify(mockPayload) },
              },
            ],
          },
        },
      },
    });

    const result = await hydrateSpells([spellStub]);

    expect(result[0].level).toBe(9);
  });

  it('should catch global errors and return empty array', async () => {
    const spellStub = { name: 'Crash' };
    
    mockCompendiumRequest.mockRejectedValue(new Error('Network Error'));

    const result = await hydrateSpells([spellStub]);

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});