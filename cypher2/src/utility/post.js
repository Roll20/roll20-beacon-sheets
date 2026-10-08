import { dispatchRef, initValues } from '@/relay/relay.js'

// Visibility is an ARGUMENT, not a store read. post() is shared by the roll cards
// and the item cards, and only the item cards are governed by ui.whisperItemCards
// (item-contents spec §5) — a branch that read the flag in here would silence rolls
// too, and every existing caller would keep compiling.
export const post = (content, { whisper = false } = {}) =>
  dispatchRef.value.post({
    characterId: initValues.character.id,
    content,
    options: { whisper: whisper ? 'gm' : undefined }
  })
