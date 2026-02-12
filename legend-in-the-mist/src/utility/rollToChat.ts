import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { RollToChatTemplate } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';

export default async (args: RollToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch);
  const { components, total } = await getRollResult(args.components, dispatch);

  const rollTemplate = createRollTemplate({
    type: 'roll',
    parameters: {
      ...args,
      components,
    },
  });

  await dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper: undefined,
      secret: undefined,
    },
  });

  return total;
};
