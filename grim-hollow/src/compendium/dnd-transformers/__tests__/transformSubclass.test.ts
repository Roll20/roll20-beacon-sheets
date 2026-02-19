import { describe, it, expect } from 'vitest';
import { transformDnDSubclass } from '../transformSubclass';

describe('transformDnDSubclass', () => {
  const mockBook = { itemId: '123' };

  it('transforms a basic subclass with features', () => {
    const rawPayload = { name: 'Champion' };
    const properties = {
      'Parent Class': 'Fighter',
      'data-datarecords': JSON.stringify([
        {
          name: 'Improved Critical',
          level: '3',
          payload: JSON.stringify({
            type: 'Features',
            description: 'Crit on 19-20',
          }),
        },
        {
          name: 'Remarkable Athlete',
          level: '7',
          payload: JSON.stringify({
            type: 'Features',
            description: 'Add half proficiency to checks',
          }),
        },
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);

    expect(result.name).toBe('Champion');
    expect(result['data-compatibility']).toEqual([{ name: 'Fighter' }]);
    
    const features = result['data-features'];
    expect(features).toBeDefined();
    
    expect(features['level-3']).toHaveLength(1);
    expect(features['level-3'][0]).toMatchObject({
      label: 'Improved Critical',
      description: 'Crit on 19-20',
      group: 'class-features',
    });

    expect(features['level-7']).toHaveLength(1);
    expect(features['level-7'][0].label).toBe('Remarkable Athlete');
  });

  it('transforms a subclass with Spellcasting (ex: Eldritch Knight)', () => {
    const rawPayload = { name: 'Eldritch Knight' };
    const properties = {
      'Parent Class': 'Fighter',
      'data-datarecords': JSON.stringify([
        {
          name: 'Spellcasting',
          level: '3',
          payload: JSON.stringify({
            type: 'Spellcasting',
            casterType: 'third',
            ability: 'Intelligence',
          }),
        },
        {
          name: 'Weapon Bond',
          level: '3',
          payload: JSON.stringify({
            type: 'Features',
            description: 'Bond with weapon',
          }),
        },
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);

    expect(result.spellcasting).toBe('third');
    expect(result['data-spellSource']).toEqual({
      name: 'Eldritch Knight Spellcasting',
      type: 'ability',
      ability: 'intelligence',
      isPrepared: false,
    });

    expect(result['data-features']['level-3']).toBeDefined();
    const bond = result['data-features']['level-3'].find((f: any) => f.label === 'Weapon Bond');
    expect(bond).toBeDefined();
  });

  it('handles malformed datarecords gracefully', () => {
    const rawPayload = { name: 'Broken' };
    const properties = {
      'Parent Class': 'Test',
      'data-datarecords': '[{"invalid_json":',
    };

    let result;
    expect(() => {
      result = transformDnDSubclass(rawPayload, mockBook, properties);
    }).not.toThrow();

    expect(result!.name).toBe('Broken');
    expect(result!['data-features']).toBeUndefined();
  });

  it('handles individual malformed records gracefully', () => {
    const rawPayload = { name: 'Semi-Broken' };
    const properties = {
      'Parent Class': 'Test',
      'data-datarecords': JSON.stringify([
        {
          name: 'Good Feature',
          level: '1',
          payload: JSON.stringify({ type: 'Features', description: 'OK' })
        },
        {
          name: 'Bad Feature',
          level: '1',
          payload: '{ bad json }'
        }
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);

    expect(result['data-features']['level-1']).toHaveLength(1);
    expect(result['data-features']['level-1'][0].label).toBe('Good');
  });

  it('ignores records with invalid levels', () => {
    const rawPayload = { name: 'Test' };
    const properties = {
      'Parent Class': 'Test',
      'data-datarecords': JSON.stringify([
        {
          name: 'No Level Feature',
          level: '0',
          payload: JSON.stringify({ type: 'Features', description: 'Test' })
        },
        {
          name: 'NaN Level',
          level: 'Not a number',
          payload: JSON.stringify({ type: 'Features', description: 'Test' })
        }
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);
    expect(result['data-features']).toBeUndefined();
  });
});