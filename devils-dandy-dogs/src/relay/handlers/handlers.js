import { initValues, beaconPulse } from '../relay'

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }) => {
  initValues.id = character.id
  initValues.character = character
  initValues.settings = settings
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null
  console.log('onInit -> Example Sheet Relay')
}

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }) => {
  const old = beaconPulse.value // This is a way to trigger a re-render of the sheet, see relay.js for more information.
  beaconPulse.value = old + 1
  console.log('onChange -> Example Sheet Relay', character)
}

export const onSettingsChange = () => {}

export const onSharedSettingsChange = () => {}

export const onTranslationsRequest = () => ({})

export const onDragOver = () => {}
