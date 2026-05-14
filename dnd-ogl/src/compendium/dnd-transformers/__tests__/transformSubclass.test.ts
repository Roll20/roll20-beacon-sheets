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

  it('creates cumulative level variants for spell attachments', () => {
    const rawPayload = { name: 'Oath of Devotion' };
    const properties = {
      'Parent Class': 'Paladin',
      'data-datarecords': JSON.stringify([
        {
          name: 'Oath Spells',
          level: '3',
          payload: JSON.stringify({
            type: 'Features',
            name: 'Oath Spells',
            description: 'You gain oath spells.',
          }),
        },
        {
          name: 'Oath Spells 3',
          parent: 'Oath Spells',
          level: '3',
          payload: JSON.stringify({
            type: 'Spell Attach',
            spells: ['Protection from Evil and Good', 'Sanctuary'],
          }),
        },
        {
          name: 'Oath Spells 5',
          parent: 'Oath Spells',
          level: '5',
          payload: JSON.stringify({
            type: 'Spell Attach',
            spells: ['Lesser Restoration', 'Zone of Truth'],
          }),
        },
        {
          name: 'Oath Spells 9',
          parent: 'Oath Spells',
          level: '9',
          payload: JSON.stringify({
            type: 'Spell Attach',
            spells: ['Beacon of Hope', 'Dispel Magic'],
          }),
        },
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);
    const features = result['data-features'];

    expect(features['level-3']).toHaveLength(1);
    expect(features['level-5']).toHaveLength(1);
    expect(features['level-9']).toHaveLength(1);

    const level3 = features['level-3'][0];
    expect(level3.label).toBe('Oath Spells');
    expect(level3['data-spells']).toHaveLength(2);
    expect(level3.validUntilLevel).toBe(5);

    const level5 = features['level-5'][0];
    expect(level5.label).toBe('Oath Spells');
    expect(level5['data-spells']).toHaveLength(4);
    expect(level5.validUntilLevel).toBe(9);

    const level9 = features['level-9'][0];
    expect(level9.label).toBe('Oath Spells');
    expect(level9['data-spells']).toHaveLength(6);
    expect(level9.validUntilLevel).toBeUndefined();
  });

  it('handles overwrite for higher-level feature variants', () => {
    const rawPayload = { name: 'Oath of Devotion' };
    const properties = {
      'Parent Class': 'Paladin',
      'data-datarecords': JSON.stringify([
        {
          name: 'Aura of Protection',
          level: '6',
          payload: JSON.stringify({
            type: 'Features',
            name: 'Aura of Protection',
            description: 'Aura grants save bonus.',
          }),
        },
        {
          name: 'Aura of Protection Bonus',
          parent: 'Aura of Protection',
          level: '6',
          payload: JSON.stringify({
            type: 'Language',
            name: 'Common',
          }),
        },
        {
          name: 'Aura of Protection Bonus 18',
          parent: 'Aura of Protection',
          level: '18',
          overwrite: 'Aura of Protection Bonus',
          payload: JSON.stringify({
            type: 'Language',
            name: 'Elvish',
          }),
        },
      ]),
    };

    const result = transformDnDSubclass(rawPayload, mockBook, properties);
    const features = result['data-features'];

    expect(features['level-6']).toHaveLength(1);
    expect(features['level-18']).toHaveLength(1);

    const level6 = features['level-6'][0];
    expect(level6.label).toBe('Aura of Protection');
    expect(level6['data-effects'].effects).toHaveLength(1);
    expect(level6['data-effects'].effects[0].value).toBe('Common');
    expect(level6.validUntilLevel).toBe(18);

    const level18 = features['level-18'][0];
    expect(level18.label).toBe('Aura of Protection');
    expect(level18['data-effects'].effects).toHaveLength(1);
    expect(level18['data-effects'].effects[0].value).toBe('Elvish');
    expect(level18.validUntilLevel).toBeUndefined();
  });
});