import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { onDropMonster, setToken } from '../dropMonster';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: {
    value: {
      compendiumRequest: vi.fn(),
    },
  },
  initValues: { character: { id: 'char-123' } },
}));

vi.mock('../hydrateSpells', () => ({
  hydrateSpells: vi.fn(async (spells) => spells),
}));

const mockDispatch = {
  updateTokensByCharacter: vi.fn(),
};

const validMonsterPayload = {
  name: 'Goblin',
  shortDescription: 'Small humanoid (goblinoid), neutral evil',
  armorClass: 15,
  hitPoints: { current: 7, max: 7, formula: '2d6' },
  speed: '30 ft.',
  abilities: {
    strength: 8,
    dexterity: 14,
    constitution: 10,
    intelligence: 10,
    wisdom: 8,
    charisma: 8,
  },
  token: 'http://example.com/goblin.png',
  skills: {},
  features: [
    {
      name: 'Nimble Escape',
      description:
        'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
      'data-effects': {
        _id: 'effect-1',
        label: 'Nimble Escape Effect',
        enabled: true,
        toggleable: true,
        removable: false,
        effects: [],
      },
    },
  ],
  actions: [],
  legendaryActions: { description: '', actions: [] },
  lairActions: { description: '', actions: [] },
  spellSources: [],
};

describe('dropMonster', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onDropMonster', () => {
    it('should drop a monster and update the NPC store', async () => {
      const store = useNpcStore();

      await onDropMonster({
        payload: { ...validMonsterPayload },
        isNewSheet: true,
      });

      expect(store.npcs).toHaveLength(1);
      expect(store.npcs[0].name).toBe('Goblin');
      expect(store.npcs[0].isDefault).toBe(true);
      expect(store.isNpc).toBe(true);
    });

    it('should strip effects from features', async () => {
      const store = useNpcStore();

      await onDropMonster({
        payload: JSON.parse(JSON.stringify(validMonsterPayload)),
        isNewSheet: true,
      });

      const npc = store.npcs[0];
      const effect = npc.effects.find((e) => e.label === 'Nimble Escape Effect');
      expect(effect).toBeDefined();
      

      const feature = npc.features.find((f) => f.name === 'Nimble Escape');
      expect(feature).toBeDefined();
      expect((feature as any)['data-effects']).toBeUndefined();
    });

    it('should handle spells dropping', async () => {
      const store = useNpcStore();
      const spellsStub = [
        {
          name: 'Fireball',
          level: 3,
          school: 'evocation',
          castingTime: '1 action',
          range: '150 feet',
          components: ['verbal', 'somatic', 'material'],
          duration: 'Instantaneous',
          description: { default: 'Boom' },
          'data-tags': ['fire'],
          'data-effects': { 
            _id: 'spell-effect',
            label: 'Burn', 
            enabled: true, 
            removable: true, 
            effects: [] 
          },
        },
      ];

      await onDropMonster({
        payload: { ...validMonsterPayload },
        spells: spellsStub as any,
        isNewSheet: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const npc = store.npcs[0];
      expect(npc.spells).toHaveLength(1);
      expect(npc.spells[0].name).toBe('Fireball');
    });

    it('should correctly configure for companion mode (isNewSheet = false)', async () => {
      const store = useNpcStore();

      await onDropMonster({
        payload: { ...validMonsterPayload },
        isNewSheet: false,
      });

      const npc = store.npcs[0];
      expect(npc.isDefault).toBe(false);
      expect(npc.isCompanion).toBe(true);
      expect(npc.isCollapsed).toBe(true);
      expect(store.isNpc).toBe(false);
    });

    it('should store token when dropped as companion', async () => {
      const store = useNpcStore();

      await onDropMonster({
        payload: { ...validMonsterPayload, token: 'https://s3.amazonaws.com/files.d20.io/images/390059088/Ewmk2luFix7r1hifN9499w/original.png' },
        isNewSheet: false,
      });

      const npc = store.npcs[0];
      expect(npc.isCompanion).toBe(true);
      expect(npc.token).toBe('https://s3.amazonaws.com/files.d20.io/images/390059088/Ewmk2luFix7r1hifN9499w/original.png');
    });

    it('should fail gracefully with invalid payload', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await onDropMonster({
        payload: { name: 'Invalid Monster' },
        isNewSheet: true,
      });

      const store = useNpcStore();
      expect(store.npcs).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid monster data', expect.anything());
    });
  });

  describe('setToken', () => {
    it('should calculate size and call dispatch', async () => {
      const payload = { ...validMonsterPayload, shortDescription: 'Large giant' };

      await setToken({
        characterId: 'char-123',
        payload,
        dispatch: mockDispatch as any,
      });

      expect(mockDispatch.updateTokensByCharacter).toHaveBeenCalledWith({
        characterId: 'char-123',
        token: {
          name: 'Goblin',
          imgsrc: 'http://example.com/goblin.png',
          width: 140, // 2 * 70
          height: 140,
        },
      });
    });

    it('should default to medium size (1) if size keyword not found', async () => {
      const payload = { ...validMonsterPayload, shortDescription: 'Weird creature' };

      await setToken({
        characterId: 'char-123',
        payload,
        dispatch: mockDispatch as any,
      });

      expect(mockDispatch.updateTokensByCharacter).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.objectContaining({ width: 70 }),
        }),
      );
    });

    it('should handle invalid payload gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const invalidPayload = { name: 'Incomplete Monster' };

      await setToken({
        characterId: 'char-123',
        payload: invalidPayload,
        dispatch: mockDispatch as any,
      });

      expect(consoleSpy).toHaveBeenCalledWith('Invalid monster data', expect.anything());
      expect(mockDispatch.updateTokensByCharacter).not.toHaveBeenCalled();
    });
  });
});