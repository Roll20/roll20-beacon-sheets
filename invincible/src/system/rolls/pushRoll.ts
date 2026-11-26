import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import { sharedSettings, storeRef, latestLocalUpdateId } from '@/relay/relay';
import { v4 as uuidv4 } from 'uuid';
import { updateSharedData } from '@/utility/updateSharedData';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';
import { logRoll } from '@/utility/logRoll';
import { ruleSets } from '@/system';

export const handlePushRoll = async (originalRollId: string, characterId: string, dispatch: Dispatch, store: any = null) => {
  if (!characterId) {
    console.error('[pushRoll] No characterId provided to push_roll.');
    return;
  }

  
  let character: Character;
  try {
    character = await dispatch.subscribe({ characterId });
  } catch (error) {
    console.error('[pushRoll] Failed to subscribe to character:', error);
    return;
  }

  if (!character) {
    console.error('[pushRoll] character not found in dispatch for id:', characterId);
    return;
  }

  let currentResolve;
  if (store && store.combat && store.combat.resolve !== undefined) {
    
    currentResolve = store.combat.resolve;
  } else {
    
    currentResolve = character.attributes.combat?.resolve;
  }
  
  if (currentResolve === undefined) {
    const calculatedMax = ruleSets.resolve_max(character).value;
    currentResolve = calculatedMax > 0 ? calculatedMax : 2;
  }

  console.log('[pushRoll] Computed Resolve:', currentResolve);

  if (currentResolve <= 0) {
    console.warn('[pushRoll] Cannot push roll, Resolve is empty.');
    return;
  }

  const rollsStr = sharedSettings.value.rolls;
  if (!rollsStr) return;

  let rolls: Record<string, any[]> = {};
  try {
    rolls = typeof rollsStr === 'string' ? JSON.parse(rollsStr) : rollsStr;
  } catch (e) {
    return;
  }

  const characterRolls = rolls[character.id];
  if (!characterRolls) return;

  const originalRoll = characterRolls.find(r => r.messageId === originalRollId);
  if (!originalRoll) {
    console.error(`[pushRoll] Could not find roll with messageId: ${originalRollId}`);
    return;
  }

  const originalData = originalRoll.data;
  if (!originalData || !originalData.components) {
    console.error(`[pushRoll] originalData or components missing for roll: ${originalRollId}`);
    return;
  }

  let isDamage = false;

  const flatComponents = Array.isArray(originalData.components) ? originalData.components : Object.values(originalData.components).flat();
  
  let targetComponent = flatComponents.find(c => c.sides === 6 && c.rawResults);
  if (!targetComponent) {
    console.error(`[pushRoll] targetComponent (d6) missing in roll: ${originalRollId}`);
    return;
  }

  isDamage = !!targetComponent.isDamage;
  const originalRaw = targetComponent.rawResults;

  let rerollIndices: number[] = [];
  for (let i = 0; i < originalRaw.length; i++) {
    const r = originalRaw[i];
    const val = typeof r === 'object' ? r.value : r;
    if (val >= 2 && val <= 5) {
      rerollIndices.push(i);
    }
  }

  if (rerollIndices.length === 0) {
    console.warn('[pushRoll] No dice available to push.');
    return;
  }

  
  const { components: resolvedComponents } = await getRollResult([{ sides: 6, count: rerollIndices.length }], dispatch);
  const newRolls = resolvedComponents[0]?.rawResults || [];
  
  
  let newOnes = 0;
  for (const res of newRolls) {
    if (res === 1) {
      newOnes++;
    }
  }

  
  if (newOnes > 0) {
    const newResolve = Math.max(0, currentResolve - newOnes);
    
    
    try {
      if (store && typeof store.setValue === 'function') {
        store.setValue('combat.resolve', newResolve);
      } else if (store && store.combat) {
        store.combat.resolve = newResolve;
      }
    } catch (e) {
      console.warn('[pushRoll] UI update skipped.', e);
    }

    
    
    
    
    const newUpdateId = uuidv4();
    if (latestLocalUpdateId) {
      latestLocalUpdateId.value = newUpdateId;
    }

    const newAttributes = {
      ...character.attributes,
      updateId: newUpdateId,
      combat: {
        ...(character.attributes.combat || {}),
        resolve: newResolve
      }
    };

    if (typeof dispatch.updateCharacter === 'function') {
      dispatch.updateCharacter({ 
        character: { 
          id: characterId, 
          attributes: newAttributes
        } 
      });
    }
  }

  
  const combinedRaw = [...originalRaw];
  let newRollsIndex = 0;

  for (let i = 0; i < combinedRaw.length; i++) {
    const r = combinedRaw[i];
    const val = typeof r === 'object' ? r.value : r;
    if (val >= 2 && val <= 5) {
      const newVal = newRolls[newRollsIndex++];
      combinedRaw[i] = { value: newVal, pushed: true };
    }
  }

  const combinedStrings = combinedRaw.map(r => {
    const val = typeof r === 'object' ? r.value : r;
    const isPushed = typeof r === 'object' && r.pushed;
    const isPushable = val >= 2 && val <= 5;
    
    let classes = [];
    if (isPushable) classes.push('pushable', 'transition-colors', 'duration-200');
    if (isPushed) classes.push('pushed', 'underline');
    if (val === 1) classes.push('failure');
    
    if (classes.length > 0) {
      return `<span class="${classes.join(' ')}">${val}</span>`;
    }
    return `<span>${val}</span>`;
  });

  const rawValues = combinedRaw.map(r => typeof r === 'object' ? r.value : r);
  let totalValue = rawValues.filter(v => v === 6).length;

  const newBreakdown = flatComponents.map(c => {
    if (c.sides === 6 && c.rawResults) {
      return {
        ...c,
        value: totalValue,
        rolledDice: combinedStrings,
        rolledDiceTooltip: `Rolls: ${rawValues.join(', ')}`,
        rawResults: combinedRaw,
      };
    }
    return c;
  });

  const rollTemplate = createRollTemplate({
    type: 'roll',
    parameters: {
      ...originalData,
      characterId: character.id,
      title: 'Push Roll',
      subtitle: originalData.title === 'Push Roll' ? (originalData.subtitle || '') : (originalData.title || ''),
      rollTemplate: originalData.rollTemplate || 'successRoll',
      components: newBreakdown,
      totalSuccesses: !isDamage ? totalValue : undefined,
      totalDamage: isDamage ? totalValue : undefined,
    }
  });

  const whisper = originalData.visibility === 'gm' || originalData.visibility === 'secret' ? 'gm' : undefined;
  const secret = originalData.visibility === 'secret' ? true : (originalData.visibility === 'gm' ? false : undefined);

  const messageId = await dispatch.post({
    characterId: character.id,
    content: rollTemplate,
    options: { whisper, secret },
  });

  if (messageId) {
    await logRoll(character.id, {
      ...originalData,
      title: 'Push Roll',
      subtitle: originalData.title === 'Push Roll' ? (originalData.subtitle || '') : (originalData.title || ''),
      rollTemplate: originalData.rollTemplate || 'successRoll',
      components: newBreakdown,
      totalSuccesses: !isDamage ? totalValue : undefined,
      totalDamage: isDamage ? totalValue : undefined,
    }, messageId, dispatch);
  }
};
