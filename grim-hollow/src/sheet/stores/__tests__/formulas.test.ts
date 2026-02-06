import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProgressionStore } from '../progression/progressionStore';
import { useAbilitiesStore } from '../abilities/abilitiesStore';
import { useSpellsStore } from '../spells/spellsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { effectKeys } from '@/effects.config';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe('Formulas & Parsing', () => {
  // Needed for formula instanciation
  let formulas: typeof import('../formulas').formulas;
  let parseFormula: typeof import('../formulas').parseFormula;
  let evaluateDiceFormula: typeof import('../formulas').evaluateDiceFormula;
  let parseFormulaAndEvaluate: typeof import('../formulas').parseFormulaAndEvaluate;

  beforeEach(async () => {
    setActivePinia(createPinia());

    vi.resetModules();

    const mod = await import('../formulas');
    formulas = mod.formulas;
    parseFormula = mod.parseFormula;
    evaluateDiceFormula = mod.evaluateDiceFormula;
    parseFormulaAndEvaluate = mod.parseFormulaAndEvaluate;

    vi.clearAllMocks();
  });

  describe('Formulas Proxy', () => {
    it('should calculate global level based on progression store', () => {
      const progression = useProgressionStore();

      progression.updateClass({ name: 'Fighter', level: 5 });

      expect(formulas.level?.value).toBe(5);

      progression.updateClass({ name: 'Wizard', level: 3 });

      expect(formulas.level?.value).toBe(8);
    });

    it('should calculate proficiency bonus correctly', () => {
      const progression = useProgressionStore();

      progression.updateClass({ name: 'Rogue', level: 1 });
      expect(formulas.pb?.value).toBe(2);

      progression.classes[0].level = 5;
      expect(formulas.pb?.value).toBe(3);
    });

    it('should access dynamic class levels via Proxy', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Fighter', level: 5 });
      progression.updateClass({ name: 'Cleric', level: 2 });

      // @ts-ignore
      expect(formulas['fighter-level']?.value).toBe(5);
      // @ts-ignore
      expect(formulas['cleric-level']?.value).toBe(2);

      // @ts-ignore
      expect(formulas['wizard-level']).toBeUndefined();
    });

    it('should return ability scores and modifiers', () => {
      const abilities = useAbilitiesStore();
      const str = abilities.abilities.find((a) => a.label === 'strength')!;
      str.score = 16;

      expect(formulas.strength?.value).toBe(16);
      expect(formulas['strength-modifier']?.value).toBe(3);
    });

    it('should return spell-dc', () => {
      const spells = useSpellsStore();
      const progression = useProgressionStore();

      progression.updateClass({ name: 'Wizard', level: 1 });

      spells.updateSource({ type: 'ability', ability: 'intelligence', name: 'Wizard' });

      expect(formulas['spell-dc']?.value).toBe(10);
    });

    it('should fallback to default spell-dc calculation if no spell sources exist', () => {
      const spells = useSpellsStore();
      const progression = useProgressionStore();
      
      spells.userSources = []; 
      
      progression.updateClass({ name: 'Fighter', level: 1 });

      expect(formulas['spell-dc']?.value).toBe(10);
    });

    it('should return 0 for ability score if ability does not exist in store', () => {
      const abilities = useAbilitiesStore();
      const strIndex = abilities.abilities.findIndex(a => a.label === 'strength');
      if (strIndex > -1) abilities.abilities.splice(strIndex, 1);

      // @ts-ignore
      expect(formulas.strength?.value).toBe(0);
    });
  });

  describe('parseFormula', () => {
    it('should replace attributes with values', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Monk', level: 4 });

      const result = parseFormula('1d20 + @{pb}');
      expect(result).toBe('1d20 + 2');
    });

    it('should replace multiple attributes', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Monk', level: 4 });

      const result = parseFormula('@{level} + @{pb}');
      expect(result).toBe('4 + 2');
    });

    it('should handle |max:X rules', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Druid', level: 10 });

      const result = parseFormula('@{level|max:5}');
      expect(result).toBe('5');
    });

    it('should handle |min:X rules', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Druid', level: 1 });

      const result = parseFormula('@{level|min:5}');
      expect(result).toBe('5');
    });

    it('should return "0" (and invalid string) if attribute is invalid', () => {
      const result = parseFormula('1d20 + @{non-existent-stat}');
      expect(result).toBe('0');
    });

    it('should handle hit-dice greedy consumption', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Fighter', hitDie: '1d10', level: 2 });
      progression.updateClass({ name: 'Rogue', hitDie: '1d8', level: 1 });

      progression.hitDice.used['1d10'] = 2;
      progression.hitDice.used['1d8'] = 1;

      expect(parseFormula('@{hit-dice:2}')).toBe('2d10');

      expect(parseFormula('@{hit-dice:3}')).toBe('2d10+1d8');
    });

    it('should return "0" for hit-dice if insufficient funds', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Fighter', hitDie: '1d10', level: 1 });
      progression.hitDice.used['1d10'] = 1;

      expect(parseFormula('@{hit-dice:5}')).toBe('0');
    });

    it('should use context.resolveHitDice when provided (NPC context)', () => {
      const mockContext = {
        resolveHitDice: vi.fn((cost) => `${cost}d8`),
      };

      const result = parseFormula('@{hit-dice:2}', mockContext);
      
      expect(mockContext.resolveHitDice).toHaveBeenCalledWith(2);
      expect(result).toBe('2d8');
    });
  });

  describe('evaluateDiceFormula', () => {
    it('should resolve math inside parenthesis', () => {
      expect(evaluateDiceFormula('(2 + 3)d6')).toBe('5d6');
    });

    it('should handle attributes in the string via internal call', () => {
      const abilities = useAbilitiesStore();
      abilities.abilities.find((a) => a.label === 'strength')!.score = 16;

      expect(evaluateDiceFormula('@{strength-modifier}d6')).toBe('3d6');
    });
  });

  describe('parseFormulaAndEvaluate', () => {
    it('should perform full math evaluation', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Fighter', level: 2 });

      expect(parseFormulaAndEvaluate('10 + @{pb}')).toBe(12);
    });

    it('should handle complex operations', () => {
      const progression = useProgressionStore();
      progression.updateClass({ name: 'Fighter', level: 4 });

      expect(parseFormulaAndEvaluate('(@{level} * @{pb}) / 2')).toBe(4);
    });
  });

  describe('Integration with Effects', () => {
    it('formulas should reflect modified values from EffectsStore', () => {
      const abilities = useAbilitiesStore();
      const effects = useEffectsStore();

      const str = abilities.abilities.find((a) => a.label === 'strength')!;
      str.score = 10;

      effects.addEffect({
        label: 'Belt',
        enabled: true,
        effects: [
          { _id: '1', attribute: effectKeys['strength'], operation: 'add', value: 2, formula: '' },
        ],
      });

      // @ts-ignore
      expect(formulas.strength.value).toBe(12);
      // @ts-ignore
      expect(formulas['strength-modifier'].value).toBe(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    
    it('should handle evaluation errors inside parentheses by returning the match string', () => {
      const result = evaluateDiceFormula('(1+)d6');
      expect(result).toBe('0');
    });

    it('should log error and return "0" when dice parsing/evaluation fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = evaluateDiceFormula('invalid@#$');
      
      expect(result).toBe('0');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not evaluate dice formula'), 
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should return 0 when formula evaluation throws an error', () => {
      const result = parseFormulaAndEvaluate('1 + ');
      expect(result).toBe(0);
    });

    it('should handle Symbol and Prototype property access on formulas Proxy', () => {
      const sym = Symbol('test');
      // @ts-ignore
      expect(formulas[sym]).toBeUndefined();

      // @ts-ignore
      expect(formulas.toString).toBeDefined();
      // @ts-ignore
      expect(typeof formulas.toString).toBe('function');
      // @ts-ignore
      expect(formulas.valueOf).toBeDefined();
    });
  });
});
