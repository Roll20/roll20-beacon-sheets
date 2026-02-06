import { describe, it, expect, vi } from 'vitest';
import { transformDnDClass } from '../transformClass';

describe('dnd-transformers/transformClass', () => {
  const mockBook = { itemId: '123' };

  describe('Legacy Class Transformation', () => {
    it('transforms basic legacy class properties', () => {
      const rawPayload = { name: 'Fighter' };
      const properties = {
        'Hit Die': 'd10',
        'data-Subclass Level': '3',
        'Caster Progression': 'None',
        'data-description': 'A fighter description.',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      expect(result.name).toBe('Fighter');
      expect(result.hitDie).toBe('1d10');
      expect(result.subclassUnlockLevel).toBe('3');
      expect(result.spellcasting).toBe('none');
    });

    it('transforms legacy spellcasting', () => {
      const rawPayload = { name: 'Wizard' };
      const properties = {
        'Hit Die': 'd6',
        'Caster Progression': 'Full',
        'Spellcasting Ability': 'Intelligence',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      expect(result.spellcasting).toBe('full');
      expect(result['data-spellSource']).toEqual({
        name: 'Wizard Spellcasting',
        type: 'ability',
        ability: 'intelligence',
        isPrepared: true,
      });
    });

    it('parses legacy proficiencies from description', () => {
      const rawPayload = { name: 'Legacy Class' };
      const properties = {
        'Hit Die': 'd8',
        'data-description': 'Armor: Light armor, Medium armor\nWeapons: Simple weapons',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      const level1Features = result['data-features']['level-1'];
      expect(level1Features).toBeDefined();

      const profFeature = level1Features[0];
      expect(profFeature.label).toBe('Proficiencies');
      const effects = profFeature['data-effects'].effects;

      expect(effects).toContainEqual(
        expect.objectContaining({ attribute: 'armor-proficiencies', value: 'light-armor' }),
      );
      expect(effects).toContainEqual(
        expect.objectContaining({ attribute: 'weapon-proficiencies', value: 'simple-weapons' }),
      );
    });

    it('handles JSON parse error in data-Saving Throws gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rawPayload = { name: 'Broken Class' };
      const properties = {
        'Hit Die': 'd8',
        'data-Saving Throws': '{invalid_json',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      // Should still transform basic props
      expect(result.name).toBe('Broken Class');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not parse data-Saving Throws'),
      );

      consoleSpy.mockRestore();
    });
    it('transforms legacy saving throws', () => {
      const rawPayload = { name: 'Monk' };
      const properties = {
        'Hit Die': 'd8',
        'data-Saving Throws': '["Strength", "Dexterity"]',
        'data-description': 'Some description',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      const level1Features = result['data-features']['level-1'];
      const profFeature = level1Features[0];
      const effects = profFeature['data-effects'].effects;

      expect(effects).toContainEqual({
        attribute: 'strength-saving-proficiency',
        operation: 'set',
        value: 1,
      });
      expect(effects).toContainEqual({
        attribute: 'dexterity-saving-proficiency',
        operation: 'set',
        value: 1,
      });
    });
  });

  describe('Modern Class Transformation', () => {
    it('transforms basic class details from datarecords', () => {
      const rawPayload = { name: 'Rogue' };
      const dataRecords = [
        {
          payload: JSON.stringify({ type: 'Hit Dice', dieSize: 'd8', dieCount: 1 }),
        },
        {
          payload: JSON.stringify({ type: 'Class Details', subclassLevel: 3 }),
        },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      expect(result.name).toBe('Rogue');
      expect(result.hitDie).toBe('1d8');
      expect(result.subclassUnlockLevel).toBe(3);
    });

    it('transforms spellcasting from datarecords', () => {
      const rawPayload = { name: 'Cleric' };
      const dataRecords = [
        {
          payload: JSON.stringify({
            type: 'Spellcasting',
            casterType: 'full',
            ability: 'Wisdom',
          }),
        },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      expect(result.spellcasting).toBe('full');
      expect(result['data-spellSource']).toMatchObject({
        type: 'ability',
        ability: 'wisdom',
        isPrepared: true,
      });
    });

    it('calculates cantrips and spells known progression', () => {
      const rawPayload = { name: 'Sorcerer' };
      const dataRecords = [
        {
          payload: JSON.stringify({
            type: 'Spellcasting',
            casterType: 'full',
            ability: 'Charisma',
          }),
        },
        { level: 1, payload: JSON.stringify({ type: 'Spell Choice', spellLevel: 0, choices: 4 }) },
        { level: 1, payload: JSON.stringify({ type: 'Spell Choice', spellLevel: 1, choices: 2 }) },
        { level: 2, payload: JSON.stringify({ type: 'Spell Choice', spellLevel: 1, choices: 1 }) },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      const source = result['data-spellSource'];

      expect(source.isPrepared).toBe(false);
      expect(source.cantripsKnown[0]).toBe(4);
      expect(source.cantripsKnown[1]).toBe(4);
      expect(source.spellsKnown[0]).toBe(2);
      expect(source.spellsKnown[1]).toBe(3); // 2 + 1
    });

    it('groups level 1 proficiencies into a single feature', () => {
      const rawPayload = { name: 'Barbarian' };
      const dataRecords = [
        {
          level: 1,
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Armor',
            proficiency: 'Shields',
          }),
        },
        {
          level: 1,
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Weapon',
            proficiency: 'Martial',
          }),
        },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      const level1 = result['data-features']['level-1'];

      const profFeature = level1.find((f: any) => f.label === 'Proficiencies');
      expect(profFeature).toBeDefined();
      expect(profFeature['data-effects'].effects).toHaveLength(2);
    });

    it('maps class features to their appropriate levels', () => {
      const rawPayload = { name: 'Monk' };
      const dataRecords = [
        {
          level: 2,
          name: 'Ki',
          payload: JSON.stringify({ type: 'Features', name: 'Ki', description: 'Ki points' }),
        },
        {
          level: 5,
          name: 'Extra Attack',
          payload: JSON.stringify({
            type: 'Features',
            name: 'Extra Attack',
            description: 'Attack twice',
          }),
        },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);

      expect(result['data-features']).toBeDefined();
      expect(result['data-features']['level-2']).toBeDefined();
      expect(result['data-features']['level-2'][0].label).toBe('Ki');
      expect(result['data-features']['level-5'][0].label).toBe('Extra Attack');
    });

    it('falls back to property if Hit Dice record parse fails', () => {
      const rawPayload = { name: 'Fighter' };
      const dataRecords = [
        { payload: 'invalid_json' },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
        'Hit Die': 'd10',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      expect(result.hitDie).toBe('1d10');
    });

    it('falls back to property if Hit Dice record is missing', () => {
      const rawPayload = { name: 'Fighter' };
      const dataRecords: any[] = [];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
        'filter-Hit Die': 'd12',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      expect(result.hitDie).toBe('1d12');
    });

    it('falls back to property if Class Details record parse fails', () => {
      const rawPayload = { name: 'Rogue' };
      const dataRecords = [
        { payload: 'invalid_json' },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
        'data-Subclass Level': '9',
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      expect(result.subclassUnlockLevel).toBe('9');
    });

    it('handles Spellcasting record parse error', () => {
      const rawPayload = { name: 'Broken Caster' };
      const dataRecords = [
        { payload: 'invalid_json' },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      expect(result.spellcasting).toBeUndefined();
    });

    it('ignores Spell Choice records with parse errors', () => {
      const rawPayload = { name: 'Sorcerer' };
      const dataRecords = [
        {
          payload: JSON.stringify({
            type: 'Spellcasting',
            casterType: 'full',
            ability: 'Charisma',
          }),
        },
        { level: 1, payload: 'invalid_json' },
        { level: 1, payload: JSON.stringify({ type: 'Spell Choice', spellLevel: 0, choices: 1 }) },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      expect(result['data-spellSource'].cantripsKnown[0]).toBe(1);
    });

    it('ignores Level 1 Proficiency records with parse errors', () => {
      const rawPayload = { name: 'Warrior' };
      const dataRecords = [
        { level: 1, payload: 'invalid_json' },
        {
          level: 1,
          payload: JSON.stringify({
            type: 'Proficiency',
            category: 'Armor',
            proficiency: 'Shields',
          }),
        },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      const level1 = result['data-features']['level-1'];
      const profFeature = level1.find((f: any) => f.label === 'Proficiencies');
      expect(profFeature['data-effects'].effects).toHaveLength(1);
    });

    it('includes records with parse errors in otherRecords but handles them safely', () => {
      const rawPayload = { name: 'Messy Class' };
      const dataRecords = [
        { level: 1, payload: 'invalid_json' },
      ];
      const properties = {
        'data-datarecords': JSON.stringify(dataRecords),
      };

      const result = transformDnDClass(rawPayload, mockBook, properties);
      // Since the record fails transformDnDFeature, it adds no features
      expect(result['data-features']).toBeUndefined();
    });
  });
});
