import { updateGMResources } from '@/sheet/stores/gmStore/gmStore';
import type { InitArgs, SharedSettingsChangeArgs } from '@roll20-official/beacon-sdk';
import { beaconPulse, initValues } from '../relay';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, sharedSettings, compendiumDropData }: InitArgs) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.sharedSettings.momentum = sharedSettings.momentum ?? 0;
  initValues.sharedSettings.threat = sharedSettings.threat ?? 0;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  console.log('onInit -> ST:Adventures 2e Relay');
};

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value; // This is a way to trigger a re-render of the sheet, see relay.ts for more information.
  beaconPulse.value = old + 1;
  console.log('onChange -> ST:Adventures 2e Relay', character);
};

export const onSettingsChange = () => {};

export const onSharedSettingsChange = (change: SharedSettingsChangeArgs) => {
  updateGMResources(change.settings)
};

export const onTranslationsRequest = () => ({});

export const onDragOver = () => {};
