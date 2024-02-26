import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20/charsheet-relay-sdk';
import type { RollToChatTemplate } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';

export default async (args: RollToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions

  const { components, total } = await getRollResult(args.components);

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
