import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  getLevel,
  getProficiencyBonus,
  getAbilityScore,
  getAbilityModifier,
  getSkillProficiency,
  getSkillModifier,
  getInitiative
} from '../handlers/computed';
import type { Character } from '@roll20-official/beacon-sdk';

describe('Relay Computed Properties', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const createMockCharacter = (overrides: Partial<any> = {}): Character => {
    return {
      id: 'char-1',
      attributes: {
        progression: { classes: {} },
        abilities: { abilities: {} },
        proficiencies: { ranked: {} },
        modifiers: { effects: {} },
        equipment: { equipment: {} },
        ...overrides
      }
    } as unknown as Character;
  };

  describe('getLevel', () => {
    it('calculates total level from multiple classes', () => {
      const character = createMockCharacter({
        progression: {
          classes: {
            'c1': { level: 3 },
            'c2': { level: 2 }
          }
        }
      });
      expect(getLevel({ character })).toBe(5);
    });

    it('returns 0 if no classes exist', () => {
      const character = createMockCharacter();
      expect(getLevel({ character })).toBe(0);
    });

    it('returns 0 if progression exists but classes property is missing', () => {
      const character = createMockCharacter({
        progression: {}
      });
      expect(getLevel({ character })).toBe(0);
    });
  });

  describe('getProficiencyBonus', () => {
    it('calculates PB based on level (Level 1 -> +2)', () => {
      const character = createMockCharacter({
        progression: { classes: { 'c1': { level: 1 } } }
      });
      expect(getProficiencyBonus({ character })).toBe(2);
    });

    it('calculates PB based on level (Level 5 -> +3)', () => {
      const character = createMockCharacter({
        progression: { classes: { 'c1': { level: 5 } } }
      });
      expect(getProficiencyBonus({ character })).toBe(3);
    });

    it('returns 0 when level is 0', () => {
      const character = createMockCharacter({
        progression: { classes: {} }
      });
      expect(getProficiencyBonus({ character })).toBe(0);
    });

    it('applies effects to proficiency bonus', () => {
      const character = createMockCharacter({
        progression: { classes: { 'c1': { level: 1 } } }, 
        modifiers: {
          effects: {
            'e1': {
              _id: 'e1',
              enabled: true,
              arrayPosition: 0,
              effects: {
                'se1': {
                  _id: 'se1',
                  attribute: 'proficiency-bonus',
                  operation: 'add',
                  value: 1,
                  required: [],
                  arrayPosition: 0
                }
              }
            }
          }
        }
      });
      expect(getProficiencyBonus({ character })).toBe(3);
    });
  });

  describe('Ability Scores and Modifiers', () => {
    const setupCharacter = (score: number, effects: any = {}) => createMockCharacter({
      abilities: {
        abilities: {
          'str': { _id: 'str', label: 'strength', score: score }
        }
      },
      modifiers: { effects }
    });

    it('calculates ability score without effects', () => {
      const character = setupCharacter(15);
      expect(getAbilityScore({ character }, 'strength')).toBe(15);
    });

    it('returns 0 if abilities property exists but nested abilities key is missing', () => {
      const character = createMockCharacter({
        abilities: {}
      });
      expect(getAbilityScore({ character }, 'strength')).toBe(0);
    });

    it('calculates ability modifier (15 -> 3)', () => {
      const character = setupCharacter(15);
      expect(getAbilityModifier({ character }, 'strength')).toBe(3);
    });

    it('calculates ability modifier (10 -> 0)', () => {
      const character = setupCharacter(10);
      expect(getAbilityModifier({ character }, 'strength')).toBe(0);
    });

    it('returns 0 modifier if ability score is 0', () => {
      const character = setupCharacter(0);
      expect(getAbilityModifier({ character }, 'strength')).toBe(0);
    });

    it('applies effects to ability score', () => {
      const character = setupCharacter(10, {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'strength',
              operation: 'add',
              value: 2,
              required: [],
              arrayPosition: 0
            }
          }
        }
      });
      expect(getAbilityScore({ character }, 'strength')).toBe(12);
      expect(getAbilityModifier({ character }, 'strength')).toBe(1);
    });

    it('handles set-base operation correctly', () => {
      const character = setupCharacter(14, {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'strength',
              operation: 'set-base',
              value: 19,
              required: [],
              arrayPosition: 0
            }
          }
        }
      });
      expect(getAbilityScore({ character }, 'strength')).toBe(19);
      expect(getAbilityModifier({ character }, 'strength')).toBe(5);
    });
  });

  describe('Skills', () => {
    const buildSkillChar = (
      skillName: string, 
      ability: string, 
      abilityScore: number, 
      level: number, 
      skillLevel: number = -1, 
      effects: any = {}
    ) => {
      return createMockCharacter({
        progression: { classes: { 'c1': { level } } },
        abilities: {
          abilities: {
            [ability]: { _id: ability, label: ability, score: abilityScore }
          }
        },
        proficiencies: {
          ranked: {
            [skillName]: { _id: skillName, label: skillName, ability: ability, level: skillLevel }
          }
        },
        modifiers: { effects }
      });
    };

    it('returns 0 if proficiencies property exists but ranked key is missing', () => {
      const character = createMockCharacter({
        proficiencies: {}
      });
      expect(getSkillProficiency({ character }, 'athletics')).toBe(0);
    });

    it('calculates skill modifier (Untrained)', () => {
      const character = buildSkillChar('athletics', 'strength', 14, 1, -1);
      
      expect(getSkillProficiency({ character }, 'athletics')).toBe(0);
      expect(getSkillModifier({ character }, 'athletics')).toBe(2); 
    });

    it('calculates skill modifier (Proficient)', () => {
      const character = buildSkillChar('athletics', 'strength', 14, 1, 1);
      
      expect(getSkillProficiency({ character }, 'athletics')).toBe(1);
      expect(getSkillModifier({ character }, 'athletics')).toBe(4); 
    });

    it('applies effects to skill proficiency level', () => {
      const effects = {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'athletics-proficiency',
              operation: 'add',
              value: 1,
              required: [],
              arrayPosition: 0
            }
          }
        }
      };
      const character = buildSkillChar('athletics', 'strength', 10, 1, -1, effects);
      
      expect(getSkillProficiency({ character }, 'athletics')).toBe(1);
      expect(getSkillModifier({ character }, 'athletics')).toBe(2); 
    });

    it('constrains proficiency level between 0 and 2', () => {
      const effects = {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'athletics-proficiency',
              operation: 'add',
              value: 5,
              required: [],
              arrayPosition: 0
            }
          }
        }
      };
      const character = buildSkillChar('athletics', 'strength', 10, 1, -1, effects);
      expect(getSkillProficiency({ character }, 'athletics')).toBe(2);
    });

    it('applies flat bonus effects to skill modifier', () => {
      const effects = {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'athletics-modifier',
              operation: 'add',
              value: 1,
              required: [],
              arrayPosition: 0
            }
          }
        }
      };
      const character = buildSkillChar('athletics', 'strength', 10, 1, 1, effects);
      
      expect(getSkillModifier({ character }, 'athletics')).toBe(3);
    });
  });

  describe('Initiative', () => {
    const buildInitChar = (dex: number, effects: any = {}) => {
      return createMockCharacter({
        progression: { classes: { 'c1': { level: 1 } } },
        abilities: {
          abilities: {
            'dexterity': { _id: 'dex', label: 'dexterity', score: dex }
          }
        },
        proficiencies: {
          ranked: {
            'initiative': { _id: 'init', label: 'initiative', ability: 'dexterity', level: -1 }
          }
        },
        modifiers: { effects }
      });
    };

    it('calculates initiative based on Dex', () => {
      const character = buildInitChar(14);
      expect(getInitiative({ character })).toBe(2);
    });

    it('applies effects to initiative', () => {
      const effects = {
        'e1': {
          _id: 'e1',
          enabled: true,
          arrayPosition: 0,
          effects: {
            'se1': {
              _id: 'se1',
              attribute: 'initiative-modifier',
              operation: 'add',
              value: 5,
              required: [],
              arrayPosition: 0
            }
          }
        }
      };
      const character = buildInitChar(10, effects);
      expect(getInitiative({ character })).toBe(5);
    });
  });
});