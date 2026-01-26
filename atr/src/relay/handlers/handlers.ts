import type { Dispatch, InitArgs } from '@roll20-official/beacon-sdk';
import { initValues, beaconPulse } from '../relay';
import { drag } from '@/compendium/drop';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = async ({ character, settings, compendiumDropData }: InitArgs, dispatch: Dispatch) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  console.log('onInit -> Example Sheet Relay');

  if(compendiumDropData && compendiumDropData.categoryName === 'Monsters') {
    drag({coordinates: {left: 0, top: 0}, dropData: compendiumDropData}, dispatch, true, character);
  }
};

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value; // This is a way to trigger a re-render of the sheet, see relay.ts for more information.
  beaconPulse.value = old + 1;
  console.log('onChange -> Example Sheet Relay', character);
};

export const onSettingsChange = () => {};

export const onSharedSettingsChange = () => {};

export const onTranslationsRequest = () => ({});

export const onDragOver = () => {};

export const onDropOver = drag;
