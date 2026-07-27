import { sharedSettings } from '@/relay/relay';
import { updateSharedData } from '@/utility/updateSharedData';

export const logRoll = async (characterId: string, rolldata: any, messageId: string, customDispatch?: any) => {
  try {
    let currentRollsStr = sharedSettings.value.rolls;
    let currentRolls: Record<string, any[]> = {};
    if (currentRollsStr && typeof currentRollsStr === 'string') {
      try {
        currentRolls = JSON.parse(currentRollsStr);
      } catch (e) {
        currentRolls = {};
      }
    } else if (currentRollsStr && typeof currentRollsStr === 'object') {
      currentRolls = currentRollsStr;
    }
    
    if (!currentRolls[characterId]) {
      currentRolls[characterId] = [];
    }
    
    currentRolls[characterId].push({ data: rolldata, messageId });
    
    
    if (currentRolls[characterId].length > 10) {
      currentRolls[characterId].shift(); 
    }
    
    
    await updateSharedData({ settings: { rolls: JSON.stringify(currentRolls) } }, customDispatch);
  } catch (err) {
    console.error('[logRoll] Error logging roll to shared settings:', err);
  }
};
