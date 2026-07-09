import getRollResult from '@/utility/getRollResult';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { RollParameters, DiceComponent } from '@/rolltemplates/rolltemplates';
import { logRoll } from '@/utility/logRoll';

function countSixes(results: string[] | undefined): number {
  if (!results) return 0;
  return results.filter(val => {
    if (val.includes('<del')) return false;
    const plainVal = val.replace(/<[^>]*>/g, '').trim();
    return plainVal === '6';
  }).length;
}

export function adjustActionRollPools(components: DiceComponent[]): DiceComponent[] {
  const groups = {
    action: components.filter(c => !c.isDamage),
    damage: components.filter(c => c.isDamage),
  };

  const processGroup = (groupComponents: DiceComponent[]) => {
    const d6PoolIndex = groupComponents.findIndex(
      c => c.rollFormula && /^\d+d6$/i.test(c.rollFormula.trim())
    );
    
    if (d6PoolIndex !== -1) {
      const d6Component = groupComponents[d6PoolIndex];
      const baseDiceCount = parseInt(d6Component.rollFormula!, 10);
      
      let modifierSum = 0;
      groupComponents.forEach((c, idx) => {
        if (idx !== d6PoolIndex && !c.rollFormula && !c.sides && typeof c.value === 'number') {
          modifierSum += c.value;
        }
      });
      
      const newDiceCount = Math.max(0, baseDiceCount + modifierSum);
      d6Component.rollFormula = `${newDiceCount}d6`;
    }
  };

  processGroup(groups.action);
  processGroup(groups.damage);

  return components;
}

export function buildBreakdownComponents(
  originalComponents: DiceComponent[],
  solvedComponents: DiceComponent[],
  resolvedComponents: DiceComponent[]
): DiceComponent[] {
  const breakdownComponents: DiceComponent[] = [];

  const processGroup = (isDamageGroup: boolean) => {
    const groupIndices = originalComponents
      .map((c, idx) => ({ c, idx }))
      .filter(item => !item.c.isDamage === !isDamageGroup)
      .map(item => item.idx);
    
    if (groupIndices.length === 0) return;
    
    const d6PoolIndices = groupIndices.filter(idx => {
      const c = originalComponents[idx];
      return !!(c.rollFormula && /^\d+d6$/i.test(c.rollFormula.trim()));
    });
    
    
    groupIndices.forEach(idx => {
      const component = originalComponents[idx];
      if (d6PoolIndices.includes(idx)) {
        const baseDiceCount = parseInt(component.rollFormula!, 10);
        breakdownComponents.push({
          label: component.label || 'Base',
          value: baseDiceCount,
          alwaysShowInBreakdown: true,
          isDamage: isDamageGroup,
        });
      } else {
        const solvedComp = solvedComponents[idx];
        breakdownComponents.push({
          ...solvedComp,
          value: component.value,
          alwaysShowInBreakdown: true,
        });
      }
    });
    
    
    if (d6PoolIndices.length > 0) {
      let totalD6Count = 0;
      let totalSolvedValue = 0;
      const combinedRolledDice: string[] = [];
      const combinedRawResults: number[] = [];
      
      d6PoolIndices.forEach(idx => {
        const solvedD6 = solvedComponents[idx];
        if (solvedD6.rolledDice) {
          totalD6Count += solvedD6.rolledDice.length;
          combinedRolledDice.push(...solvedD6.rolledDice);
        }
        if (solvedD6.rawResults) {
          combinedRawResults.push(...solvedD6.rawResults);
        }
        totalSolvedValue += (solvedD6.value ?? 0);
      });
      
      
      let modifierSum = 0;
      groupIndices.forEach(idx => {
        const c = originalComponents[idx];
        if (!d6PoolIndices.includes(idx) && !c.rollFormula && !c.sides && typeof c.value === 'number') {
          modifierSum += c.value;
        }
      });
      
      let baseDiceSum = 0;
      d6PoolIndices.forEach(idx => {
        const c = originalComponents[idx];
        baseDiceSum += parseInt(c.rollFormula!, 10);
      });
      
      const finalDiceCount = Math.max(0, baseDiceSum + modifierSum);
      
      const plainDiceList = combinedRolledDice.map(val => val.replace(/<[^>]*>/g, '').trim());
      
      const formattedRolledDice = combinedRolledDice.map(val => {
        const plainVal = parseInt(val.replace(/<[^>]*>/g, '').trim(), 10);
        if (isNaN(plainVal)) return val;
        
        const isPushable = plainVal >= 2 && plainVal <= 5;
        let classes = [];
        if (isPushable) classes.push('pushable', 'transition-colors', 'duration-200');
        
        if (classes.length > 0) {
          return `<span class="${classes.join(' ')}">${plainVal}</span>`;
        }
        return `<span>${plainVal}</span>`;
      });
      
      breakdownComponents.push({
        sides: 6,
        label: `Rolls (${finalDiceCount}d6)`,
        value: totalSolvedValue,
        rolledDice: formattedRolledDice,
        rolledDiceTooltip: `Rolls: ${plainDiceList.join(', ')}`,
        alwaysShowInBreakdown: true,
        isDamage: isDamageGroup,
        rawResults: combinedRawResults,
      });
    }
  };

  processGroup(false); 
  processGroup(true);  

  return breakdownComponents;
}

export const actionRollSolver = async (args: RollParameters, customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch);

  
  const flatComponents = Array.isArray(args.components) ? args.components : Object.values(args.components).flat();
  
  
  const clonedComponents = flatComponents.map(c => ({ ...c }));
  adjustActionRollPools(clonedComponents);

  const { components: resolvedComponents } = await getRollResult(clonedComponents, dispatch);

  
  
  
  const solvedComponents = resolvedComponents.map((component): DiceComponent => {
    const isD6 = component.sides === 6;
    
    let solvedValue = 0;
    if (isD6) {
      if (component.rolledDice && component.rolledDice.length > 0) {
        solvedValue = countSixes(component.rolledDice);
      } else if (component.value !== undefined) {
        
        solvedValue = component.value === 6 ? 1 : 0;
      }
    }

    return {
      ...component,
      value: solvedValue,
      alwaysShowInBreakdown: true,
    };
  });

  
  const solvedTotal = solvedComponents.reduce((sum, c) => sum + (c.value ?? 0), 0);

  
  const breakdownComponents = buildBreakdownComponents(
    flatComponents,
    solvedComponents,
    resolvedComponents
  );

  
  const rollTemplate = createRollTemplate({
    type: 'roll',
    parameters: {
      ...args,
      characterId: initValues.character.id,
      rollTemplate: args.rollTemplate || 'successRoll',
      components: breakdownComponents,
      totalSuccesses: solvedTotal,
    },
  });

  const whisper = args.visibility === 'gm' || args.visibility === 'secret' ? 'gm' : undefined;
  const secret = args.visibility === 'secret' ? true : (args.visibility === 'gm' ? false : undefined);

  
  const messageId = await dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper,
      secret,
    },
  });

  if (messageId) {
    await logRoll(initValues.character.id, { ...args, components: breakdownComponents, totalSuccesses: solvedTotal }, messageId);
  }

  return solvedTotal;
};

export const actionDamageRollSolver = async (args: RollParameters, customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch);

  
  let flatInput: DiceComponent[] = [];
  if (Array.isArray(args.components)) {
    flatInput = args.components;
  } else {
    if (args.components.action) {
      flatInput.push(...args.components.action);
    }
    if (args.components.damage) {
      flatInput.push(...args.components.damage.map(c => ({ ...c, isDamage: true })));
    }
    for (const key of Object.keys(args.components)) {
      if (key !== 'action' && key !== 'damage') {
        flatInput.push(...args.components[key]);
      }
    }
  }

  
  const clonedComponents = flatInput.map(c => ({ ...c }));
  adjustActionRollPools(clonedComponents);

  
  const { components: resolvedComponents } = await getRollResult(clonedComponents, dispatch);

  
  
  
  const solvedComponents = resolvedComponents.map((component): DiceComponent => {
    if (component.isDamage) {
      return {
        ...component,
        alwaysShowInBreakdown: true,
      };
    }

    const isD6 = component.sides === 6;
    let solvedValue = 0;
    if (isD6) {
      if (component.rolledDice && component.rolledDice.length > 0) {
        solvedValue = countSixes(component.rolledDice);
      } else if (component.value !== undefined) {
        solvedValue = component.value === 6 ? 1 : 0;
      }
    }

    return {
      ...component,
      value: solvedValue,
      alwaysShowInBreakdown: true,
    };
  });

  
  const totalSuccesses = solvedComponents
    .filter(c => !c.isDamage)
    .reduce((sum, c) => sum + (c.value ?? 0), 0);

  const totalDamage = solvedComponents
    .filter(c => c.isDamage)
    .reduce((sum, c) => sum + (c.value ?? 0), 0);

  
  const breakdownComponents = buildBreakdownComponents(
    flatInput,
    solvedComponents,
    resolvedComponents
  );

  
  const rollTemplate = createRollTemplate({
    type: 'roll',
    parameters: {
      ...args,
      characterId: initValues.character.id,
      rollTemplate: args.rollTemplate || 'actionDamageRoll',
      components: breakdownComponents,
      totalSuccesses,
      totalDamage,
    },
  });

  const whisper = args.visibility === 'gm' || args.visibility === 'secret' ? 'gm' : undefined;
  const secret = args.visibility === 'secret' ? true : (args.visibility === 'gm' ? false : undefined);

  
  const messageId = await dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper,
      secret,
    },
  });

  if (messageId) {
    await logRoll(initValues.character.id, { ...args, components: breakdownComponents, totalSuccesses, totalDamage }, messageId);
  }

  return { successes: totalSuccesses, damage: totalDamage };
};
