import { describe, it, expect, vi } from 'vitest';
import { createEffectFragment } from '../transformEffects';


describe('dnd-transformers/transformEffects', () => {
  describe('createEffectFragment', () => {
    it('returns null for invalid JSON payload', () => {
      const record = { name: 'Bad Data', payload: '{ invalid json }' };
      const result = createEffectFragment(record);
      expect(result).toBeNull();
    });

    it('transforms "Features" type (Description only)', () => {
      const record = {
        name: 'Feature',
        payload: JSON.stringify({
          type: 'Features',
          description: 'A simple feature description.',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.description).toBe('A simple feature description.');
    });

    it('transforms "Action" type', () => {
      const record = {
        name: 'Dash',
        payload: JSON.stringify({
          type: 'Action',
          name: 'Dash',
          actionType: 'Action',
          description: 'Move double speed.',
        }),
      };
      const result = createEffectFragment(record);
      
      expect(result?.actions).toHaveLength(1);
      expect(result?.actions![0]).toEqual(expect.objectContaining({
        name: 'Dash',
        group: 'actions',
        isAttack: false,
        description: 'Move double speed.',
      }));
    });

    it('transforms "Attack" type with Saving Throw', () => {
      const record = {
        name: 'Fireball',
        payload: JSON.stringify({
          type: 'Attack',
          name: 'Fireball',
          actionType: 'Action',
          range: '150 ft',
          save: { saveAbility: 'Dexterity' },
          description: 'Explosion',
        }),
      };
      const result = createEffectFragment(record);
      
      expect(result?.actions).toHaveLength(1);
      const action = result?.actions![0];
      expect(action).toEqual(expect.objectContaining({
        name: 'Fireball',
        group: 'actions',
        range: '150 ft',
        saving: 'dexterity',
        description: 'Explosion',
      }));
      // Default formula calculation
      expect(action?.savingDc).toBe('8 + @{pb} + @{dexterity-modifier}');
    });

    it('transforms "Attack" type with Flat Save DC', () => {
      const record = {
        name: 'Breath Weapon',
        payload: JSON.stringify({
          type: 'Attack',
          name: 'Breath',
          actionType: 'Action',
          save: { saveAbility: 'Constitution', saveFlat: 15 },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.actions![0].savingDc).toBe('15');
      expect(result?.actions![0].saving).toBe('constitution');
      expect(result?.actions![0].name).toBe('Breath');
      expect(result?.actions![0].group).toBe('actions');
    });

    it('transforms "Proficiency" type (Skill)', () => {
      const record = {
        name: 'Skill Prof',
        payload: JSON.stringify({
          type: 'Proficiency',
          category: 'Skill',
          proficiency: 'Animal Handling',
          proficiencyLevel: 'Proficient',
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'animal-handling-proficiency',
        operation: 'set-max',
        value: 1,
      });
    });

    it('transforms "Proficiency" type (Armor)', () => {
      const record = {
        name: 'Armor Prof',
        payload: JSON.stringify({
          type: 'Proficiency',
          category: 'Armor',
          proficiency: 'Light Armor',
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'armor-proficiencies',
        operation: 'push',
        value: 'light-armor', 
      });
    });

    it('transforms "Resource" type', () => {
      const record = {
        name: 'Ki Points',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Ki',
          maxValueFormula: { flatValue: 5 },
          recoveryRate: {
            'Short Rest': { type: 'Full' },
            'Long Rest': { type: 'Full' },
          },
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.resources).toHaveLength(1);
      expect(result?.resources![0]).toEqual(expect.objectContaining({
        name: 'Ki',
        max: '5',
        count: 5,
        refreshOnShortRest: 'all',
        refreshOnLongRest: 'all',
      }));
    });

    it('transforms "Resource" type using rollFormula for Long Rest recovery', () => {
      const record = {
        name: 'Roll Recovery',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          recoveryRate: {
            'Long Rest': { type: 'Calculation', rollFormula: '1d8' },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnLongRest).toBe('fixed-value');
      expect(result?.resources![0].refreshOnLongRestAmount).toBe('1d8');
    });

    it('transforms "Resource" type using flatValue for Long Rest recovery', () => {
      const record = {
        name: 'Flat Recovery',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          recoveryRate: {
            'Long Rest': { type: 'Calculation', calculationFormula: { flatValue: 5 } },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnLongRest).toBe('fixed-value');
      expect(result?.resources![0].refreshOnLongRestAmount).toBe('5');
    });

    it('transforms "Resource" type using flatValue for Short Rest recovery', () => {
      const record = {
        name: 'Flat Short Recovery',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          recoveryRate: {
            'Short Rest': { type: 'Calculation', calculationFormula: { flatValue: 3 } },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnShortRest).toBe('fixed-value');
      expect(result?.resources![0].refreshOnShortRestAmount).toBe('3');
    });

    it('transforms "Resource" type using rollFormula for Dawn recovery', () => {
      const record = {
        name: 'Dawn Roll',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          recoveryRate: {
            'Dawn': { type: 'Roll', rollFormula: '1d6' },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnDawn).toBe('fixed-value');
      expect(result?.resources![0].refreshOnDawnAmount).toBe('1d6');
    });

    it('transforms "Resource" type using flatValue for Dawn recovery', () => {
      const record = {
        name: 'Dawn Flat',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Res',
          recoveryRate: {
            'Dawn': { type: 'Roll', calculationFormula: { flatValue: 2 } },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnDawn).toBe('fixed-value');
      expect(result?.resources![0].refreshOnDawnAmount).toBe('2');
    });

    it('transforms "Resource" type with Short Rest recovery', () => {
      const record = {
        name: 'Legacy Short',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Old Short',
          maxValueFormula: { flatValue: 1 },
          recovery: 'Short Rest',
          recoveryRate: 'Full',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnShortRest).toBe('all');
      expect(result?.resources![0].max).toBe('1');
    });

    it('transforms "Resource" type with maxValueFormula', () => {
      const record = {
        name: 'Lay On Hands',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Lay On Hands',
          value: 'full',
          maxValueFormula: {
            classLevel: { add: true, multiplier: 5, className: 'Paladin' },
            round: 'Down',
          },
          recovery: 'Long Rest',
          recoveryRate: 'Full',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].max).toBe('5 * $ownerlevel');
      expect(result?.resources![0].count).toBe(0);
      expect(result?.resources![0].refreshOnLongRest).toBe('all');
    });

    it('transforms "Resource" type with classLevel multiplier of 1', () => {
      const record = {
        name: 'Simple Pool',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Pool',
          maxValueFormula: {
            classLevel: { add: true, multiplier: 1, className: 'Fighter' },
          },
          recovery: 'Long Rest',
          recoveryRate: 'Full',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].max).toBe('$ownerlevel');
    });

    it('transforms "Ability Score" type', () => {
      const record = {
        name: 'ASI',
        payload: JSON.stringify({
          type: 'Ability Score',
          ability: 'Strength',
          calculation: 'Modify',
          value: 2,
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'strength',
        operation: 'add',
        value: 2,
      });
    });

    it('transforms "Ability Score Choice" type', () => {
      const record = {
        name: 'ASI Choice',
        payload: JSON.stringify({
          type: 'Ability Score Choice',
          choose: 1,
          increase: 1,
          from: ['Strength', 'Dexterity'],
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.pickers).toHaveLength(1);
      expect(result?.effects).toHaveLength(1);
      
      expect(result?.effects![0].attribute).toBe('$picker:0');
      expect(result?.effects![0].operation).toBe('add');
      expect(result?.effects![0].value).toBe(1);
    });

    it('transforms "Language Choice" type', () => {
      const record = {
        name: 'Lang Choice',
        payload: JSON.stringify({
          type: 'Language Choice',
          numOfChoices: 1,
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.pickers).toHaveLength(1);
      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'languages',
        operation: 'push',
        value: '$picker:0',
      });
    });

    it('transforms "Speed" type', () => {
      const record = {
        name: 'Speed Boost',
        payload: JSON.stringify({
          type: 'Speed',
          speed: 'Fly',
          calculation: 'Set Base',
          valueFormula: { flatValue: 30 },
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'fly-speed',
        operation: 'set-base',
        value: 30,
      });
    });

    it('transforms "Spell Attach" type', () => {
      const record = {
        name: 'Magic Initiate',
        description: 'Learn spells',
        payload: JSON.stringify({
          type: 'Spell Attach',
          spells: ['Firebolt', 'Cure Wounds']
        })
      };
      const result = createEffectFragment(record);

      expect(result?.spells).toHaveLength(2);
      expect(result?.spells![0]).toEqual({ name: 'Firebolt', spellSourceId: '$source:0' });
      expect(result?.description).toBe('Learn spells');
    });

    it('transforms "Defense" type', () => {
      const record = {
        name: 'Resist Fire',
        payload: JSON.stringify({
          type: 'Defense',
          defense: 'Resistance',
          damage: 'Fire'
        })
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'damage-resistances',
        operation: 'push',
        value: 'fire'
      });
    });

    it('transforms "Proficiency" type (Saving Throw)', () => {
      const record = {
        name: 'Save Prof',
        payload: JSON.stringify({
          type: 'Proficiency',
          category: 'Saving Throw',
          proficiency: 'Wisdom',
        }),
      };
      const result = createEffectFragment(record);

      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'wisdom-saving-proficiency',
        operation: 'set',
        value: 1,
      });
    });

    it('transforms "Resource" type with legacy string recovery', () => {
      const record = {
        name: 'Legacy Res',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Old',
          maxValueFormula: { flatValue: 1 },
          recovery: 'Long Rest',
          recoveryRate: 'Full',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnLongRest).toBe('all');
    });

    it('transforms "Resource" type with complex recovery (Calculation/Roll)', () => {
      const record = {
        name: 'Complex Res',
        payload: JSON.stringify({
          type: 'Resource',
          name: 'Points',
          maxValueFormula: { flatValue: 10 },
          recoveryRate: {
            'Long Rest': { type: 'Calculation', calculationFormula: { customFormula: '@{level}' } },
            'Short Rest': { type: 'Calculation', rollFormula: '1d4' },
            'Dawn': { type: 'Roll', rollFormula: '1d6+1' },
          },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.resources![0].refreshOnLongRest).toBe('fixed-value');
      expect(result?.resources![0].refreshOnLongRestAmount).toBe('@{level}');
      expect(result?.resources![0].refreshOnShortRest).toBe('fixed-value');
      expect(result?.resources![0].refreshOnShortRestAmount).toBe('1d4');
      expect(result?.resources![0].refreshOnDawn).toBe('fixed-value');
      expect(result?.resources![0].refreshOnDawnAmount).toBe('1d6+1');
    });

    it('transforms "Roll Bonus" type (Advantage)', () => {
      const record = {
        name: 'Advantage',
        payload: JSON.stringify({
          type: 'Roll Bonus',
          bonusName: ['Stealth'],
          bonusDetails: 'Keep Highest',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects![0]).toEqual({
        attribute: 'stealth-action-die',
        operation: 'set',
        value: 1,
      });
    });

    it('transforms "Roll Bonus" type (Disadvantage)', () => {
      const record = {
        name: 'Disadvantage',
        payload: JSON.stringify({
          type: 'Roll Bonus',
          bonusName: ['Perception'],
          bonusDetails: 'Keep Lowest',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects![0]).toEqual({
        attribute: 'perception-action-die',
        operation: 'set',
        value: -1,
      });
    });

    it('handles "Roll Bonus" with missing data gracefully', () => {
      const record = {
        name: 'Bad Bonus',
        payload: JSON.stringify({
          type: 'Roll Bonus',
          bonusName: [], 
        }),
      };
      const result = createEffectFragment(record);
      expect(result).toEqual({});
    });

    it('transforms "Sense" type', () => {
      const record = {
        name: 'Darkvision',
        payload: JSON.stringify({
          type: 'Sense',
          name: 'Darkvision',
          valueFormula: { flatValue: 60 },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects![0]).toEqual({
        attribute: 'sense-darkvision',
        operation: 'set-base',
        value: 60,
      });
    });

    it('transforms "Language" type', () => {
      const record = {
        name: 'Elvish',
        payload: JSON.stringify({
          type: 'Language',
          name: 'Elvish',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects![0]).toEqual({
        attribute: 'languages',
        operation: 'push',
        value: 'Elvish',
      });
    });

    it('transforms "Spellcasting" type', () => {
      const record = {
        name: 'Wizard Casting',
        payload: JSON.stringify({
          type: 'Spellcasting',
          ability: 'Intelligence',
          name: 'Wizard Casting',
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.spellSources![0]).toEqual({
        name: 'Wizard Casting',
        type: 'ability',
        ability: 'intelligence',
      });
    });

    it('transforms "Spellcasting" type using fallback name', () => {
      const record = {
        name: 'Cleric',
        payload: JSON.stringify({
          type: 'Spellcasting',
          ability: 'Wisdom',
          name: undefined,
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.spellSources![0].name).toBe('Cleric Spellcasting');
    });

    it('transforms "Armor Class" with customFormula (Barbarian Unarmored Defense)', () => {
      const record = {
        name: 'Barbarian Unarmored Defense AC',
        payload: JSON.stringify({
          type: 'Armor Class',
          calculation: 'Modify',
          source: 'Other',
          valueFormula: { customFormula: '@{constitution_mod}' },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'armor-class',
        operation: 'add-formula',
        formula: '@{constitution-modifier}',
      });
    });

    it('transforms "Armor Class" with flatValue', () => {
      const record = {
        name: 'AC Bonus',
        payload: JSON.stringify({
          type: 'Armor Class',
          calculation: 'Modify',
          valueFormula: { flatValue: 2 },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'armor-class',
        operation: 'add',
        value: 2,
      });
    });

    it('transforms "Armor Class" Set Base with flatValue', () => {
      const record = {
        name: 'Natural Armor',
        payload: JSON.stringify({
          type: 'Armor Class',
          calculation: 'Set Base',
          valueFormula: { flatValue: 13 },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'armor-class',
        operation: 'set-base',
        value: 13,
      });
    });

    it('transforms "Armor Class" Override with flatValue', () => {
      const record = {
        name: 'AC Override',
        payload: JSON.stringify({
          type: 'Armor Class',
          calculation: 'Override',
          valueFormula: { flatValue: 18 },
        }),
      };
      const result = createEffectFragment(record);
      expect(result?.effects).toHaveLength(1);
      expect(result?.effects![0]).toEqual({
        attribute: 'armor-class',
        operation: 'set-base-final',
        value: 18,
      });
    });
  });
});