import type { InitArgs } from '@roll20/beacon-sdk';
import { initValues, beaconPulse } from '../relay';

export const onInit = ({ character, settings, compendiumDropData }: InitArgs) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  console.log('onInit -> Example Sheet Relay');
};

export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value;
  beaconPulse.value = old + 1;
  console.log('onChange -> Example Sheet Relay', character);
};

export const onSettingsChange = () => {};

export const onSharedSettingsChange = () => {};

export const onTranslationsRequest = () => ({});

export const onDragOver = () => {};
