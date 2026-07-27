import type { InitArgs, SharedSettingsChangeArgs, Character, Dispatch } from '@roll20-official/beacon-sdk';
import { initValues, beaconPulse, sharedSettings, isHeadlessRef } from '../relay';
import { logger } from '@/utility/logger';
import { drag } from '@/relay/handlers/drop';
import { ruleSets } from '@/system';
import { objectToArray, arrayToObject } from '@/utility/objectify';
import { performCriticalInjuryRoll } from '@/system/injuries/criticalInjuries';

export const onInit = ({ character, settings, compendiumDropData, sharedSettings: initialSharedSettings }: InitArgs, dispatch: Dispatch) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  sharedSettings.value = initialSharedSettings ?? {};

  logger.log('onInit -> Sheet Relay');
};

export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value; 
  beaconPulse.value = old + 1;
  logger.log('onChange -> Sheet Relay', character);
};

export const onSettingsChange = () => { };

export const onSharedSettingsChange = (args?: SharedSettingsChangeArgs) => {
  if (isHeadlessRef.value) return;
  sharedSettings.value = { ...sharedSettings.value, ...(args?.settings ?? {}) };
};

export const onTranslationsRequest = () => ({});

export const onDragOver = () => {};

export const onDropOver = drag;

const applyChange = (oldValue: number, newValue: string | number): number => {
  const valStr = String(newValue).trim();
  const isAdd = valStr.startsWith('+');
  const isSub = valStr.startsWith('-');
  
  if (isAdd || isSub) {
    const offset = Number(valStr.slice(1).trim());
    const offsetNum = isNaN(offset) ? 0 : offset;
    return isAdd ? oldValue + offsetNum : oldValue - offsetNum;
  }
  
  const num = Number(valStr);
  return isNaN(num) ? 0 : num;
};

export const setHealth = async (
  {
    character,
    dispatch,
  }: {
    character: Character;
    dispatch: Dispatch;
  },
  ...args: any[]
) => {
  const newValue = args[0];
  const oldValue = Number(ruleSets.health(character)) || 0;
  const maxVal = Number(ruleSets.health_max(character).value);
  const max = isNaN(maxVal) ? 10 : maxVal;
  
  const targetVal = applyChange(oldValue, newValue);
  const clampedVal = Math.min(max, Math.max(0, targetVal));
  const finalValue = String(isNaN(clampedVal) ? 0 : clampedVal);
  
  const characterId = character.id;
  const existingCombat = (character.attributes?.combat || {}) as Record<string, any>;
  
  let updatedInjuries = existingCombat.criticalInjuries;
  if (targetVal < oldValue && targetVal <= 0) {
    try {
      const excessDamage = targetVal < 0 ? Math.abs(targetVal) : 0;
      const currentInjuriesArray = objectToArray(existingCombat.criticalInjuries || {});
      const newInjuriesArray = await performCriticalInjuryRoll({
        dispatch,
        characterName: character.name || 'Character',
        characterId,
        currentInjuries: currentInjuriesArray,
        modifier: excessDamage,
      });
      updatedInjuries = arrayToObject(newInjuriesArray as any);
    } catch (err) {
      console.error('[setHealth] Failed to roll critical injury:', err);
    }
  }

  const combatUpdate: Record<string, any> = {
    ...existingCombat,
    health: finalValue,
  };
  if (updatedInjuries !== undefined) {
    combatUpdate.criticalInjuries = updatedInjuries;
  }

  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        combat: combatUpdate,
      },
    },
  });
};

export const setResolve = (
  {
    character,
    dispatch,
  }: {
    character: Character;
    dispatch: Dispatch;
  },
  ...args: any[]
) => {
  const newValue = args[0];
  const oldValue = Number(ruleSets.resolve(character)) || 0;
  const maxVal = Number(ruleSets.resolve_max(character).value);
  const max = isNaN(maxVal) ? 10 : maxVal;
  
  const targetVal = applyChange(oldValue, newValue);
  const clampedVal = Math.min(max, Math.max(0, targetVal));
  const finalValue = String(isNaN(clampedVal) ? 0 : clampedVal);
  
  const characterId = character.id;
  const existingCombat = (character.attributes?.combat || {}) as Record<string, any>;
  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        combat: {
          ...existingCombat,
          resolve: finalValue,
        }
      },
    },
  });
};

