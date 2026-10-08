import type { InitArgs } from '@roll20-official/beacon-sdk';
import { initValues, beaconPulse } from '../relay';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }: InitArgs) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
};

// onChange fires when the character data is updated. Bumping beaconPulse triggers
// the sheet to re-hydrate and re-render (see relay.ts).
export const onChange = async () => {
  beaconPulse.value = beaconPulse.value + 1;
};

export const onSettingsChange = () => {};

export const onSharedSettingsChange = () => {};

export const onTranslationsRequest = () => ({});

export const onDragOver = () => {};

// Compendium drop onto the sheet. The payload is captured so The Crucible can
// offer to seed an entity from it (the drop data also arrives via onInit).
export const onDropOver = ({ compendiumDropData }: { compendiumDropData?: unknown } = {}) => {
  if (compendiumDropData) {
    initValues.compendiumDrop = compendiumDropData as never;
  }
};
