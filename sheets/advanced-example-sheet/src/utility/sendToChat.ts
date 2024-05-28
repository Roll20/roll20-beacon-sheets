import { createRollTemplate, type SendToChatTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';

/* Example function for sending a text message to chat with no rolls involved, using a template */
export default async (args: SendToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const { characterName, title, subtitle, keyValues, textContent, traits } = args;
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions
  // Pass in all the data to generate the template HTML with Handlebars.
  const rollTemplate = createRollTemplate({
    type: 'chat', // We use the "chat" template.
    parameters: {
      characterName,
      title,
      subtitle,
      traits,
      keyValues,
      textContent,
    },
  });
  // Post template into Chat.
  return dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper: undefined,
    },
  });
};
