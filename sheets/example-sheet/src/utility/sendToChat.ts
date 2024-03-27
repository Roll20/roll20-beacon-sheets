import { createRollTemplate, type SendToChatTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20/beacon-sdk';
.
export default async (args: SendToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const { characterName, title, subtitle, keyValues, textContent, traits } = args;
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions
  const rollTemplate = createRollTemplate({
    type: 'chat',
    parameters: {
      characterName,
      title,
      subtitle,
      traits,
      keyValues,
      textContent,
    },
  });
  return dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper: undefined,
    },
  });
};
