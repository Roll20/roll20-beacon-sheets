import { createRollTemplate, type SendToChatTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';

export default async (args: SendToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const { characterName, title } = args;
  const dispatch = customDispatch || (dispatchRef.value as Dispatch);

  const rollTemplate = createRollTemplate({
    type: 'chat',
    parameters: {
      characterName,
      title
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
