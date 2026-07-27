import { describe, it, expect } from 'vitest';
import { calculateModifiedValue, getValueByPath } from '../calculateModifiedValue';

describe('calculateModifiedValue with disabled effects', () => {
  it('includes enabled modifier effects and excludes disabled modifier effects', () => {
    const mockCharacterData: any = {
      powers: {
        list: [
          {
            _id: 'p1',
            name: 'Test Power',
            effects: { value: [] },
            modifiers: [
              {
                _id: 'm1',
                name: 'Active Boost',
                type: 'boost',
                isActive: true,
                effects: {
                  value: [
                    {
                      _id: 'eff1',
                      attribute: 'fighting',
                      operation: 'add',
                      value: '2',
                      label: 'Active Boost'
                    }
                  ],
                  disabled: false
                }
              },
              {
                _id: 'm2',
                name: 'Inactive Limit',
                type: 'limit',
                isActive: false,
                effects: {
                  value: [
                    {
                      _id: 'eff2',
                      attribute: 'fighting',
                      operation: 'subtract',
                      value: '1',
                      label: 'Inactive Limit'
                    }
                  ],
                  disabled: true
                }
              }
            ]
          }
        ]
      }
    };

    
    let result = calculateModifiedValue({
      attributes: ['fighting'] as any[],
      baseValue: 3,
      characterData: mockCharacterData
    });
    expect(result.value).toBe(5);
    expect(result.modifiers).toHaveLength(1);
    expect(result.modifiers[0].name).toBe('Active Boost');

    
    mockCharacterData.powers.list[0].modifiers[1].isActive = true;
    mockCharacterData.powers.list[0].modifiers[1].effects.disabled = false;
    result = calculateModifiedValue({
      attributes: ['fighting'] as any[],
      baseValue: 3,
      characterData: mockCharacterData
    });
    expect(result.value).toBe(4);
    expect(result.modifiers).toHaveLength(2);

    
    mockCharacterData.powers.list[0].modifiers[0].isActive = false;
    mockCharacterData.powers.list[0].modifiers[0].effects.disabled = true;
    mockCharacterData.powers.list[0].modifiers[1].isActive = false;
    mockCharacterData.powers.list[0].modifiers[1].effects.disabled = true;
    result = calculateModifiedValue({
      attributes: ['fighting'] as any[],
      baseValue: 3,
      characterData: mockCharacterData
    });
    expect(result.value).toBe(3);
    expect(result.modifiers).toHaveLength(0);
  });

  it('calculates rawValue by excluding any effects with _id containing _custom', () => {
    const mockCharacterData: any = {
      powers: {
        list: [
          {
            _id: 'p1',
            name: 'Test Power',
            effects: {
              value: [
                {
                  _id: 'eff_normal',
                  attribute: 'fighting',
                  operation: 'add',
                  value: '2',
                  label: 'Normal Boost'
                },
                {
                  _id: 'fighting_custom',
                  attribute: 'fighting',
                  operation: 'add',
                  value: '3',
                  label: 'Custom Adjustment'
                }
              ],
              disabled: false
            }
          }
        ]
      }
    };

    const result = calculateModifiedValue({
      attributes: ['fighting'] as any[],
      baseValue: 3,
      characterData: mockCharacterData
    });
    expect(result.value).toBe(8); 
    expect(result.rawValue).toBe(5); 
  });
});
