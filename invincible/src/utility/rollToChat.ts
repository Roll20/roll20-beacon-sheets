import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { RollParameters } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';
import { logRoll } from '@/utility/logRoll';

export default async (args: RollParameters, customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); 
  
  const flatComponents = Array.isArray(args.components) ? args.components : Object.values(args.components).flat();
  const { components: resolvedComponents, total } = await getRollResult(flatComponents, dispatch);

  
  const rollTemplate = createRollTemplate({
    type: 'roll', 
    parameters: {
      ...args,
      components: resolvedComponents,
    },
  });

  const whisper = args.visibility === 'gm' || args.visibility === 'secret' ? 'gm' : undefined;
  const secret = args.visibility === 'secret' ? true : (args.visibility === 'gm' ? false : undefined);

  
  const messageId = await dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper,
      secret,
    },
  });

  if (messageId) {
    await logRoll(initValues.character.id, { ...args, components: resolvedComponents, total }, messageId);
  }

  return total;
};
