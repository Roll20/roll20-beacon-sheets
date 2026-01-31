import { initValues } from '..';
import { colorHandler } from './colorHandler';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }, dispatch) => {
  initValues.id = character.id
  initValues.character = character
  initValues.settings = settings
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null
  colorHandler(settings)

  // Register the Transform action to the token action bar
  // TODO: addActionsToHost was removed in SDK v0.1.15+, find replacement API
  // dispatch.addActionsToHost({
  //   locations: ['tokenActionBar'],
  //   name: 'Transform',
  //   sheetAction: {
  //     characterId: character.id,
  //     action: 'transform',
  //     args: [],
  //   },
  // });

  console.log('onInit -> Magi-Knights Sheet Relay')
};