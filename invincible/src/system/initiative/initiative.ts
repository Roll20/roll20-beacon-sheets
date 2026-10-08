export interface InitiativeEntry {
  timestamp: number;
  initiative: number[];
  avatar?: string;
  name?: string;
}

export type InitiativeMap = Record<string, InitiativeEntry>;

export interface RollInfo {
  charId: string;
  value: number;
  timestamp: number;
  index: number;
}

export function isEarlier(a: RollInfo, b: RollInfo): boolean {
  if (a.timestamp !== b.timestamp) {
    return a.timestamp < b.timestamp;
  }
  if (a.charId !== b.charId) {
    return a.charId < b.charId;
  }
  return a.index < b.index;
}

export async function rollInitiativeAction(
  myCharId: string,
  currentInitiativeMap: InitiativeMap,
  dispatch: any,
  avatar?: string,
  name?: string
): Promise<InitiativeMap> {
  const initMap = { ...currentInitiativeMap };
  const takenValues = new Set<number>();
  
  
  for (const [charId, data] of Object.entries(initMap)) {
    if (data && Array.isArray(data.initiative)) {
      data.initiative.forEach(val => takenValues.add(val));
    }
  }

  
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const remainingNumbers = allNumbers.filter(num => !takenValues.has(num));

  let rolledValue = 0;
  if (remainingNumbers.length > 0) {
    const X = remainingNumbers.length;
    let rolledIndex = 0;
    if (dispatch && typeof dispatch.roll === 'function') {
      try {
        const res = await dispatch.roll({ rolls: { init: `1d${X}` } });
        const rollVal = res.results.init.results.result;
        rolledIndex = rollVal - 1;
      } catch (err) {
        console.error('[initiative] Failed to roll via SDK, using fallback:', err);
        rolledIndex = Math.floor(Math.random() * X);
      }
    } else {
      rolledIndex = Math.floor(Math.random() * X);
    }
    rolledValue = remainingNumbers[rolledIndex];
  } else {
    
    if (dispatch && typeof dispatch.roll === 'function') {
      try {
        const res = await dispatch.roll({ rolls: { init: '1d10' } });
        rolledValue = res.results.init.results.result;
      } catch (err) {
        rolledValue = Math.floor(Math.random() * 10) + 1;
      }
    } else {
      rolledValue = Math.floor(Math.random() * 10) + 1;
    }
  }

  const currentInitData = initMap[myCharId] || { initiative: [] };
  const currentList = Array.isArray(currentInitData.initiative) ? [...currentInitData.initiative] : [];
  currentList.push(rolledValue);

  initMap[myCharId] = {
    timestamp: Date.now(),
    initiative: currentList,
    avatar: avatar || currentInitData.avatar,
    name: name || currentInitData.name
  };

  return initMap;
}

export function clearInitiativeAction(
  myCharId: string,
  currentInitiativeMap: InitiativeMap
): InitiativeMap {
  const initMap = { ...currentInitiativeMap };
  delete initMap[myCharId];
  return initMap;
}

export async function resolveDuplicatesAction(
  myCharId: string,
  currentInitiativeMap: InitiativeMap,
  dispatch: any
): Promise<{ changed: boolean; updatedMap: InitiativeMap }> {
  const initMap = { ...currentInitiativeMap };
  const myData = initMap[myCharId];
  if (!myData || !Array.isArray(myData.initiative) || myData.initiative.length === 0) {
    return { changed: false, updatedMap: initMap };
  }

  const myList = [...myData.initiative];
  const myTimestamp = myData.timestamp || 0;

  
  const allRolls: RollInfo[] = [];
  for (const [charId, data] of Object.entries(initMap)) {
    if (data && Array.isArray(data.initiative)) {
      const list = data.initiative;
      const ts = data.timestamp || 0;
      list.forEach((val, idx) => {
        allRolls.push({
          charId,
          value: val,
          timestamp: ts,
          index: idx
        });
      });
    }
  }

  let changed = false;

  for (let i = 0; i < myList.length; i++) {
    const myVal = myList[i];
    const myRollInfo: RollInfo = {
      charId: myCharId,
      value: myVal,
      timestamp: myTimestamp,
      index: i
    };

    
    const hasEarlierConflict = allRolls.some(other =>
      other.value === myVal &&
      (other.charId !== myCharId || other.index !== i) &&
      isEarlier(other, myRollInfo)
    );

    if (hasEarlierConflict) {
      
      const takenValues = new Set<number>();
      allRolls.forEach(roll => {
        const rollInfo: RollInfo = {
          charId: roll.charId,
          value: roll.value,
          timestamp: roll.timestamp,
          index: roll.index
        };
        if (isEarlier(rollInfo, myRollInfo) || (roll.charId === myCharId && roll.index !== i)) {
          takenValues.add(roll.value);
        }
      });

      
      const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const remainingNumbers = allNumbers.filter(num => !takenValues.has(num));

      let newValue = 0;
      if (remainingNumbers.length > 0) {
        const X = remainingNumbers.length;
        let rolledIndex = 0;
        if (dispatch && typeof dispatch.roll === 'function') {
          try {
            const res = await dispatch.roll({ rolls: { init: `1d${X}` } });
            const rollVal = res.results.init.results.result;
            rolledIndex = rollVal - 1;
          } catch (err) {
            console.error('[initiative] Failed to reroll via SDK:', err);
            rolledIndex = Math.floor(Math.random() * X);
          }
        } else {
          rolledIndex = Math.floor(Math.random() * X);
        }
        newValue = remainingNumbers[rolledIndex];
      } else {
        if (dispatch && typeof dispatch.roll === 'function') {
          try {
            const res = await dispatch.roll({ rolls: { init: '1d10' } });
            newValue = res.results.init.results.result;
          } catch (err) {
            newValue = Math.floor(Math.random() * 10) + 1;
          }
        } else {
          newValue = Math.floor(Math.random() * 10) + 1;
        }
      }

      myList[i] = newValue;
      changed = true;

      
      const existingIdx = allRolls.findIndex(r => r.charId === myCharId && r.index === i);
      if (existingIdx !== -1) {
        allRolls[existingIdx].value = newValue;
      }
    }
  }

  if (changed) {
    initMap[myCharId] = {
      timestamp: myTimestamp, 
      initiative: myList,
      avatar: myData.avatar,
      name: myData.name
    };
  }

  return { changed, updatedMap: initMap };
}
