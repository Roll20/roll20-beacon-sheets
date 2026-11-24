import { dispatchRef, initValues } from '@/relay/relay.js'

// Visibility is an ARGUMENT, not a store read. post() is shared by the roll cards
// and the item cards, and only the item cards are governed by ui.whisperItemCards
// (item-contents spec §5) — a branch that read the flag in here would silence rolls
// too, and every existing caller would keep compiling.
//
// messageId: a card that reports dice must pass the id dispatch.roll() returned.
// Roll20 animates 3D dice only for the message posted under the roll's own id
// (ddd-g93x). Cards with no dice behind them leave it out and the SDK mints one.
export const post = (content, { whisper = false, messageId } = {}) =>
  dispatchRef.value.post({
    ...(messageId && { messageId }),
    characterId: initValues.character.id,
    content,
    options: { whisper: whisper ? 'gm' : undefined }
  })
