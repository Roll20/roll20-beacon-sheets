import { beaconPulse } from '..';
// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }) => {
  const old = beaconPulse.value // This is a way to trigger a re-render of the sheet, see relay.js for more information.
  beaconPulse.value = old + 1
  console.log('onChange -> Example Sheet Relay', character)
}