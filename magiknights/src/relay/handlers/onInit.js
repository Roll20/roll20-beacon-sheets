import { initValues } from '..';
import { colorHandler } from './colorHandler';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }) => {
  initValues.id = character.id
  initValues.character = character
  initValues.settings = settings
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null
  colorHandler(settings)
  console.log('onInit -> Example Sheet Relay')
};