import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { RollToChatTemplate } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';

/* Example function for Rolling a basic check and showing the roll template. */
export default async (args: RollToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions
  // Use Beacon to make the rolls and calculations. We end up with a Roll Result.
  const { components, total, resultType, naturalRoll, confirmationRoll } = await getRollResult(
    args.components,
    dispatch,
    args.allowCrit || false,
  );

  // Pass in the roll result to Handlebars and get HTML to render the roll template
  const rollTemplate = createRollTemplate({
    type: 'roll', // We have 2 roll templates, "roll" and "chat". We will use "roll" for this.
    parameters: {
      ...args,
      components,
      resultType, // Pass the critical result type to the template
      naturalRoll, // Pass the natural roll value for display
      confirmationRoll, // Pass the confirmation roll value for display
    },
  });

  // Post the roll template HTML into Chat.
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
