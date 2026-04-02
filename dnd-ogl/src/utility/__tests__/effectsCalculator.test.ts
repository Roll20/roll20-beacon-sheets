import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkRequirements,
  EffectsCalculator,
  processItemTags,
  RequirementContext,
} from '../effectsCalculator';
import type {
  DicePool,
  Effect,
  ExtendedSingleEffect,
  Picker,
  SingleEffect,
} from '@/sheet/stores/modifiers/modifiersStore';
import { evaluate } from 'mathjs';
import { createComponentsFromFormula, getDicePoolAverage } from '@/utility/diceParser';
import { parseFormula, parseFormulaAndEvaluate } from '@/sheet/stores/formulas';
import { createPinia, setActivePinia } from 'pinia';
import { Action } from '@/sheet/stores/actions/actionsStore';
import { v4 as uuidv4 } from 'uuid';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
  initValues: { character: { id: 'char-123' } },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const createEffectParent = (
  singleEffects: Partial<SingleEffect>[] = [],
  overrides: Partial<Effect> = {},
): Effect => ({
  _id: uuidv4(),
  label: 'Test Source',
  enabled: true,
  description: '',
  effects: singleEffects.map(
    (eff) =>
      ({
        _id: uuidv4(),
        attribute: 'test-attribute',
        operation: 'push',
        value: '',
        formula: '',
        required: [],
        ...eff,
      } as SingleEffect),
  ),
  actions: [],
  resources: [],
  spells: [],
  spellSources: [],
  pickers: [],
  ...overrides,
});

const createExtendedEffect = (
  overrides: Partial<ExtendedSingleEffect> = {},
): ExtendedSingleEffect =>
  ({
    _id: 'test-id',
    attribute: 'test-attr',
    operation: 'add',
    value: 0,
    formula: '',
    label: 'Test Effect',
    description: '',
    required: [],
    pickers: [],
    ...overrides,
  } as ExtendedSingleEffect);

describe('calculateModifiedDicePool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('should return base pool when no effects are provided', () => {
    const basePool: DicePool = ['1d6', 5];
    const result = EffectsCalculator.calculateModifiedDicePool(basePool, []);

    expect(result.final).toEqual(basePool);
    expect(result.modifiers).toEqual([]);
  });

  it('appends negative value string for subtract operation', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'subtract',
        value: '1d4',
      }),
    ];
    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);
    expect(result.final).toEqual(['1d6', '-1d4']);
  });

  it('should set-final', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'set-final',
        value: '3d8',
      }),
    ];
    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);
    expect(result.final).toEqual(['3d8']);
  });

  it('should add value to pool with add operation', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'add',
        value: 5,
        label: 'Strength Bonus',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d6', 5]);
    expect(result.modifiers).toEqual([{ name: 'Strength Bonus', value: 5 }]);
  });

  it('should subtract value from pool with subtract operation', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'subtract',
        value: 3,
        label: 'Penalty',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d6', '-3']);
    expect(result.modifiers).toEqual([{ name: 'Penalty', value: -3 }]);
  });

  it('should set pool with set-final operation', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'set-final',
        value: '1d10',
        label: 'Final Override',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d10']);
    expect(result.modifiers).toEqual([]);
  });

  it('should set-base only if effect average is higher', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'set-base',
        value: '1d10',
        label: 'Better Weapon',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d10']);
    expect(result.modifiers).toEqual([]);
  });

  it('should not set-base if effect average is lower', () => {
    const basePool: DicePool = ['1d10'];
    const effects = [
      createExtendedEffect({
        operation: 'set-base',
        value: '1d6',
        label: 'Worse Weapon',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d10']);
    expect(result.modifiers).toEqual([]);
  });

  it('should set if effect average is higher', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'set',
        value: '1d10',
        label: 'Better Weapon',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d10']);
  });

  it('should not set if effect average is lower', () => {
    const basePool: DicePool = ['1d10'];
    const effects = [
      createExtendedEffect({
        operation: 'set',
        value: '1d6',
        label: 'Worse Weapon',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d10']);
  });

  it('should handle formula-based operations', () => {
    const abilitiesStore = useAbilitiesStore();
    const dex = abilitiesStore.abilities.find((a) => a.label === 'dexterity');
    if (dex) dex.score = 14;

    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'add-formula',
        formula: '@{dexterity-modifier}',
        label: 'Dex Modifier',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d6', 2]);
    expect(result.modifiers).toEqual([{ name: 'Dex Modifier', value: 2 }]);
  });

  it('should handle multiple effects in sequence', () => {
    const basePool: DicePool = ['1d6'];
    const effects = [
      createExtendedEffect({
        operation: 'add',
        value: 3,
        label: 'Strength',
      }),
      createExtendedEffect({
        operation: 'add',
        value: 2,
        label: 'Magic Bonus',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);

    expect(result.final).toEqual(['1d6', 3, 2]);
    expect(result.modifiers).toEqual([
      { name: 'Strength', value: 3 },
      { name: 'Magic Bonus', value: 2 },
    ]);
  });

  it('handles formula evaluation by using parsed string', () => {
    const basePool: DicePool = [];
    const effects = [
      createExtendedEffect({
        operation: 'add-formula',
        formula: '1d6',
        label: 'Dice Formula',
      }),
    ];

    const result = EffectsCalculator.calculateModifiedDicePool(basePool, effects);
    expect(result.final).toEqual(['1d6']);
  });
});

describe('checkRequirements', () => {
  const baseContext: RequirementContext = {
    isEquipped: true,
    isAttuned: true,
    pickers: [],
  };

  describe('Static Requirements', () => {
    it('returns true if requirements are undefined or empty', () => {
      expect(checkRequirements(undefined, baseContext)).toBe(true);
      expect(checkRequirements([], baseContext)).toBe(true);
    });

    it('validates "equipped" status', () => {
      expect(checkRequirements(['equipped'], { ...baseContext, isEquipped: true })).toBe(true);
      expect(checkRequirements(['equipped'], { ...baseContext, isEquipped: false })).toBe(false);
    });

    it('validates "attuned" status', () => {
      expect(checkRequirements(['attuned'], { ...baseContext, isAttuned: true })).toBe(true);
      expect(checkRequirements(['attuned'], { ...baseContext, isAttuned: false })).toBe(false);
    });

    it('validates multiple static requirements', () => {
      const reqs = ['equipped', 'attuned'];
      expect(checkRequirements(reqs, { ...baseContext, isEquipped: true, isAttuned: true })).toBe(
        true,
      );
      expect(checkRequirements(reqs, { ...baseContext, isEquipped: true, isAttuned: false })).toBe(
        false,
      );
    });

    it('defaults to true if context properties are undefined', () => {
      const emptyContext: RequirementContext = {};
      expect(checkRequirements(['equipped'], emptyContext)).toBe(true);
      expect(checkRequirements(['attuned'], emptyContext)).toBe(true);
    });
  });

  describe('Picker Requirements', () => {
    const mockPickers: Picker[] = [
      { label: 'Damage Type', value: 'fire', options: [] },
      { label: 'Level', value: '5', options: [] },
      { label: 'Bonus', value: '10', options: [] },
    ];

    const pickerContext: RequirementContext = { ...baseContext, pickers: mockPickers };

    it('returns false if picker index does not exist', () => {
      expect(checkRequirements(['$picker:99==fire'], pickerContext)).toBe(false);
    });

    it('returns false if pickers array is undefined in context', () => {
      expect(checkRequirements(['$picker:0==fire'], { ...baseContext, pickers: undefined })).toBe(
        false,
      );
    });

    it('handles Equality (==)', () => {
      expect(checkRequirements(['$picker:0==fire'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:0==cold'], pickerContext)).toBe(false);
    });

    it('handles Less Than or Equal (<=)', () => {
      // Value is 5
      expect(checkRequirements(['$picker:1<=6'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:1<=5'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:1<=4'], pickerContext)).toBe(false);
    });

    it('handles Greater Than or Equal (>=)', () => {
      // Value is 5
      expect(checkRequirements(['$picker:1>=4'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:1>=5'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:1>=6'], pickerContext)).toBe(false);
    });

    it('handles Less Than (<)', () => {
      // Value is 10
      expect(checkRequirements(['$picker:2<11'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:2<10'], pickerContext)).toBe(false);
    });

    it('handles Greater Than (>)', () => {
      // Value is 10
      expect(checkRequirements(['$picker:2>9'], pickerContext)).toBe(true);
      expect(checkRequirements(['$picker:2>10'], pickerContext)).toBe(false);
    });

    it('ignores unknown requirements strings', () => {
      // The function returns true at the end if regex doesn't match
      expect(checkRequirements(['unknown-req'], baseContext)).toBe(true);
    });
  });
});

describe('getPicker', () => {
  const mockPickers: Picker[] = [
    { label: 'Str', value: 'strength', options: [] },
    { label: 'Dex', value: 'dexterity', options: [] },
  ];

  describe('String Input', () => {
    it('returns original value if no picker pattern found', () => {
      expect(EffectsCalculator.getPicker('fire', mockPickers)).toBe('fire');
    });

    it('replaces picker placeholder with value', () => {
      expect(EffectsCalculator.getPicker('$picker:0', mockPickers)).toBe('strength');
    });

    it('returns empty string if picker index does not exist', () => {
      expect(EffectsCalculator.getPicker('$picker:99', mockPickers)).toBe('');
    });

    it('returns empty string if picker has no value', () => {
      const emptyPicker: Picker[] = [{ label: 'Empty', value: undefined, options: [] }];
      expect(EffectsCalculator.getPicker('$picker:0', emptyPicker)).toBe('');
    });

    it('handles pickers inside a longer string/formula', () => {
      expect(EffectsCalculator.getPicker('1d6 + $picker:0', mockPickers)).toBe('1d6 + strength');
    });

    it('handles multiple pickers in one string', () => {
      expect(EffectsCalculator.getPicker('$picker:0 + $picker:1', mockPickers)).toBe(
        'strength + dexterity',
      );
    });

    it('returns empty string if one of multiple pickers is broken', () => {
      expect(EffectsCalculator.getPicker('$picker:0 + $picker:99', mockPickers)).toBe('');
    });
  });

  describe('Array Input', () => {
    it('returns original array if no picker patterns found', () => {
      const input = ['fire', 'cold'];
      const result = EffectsCalculator.getPicker(input, mockPickers);
      expect(result).toEqual(['fire', 'cold']);
      expect(result).not.toBe(input);
    });

    it('replaces mixed content correctly', () => {
      const input = ['fire', '$picker:1'];
      expect(EffectsCalculator.getPicker(input, mockPickers)).toEqual(['fire', 'dexterity']);
    });

    it('returns empty array if ANY picker is broken/missing', () => {
      const input = ['fire', '$picker:99'];
      expect(EffectsCalculator.getPicker(input, mockPickers)).toEqual([]);
    });

    it('returns empty array if picker has no value', () => {
      const emptyPicker: Picker[] = [{ label: 'Empty', value: undefined, options: [] }];
      const input = ['$picker:0'];
      expect(EffectsCalculator.getPicker(input, emptyPicker)).toEqual([]);
    });
  });
});

describe('EffectsCalculator Internal Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe('getValidEffects', () => {
    const alwaysActive = () => true;

    it('filters effects by attribute name', () => {
      const effect = createEffectParent([
        { attribute: 'strength', value: 1 },
        { attribute: 'dexterity', value: 2 },
      ]);

      const result = EffectsCalculator.getValidEffects([effect], 'strength', alwaysActive);

      expect(result).toHaveLength(1);
      expect(result[0].attribute).toBe('strength');
      expect(result[0].value).toBe(1);
    });

    it('supports checking multiple attributes array', () => {
      const effect = createEffectParent([
        { attribute: 'strength', value: 1 },
        { attribute: 'dexterity', value: 2 },
        { attribute: 'constitution', value: 3 },
      ]);

      const result = EffectsCalculator.getValidEffects(
        [effect],
        ['strength', 'dexterity'],
        alwaysActive,
      );

      expect(result).toHaveLength(2);
    });

    it('resolves dynamic picker attributes (e.g. $picker:0)', () => {
      const pickers: Picker[] = [{ label: 'Choose', value: 'strength', options: [] }];

      const effect = createEffectParent([{ attribute: '$picker:0', value: 5 }], { pickers });

      const result = EffectsCalculator.getValidEffects([effect], 'strength', alwaysActive);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(5);
    });

    it('filters out effects based on isActiveCheck callback', () => {
      const effect = createEffectParent([{ attribute: 'strength' }]);

      const result = EffectsCalculator.getValidEffects([effect], 'strength', () => false);

      expect(result).toHaveLength(0);
    });

    it('sorts results based on operation priority', () => {
      const effect = createEffectParent([
        { operation: 'set', value: 10 }, // Priority 4
        { operation: 'set-base', value: 8 }, // Priority 1
        { operation: 'add', value: 2 }, // Priority 2
      ]);

      const result = EffectsCalculator.getValidEffects([effect], 'test-attribute', alwaysActive);

      expect(result).toHaveLength(3);
      expect(result[0].operation).toBe('set-base');
      expect(result[1].operation).toBe('add');
      expect(result[2].operation).toBe('set');
    });
  });

  describe('constrain', () => {
    it('returns the value itself if it matches a constraint', () => {
      const result = EffectsCalculator.constrain(5, [1, 5, 9]);
      expect(result).toBe(5);
    });

    it('returns the largest constraint less than or equal to value (floor behavior)', () => {
      const result = EffectsCalculator.constrain(7, [1, 5, 9]);
      expect(result).toBe(5);
    });

    it('returns the minimum constraint if value is smaller than all constraints', () => {
      const result = EffectsCalculator.constrain(0, [1, 5, 9]);
      expect(result).toBe(1);
    });

    it('works with unsorted constraint arrays', () => {
      const result = EffectsCalculator.constrain(7, [9, 1, 5]);
      expect(result).toBe(5);
    });
  });

  describe('collectFromEffects', () => {
    const alwaysActive = () => true;

    it('collects items from enabled effects', () => {
      const action = { _id: 'a1', name: 'Fireball', group: 'actions' } as Action;
      const effect = createEffectParent([], {
        enabled: true,
        actions: [action],
        _id: 'test-effect-id',
      });

      const result = EffectsCalculator.collectFromEffects<Action>(
        [effect],
        'actions',
        alwaysActive,
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fireball');
      expect(result[0].isFromEffect).toBe(true);
      expect(result[0].sourceEffectId).toBe('test-effect-id');
    });

    it('ignores items from effects filtered out by isActiveCheck', () => {
      const action = { _id: 'a1', name: 'Hidden Action', group: 'actions' } as Action;
      const effect = createEffectParent([], { actions: [action] });

      const result = EffectsCalculator.collectFromEffects<Action>([effect], 'actions', () => false);

      expect(result).toHaveLength(0);
    });

    it('validates item-specific requirements (e.g. pickers)', () => {
      const action = {
        _id: 'a1',
        name: 'Fire Action',
        group: 'actions',
        required: ['$picker:0==fire'],
      } as unknown as Action;

      const effectCold = createEffectParent([], {
        _id: 'e1',
        actions: [action],
        pickers: [{ label: 'Element', value: 'cold', options: [] }],
      });

      const resultA = EffectsCalculator.collectFromEffects<Action>(
        [effectCold],
        'actions',
        alwaysActive,
      );
      expect(resultA).toHaveLength(0);

      const effectFire = createEffectParent([], {
        _id: 'e2',
        actions: [{ ...action, _id: 'a2' } as Action],
        pickers: [{ label: 'Element', value: 'fire', options: [] }],
      });

      const resultB = EffectsCalculator.collectFromEffects<Action>(
        [effectFire],
        'actions',
        alwaysActive,
      );
      expect(resultB).toHaveLength(1);
      expect(resultB[0].name).toBe('Fire Action');
    });

    it('merges with default values from stores', () => {
      const partialAction = { name: 'Incomplete Action' } as Action;

      const effect = createEffectParent([], {
        actions: [partialAction],
      });

      const result = EffectsCalculator.collectFromEffects<Action>(
        [effect],
        'actions',
        alwaysActive,
      );

      expect(result[0].name).toBe('Incomplete Action');
      expect(result[0].group).toBe('actions');
      expect(result[0]._id).toBeDefined();
    });
  });
});

describe('processItemTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });
  it('should do nothing if items are undefined or empty', () => {
    const store = useTagsStore();
    processItemTags(undefined, 'equipment');
    processItemTags([], 'equipment');

    expect(store.tagGroups).toHaveLength(0);
  });

  it('should ignore items without data-tags', () => {
    const store = useTagsStore();
    const items = [{ name: 'Sword' }];

    processItemTags(items, 'equipment');

    expect(store.tagGroups).toHaveLength(0);
    expect(items[0]).toEqual({ name: 'Sword' });
  });

  it('should process items with data-tags correctly', () => {
    const store = useTagsStore();
    const items = [{ name: 'Magic Sword', 'data-tags': ['magical', 'versatile'] }];

    processItemTags(items, 'equipment');

    const processedItem = items[0];

    expect(processedItem['data-tags']).toBeUndefined();
    expect(processedItem.tagId).toBeDefined();

    expect(store.tagGroups).toHaveLength(1);

    const group = store.tagGroups.find((g) => g._id === processedItem.tagId);
    expect(group).toBeDefined();
    expect(group?.category).toBe('equipment');
    expect(group?.tags).toHaveLength(2);
    expect(group?.tags.map((t) => t.text).sort()).toEqual(['magical', 'versatile'].sort());
  });

  it('should generate unique IDs for multiple items', () => {
    const store = useTagsStore();
    const items = [
      { name: 'A', 'data-tags': ['a'] },
      { name: 'B', 'data-tags': ['b'] },
    ];

    processItemTags(items, 'feature');

    expect(items[0].tagId).not.toBe(items[1].tagId);
    expect(store.tagGroups).toHaveLength(2);
    expect(store.tagGroups[0].category).toBe('feature');
  });
});

describe('calculateModifiedTags', () => {
  const alwaysActive = () => true;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe('Defense Attributes (Resistances/Immunities)', () => {
    it('should add valid damage types from effects', () => {
      const effect = createEffectParent([
        {
          attribute: 'damage-resistances',
          operation: 'push',
          value: 'fire',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags(
        [effect],
        'damage-resistances',
        alwaysActive,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        text: 'fire',
        isDefault: true,
        isFromEffect: true,
        sourceLabel: 'Test Source',
      });
    });

    it('should add valid conditions (immunities)', () => {
      const effect = createEffectParent([
        {
          attribute: 'condition-immunities',
          operation: 'push',
          value: 'poisoned',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags(
        [effect],
        'condition-immunities',
        alwaysActive,
      );

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('poisoned');
    });

    it('should filter out invalid types for defense attributes', () => {
      const effect = createEffectParent([
        {
          attribute: 'damage-immunities',
          operation: 'push',
          value: 'not-a-real-damage-type',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags(
        [effect],
        'damage-immunities',
        alwaysActive,
      );

      expect(result).toHaveLength(0);
    });

    it('should handle arrays of values', () => {
      const effect = createEffectParent([
        {
          attribute: 'damage-resistances',
          operation: 'push',
          value: ['cold', 'lightning', 'invalid'],
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags(
        [effect],
        'damage-resistances',
        alwaysActive,
      );

      expect(result).toHaveLength(2); // cold + lightning
    });
  });

  describe('General Attributes (Proficiencies/Languages)', () => {
    it('should mark known configuration items as default', () => {
      const effect = createEffectParent([
        {
          attribute: 'languages',
          operation: 'push',
          value: 'elvish',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags([effect], 'languages', alwaysActive);

      expect(result[0].isDefault).toBe(true);
    });

    it('should allow unknown items but mark them as not default', () => {
      const effect = createEffectParent([
        {
          attribute: 'languages',
          operation: 'push',
          value: 'ancient-dialect',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags([effect], 'languages', alwaysActive);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('ancient-dialect');
      expect(result[0].isDefault).toBe(false);
    });

    it('should correctly categorize armor proficiencies', () => {
      const effect = createEffectParent([
        {
          attribute: 'armor-proficiencies',
          operation: 'push',
          value: 'light-armor',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags(
        [effect],
        'armor-proficiencies',
        alwaysActive,
      );

      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('Logic flow', () => {
    it('should ignore effects that are not "push" operations', () => {
      const effect = createEffectParent([
        {
          attribute: 'languages',
          operation: 'set',
          value: 'elvish',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags([effect], 'languages', alwaysActive);
      expect(result).toHaveLength(0);
    });

    it('should respect the isActiveCheck callback', () => {
      const effect = createEffectParent([
        {
          attribute: 'languages',
          operation: 'push',
          value: 'elvish',
        },
      ]);

      const result = EffectsCalculator.calculateModifiedTags([effect], 'languages', () => false);

      expect(result).toHaveLength(0);
    });
  });
});

describe('calculateModifiedValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return base value if no effects are provided', () => {
    const result = EffectsCalculator.calculateModifiedValue(10, []);
    expect(result.final).toBe(10);
    expect(result.modifiers).toEqual([]);
  });

  describe('Operations', () => {
    it('handles "add" operation', () => {
      const effects = [createExtendedEffect({ operation: 'add', value: 2 })];
      const result = EffectsCalculator.calculateModifiedValue(10, effects);
      expect(result.final).toBe(12);
      expect(result.modifiers).toEqual([{ name: 'Test Effect', value: 2 }]);
    });

    it('handles "subtract" operation', () => {
      const effects = [createExtendedEffect({ operation: 'subtract', value: 3 })];
      const result = EffectsCalculator.calculateModifiedValue(10, effects);
      expect(result.final).toBe(7);
      expect(result.modifiers).toEqual([{ name: 'Test Effect', value: -3 }]);
    });

    it('handles "set-base" (only applies if higher than current)', () => {
      const effectHigh = createExtendedEffect({ operation: 'set-base', value: 12, label: 'High' });
      const result1 = EffectsCalculator.calculateModifiedValue(10, [effectHigh]);
      expect(result1.final).toBe(12);

      const effectLow = createExtendedEffect({ operation: 'set-base', value: 8, label: 'Low' });
      const result2 = EffectsCalculator.calculateModifiedValue(10, [effectLow]);
      expect(result2.final).toBe(10);
      expect(result2.modifiers).toHaveLength(0);
    });

    it('handles "set" (override if higher)', () => {
      const effect = createExtendedEffect({ operation: 'set', value: 15 });
      const result = EffectsCalculator.calculateModifiedValue(10, [effect]);
      expect(result.final).toBe(15);
    });

    it('handles "set-final" (hard override)', () => {
      const effect = createExtendedEffect({ operation: 'set-final', value: 5 });
      const result = EffectsCalculator.calculateModifiedValue(10, [effect]);
      expect(result.final).toBe(5);
    });

    it('handles "set-base-final" (hard override)', () => {
      const effect = createExtendedEffect({ operation: 'set-base-final', value: 20 });
      const result = EffectsCalculator.calculateModifiedValue(10, [effect]);
      expect(result.final).toBe(20);
    });

    it('handles "set-min"', () => {
      const effect = createExtendedEffect({ operation: 'set-min', value: 5 });
      const result = EffectsCalculator.calculateModifiedValue(10, [effect]);
      expect(result.final).toBe(5);
    });

    it('handles "set-max"', () => {
      const effect = createExtendedEffect({ operation: 'set-max', value: 15 });
      const result = EffectsCalculator.calculateModifiedValue(10, [effect]);
      expect(result.final).toBe(15);
    });
  });

  describe('Formulas', () => {
    it('parses and evaluates formulas for operations ending in "-formula"', () => {
      const progression = useProgressionStore();
      // Mock a class with level 5.
      progression.classes = [{ level: 5 } as any];

      const effects = [
        createExtendedEffect({
          operation: 'add-formula',
          formula: '@{level}',
          value: 0,
        }),
      ];

      const result = EffectsCalculator.calculateModifiedValue(10, effects);

      expect(result.final).toBe(15);
    });

    it('handles set-base-formula', () => {
      const effects = [createExtendedEffect({ operation: 'set-base-formula', formula: '18' })];

      const result = EffectsCalculator.calculateModifiedValue(10, effects);

      expect(result.final).toBe(18);
    });
  });

  describe('Constraints', () => {
    it('constrains the final value to the provided set', () => {
      const constraints = [1, 2, 3, 4, 5];

      const result = EffectsCalculator.calculateModifiedValue(
        1,
        [createExtendedEffect({ operation: 'add', value: 6 })],
        constraints,
      );

      expect(result.final).toBe(5);
    });

    it('handles values below minimum constraint', () => {
      const constraints = [2, 4, 6];
      const result = EffectsCalculator.calculateModifiedValue(1, [], constraints);
      expect(result.final).toBe(2);
    });
  });
});

describe('calculateModifiedRollBonuses', () => {
  const alwaysActive = () => true;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create components for flat value additions', () => {
    const effect = createEffectParent(
      [
        {
          attribute: 'attack-roll',
          operation: 'add',
          value: 2,
        },
      ],
      { label: 'Blessing' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses(
      [effect],
      'attack-roll',
      alwaysActive,
    );

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
    expect(result[0].label).toBe('Blessing [+2]');
  });

  it('should create components for dice additions', () => {
    const effect = createEffectParent(
      [
        {
          attribute: 'damage',
          operation: 'add',
          value: '1d4',
        },
      ],
      { label: 'Fire' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses([effect], 'damage', alwaysActive);

    expect(result).toHaveLength(1);
    expect(result[0].sides).toBe(4);
    expect(result[0].count).toBe(1);
    expect(result[0].label).toBe('Fire [1d4]');
  });

  it('should invert values for subtract operations', () => {
    const effect = createEffectParent(
      [
        {
          attribute: 'attack-roll',
          operation: 'subtract',
          value: 2,
        },
      ],
      { label: 'Bane' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses(
      [effect],
      'attack-roll',
      alwaysActive,
    );

    expect(result[0].value).toBe(-2);
    expect(result[0].label).toBe('Bane [-2]');
  });

  it('should invert dice counts for subtract operations', () => {
    const effect = createEffectParent(
      [
        {
          attribute: 'save',
          operation: 'subtract',
          value: '1d4',
        },
      ],
      { label: 'Penalty' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses([effect], 'save', alwaysActive);

    expect(result[0].count).toBe(-1);
    expect(result[0].label).toBe('Penalty [1d4]');
  });

  it('should handle complex formulas with multiple components', () => {
    const effect = createEffectParent(
      [
        {
          attribute: 'damage',
          operation: 'add',
          value: '1d6 + 2',
        },
      ],
      { label: 'Combo' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses([effect], 'damage', alwaysActive);

    expect(result).toHaveLength(2);
    expect(result[0].sides).toBe(6);
    expect(result[0].label).toBe('Combo [1d6]');
    expect(result[1].value).toBe(2);
    expect(result[1].label).toBe('Combo [+2]');
  });

  it('should resolve pickers in formulas', () => {
    const pickers: Picker[] = [{ label: 'Val', value: '5', options: [] }];
    const effect = createEffectParent(
      [
        {
          attribute: 'attack',
          operation: 'add-formula',
          formula: '$picker:0',
        },
      ],
      { pickers, label: 'Dynamic' },
    );

    const result = EffectsCalculator.calculateModifiedRollBonuses([effect], 'attack', alwaysActive);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(5);
    expect(result[0].label).toBe('Dynamic [+5]');
  });
});

describe('calculateActionDie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 if no effects', () => {
    const result = EffectsCalculator.calculateActionDie([]);
    expect(result).toBe(0);
  });

  it('returns positive value for Advantage (1)', () => {
    const effects = [createExtendedEffect({ operation: 'add', value: 1 })];
    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(1);
  });

  it('returns negative value for Disadvantage (-1)', () => {
    const effects = [createExtendedEffect({ operation: 'add', value: -1 })];
    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(-1);
  });

  it('returns 0 if Advantage and Disadvantage cancel out', () => {
    const effects = [
      createExtendedEffect({ operation: 'add', value: 1 }),
      createExtendedEffect({ operation: 'add', value: -1 }),
    ];
    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(0);
  });

  it('returns the max value if multiple Advantages exist', () => {
    const effects = [
      createExtendedEffect({ operation: 'add', value: 1 }),
      createExtendedEffect({ operation: 'add', value: 2 }),
    ];
    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(2);
  });

  it('returns the min value if multiple Disadvantages exist', () => {
    const effects = [
      createExtendedEffect({ operation: 'add', value: -1 }),
      createExtendedEffect({ operation: 'add', value: -2 }),
    ];
    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(-2);
  });

  it('evaluates formula operations correctly', () => {
    const effects = [
      createExtendedEffect({
        operation: 'add-formula',
        formula: '1',
      }),
    ];

    const result = EffectsCalculator.calculateActionDie(effects);
    expect(result).toBe(1);
  });
});
