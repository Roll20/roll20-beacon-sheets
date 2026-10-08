import { dispatchRef, sharedSettings } from '@/relay/relay';

const getValidCharacterIds = async (dispatch: any): Promise<Set<string>> => {
  if (!dispatch || typeof dispatch.getAvailableCharacters !== 'function') {
    return new Set();
  }
  try {
    const available = await dispatch.getAvailableCharacters();
    if (!available) return new Set();

    let validIds: string[] = [];

    
    if (Array.isArray(available)) {
      validIds = available.map(c => c.id || c._id);
    } else if (Array.isArray(available.characters)) {
      validIds = available.characters.map((c: any) => c.id || c._id);
    } else if (Array.isArray(available.results)) {
      validIds = available.results.map((c: any) => c.id || c._id);
    } else if (typeof available === 'object') {
      validIds = Object.keys(available).filter(k => k !== 'type' && k !== 'requestId');
    }

    return new Set(validIds.filter(Boolean));
  } catch (err) {
    console.warn('[updateSharedData] Failed to get available characters:', err);
    return new Set();
  }
};

export const updateSharedData = async (payload: { settings: Record<string, string> }, customDispatch?: any) => {
  const dispatch = customDispatch || dispatchRef.value;
  if (!dispatch || typeof dispatch.updateSharedSettings !== 'function') return;

  const validIds = await getValidCharacterIds(dispatch);
  if (validIds.size === 0) {
    
    return dispatch.updateSharedSettings(payload);
  }

  const cleanedSettings: Record<string, string> = { ...payload.settings };
  let localSharedSettingsUpdate: Record<string, any> = {};

  
  if (cleanedSettings.initiative) {
    try {
      const initMap = JSON.parse(cleanedSettings.initiative);
      let changed = false;
      for (const charId of Object.keys(initMap)) {
        if (!validIds.has(charId)) {
          delete initMap[charId];
          changed = true;
        }
      }
      if (changed) {
        cleanedSettings.initiative = JSON.stringify(initMap);
        localSharedSettingsUpdate.initiative = initMap;
      }
    } catch (e) {
      
    }
  }

  
  if (cleanedSettings.rolls) {
    try {
      const rollsMap = JSON.parse(cleanedSettings.rolls);
      let changed = false;
      for (const charId of Object.keys(rollsMap)) {
        if (!validIds.has(charId)) {
          delete rollsMap[charId];
          changed = true;
        }
      }
      if (changed) {
        cleanedSettings.rolls = JSON.stringify(rollsMap);
        localSharedSettingsUpdate.rolls = rollsMap;
      }
    } catch (e) {
      
    }
  }

  
  if (cleanedSettings.teams) {
    try {
      const teamsArr = JSON.parse(cleanedSettings.teams);
      let changed = false;
      if (Array.isArray(teamsArr)) {
        for (const team of teamsArr) {
          if (team.members && Array.isArray(team.members)) {
            const originalLength = team.members.length;
            team.members = team.members.filter((m: any) => validIds.has(m._id || m.id));
            if (team.members.length !== originalLength) changed = true;
          }
        }
      }
      if (changed) {
        cleanedSettings.teams = JSON.stringify(teamsArr);
        localSharedSettingsUpdate.teams = teamsArr;
      }
    } catch (e) {
      
    }
  }

  
  if (Object.keys(localSharedSettingsUpdate).length > 0) {
    sharedSettings.value = { ...sharedSettings.value, ...localSharedSettingsUpdate };
  }

  return dispatch.updateSharedSettings({ settings: cleanedSettings });
};
