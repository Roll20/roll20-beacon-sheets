import { type AbilityKey, useAbilitiesStore } from './abilities/abilitiesStore';
import { useEffectsStore } from './modifiers/modifiersStore';
import { type HitDieSize, useProgressionStore } from './progression/progressionStore';
import { useCombatStore } from './combat/combatStore';
import { type EffectValue } from '@/effects.config';
import { computed, type ComputedRef } from 'vue';
import { config } from '@/config';
import { evaluate } from 'mathjs';
import { parse, serialize } from 'dice-notation';
import { useSpellsStore } from './spells/spellsStore';

export type FormulaKey =
  | EffectValue
  | 'strength-modifier'
  | 'dexterity-modifier'
  | 'constitution-modifier'
  | 'intelligence-modifier'
  | 'wisdom-modifier'
  | 'charisma-modifier'
  | 'initiative'
  | 'pb'
  | 'level'
  | 'spell-dc'
  | `${(typeof config.speeds)[number]}-speed`;

export type NpcFormulaContext = {
  resolveHitDice?: (cost: number) => string;
  variables?: Record<string, number>;
};

export const parseFormula = (formula: string, context?: NpcFormulaContext): string => {
  if (!formula) return '0';

  let valid = true;

  const parsed = formula.replace(/@\{([^}]+)\}/g, (match, rawAttr) => {
    const parts = rawAttr.split('|');
    const attributeKey = parts[0].trim();
    const rule = parts[1] ? parts[1].trim() : null;

    const hitDiceMatch = rawAttr.trim().match(/^hit-dice:(\d+)$/);
    if (hitDiceMatch) {
      const cost = parseInt(hitDiceMatch[1], 10);

      // Context Override for NPCs
      if (context?.resolveHitDice) {
        return context.resolveHitDice(cost);
      }

      const progression = useProgressionStore();
      
      const availableDice: Partial<Record<HitDieSize, number>> = {};
      const total = progression.getHitDice;
      
      config.hitDieSize.forEach(size => {
        const current = progression.hitDice.used[size] || 0;
        const max = total[size] || 0;
        availableDice[size] = Math.min(current, max);
      });

      // Greedy selection to sort descending
      const sizesDesc = [...config.hitDieSize].reverse(); 
      
      let remainingCost = cost;
      const parts: string[] = [];
      
      for (const size of sizesDesc) {
        if (remainingCost <= 0) break;
        const count = availableDice[size] || 0;
        
        if (count > 0) {
          const take = Math.min(count, remainingCost);
          const dieLabel = size.substring(1); // 1d8 -> d8
          parts.push(`${take}${dieLabel}`); 
          remainingCost -= take;
        }
      }
      
      if (remainingCost > 0) return '0';
      
      if (parts.length === 0) return '0';
      return parts.join('+');
    }

    let value: number | undefined;

    // Check npc context first
    if (context?.variables && attributeKey in context.variables) {
      value = context.variables[attributeKey];
    } else {
      // Fallback to global formulas
      const ref = formulas[attributeKey as FormulaKey];
      if (ref) {
        value = ref.value;
      }
    }

    if (value === undefined) {
      valid = false;
      return match;
    }

    if (rule) {
      const [operation, capValueStr] = rule.split(':');
      const capValue = parseInt(capValueStr, 10);

      if (!isNaN(capValue)) {
        if (operation.trim() === 'max') {
          value = Math.min(value, capValue);
        } else if (operation.trim() === 'min') {
          value = Math.max(value, capValue);
        }
      }
    }
    return String(value);
  });
  return valid ? parsed : '0';
};

export const evaluateDiceFormula = (diceString: string, context?: NpcFormulaContext): string => {
  if (!diceString || typeof diceString !== 'string') return '0';

  try {
    let resolvedFormula = parseFormula(diceString, context);

    let previousFormula = '';
    while (resolvedFormula !== previousFormula) {
      previousFormula = resolvedFormula;
      resolvedFormula = resolvedFormula.replace(/\(([^)]+)\)/g, (match, expression) => {
        try {
          return String(evaluate(expression));
        } catch {
          return match;
        }
      });
    }

    const parsedNotation = parse(resolvedFormula);
    const result = serialize(parsedNotation);
    
    if (result.includes('NaN')) return '0';
    return result;
  } catch (error) {
    console.error(`Could not evaluate dice formula: "${diceString}"`, error);
    return '0';
  }
};

export const parseFormulaAndEvaluate = (formula: string|number, context?: NpcFormulaContext): number => {
  if (typeof formula === 'number') return formula;
  const parsed = parseFormula(formula, context);
  // If parsed is not a valid mathematical expression, return '0'
  try {
    return evaluate(parsed);
  } catch {
    return 0;
  }
};

const getLevel = (): number => {
  const classes = useProgressionStore().classes;
  const level = Object.values(classes).reduce((level, cls) => level + (cls.level || 0), 0);
  return level;
};

const getPrimarySpellDC = (): number => {
  const spellsStore = useSpellsStore();
  if (spellsStore.sources.length > 0) {
    return spellsStore.getSourceDC(spellsStore.sources[0]._id).value.final;
  }
  return 8 + useProgressionStore().getProficiencyBonus;
};

const speedFormulas = Object.fromEntries(
  config.speeds.map((speed) => [
    `${speed}-speed`,
    computed(() => useCombatStore().getSpeed(speed).value.final),
  ]),
);

const getAbilityScore = (ability: AbilityKey): number => {
  const abilities = useAbilitiesStore().abilities;

  const existing = Object.values(abilities).find((ab) => ab.label === ability);
  return existing
    ? useEffectsStore().getModifiedValue(existing.score, ability, undefined).value.final
    : 0;
};

const getAbilityModifier = (ability: AbilityKey): number => {
  const score = getAbilityScore(ability);
  const modifier = score === 0 ? 0 : Math.ceil((score - 10) / 2);
  return modifier;
};

// export const formulas: Partial<Record<FormulaKey, ComputedRef<number>>> = {
//   level: computed(() => getLevel()),
//   pb: computed(() => {
//     const level = getLevel();
//     const pb = level === 0 ? 0 : Math.ceil(level / 4) + 1;
//     return useEffectsStore().getModifiedValue(pb, 'proficiency').value.final;
//   }),
//   ...Object.fromEntries(
//     config.abilities.map((ability) => [ability, computed(() => getAbilityScore(ability))]),
//   ),
//   ...Object.fromEntries(
//     config.abilities.map((ability) => [
//       `${ability}-modifier`,
//       computed(() => getAbilityModifier(ability)),
//     ]),
//   ),
//   ...speedFormulas,
// };

export const formulas = new Proxy<Partial<Record<FormulaKey, ComputedRef<number>>>>(
  {
    level: computed(() => getLevel()),
    pb: computed(() => {
      const level = getLevel();
      const pb = level === 0 ? 0 : Math.ceil(level / 4) + 1;
      return useEffectsStore().getModifiedValue(pb, 'proficiency').value.final;
    }),
    ...Object.fromEntries(
      config.abilities.map((ability) => [ability, computed(() => getAbilityScore(ability))]),
    ),
    ...Object.fromEntries(
      config.abilities.map((ability) => [
        `${ability}-modifier`,
        computed(() => getAbilityModifier(ability)),
      ]),
    ),
    'spell-dc': computed(() => getPrimarySpellDC()),

    ...speedFormulas,
  },
  {
    get(target, prop: string) {
      if (
        typeof prop === 'symbol' ||
        Object.prototype.hasOwnProperty.call(Object.prototype, prop)
      ) {
        return Reflect.get(target, prop);
      }

      if (prop in target) return target[prop as keyof typeof target];

      if (/^(.+)-level$/.test(prop)) {
        const existingClass = useProgressionStore().classes.find(
          (c) =>
            c.name.toLowerCase().replace(/ /g, '-') === prop.toLowerCase().replace(/-level$/g, ''),
        );
        const transformation = useProgressionStore().transformation;
        const existingTransformation = transformation && 
          transformation.name.toLowerCase().replace(/ /g, '-') === 
          prop.toLowerCase().replace(/-level$/g, '')
          ? transformation
          : undefined;
        if (existingClass) {
          return computed(() => existingClass.level || 1);
        }
        if (existingTransformation) {
          return computed(() => existingTransformation.level || 1);
        }
        return undefined;
      }

      return undefined;
    },
  },
);

/*
export const getProficiencyBonus = ({ character }: Context): number => {
  const level = getLevel({ character });
  const pb = level === 0
    ? 0
    : Math.ceil(level/4) + 1;
  return getModifiedValue(pb, 'proficiency', undefined, character);
};

export const getAbilityScore = ({ character }: Context, ability: AbilityKey):number => {
  const abilities = 
    !character.attributes?.abilities || 
    !character.attributes.abilities.hasOwnProperty('abilities') 
      ? {}
      : (character.attributes.abilities as AbilitiesHydrate).abilities;
  
  const existing = Object.values(abilities).find((ab) => ab.label === ability);
  return existing ? getModifiedValue(existing.score, ability, undefined, character) : 0;
};

export const getAbilityModifier = ({ character }: Context, ability: AbilityKey):number => {
  const score = getAbilityScore({ character }, ability);
  const modifier = score === 0
    ? 0
    : Math.ceil((score - 10) / 2);
  return modifier;
};

const getSkill = ({ character }: Context, skill: string): RankedProficiency | undefined => {
  const skills =
    !character.attributes?.proficiencies ||
    !character.attributes.proficiencies.hasOwnProperty('ranked')
      ? {}
      : (character.attributes.proficiencies as ProficienciesHydrate).ranked;

  const existing = Object.values(skills).find((s) => s.label === skill);
  return existing;
};

export const getSkillProficiency = ({ character }: Context, skill: string): number => {
  const existing = getSkill({ character }, skill); 
  if(!existing) return 0;

  const isAutomatic = existing.level === -1;
  if(isAutomatic) {
    return getModifiedValue(0, `${skill}-proficiency`, proficiencyLevelsValues, character);
  } else {
    return existing.level;
  }
};

export const getSkillModifier = ({ character }: Context, skill: string): number => {
  const existing = getSkill({ character }, skill); 
  if(!existing) return 0;

  const pb = getProficiencyBonus({ character });
  const proficiency = getSkillProficiency({ character }, skill);
  const abilityMod = getAbilityModifier({ character }, existing.ability);

  const baseMod = abilityMod + (pb * proficiency);
  return getModifiedValue(baseMod, `${skill}-modifier`, undefined, character);
};

export const getInitiative = ({ character }: Context) => getSkillModifier({ character }, 'initiative');
*/
