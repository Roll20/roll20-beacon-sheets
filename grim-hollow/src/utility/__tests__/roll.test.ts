import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  D20RollArgs,
  DamageRollArgs,
  getD20RollBreakdown,
  getDamageRollBreakdown,
  getRollProperties,
  performD20Roll,
  performDamageRoll,
} from '../roll';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { config } from '@/config';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
  initValues: { character: { id: 'char-123' } },
}));

// Mock returns the args as a string so we can parse and inspect them in tests
vi.mock('@/rolltemplates/rolltemplates', () => ({
  createRollTemplate: vi.fn((args) => JSON.stringify(args)),
}));

const createMockDispatch = (rollResultValue = 10) => {
  return {
    post: vi.fn(),
    addToTracker: vi.fn(),
    roll: vi.fn().mockImplementation(async ({ rolls }) => {
      const results: any = {};
      Object.keys(rolls).forEach((key) => {
        const expression = rolls[key];

        const sidesMatch = expression.match(/d(\d+)/);
        const sides = sidesMatch ? parseInt(sidesMatch[1]) : 20;

        results[key] = {
          results: {
            result: rollResultValue,
            expression: expression,
            // Simulate a result object that Beacon returns
            rolls: [{ dice: 1, sides: sides, results: [rollResultValue] }],
          },
        };
      });
      return { results };
    }),
  };
};

describe('Roll Utility Integration', () => {
  let mockDispatch: ReturnType<typeof createMockDispatch>;

  beforeEach(() => {
    setActivePinia(createPinia());

    const meta = useMetaStore();
    meta.name = 'Test Character';
    meta.id = 'char-123';

    const abilities = useAbilitiesStore();

    // Populate abilities to ensure lookups work
    config.abilities.forEach((key) => {
      const existing = abilities.abilities.find((a) => a.label === key);
      if (existing) {
        existing.score = 10;
      }
    });

    mockDispatch = createMockDispatch();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getD20RollBreakdown', () => {
    it('should return base components filtered by non-zero values', () => {
      const args: D20RollArgs = {
        rollName: 'Attack',
        subtitle: 'Longsword',
        bonuses: [
          { label: 'Proficiency', value: 2 },
          { label: 'Strength', value: 3 },
          { label: 'Empty', value: 0 },
        ],
      };

      const result = getD20RollBreakdown(args);

      expect(result.baseComponents).toHaveLength(2);
      expect(result.baseComponents[0]).toEqual({ label: 'Proficiency', value: 2 });
      expect(result.baseComponents[1]).toEqual({ label: 'Strength', value: 3 });
    });

    it('should use custom effects source and filter out disabled effects', () => {
      const customEffects: Effect[] = [
        {
          _id: 'e1',
          label: 'Bless',
          enabled: true,
          description: '',
          effects: [
            { _id: 'se1', attribute: 'attack-roll', operation: 'add', value: '1d4', formula: '' },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
        {
          _id: 'e2',
          label: 'Bane',
          enabled: false,
          description: '',
          effects: [
            {
              _id: 'se2',
              attribute: 'attack-roll',
              operation: 'subtract',
              value: '1d4',
              formula: '',
            },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: D20RollArgs = {
        rollName: 'Attack',
        subtitle: 'Longsword',
        bonuses: [],
        effectsSource: customEffects,
        rollBonusKeys: ['attack-roll'],
      };

      const result = getD20RollBreakdown(args);

      expect(result.effectRollBonuses).toHaveLength(1);
      expect(result.effectRollBonuses[0].label).toBe('Bless [1d4]');
    });

    it('should fallback to global effects store if no source provided', () => {
      const effectsStore = useEffectsStore();
      effectsStore.addEffect({
        label: 'Global Bless',
        enabled: true,
        effects: [
          { _id: 'se1', attribute: 'attack-roll', operation: 'add', value: '1d4', formula: '' },
        ],
      });

      const args: D20RollArgs = {
        rollName: 'Attack',
        subtitle: 'Longsword',
        bonuses: [],
        // effectsSource is undefined
        rollBonusKeys: ['attack-roll'],
      };

      const result = getD20RollBreakdown(args);

      expect(result.effectRollBonuses).toHaveLength(1);
      expect(result.effectRollBonuses[0].label).toBe('Global Bless [1d4]');
    });

    it('should aggregate bonuses from multiple roll keys', () => {
      const customEffects: Effect[] = [
        {
          _id: 'e1',
          label: 'Multi-Bonus',
          enabled: true,
          description: '',
          effects: [
            { _id: '1', attribute: 'key-a', operation: 'add', value: 2, formula: '' },
            { _id: '2', attribute: 'key-b', operation: 'add', value: 3, formula: '' },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: D20RollArgs = {
        rollName: 'Test',
        subtitle: 'Test',
        bonuses: [],
        effectsSource: customEffects,
        rollBonusKeys: ['key-a', 'key-b'],
      };

      const result = getD20RollBreakdown(args);

      expect(result.effectRollBonuses).toHaveLength(2);
      expect(result.effectRollBonuses).toContainEqual(
        expect.objectContaining({ label: 'Multi-Bonus [+2]', value: 2 }),
      );
      expect(result.effectRollBonuses).toContainEqual(
        expect.objectContaining({ label: 'Multi-Bonus [+3]', value: 3 }),
      );
    });

    it('should use store.isEffectSingleActive when using global store', () => {
      const effectsStore = useEffectsStore();

      const effect = effectsStore.addEffect({
        label: 'Conditional Effect',
        enabled: true,
        effects: [{ _id: '1', attribute: 'attack-roll', operation: 'add', value: 2, formula: '' }],
      });

      const spy = vi.spyOn(effectsStore, 'isEffectSingleActive').mockReturnValue(false);

      const args: D20RollArgs = {
        rollName: 'Test',
        subtitle: 'Test',
        bonuses: [],
        rollBonusKeys: ['attack-roll'],
      };

      const result = getD20RollBreakdown(args);

      expect(result.effectRollBonuses).toHaveLength(0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('performD20Roll', () => {
    it('should perform a basic d20 roll', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'Longsword',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
      };

      await performD20Roll(args);

      expect(mockDispatch.roll).toHaveBeenCalledWith({
        rolls: { 'dice-0': '1d20' },
      });

      const lastCall = mockDispatch.post.mock.lastCall?.[0];
      const content = JSON.parse(lastCall.content);

      expect(content.parameters.total).toBe(13);
      expect(content.parameters.title).toBe('Attack Roll');
    });

    it('should return crit-success when d20 rolls 20', async () => {
      mockDispatch = createMockDispatch(20);

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'Longsword',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
        critRange: 20,
      };

      const result = await performD20Roll(args);

      expect(result).toBe('crit-success');
      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.resultType).toBe('crit-success');
    });

    it('should return crit-fail when d20 rolls 1', async () => {
      mockDispatch = createMockDispatch(1);

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'Longsword',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
      };

      const result = await performD20Roll(args);

      expect(result).toBe('crit-fail');
    });

    it('should add to tracker when requested', async () => {
      const args: D20RollArgs = {
        rollName: 'Initiative',
        subtitle: '',
        bonuses: [{ label: 'Dex', value: 2 }],
        customDispatch: mockDispatch as any,
        addToTracker: true,
        tokenId: 'token-123',
      };

      await performD20Roll(args);

      expect(mockDispatch.addToTracker).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenId: 'token-123',
          value: 12,
        }),
      );
    });
    it('should handle advantage (roll 2 dice)', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Advantage',
        bonuses: [],
        customDispatch: mockDispatch as any,
        advantage: 1,
      };

      await performD20Roll(args);

      // Verify 2 dice were requested
      expect(mockDispatch.roll).toHaveBeenCalledWith({
        rolls: { 'dice-0': '1d20', 'dice-1': '1d20' },
      });

      // Verify template received both dice
      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.d20s).toHaveLength(2);
    });

    it('should handle advantage with effectsSource', async () => {
      const customEffects: Effect[] = [
        {
          _id: 'e1',
          label: 'Guidance',
          enabled: true,
          description: '',
          required: [],
          effects: [
            {
              _id: 'se1',
              attribute: 'attack-roll',
              operation: 'add-formula',
              value: '',
              formula: '1d4',
              required: [],
            },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Advantage',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
        advantage: 1,
        rollBonusKeys: ['attack-roll'],
        effectsSource: customEffects,
      };

      await performD20Roll(args);

      expect(mockDispatch.roll).toHaveBeenCalledWith({
        rolls: { 'dice-0': '1d20', 'dice-1': '1d20', 'dice-3': '1d4' },
      });

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.d20s).toHaveLength(2);
      expect(content.parameters.components).toContainEqual(
        expect.objectContaining({ label: expect.stringContaining('Guidance') }),
      );
    });

    it('should handle advantage without effectsSource (Global Store)', async () => {
      const effectsStore = useEffectsStore();
      effectsStore.addEffect({
        label: 'Bless',
        enabled: true,
        effects: [
          {
            _id: 'e1',
            attribute: 'attack-roll',
            operation: 'add-formula',
            value: '',
            formula: '1d4',
          },
        ],
      });

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Advantage',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
        advantage: 1,
        rollBonusKeys: ['attack-roll'],
      };

      await performD20Roll(args);

      //'dice-2' is skipped because it's a flat bonus
      expect(mockDispatch.roll).toHaveBeenCalledWith({
        rolls: { 'dice-0': '1d20', 'dice-1': '1d20', 'dice-3': '1d4' },
      });

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.d20s).toHaveLength(2);
      expect(content.parameters.components).toContainEqual(
        expect.objectContaining({ label: expect.stringContaining('Bless') }),
      );
    });

    it('should calculate action die with effectsSource when advantage is undefined', async () => {
      const customEffects: Effect[] = [
        {
          _id: 'e1',
          label: 'Action Die Effect',
          enabled: true,
          description: '',
          effects: [
            { _id: 'se1', attribute: 'action-die', operation: 'add', value: 1, formula: '' },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Action Die',
        bonuses: [{ label: 'Strength', value: 3 }],
        customDispatch: mockDispatch as any,
        actionDieKeys: ['action-die'],
        effectsSource: customEffects,
      };

      await performD20Roll(args);

      expect(mockDispatch.roll).toHaveBeenCalledWith(
        expect.objectContaining({
          rolls: expect.objectContaining({ 
            'dice-0': '1d20',
            'dice-1': '1d20' 
          }),
        }),
      );
    });

    it('should calculate kept value with positive actionDieValue (Advantage)', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Advantage',
        bonuses: [],
        customDispatch: mockDispatch as any,
        advantage: 1,
      };

      // Mock implementation to return different values for dice
      mockDispatch.roll.mockImplementation(async () => {
        return {
          results: {
            'dice-0': { results: { result: 5, expression: '1d20', rolls: [] } },
            'dice-1': { results: { result: 15, expression: '1d20', rolls: [] } },
          },
        };
      });

      await performD20Roll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      // Should keep the higher value (15)
      expect(content.parameters.total).toBe(15);
      expect(content.parameters.d20s.find((d: any) => d.value === 15).kept).toBe(true);
      expect(content.parameters.d20s.find((d: any) => d.value === 5).kept).toBe(false);
    });

    it('should calculate kept value with negative actionDieValue (Disadvantage)', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: 'With Disadvantage',
        bonuses: [],
        customDispatch: mockDispatch as any,
        advantage: -1,
      };

      // Mock implementation to return different values for dice
      mockDispatch.roll.mockImplementation(async () => {
        return {
          results: {
            'dice-0': { results: { result: 5, expression: '1d20', rolls: [] } },
            'dice-1': { results: { result: 15, expression: '1d20', rolls: [] } },
          },
        };
      });

      await performD20Roll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      // Should keep the lower value (5)
      expect(content.parameters.total).toBe(5);
      expect(content.parameters.d20s.find((d: any) => d.value === 5).kept).toBe(true);
      expect(content.parameters.d20s.find((d: any) => d.value === 15).kept).toBe(false);
    });

    it('should add custom character to tracker', async () => {
      const args: D20RollArgs = {
        rollName: 'Initiative',
        subtitle: '',
        bonuses: [],
        customDispatch: mockDispatch as any,
        addToTracker: true,
        characterName: 'Custom Character',
        avatar: 'avatar-url.png',
      };

      await performD20Roll(args);

      expect(mockDispatch.addToTracker).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: expect.objectContaining({
            name: 'Custom Character',
            img: 'avatar-url.png',
          }),
        }),
      );
    });

    it('should use dispatchRef when customDispatch not provided', async () => {
      const { dispatchRef } = await import('@/relay/relay');
      dispatchRef.value = mockDispatch as any;

      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: '',
        bonuses: [],
      };

      await performD20Roll(args);

      expect(mockDispatch.roll).toHaveBeenCalled();
    });

    it('should handle roll without description', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: '',
        bonuses: [],
        customDispatch: mockDispatch as any,
      };

      await performD20Roll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.description).toBeUndefined();
    });

    it('should clean description by removing bracket tags', async () => {
      const args: D20RollArgs = {
        rollName: 'Attack Roll',
        subtitle: '',
        bonuses: [],
        customDispatch: mockDispatch as any,
        description: 'Attack with [Force] damage.',
      };

      await performD20Roll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.description).toBe('Attack with  damage.');
    });
  });

  describe('getDamageRollBreakdown', () => {
    const mockT = (key: string) => key;

    it('should build base components from damage rolls', () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '1d8' }],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.baseComponents).toHaveLength(1);
      expect(result.baseComponents[0]).toEqual({
        label: 'titles.dice-pool-types.slashing',
        value: '1d8',
      });
    });

    it('should include ability modifiers in base components when non-zero', () => {
      const abilities = useAbilitiesStore();
      const str = abilities.abilities.find((a) => a.label === 'strength');
      if (str) str.score = 16; // +3 Modifier

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' }],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.baseComponents).toHaveLength(2);
      expect(result.baseComponents).toContainEqual({
        label: 'titles.abilities.strength',
        value: 3,
      });
    });

    it('should exclude ability modifier if the calculated modifier is 0', () => {
      const abilities = useAbilitiesStore();
      const str = abilities.abilities.find((a) => a.label === 'strength');
      if (str) str.score = 10; // +0 Modifier

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' }],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.baseComponents).toHaveLength(1);
      expect(result.baseComponents[0].label).toContain('slashing');
    });

    it('should calculate flat bonuses from custom effectsSource and filter disabled ones', () => {
      const customEffects: Effect[] = [
        {
          _id: '1',
          label: 'Rage',
          enabled: true,
          description: '',
          effects: [{ _id: 'e1', attribute: 'damage', operation: 'add', value: 2, formula: '' }],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
        {
          _id: '2',
          label: 'Inactive',
          enabled: false,
          description: '',
          effects: [{ _id: 'e2', attribute: 'damage', operation: 'add', value: 10, formula: '' }],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Test',
        isCrit: false,
        effectsSource: customEffects,
        damageModifierKeys: ['damage'],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.flatBonuses).toHaveLength(1);
      expect(result.flatBonuses[0]).toEqual({ name: 'Rage', value: 2 });
    });

    it('should calculate roll bonuses from global store if source not provided', () => {
      const effectsStore = useEffectsStore();
      effectsStore.addEffect({
        label: 'Sneak Attack',
        enabled: true,
        effects: [
          { _id: 'sa', attribute: 'damage-roll', operation: 'add-formula', value: '', formula: '2d6' },
        ],
      });

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Test',
        isCrit: false,
        damageRollKeys: ['damage-roll'],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.rollBonuses.length).toBeGreaterThan(0);
      expect(result.rollBonuses[0].label).toContain('Sneak Attack');
    });

    it('should respect isEffectSingleActive check when using global store', () => {
      const effectsStore = useEffectsStore();
      effectsStore.addEffect({
        label: 'Magic Weapon',
        enabled: true,
        effects: [{ _id: 'mw', attribute: 'damage', operation: 'add', value: 1, formula: '' }],
      });

      const spy = vi.spyOn(effectsStore, 'isEffectSingleActive').mockReturnValue(false);

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Test',
        isCrit: false,
        damageModifierKeys: ['damage'],
        t: mockT,
      };

      const result = getDamageRollBreakdown(args);

      expect(result.flatBonuses).toHaveLength(0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('performDamageRoll', () => {
    const mockT = (key: string) => key;

    it('should perform a basic damage roll', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '1d8' }],
        customDispatch: mockDispatch as any,
        t: (k) => k,
      };

      await performDamageRoll(args);

      expect(mockDispatch.roll).toHaveBeenCalledWith(
        expect.objectContaining({
          rolls: expect.objectContaining({ 'dice-0': '1d8' }),
        }),
      );

      // mockDispatch creates a roll result of 10 for every die.
      const lastPostCall = mockDispatch.post.mock.lastCall?.[0];
      const content = JSON.parse(lastPostCall.content);
      expect(content.parameters.grandTotal).toBe(10);
    });

    it('should handle critical hits by adding crit dice to formula', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: true,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '2d8' }],
        customDispatch: mockDispatch as any,
        t: (k) => k,
      };

      await performDamageRoll(args);

      const callArgs = mockDispatch.roll.mock.lastCall?.[0];
      const formulas = Object.values(callArgs.rolls);

      expect(formulas).toContain('1d8');
      expect(formulas).toContain('2d8');

      // 10 (base) + 10 (crit) = 20
      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.grandTotal).toBe(20);
    });

    it('should add flatBonus and rollBonuses from effects', async () => {
      const customEffects: Effect[] = [
        {
          _id: 'e1',
          label: 'Damage Boost',
          enabled: true,
          description: '',
          effects: [
            { _id: 'se1', attribute: 'damage-mod', operation: 'add', value: 5, formula: '' },
            {
              _id: 'se2',
              attribute: 'damage-roll',
              operation: 'add-formula',
              value: '',
              formula: '1d6',
            },
          ],
          actions: [],
          resources: [],
          spells: [],
          pickers: [],
        },
      ];

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Enhanced',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '1d8' }],
        customDispatch: mockDispatch as any,
        effectsSource: customEffects,
        damageModifierKeys: ['damage-mod'],
        damageRollKeys: ['damage-roll'],
        t: (k) => k,
      };

      await performDamageRoll(args);

      const callArgs = mockDispatch.roll.mock.lastCall?.[0];
      const formulas = Object.values(callArgs.rolls);

      expect(formulas).toContain('1d8');
      expect(formulas).toContain('1d6');

      // flat bonus (5) + rolls (10 + 10) = 25
      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.grandTotal).toBe(25);
    });

    it('should use damageGroups when provided instead of damageRolls', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Custom',
        isCrit: false,
        damageGroups: [
          { type: 'Fire', components: [{ label: 'Fire Damage', value: 10 }] },
          { type: 'Cold', components: [{ label: 'Cold Damage', value: 5 }] },
        ],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);


      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      // 10 + 5 = 15
      expect(content.parameters.grandTotal).toBe(15);
      expect(content.parameters.damageGroups).toHaveLength(2);
    });


    it('should create bonus group when no damage groups but has additionalComponents', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Bonus Only',
        isCrit: false,
        customDispatch: mockDispatch as any,
        additionalComponents: [{ label: 'Extra', value: 10 }],
        t: mockT,
      };

      await performDamageRoll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.damageGroups[0].type).toBe('titles.damage');
      expect(content.parameters.grandTotal).toBe(10);
    });

    it('should handle damage roll without description', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: '',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '1d8' }],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);

      const content = JSON.parse(mockDispatch.post.mock.lastCall?.[0].content);
      expect(content.parameters.description).toBeUndefined();
    });

    it('should use getDiceFromExpression when critDamage is not provided', async () => {
      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Longsword',
        isCrit: true,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '' }],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);

      const callArgs = mockDispatch.roll.mock.lastCall?.[0];
      const formulas = Object.values(callArgs.rolls);

      // Should roll 1d8 twice (base + auto-calculated crit)
      expect(formulas).toEqual(['1d8', '1d8']);
    });

    it('should add ability modifier to damage components if non-zero', async () => {
      const abilities = useAbilitiesStore();
      const str = abilities.abilities.find((a) => a.label === 'strength');
      if (str) str.score = 16;

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'With Ability',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' }],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);

      const lastCall = mockDispatch.post.mock.lastCall?.[0];
      const content = JSON.parse(lastCall.content);
      const damageGroup = content.parameters.damageGroups[0];

      // Should contain the die and the modifier
      expect(damageGroup.components).toHaveLength(2);
      expect(damageGroup.components).toContainEqual(
        expect.objectContaining({ label: 'titles.abilities.strength', value: 3 }),
      );
      // Total: 10 + 3 = 13
      expect(damageGroup.total).toBe(13);
    });

    it('should NOT add ability modifier component if modifier is zero', async () => {
      const abilities = useAbilitiesStore();
      const str = abilities.abilities.find((a) => a.label === 'strength');
      if (str) str.score = 10;

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Zero Mod',
        isCrit: false,
        damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' }],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);

      const lastCall = mockDispatch.post.mock.lastCall?.[0];
      const content = JSON.parse(lastCall.content);
      const damageGroup = content.parameters.damageGroups[0];

      expect(damageGroup.components).toHaveLength(1);
      expect(damageGroup.components[0].label).not.toContain('titles.abilities');
    });

    it('should create a "bonus" damage group when only a flat bonus exists', async () => {
      const effectsStore = useEffectsStore();
      effectsStore.addEffect({
        label: 'Divine Fury',
        enabled: true,
        effects: [{ _id: 'e1', attribute: 'damage-mod', operation: 'add', value: 5, formula: '' }],
      });

      const args: DamageRollArgs = {
        rollName: 'Damage',
        subtitle: 'Just Bonus',
        isCrit: false,
        damageRolls: [],
        damageModifierKeys: ['damage-mod'],
        customDispatch: mockDispatch as any,
        t: mockT,
      };

      await performDamageRoll(args);

      const lastCall = mockDispatch.post.mock.lastCall?.[0];
      const content = JSON.parse(lastCall.content);

      expect(content.parameters.damageGroups).toHaveLength(1);
      const bonusGroup = content.parameters.damageGroups[0];

      expect(bonusGroup.type).toBe('titles.damage');
      expect(bonusGroup.components).toContainEqual(
        expect.objectContaining({ label: 'Bonus', value: 5 }),
      );
      expect(content.parameters.grandTotal).toBe(5);
    });
  });

  describe('Roll Utility Properties & Damage', () => {
    const mockT = (key: string) => key;

    describe('getRollProperties', () => {
      it('should extract range and target from actions', () => {
        const action: any = {
          range: '5 ft.',
          target: 'One creature',
          saving: 'none',
          components: [],
        };

        const result = getRollProperties(action, mockT);

        expect(result['titles.range']).toBe('5 ft.');
        expect(result['titles.target']).toBe('One creature');
      });

      it('should format spell components', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          components: ['verbal', 'somatic'],
          saving: 'none',
        };

        const result = getRollProperties(spell, mockT);

        expect(result['titles.components']).toContain('abbreviations.spell-components.verbal');
        expect(result['titles.components']).toContain('abbreviations.spell-components.somatic');
      });

      it('should include saving throw DC when explicitly passed as argument', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          saving: 'dexterity',
          savingDc: '12', // Should be ignored in favor of argument
          components: [],
        };

        // Pass 15 as override
        const result = getRollProperties(spell, mockT, 15);

        expect(result['titles.saving-throw']).toContain('titles.abilities.dexterity');
        expect(result['titles.saving-throw']).toContain('15');
      });

      it('should use savingDc from item when saveDC parameter is not provided', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          saving: 'wisdom',
          savingDc: 14,
          components: [],
        };

        const result = getRollProperties(spell, mockT);

        expect(result['titles.saving-throw']).toContain('titles.abilities.wisdom');
        expect(result['titles.saving-throw']).toContain('14');
      });

      it('should include material components string when present', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          components: ['verbal', 'somatic', 'material'],
          material: 'A bit of bat fur',
          saving: 'none',
        };

        const result = getRollProperties(spell, mockT);

        expect(result['titles.components']).toContain('abbreviations.spell-components.verbal');
        expect(result['titles.components']).toContain(' (A bit of bat fur)');
      });

      it('should handle spell without material components string cleanly', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          components: ['verbal', 'somatic'],
          saving: 'none',
        };

        const result = getRollProperties(spell, mockT);

        expect(result['titles.components']).toContain('abbreviations.spell-components.verbal');
        expect(result['titles.components']).not.toContain('(');
      });

      it('should not include saving throw property when DC resolves to 0', () => {
        const spell: any = {
          range: '30 ft.',
          target: '',
          saving: 'constitution',
          savingDc: 0,
          components: [],
        };

        const result = getRollProperties(spell, mockT);

        expect(result['titles.saving-throw']).toBeUndefined();
      });
    });

    describe('getDamageRollBreakdown', () => {
      it('should return empty base components when no damage rolls provided', () => {
        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.baseComponents).toEqual([]);
      });

      it('should not include ability modifier when set to "none"', () => {
        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          damageRolls: [{ type: 'slashing', damage: '1d8', ability: 'none', critDamage: '1d8' }],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.baseComponents).toHaveLength(1);
        expect(result.baseComponents[0].label).toBe('titles.dice-pool-types.slashing');
      });

      it('should include ability modifier when it is non-zero', () => {
        const abilities = useAbilitiesStore();
        const str = abilities.abilities.find((a) => a.label === 'strength');
        if (str) str.score = 16;

        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          damageRolls: [
            { type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' },
          ],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.baseComponents).toHaveLength(2);
        expect(result.baseComponents[1]).toEqual({ label: 'titles.abilities.strength', value: 3 });
      });

      it('should exclude ability modifier when modifier is 0', () => {
        const abilities = useAbilitiesStore();
        const str = abilities.abilities.find((a) => a.label === 'strength');
        if (str) str.score = 10;

        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          damageRolls: [
            { type: 'slashing', damage: '1d8', ability: 'strength', critDamage: '1d8' },
          ],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.baseComponents).toHaveLength(1);
        const hasModifier = result.baseComponents.some(
          (c) => c.label === 'titles.abilities.strength',
        );
        expect(hasModifier).toBe(false);
      });

      it('should use custom effectsSource when provided (Effect Isolation)', () => {
        const customEffects: Effect[] = [
          {
            _id: 'e1',
            label: 'Test Effect',
            enabled: true,
            description: '',
            effects: [
              { _id: 'se1', attribute: 'test-modifier', operation: 'add', value: 5, formula: '' },
            ],
            actions: [],
            resources: [],
            spells: [],
            pickers: [],
          },
        ];

        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          effectsSource: customEffects,
          damageModifierKeys: ['test-modifier'],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.flatBonuses).toHaveLength(1);
        expect(result.flatBonuses[0]).toEqual({ name: 'Test Effect', value: 5 });
      });

      it('should use global effectsStore when effectsSource not provided', () => {
        const effectsStore = useEffectsStore();
        effectsStore.addEffect({
          label: 'Global Effect',
          enabled: true,
          effects: [
            { _id: 'ge1', attribute: 'test-modifier', operation: 'add', value: 3, formula: '' },
          ],
        });

        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          damageModifierKeys: ['test-modifier'],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.flatBonuses).toHaveLength(1);
        expect(result.flatBonuses[0]).toEqual({ name: 'Global Effect', value: 3 });
      });

      it('should calculate both flatBonuses (numeric) and rollBonuses (formula)', () => {
        const effectsStore = useEffectsStore();
        effectsStore.addEffect({
          label: 'Mixed Effect',
          enabled: true,
          effects: [
            { _id: '1', attribute: 'test-modifier', operation: 'add', value: 5, formula: '' },
            {
              _id: '2',
              attribute: 'test-roll',
              operation: 'add-formula',
              value: '',
              formula: '1d4',
            },
          ],
        });

        const args: DamageRollArgs = {
          rollName: 'Damage',
          subtitle: 'Test',
          isCrit: false,
          damageModifierKeys: ['test-modifier'],
          damageRollKeys: ['test-roll'],
          t: mockT,
        };

        const result = getDamageRollBreakdown(args);

        expect(result.flatBonuses).toEqual([{ name: 'Mixed Effect', value: 5 }]);

        expect(result.rollBonuses).toHaveLength(1);
        expect(result.rollBonuses[0].label).toContain('Mixed Effect [1d4]');
      });
    });
  });
});
