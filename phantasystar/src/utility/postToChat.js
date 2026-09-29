import { createRollTemplate } from '@/rollTemplates/index.js'
import { dispatchRef, initValues } from '@/relay/relay'
import { PUBLIC, cardNoteFor, postOptionsFor } from '@/utility/rollVisibility.js'

export default async (
  type,
  parameters,
  { visibility = PUBLIC, whisper = undefined, customDispatch } = {},
) => {
  const dispatch = customDispatch || dispatchRef.value
  const note = cardNoteFor(visibility)
  const content = createRollTemplate({
    type,
    parameters: note ? { ...parameters, whisperNote: note } : parameters,
  })
  await dispatch.post({
    characterId: initValues.character.id,
    content,
    options: whisper ? { whisper } : postOptionsFor(visibility),
  })
  return content
}
