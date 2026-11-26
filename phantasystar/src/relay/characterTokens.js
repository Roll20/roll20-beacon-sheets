import { initValues, dispatchRef } from './relay.js'

export const updateCharacterTokens = async (token) => {
  const characterId = initValues.character?.id
  const dispatch = dispatchRef.value
  if (!characterId || typeof dispatch?.updateTokensByCharacter !== 'function') return false
  try {
    await dispatch.updateTokensByCharacter({ characterId, token })
    return true
  } catch {
    return false
  }
}
