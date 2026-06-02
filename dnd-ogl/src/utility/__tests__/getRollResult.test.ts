import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getRollResult from '../getRollResult';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import { dispatchRef } from '@/relay/relay';

vi.mock('@/relay/relay', () => ({
  dispatchRef: { value: null },
}));

describe('getRollResult', () => {
  let mockDispatch: any;

  beforeEach(() => {
    mockDispatch = {
      roll: vi.fn(),
    };
    dispatchRef.value = mockDispatch as unknown as Dispatch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate total from dice components using custom dispatch', async () => {
    const components: DiceComponent[] = [
      { sides: 20, count: 1 },
      { sides: 6, count: 2 },
    ];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 15, expression: '1d20' } },
        'dice-1': { results: { result: 8, expression: '2d6' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(mockDispatch.roll).toHaveBeenCalledWith({
      rolls: { 'dice-0': '1d20', 'dice-1': '2d6' },
    });
    expect(result.total).toBe(23);
    expect(result.components).toHaveLength(2);
  });

  it('should fallback to global dispatchRef if customDispatch is missing', async () => {
    const components: DiceComponent[] = [{ sides: 20, count: 1 }];

    mockDispatch.roll.mockResolvedValue({
      results: { 'dice-0': { results: { result: 10, expression: '1d20' } } },
    });

    await getRollResult(components);

    expect(dispatchRef.value.roll).toHaveBeenCalled();
  });

  it('should handle components without "sides" (Flat Bonuses)', async () => {
    const components: DiceComponent[] = [
      { sides: 20, count: 1 },
      { value: 5, label: 'Mod' },
    ];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 10, expression: '1d20' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(mockDispatch.roll).toHaveBeenCalledWith({
      rolls: { 'dice-0': '1d20' },
    });

    expect(result.total).toBe(15);
    expect(result.components[1].value).toBe(5);
  });

  it('should default count to 1 if undefined', async () => {
    const components: DiceComponent[] = [{ sides: 8 }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 5, expression: '1d8' } },
      },
    });

    await getRollResult(components, mockDispatch);

    expect(mockDispatch.roll).toHaveBeenCalledWith({
      rolls: { 'dice-0': '1d8' },
    });
  });

  it('should handle negative dice counts', async () => {
    const components: DiceComponent[] = [{ sides: 6, count: -2 }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 8, expression: '2d6' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.components[0].value).toBe(-8);
    expect(result.total).toBe(-8);
  });

  it('should apply label from result expression if component has no label', async () => {
    const components: DiceComponent[] = [{ sides: 20, count: 1 }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 12, expression: '1d20+2' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.components[0].label).toBe('1d20+2');
  });

  it('should prefer existing label over result expression', async () => {
    const components: DiceComponent[] = [{ sides: 20, count: 1, label: 'My Attack' }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 12, expression: '1d20' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.components[0].label).toBe('My Attack');
  });

  it('should expand roll formulas into sub-components and maintain array order', async () => {
    const components: DiceComponent[] = [
      { value: 5, label: 'Before' },
      { sides: 6, count: 2, label: 'Damage', rollFormula: '2d6+3' },
      { value: 2, label: 'After' },
    ];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-1': {
          results: {
            result: 10,
            expression: '2d6+3',
            rolls: [{ dice: 2, sides: 6, results: [3, 4] }],
          },
        },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.components).toHaveLength(4);

    // Check Order
    expect(result.components[0].label).toBe('Before');
    expect(result.components[3].label).toBe('After');

    // Check Expansion
    const dicePart = result.components[1];
    expect(dicePart.label).toBe('Damage [2d6]'); // Original Label + [Sub Label]
    expect(dicePart.value).toBe(7);

    const bonusPart = result.components[2];
    expect(bonusPart.label).toBe('Manual Bonus');
    expect(bonusPart.value).toBe(3); // Total (10) - DiceSum (7)

    expect(result.total).toBe(17); // 5 + 7 + 3 + 2
  });

  it('should handle undefined values in total reduction', async () => {
    // component has no value
    const components: DiceComponent[] = [{ sides: 20, count: 1 }, { label: 'Ghost' }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': { results: { result: 10, expression: '1d20' } },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.total).toBe(10);
  });

  it('should use sublabel directly if parent component has no label during expansion', async () => {
    const components: DiceComponent[] = [{ sides: 6, count: 2, rollFormula: '2d6' }];

    mockDispatch.roll.mockResolvedValue({
      results: {
        'dice-0': {
          results: {
            result: 7,
            expression: '2d6',
            rolls: [{ dice: 2, sides: 6, results: [3, 4] }],
          },
        },
      },
    });

    const result = await getRollResult(components, mockDispatch);

    expect(result.components[0].label).toBe('2d6');

    expect(result.components[1].label).toBe('Manual Bonus');
  });
});
