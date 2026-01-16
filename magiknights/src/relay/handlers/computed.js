/**
 * Computed properties for token bar linkage
 * These functions allow token bars to be linked to character sheet attributes
 * such as HP (MKHP), MP, SHP, and Temp HP.
 */

/**
 * Helper function that applies a change to a value.
 * Supports relative changes (+5, -3) and absolute values.
 * @param {number} oldValue - The current value
 * @param {number|string} newValue - The new value or relative change
 * @returns {number} The final value after applying the change
 */
const applyChange = (oldValue, newValue) => {
  if (typeof newValue === 'string') newValue = newValue.trim();
  const operator = typeof newValue === 'string' ? newValue[0] : false;
  if (typeof newValue === 'string' && (operator === '-' || operator === '+')) {
    const intValue = parseInt(newValue.substring(1));
    if (isNaN(intValue)) return oldValue;
    if (operator === '+') return oldValue + intValue;
    if (operator === '-') return oldValue - intValue;
    return oldValue;
  } else {
    const intValue = typeof newValue === 'string' ? parseInt(newValue) : newValue;
    if (isNaN(intValue)) return oldValue;
    return intValue;
  }
};

/**
 * Get MKHP (Magi-Knight HP) values for token bar display
 * Returns current and max HP values
 */
export const getMKHP = ({ character }) => {
  if (!character.attributes?.hp) return {};
  const hp = character.attributes.hp;
  return {
    current: hp.current ?? 0,
    max: character.attributes.hp_max ?? hp.current ?? 0,
  };
};

/**
 * Set MKHP current value from token bar changes
 * Supports both absolute values and relative changes (+/-)
 */
export const setMKHP = ({ character, dispatch }, ...args) => {
  const newValue = args[0];
  const oldValue = character.attributes?.hp?.current ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);

  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        hp: {
          current: finalValue,
          temp: character.attributes?.hp?.temp ?? 0,
          max_override: character.attributes?.hp?.max_override ?? '',
        },
      },
    },
  });
};

/**
 * Get Temp HP values for token bar display
 * Returns only current value (temp HP has no max)
 */
export const getTempHP = ({ character }) => {
  if (!character.attributes?.hp) return {};
  return {
    current: character.attributes.hp.temp ?? 0,
  };
};

/**
 * Set Temp HP value from token bar changes
 * Supports both absolute values and relative changes (+/-)
 */
export const setTempHP = ({ character, dispatch }, ...args) => {
  const newValue = args[0];
  const oldValue = character.attributes?.hp?.temp ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);

  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        hp: {
          current: character.attributes?.hp?.current ?? 0,
          temp: finalValue,
          max_override: character.attributes?.hp?.max_override ?? '',
        },
      },
    },
  });
};

/**
 * Get SHP (Student HP) values for token bar display
 * Returns current and max SHP values
 */
export const getSHP = ({ character }) => {
  if (!character.attributes?.shp) return {};
  const shp = character.attributes.shp;
  return {
    current: shp.current ?? 0,
    max: character.attributes.shp_max ?? shp.current ?? 0,
  };
};

/**
 * Set SHP current value from token bar changes
 * Supports both absolute values and relative changes (+/-)
 */
export const setSHP = ({ character, dispatch }, ...args) => {
  const newValue = args[0];
  const oldValue = character.attributes?.shp?.current ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);

  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        shp: {
          current: finalValue,
          max_override: character.attributes?.shp?.max_override ?? '',
        },
      },
    },
  });
};

/**
 * Get MP (Magic Points) values for token bar display
 * Returns current and max MP values
 */
export const getMP = ({ character }) => {
  if (!character.attributes?.mp) return {};
  const mp = character.attributes.mp;
  return {
    current: mp.current ?? 0,
    max: character.attributes.mp_max ?? mp.current ?? 0,
  };
};

/**
 * Set MP current value from token bar changes
 * Supports both absolute values and relative changes (+/-)
 */
export const setMP = ({ character, dispatch }, ...args) => {
  const newValue = args[0];
  const oldValue = character.attributes?.mp?.current ?? 0;
  const characterId = character.id;
  const finalValue = applyChange(oldValue, newValue);

  dispatch.update({
    character: {
      id: characterId,
      attributes: {
        updateId: 'TOKENCHANGE',
        mp: {
          current: finalValue,
          max_override: character.attributes?.mp?.max_override ?? '',
        },
      },
    },
  });
};
