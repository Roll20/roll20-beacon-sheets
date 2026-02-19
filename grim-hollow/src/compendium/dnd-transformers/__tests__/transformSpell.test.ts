import { describe, it, expect, vi } from 'vitest';
import { transformDnDSpell } from '../transformSpell';


describe('transformDnDSpell', () => {
  const mockBook = { name: 'PHB', itemId: '1' };

  describe('Legacy Import (Properties only)', () => {
    it('transforms a basic legacy spell', () => {
      const rawPayload = { name: 'Legacy Fireball' };
      const properties = {
        Level: '3',
        School: 'Evocation',
        'Casting Time': '1 action',
        Range: '150 feet',
        Duration: 'Instantaneous',
        Components: 'V, S, M',
        Material: 'A tiny ball of guano',
        Concentration: 'No',
        Ritual: 'No',
        'Spell Attack': 'None',
        Save: 'Dexterity',
        Damage: '8d6',
        'Damage Type': 'Fire',
        'data-description': 'A bright streak flashes...',
        'Higher Spell Slot Desc': 'Add 1d6 damage per level.',
        'Higher Spell Slot Dice': '1'
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.name).toBe('Legacy Fireball');
      expect(result.level).toBe(3);
      expect(result.school).toBe('evocation');
      expect(result.components).toEqual(['verbal', 'somatic', 'material']);
      expect(result.material).toBe('A tiny ball of guano');
      expect(result.damage?.[0]).toEqual({
        ability: 'none',
        damage: '8d6',
        type: 'fire',
        critDamage: '8d6'
      });
      expect(result.saving).toBe('dexterity');
      
      // Check Legacy Upcasting
      expect(result.upcast).toBeDefined();
      expect(result.upcast).toHaveLength(6); // Levels 4, 5, 6, 7, 8, 9
      expect(result.upcast?.[0].level).toBe(4);
      expect(result.upcast?.[0].damage[0].damage).toBe('9d6'); // 8d6 + 1d6
    });

    it('transforms a legacy cantrip', () => {
      const rawPayload = { name: 'Legacy Bolt' };
      const properties = {
        Level: '0',
        School: 'Evocation',
        'Spell Attack': 'Ranged',
        Damage: '1d10',
        'Damage Type': 'Fire'
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.level).toBe(0);
      expect(result.isAttack).toBe(true);
      expect(result.damage?.[0].damage).toBe('1d10');
    });

    it('falls back to property-based damage if no damage record exists in datarecords', () => {
      const properties = {
        Level: '1',
        Damage: '4d6',
        'Damage Type': 'Acid',
        'data-datarecords': '[]' 
      };

      const result = transformDnDSpell({ name: 'Legacy Data Spell' }, mockBook, properties);

      expect(result.damage).toHaveLength(1);
      expect(result.damage?.[0]).toEqual({
        ability: 'none',
        damage: '4d6',
        type: 'acid'
      });
    });
  });

  describe('Modern Import (Data Records)', () => {
    it('transforms a modern spell with data records', () => {
      const rawPayload = { name: 'Modern Magic Missile' };
      
      const spellRecord = {
        type: 'Spell',
        description: 'Magic darts...',
        components: { materialDescription: '' }
      };
      
      const damageRecord = {
        type: 'Damage',
        diceCount: 3,
        diceSize: 'd4',
        damageType: 'Force',
        ability: 'none'
      };

      const upcastingRecord = {
        type: 'Upcasting',
        mode: 'Per X Spell Level',
        target: '$.diceCount',
        value: 1,
        level: 1,
        startingLevel: 2 
      };

      const properties = {
        Level: '1',
        School: 'Evocation',
        'Casting Time': '1 action',
        Range: '120 feet',
        Components: 'V, S',
        Duration: 'Instantaneous',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(spellRecord) },
          { payload: JSON.stringify(damageRecord) },
          { payload: JSON.stringify(upcastingRecord) }
        ])
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.name).toBe('Modern Magic Missile');
      expect(result.level).toBe(1);
      expect(result.damage?.[0].damage).toBe('3d4');
      expect(result.damage?.[0].type).toBe('force');
      
      expect(result.upcast).toBeDefined();
      expect(result.upcast).toHaveLength(8); 
      expect(result.upcast?.[0].level).toBe(2);
      expect(result.upcast?.[0].damage[0].damage).toBe('4d4');
    });

    it('transforms a cantrip with scaling', () => {
      const rawPayload = { name: 'Fire Bolt' };
      const spellRecord = { type: 'Spell' };
      const damageRecord = {
        type: 'Damage',
        diceCount: 1,
        diceSize: 'd10',
        damageType: 'Fire',
        ability: 'none'
      };
      
      const scaling5 = { type: 'Upcasting', mode: 'Specific Character Level', level: 5, value: 1 };
      const scaling11 = { type: 'Upcasting', mode: 'Specific Character Level', level: 11, value: 1 };
      const scaling17 = { type: 'Upcasting', mode: 'Specific Character Level', level: 17, value: 1 };

      const properties = {
        Level: '0',
        School: 'Evocation',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(spellRecord) },
          { payload: JSON.stringify(damageRecord) },
          { parent: 'Fire Bolt', payload: JSON.stringify(scaling5) },
          { parent: 'Fire Bolt', payload: JSON.stringify(scaling11) },
          { parent: 'Fire Bolt', payload: JSON.stringify(scaling17) }
        ])
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.level).toBe(0);
      expect(result.damage).toBeDefined();
      const formula = result.damage?.[0].damage;
      expect(formula).toContain('d10');
      expect(formula).toContain('@{level} < 5 ? 1');
      expect(formula).toContain('4'); 
    });

    it('returns null for cantrip scaling if base damage is not dice-based', () => {
      const damageRecord = {
        type: 'Damage',
        damage: '5',
        damageType: 'Fire'
      };
      
      const scalingRecord = {
        type: 'Upcasting',
        mode: 'Specific Character Level',
        level: 5,
        value: 1
      };

      const properties = {
        Level: '0',
        Damage: '5', 
        'Damage Type': 'Fire',
        'data-datarecords': JSON.stringify([
           { parent: 'Flat Cantrip', payload: JSON.stringify(scalingRecord) }
        ])
      };

      const result = transformDnDSpell({ name: 'Flat Cantrip' }, mockBook, properties);
      
      expect(result.damage?.[0].damage).toBe('5');
    });

    it('handles formula transformation via deepTransformFormulas', () => {
      const rawPayload = { name: 'Buff Spell' };
      const spellRecord = {
        type: 'Spell',
        description: 'Add @{int_mod} to checks.'
      };

      const properties = {
        Level: '1',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(spellRecord) }
        ])
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);
      expect(result.description?.default).toContain('@{intelligence-modifier}');
    });

    it('handles specific level upcasting (ex: Duration change)', () => {
      const rawPayload = { name: 'Bestow Curse' };
      const upcastRecord = {
        type: 'Upcasting',
        mode: 'Specific Spell Level',
        target: '$.duration',
        value: '8 hours',
        level: 5
      };

      const properties = {
        Level: '3',
        Duration: '1 minute',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify({ type: 'Spell' }) },
          { payload: JSON.stringify(upcastRecord) }
        ])
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.upcast).toBeDefined();
      const level5Upcast = result.upcast?.find(u => u.level === 5);
      expect(level5Upcast?.duration).toBe('8 hours');
    });

    it('handles duration upcasting via Per X Spell Level', () => {
      const upcastRecord = {
        type: 'Upcasting',
        mode: 'Per X Spell Level',
        target: '$.duration',
        value: '1 minute',
        level: 1,
        startingLevel: 2
      };

      const properties = {
        Level: '1',
        Duration: '1 minute',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify({ type: 'Spell' }) },
          { payload: JSON.stringify(upcastRecord) }
        ])
      };

      const result = transformDnDSpell({ name: 'Extending Spell' }, mockBook, properties);

      expect(result.upcast).toBeDefined();
      const level2 = result.upcast?.find(u => u.level === 2);
      expect(level2?.duration).toBe('2 minute'); 
      
      const level3 = result.upcast?.find(u => u.level === 3);
      expect(level3?.duration).toBe('3 minute');
    });
  });

  describe('Damage Calculation Logic', () => {
    it('defaults to "untyped" damage if type is not in config', () => {
      const damageRecord = {
        type: 'Damage',
        diceCount: 1,
        diceSize: 'd6',
        damageType: 'Emotional',
        ability: 'none'
      };

      const properties = {
        Level: '1',
        'data-datarecords': JSON.stringify([
          { payload: JSON.stringify(damageRecord) }
        ])
      };

      const result = transformDnDSpell({ name: 'Emotional Damage' }, mockBook, properties);
      
      expect(result.damage?.[0].type).toBe('untyped');
    });
  });

  describe('Error Handling', () => {
    it('returns minimal object if data is corrupted/missing', () => {
      const rawPayload = { name: 'Broken Spell' };
      const properties = { Level: '1' }; // Missing records and legacy fields

      const result = transformDnDSpell(rawPayload, mockBook, properties);
      
      expect(result.name).toBe('Broken Spell');
      expect(result.level).toBe(1);
      expect(result.damage).toBeUndefined();
    });

    it('handles completely invalid JSON in data-records gracefully', () => {
      const rawPayload = { name: 'Bad JSON Spell' };
      const properties = {
        Level: '1',
        'data-datarecords': '{ "invalid": true '
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);
      
      expect(result.name).toBe('Bad JSON Spell');
    });

    it('handles malformed JSON inside a single datarecord payload', () => {
      // One valid record, one malformed record
      const properties = {
        Level: '1',
        'data-datarecords': JSON.stringify([
          { payload: '{"type": "Spell"}' },
          { payload: '{ invalid json here }' }
        ])
      };

      const result = transformDnDSpell({ name: 'Partial Fail Spell' }, mockBook, properties);
      
      expect(result.name).toBe('Partial Fail Spell');
    });
  });

  describe('Healing Spells', () => {
    it('transforms a modern healing spell', () => {
      const rawPayload = { name: 'Healing Word' };
      const properties = {
        Level: '1',
        School: 'Evocation',
        'Casting Time': '1 bonus action',
        Range: '60 feet',
        Duration: 'Instantaneous',
        Components: 'V',
        Concentration: 'No',
        Ritual: 'No',
        'Spell Attack': 'None',
        'data-description': 'A creature of your choice that you can see within range regains hit points.',
        'Higher Spell Slot Desc': 'The healing increases by 1d4 for each slot level above 1st.',
        'data-datarecords': JSON.stringify([
          { payload: '{"type":"Spell","description":"Healing Word description"}' },
          {
            name: 'Healing Word Healing',
            payload: '{"type":"Healing","ability":"auto","isTemp":false,"diceCount":1,"diceSize":"d4"}',
          },
          {
            name: 'Healing Word Healing Upcasting',
            parent: 'Healing Word Healing',
            payload: '{"type":"Upcasting","mode":"Per X Spell Level","startingLevel":2,"level":1,"target":"$.diceCount","value":1}',
          },
        ]),
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.name).toBe('Healing Word');
      expect(result.level).toBe(1);
      expect(result.damage).toBeDefined();
      expect(result.damage?.[0]).toEqual({
        ability: 'spellcasting',
        damage: '1d4',
        type: 'healing',
      });

      // Upcasting
      expect(result.upcast).toBeDefined();
      expect(result.upcast).toHaveLength(8); // Levels 2-9
      expect(result.upcast?.[0].level).toBe(2);
      expect(result.upcast?.[0].damage[0].damage).toBe('2d4');
      expect(result.upcast?.[0].damage[0].type).toBe('healing');
      expect(result.upcast?.[0].damage[0].ability).toBe('spellcasting');
      expect(result.upcast?.[7].level).toBe(9);
      expect(result.upcast?.[7].damage[0].damage).toBe('9d4');
    });

    it('transforms a modern temporary hit points spell', () => {
      const rawPayload = { name: 'False Life' };
      const properties = {
        Level: '1',
        School: 'Necromancy',
        'Casting Time': '1 action',
        Range: 'Self',
        Duration: '1 hour',
        Components: 'V, S, M',
        Concentration: 'No',
        Ritual: 'No',
        'Spell Attack': 'None',
        'data-description': 'You gain temporary hit points.',
        'data-datarecords': JSON.stringify([
          { payload: '{"type":"Spell","description":"False Life description"}' },
          {
            name: 'False Life THP',
            payload: '{"type":"Healing","ability":"none","isTemp":true,"diceCount":1,"diceSize":"d4"}',
          },
        ]),
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.damage).toBeDefined();
      expect(result.damage?.[0]).toEqual({
        ability: 'none',
        damage: '1d4',
        type: 'temporary-hit-points',
      });
    });

    it('transforms a legacy healing spell', () => {
      const rawPayload = { name: 'Cure Wounds' };
      const properties = {
        Level: '1',
        School: 'Evocation',
        'Casting Time': '1 action',
        Range: 'Touch',
        Duration: 'Instantaneous',
        Components: 'V, S',
        Concentration: 'No',
        Ritual: 'No',
        'Spell Attack': 'None',
        Healing: '1d8',
        'Add Casting Modifier': 'Yes',
        'data-description': 'A creature you touch regains hit points.',
        'Higher Spell Slot Desc': 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
        'Higher Spell Slot Dice': '1',
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.name).toBe('Cure Wounds');
      expect(result.damage).toBeDefined();
      expect(result.damage?.[0]).toEqual({
        ability: 'spellcasting',
        damage: '1d8',
        type: 'healing',
      });

      expect(result.upcast).toBeDefined();
      expect(result.upcast?.[0].level).toBe(2);
      expect(result.upcast?.[0].damage[0].damage).toBe('2d8');
      expect(result.upcast?.[0].damage[0].type).toBe('healing');
    });

    it('transforms a legacy healing spell without casting modifier', () => {
      const rawPayload = { name: 'Goodberry' };
      const properties = {
        Level: '1',
        School: 'Transmutation',
        'Casting Time': '1 action',
        Range: 'Touch',
        Duration: 'Instantaneous',
        Components: 'V, S, M',
        Concentration: 'No',
        Ritual: 'No',
        'Spell Attack': 'None',
        Healing: '1',
        'data-description': 'Up to ten berries appear in your hand.',
      };

      const result = transformDnDSpell(rawPayload, mockBook, properties);

      expect(result.damage).toBeDefined();
      expect(result.damage?.[0]).toEqual({
        ability: 'none',
        damage: '1',
        type: 'healing',
      });
    });
  });
});