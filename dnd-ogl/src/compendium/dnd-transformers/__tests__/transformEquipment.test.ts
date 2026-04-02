import { describe, it, expect, vi } from 'vitest';
import { transformDnDEquipment } from '../transformEquipment';
import { config } from '@/config';



describe('transformDnDEquipment', () => {
  const mockBook = { itemId: '123' };

  describe('Cost Parsing', () => {
    it('returns undefined for missing or invalid cost strings', () => {
      const rawPayload = { name: 'Item' };
      // cost missing
      expect(transformDnDEquipment(rawPayload, {}, {}).value).toBeUndefined();
      
      // cost invalid format
      const invalidProps = { 
        'data-datarecords': JSON.stringify([{ payload: JSON.stringify({ type: 'Item', cost: 'free' }) }]) 
      };
      expect(transformDnDEquipment(rawPayload, {}, invalidProps).value).toBeUndefined();
    });
  });

  describe('Legacy Import (Properties-based)', () => {
    it('transforms basic equipment properties', () => {
      const rawPayload = { name: 'Rope, Hempen (50 feet)' };
      const properties = {
        'Item Type': 'Adventuring Gear',
        Weight: '10',
        'data-description': 'Simple rope.',
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      expect(result.name).toBe('Rope, Hempen (50 feet)');
      expect(result.weight).toBe(10);
      expect(result.type).toBe('survival-gear');
      expect(result.description).toContain('Simple rope.');
    });

    it('handles legacy attunement and string modifiers for AC', () => {
      const rawPayload = { name: 'Shield +2' };
      const properties = {
        'Item Type': 'Shield',
        AC: '2',
        'Requires Attunement': true,
        'Modifiers': 'AC +2, Saves +1',
        'data-description': 'A magic shield.'
      };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);

      expect((result as any)['data-tags']).toContain('attunement');

      const effects = (result as any)['data-effects'];
      expect(effects.required).toContain('attuned');

      const acEffect = effects.effects.find((e: any) => e.attribute === 'armor-class');
      // Base (2) + Magic (2) = 4
      expect(acEffect.value).toBe(4); 
    });

    it('transforms legacy armor with AC and Dex mod', () => {
      const rawPayload = { name: 'Leather Armor' };
      const properties = {
        'Item Type': 'Light Armor',
        AC: '11',
        Weight: '10',
        'data-description': 'Protection. Dex Modifier.',
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      expect(result.type).toBe('armor');
      const effects = (result as any)['data-effects'];
      expect(effects).toBeDefined();
      expect(effects.required).toContain('equipped');
      
      const acEffect = effects.effects.find((e: any) => e.attribute === 'armor-class');
      expect(acEffect).toBeDefined();
      expect(acEffect.operation).toBe('set-base-final-formula');
      expect(acEffect.formula).toContain('11+@{dexterity-modifier}');
    });

    it('transforms legacy medium armor with Dex cap', () => {
      const rawPayload = { name: 'Hide Armor' };
      const properties = {
        'Item Type': 'Medium Armor',
        AC: '12',
        'data-description': 'Dex modifier (max 2)',
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);
      const acEffect = (result as any)['data-effects'].effects[0];
      
      expect(acEffect.formula).toContain('12+@{dexterity-modifier|max:2}');
    });

    it('transforms legacy shields (additive AC)', () => {
      const rawPayload = { name: 'Shield' };
      const properties = {
        'Item Type': 'Shield',
        AC: '2',
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);
      const acEffect = (result as any)['data-effects'].effects[0];

      expect(acEffect.operation).toBe('add');
      expect(acEffect.value).toBe(2);
    });

    it('parses legacy simple weapon damage', () => {
      const rawPayload = { name: 'Dagger' };
      const properties = {
        'Item Type': 'Melee Weapon',
        Damage: '1d4',
        'Damage Type': 'Piercing',
        Properties: 'Finesse, Light, Thrown',
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);
      
      expect(result.type).toBe('weapon');
      expect((result as any)['data-tags']).toEqual(expect.arrayContaining(['Finesse', 'Light', 'Thrown']));
      
      const action = (result as any)['data-effects'].actions[0];
      expect(action).toBeDefined();
      expect(action.name).toBe('Dagger');
      expect(action.isAttack).toBe(true);
      expect(action.damage[0].damage).toBe('1d4');
      expect(action.damage[0].type).toBe('piercing');
    });
  });

  describe('Modern DataRecords Import', () => {
    it('transforms structured equipment item', () => {
      const rawPayload = { name: 'Backpack' };
      const itemRecord = {
        type: 'Item',
        name: 'Backpack',
        weight: 5,
        cost: '2 gp',
        description: 'Holds things.',
      };
      
      const properties = {
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(itemRecord) }
        ])
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      expect(result.name).toBe('Backpack');
      expect(result.weight).toBe(5);
      expect(result.value).toEqual({ amount: 2, currency: 'gp' });
    });

    it('parses string weight to number', () => {
      const rawPayload = { name: 'Backpack' };
      const itemRecord = {
        type: 'Item',
        name: 'Backpack',
        weight: '5',
        cost: '2 GP',
        description: 'Holds things.',
      };
      
      const properties = {
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(itemRecord) }
        ])
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      expect(result.weight).toBe(5);
      expect(typeof result.weight).toBe('number');
    });

    it('adds mastery property to tags', () => {
      const rawPayload = { name: 'Greatsword' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Greatsword' }) }
      ];
      const properties = { 
        'data-datarecords': JSON.stringify(records),
        'Mastery': 'Graze' 
      };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      expect((result as any)['data-tags']).toContain('Graze');
    });

    it('handles structured shields (additive AC)', () => {
      const rawPayload = { name: 'Shield' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Shield', shieldData: { category: 'Shield' } }) },
        { payload: JSON.stringify({ type: 'Armor Class', calculation: 'Set Base', valueFormula: { flatValue: 2 } }) },
        { payload: JSON.stringify({ type: 'Armor Class', calculation: 'Modify', valueFormula: { flatValue: 1 } }) },
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      const acEffect = (result as any)['data-effects'].effects[0];
      
      expect(acEffect.attribute).toBe('armor-class');
      expect(acEffect.operation).toBe('add');
      expect(acEffect.value).toBe(3); // 2 + 1
    });

    it('handles structured armor with capability and caps', () => {
      const rawPayload = { name: 'Studded Leather' };
      const records = [
        { payload: JSON.stringify({ 
            type: 'Item', 
            name: 'Studded Leather', 
            armorData: { category: 'Light Armor', ability: 'dex', bonusCap: 2 } 
          }) 
        },
        { payload: JSON.stringify({ type: 'Armor Class', calculation: 'Set Base', valueFormula: { flatValue: 12 } }) }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      const acEffect = (result as any)['data-effects'].effects[0];

      expect(acEffect.operation).toBe('set-base-final-formula');
      expect(acEffect.formula).toContain('12+@{dexterity-modifier|max:2}');
    });

    it('parses save DC from description in spell attach', () => {
      const rawPayload = { name: 'Wand of Fear' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Wand', description: 'Targets must succeed on a DC 15 Constitution save.' }) },
        { payload: JSON.stringify({ type: 'Spell Attach', spells: ['Fear'] }) }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      const source = (result as any)['data-effects'].spellSources[0];

      expect(source.type).toBe('flat');
      // Logic is flatDC - 8. 15 - 8 = 7
      expect(source.flat).toBe(7);
    });

    it('handles complex attack damage configuration', () => {
      const rawPayload = { name: 'Complex Weapon' };
      const records = [
        { name: 'Item', payload: JSON.stringify({ type: 'Item', name: 'Complex Weapon' }) },
        { name: 'Hit', payload: JSON.stringify({ type: 'Attack', name: 'Hit', attack: { abilityBonus: 'str' } }) },
        // Ability auto
        { parent: 'Hit', payload: JSON.stringify({ type: 'Damage', damageType: 'Slashing', diceCount: 1, diceSize: 'd8', ability: 'auto' }) },
        // custom formula
        { parent: 'Hit', payload: JSON.stringify({ type: 'Damage', damageType: 'Fire', diceCount: 1, diceSize: 'd6', _bonus: '@{level}' }) },
        // negative integer bonus
        { parent: 'Hit', payload: JSON.stringify({ type: 'Damage', damageType: 'Cold', diceCount: 1, diceSize: 'd4', bonus: -1 }) },
        // positive integer bonus
        { parent: 'Hit', payload: JSON.stringify({ type: 'Damage', damageType: 'Acid', diceCount: 1, diceSize: 'd4', bonus: 2 }) }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      const action = (result as any)['data-effects'].actions[0];

      // Auto ability -> takes parent ability
      expect(action.damage[0].ability).toBe('str');
      
      expect(action.damage[1].damage).toBe('1d6+(@{level})');

      expect(action.damage[2].damage).toBe('1d4-1');

      expect(action.damage[3].damage).toBe('1d4+2');
    });

    it('merges additional effect fragments (ex: Features) into effects object', () => {
      const rawPayload = { name: 'Item with Feature' };
      const speedPayload = {
        type: 'Speed',
        speed: 'Fly',
        calculation: 'Set Base',
        valueFormula: { flatValue: 30 }
      };
      
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Item' }) },
        { payload: JSON.stringify(speedPayload) }
      ];
      const properties = { 'data-datarecords': JSON.stringify(records) };

      const result = transformDnDEquipment(rawPayload, { itemId: '1' }, properties);
      const effects = (result as any)['data-effects'].effects;

      expect(effects).toHaveLength(1);
      expect(effects[0].attribute).toBe('fly-speed');
      expect(effects[0].value).toBe(30);
    });

    it('maps ammunition type correctly', () => {
      const rawPayload = { name: 'Arrows' };
      const itemRecord = {
        type: 'Item',
        name: 'Arrows',
        armorData: { category: 'Ammunition' }
      };
      
      const properties = {
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(itemRecord) }
        ]),
        'Item Type': 'Ammunition'
      };

      const result = transformDnDEquipment(rawPayload, mockBook, properties);
      expect(result.type).toBe('ammunition');
    });

    it('transforms magic armor with base AC and bonus', () => {
      const rawPayload = { name: 'Plate +1' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Plate +1', armorData: { category: 'Heavy Armor', ability: null } }) },
        { payload: JSON.stringify({ type: 'Armor Class', calculation: 'Set Base', valueFormula: { flatValue: 18 } }) },
        { payload: JSON.stringify({ type: 'Armor Class', calculation: 'Modify', valueFormula: { flatValue: 1 } }) },
      ];

      const properties = { 'data-datarecords': JSON.stringify(records) };
      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      const acEffect = (result as any)['data-effects'].effects[0];
      expect(acEffect.operation).toBe('set-base-final-formula');
      expect(acEffect.formula).toBe('19');
    });

    it('transforms attunement and tags', () => {
      const rawPayload = { name: 'Ring of Protection' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Ring', properties: ['Wondrous Item'] }) },
        { payload: JSON.stringify({ type: 'Attunement' }) }
      ];

      const properties = { 'data-datarecords': JSON.stringify(records) };
      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      expect((result as any)['data-tags']).toContain('attunement');
      expect((result as any)['data-effects'].required).toContain('attuned');
    });

    it('transforms spell attach records into spellSources and spells', () => {
      const rawPayload = { name: 'Wand of Magic Missiles' };
      const records = [
        { payload: JSON.stringify({ type: 'Item', name: 'Wand' }) },
        { payload: JSON.stringify({ type: 'Spell Attach', spells: ['Magic Missile'] }) },
      ];

      const properties = { 'data-datarecords': JSON.stringify(records) };
      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      // Should create a spell source
      const source = (result as any)['data-effects'].spellSources[0];
      expect(source.name).toBe('Wand');
      expect(source.type).toBe('flat');

      // Should extract spells to data-spells
      expect((result as any)['data-spells']).toHaveLength(1);
      expect((result as any)['data-spells']![0].name).toBe('Magic Missile');
    });

    it('transforms complex attacks', () => {
      const rawPayload = { name: 'Flametongue' };
      const records = [
        { name: 'Base', payload: JSON.stringify({ type: 'Item', name: 'Flametongue' }) },
        { 
          name: 'Slash', 
          payload: JSON.stringify({ type: 'Attack', name: 'Slash', actionType: 'Action', attack: { abilityBonus: 'str' } }) 
        },
        { 
          parent: 'Slash',
          payload: JSON.stringify({ type: 'Damage', damageType: 'Slashing', diceCount: 2, diceSize: 'd6', ability: 'str' }) 
        },
        {
          parent: 'Slash',
          payload: JSON.stringify({ type: 'Damage', damageType: 'Fire', diceCount: 2, diceSize: 'd6' })
        }
      ];

      const properties = { 'data-datarecords': JSON.stringify(records) };
      const result = transformDnDEquipment(rawPayload, mockBook, properties);

      const action = (result as any)['data-effects'].actions[0];
      expect(action.name).toBe('Slash');
      expect(action.damage).toHaveLength(2);
      expect(action.damage[0].type).toBe('slashing');
      expect(action.damage[1].type).toBe('fire');
      expect(action.damage[0].damage).toBe('2d6');
      expect(action.damage[1].damage).toBe('2d6');
    });
  });
});