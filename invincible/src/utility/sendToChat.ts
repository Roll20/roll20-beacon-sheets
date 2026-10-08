import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { CommonParameters } from '@/rolltemplates/rolltemplates';

export default async (args: CommonParameters, customDispatch?: Dispatch): Promise<void> => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch);

  
  const chatTemplate = createRollTemplate({
    type: 'chat', 
    parameters: args,
  });

  const whisper = args.visibility === 'gm' || args.visibility === 'secret' ? 'gm' : undefined;
  const secret = args.visibility === 'secret' ? true : (args.visibility === 'gm' ? false : undefined);

  
  await dispatch.post({
    characterId: initValues.character.id,
    content: chatTemplate,
    options: {
      whisper,
      secret,
    },
  });
};
