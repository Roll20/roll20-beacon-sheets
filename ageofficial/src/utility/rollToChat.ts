import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { RollToChatTemplate } from '@/rolltemplates/rolltemplates';
import getRollResult from '@/utility/getRollResult';
import { addToStunts } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
// import getStunt from '@/rolltemplates/expressions/getStunt';
/* Example function for Rolling a basic check and showing the roll template. */
export default async (args: RollToChatTemplate['parameters'], customDispatch?: Dispatch) => {
  // console.log(args)
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions
  // Use Beacon to make the rolls and calculations. We end up with a Roll Result.
  const { components, total } = await getRollResult(args.components, dispatch);
  // if(args.secondaryComponents){
  //   const { subComponents, subTotal } = await getRollResult(args.secondaryComponents, dispatch);
  // }
  // Pass in the roll result to Handlebars and get HTML to render the roll template
  const rollTemplate = createRollTemplate({
    type: 'roll', // We have 2 roll templates, "roll" and "chat". We will use "roll" for this.
    parameters: {
      ...args,
      components
    },
  });
  
  if(hasDuplicates(components)){
    // addToStunts(getStunt(components))
  }
  
  // Post the roll template HTML into Chat.
  await dispatch.post({
    characterId: initValues.character.id,
    content: rollTemplate,
    options: {
      whisper: (useSettingsStore().whisperRollsGM === 'always' || useSettingsStore().whisperRollsGMToggle) ? 'gm' : undefined,
      secret: undefined,
    },
  });
  const tkn = await dispatch.getTokens({
    characterId:initValues.character.id
  })
  if(args.title === 'Initiative'){
    await dispatch.addToTracker({
      value: total,
      tokenId:tkn.tokens[0]? tkn.tokens[0].id :tkn.selected[0].id
    })
  }  
  return total;
};
function hasDuplicates(dice:any[]) {
  const unique = new Set(dice[0].dice);
  return unique.size !== dice[0].dice.length;
}
function getStunt(dice: any[]) {
  return getLastEntry(dice[0].dice)
}

function getLastEntry(arr: any) {
  return arr[arr.length - 1];
}
