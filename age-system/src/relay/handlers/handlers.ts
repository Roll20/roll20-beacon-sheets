import type { InitArgs } from '@roll20-official/beacon-sdk';
import { initValues, beaconPulse, dispatchRef } from '../relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { lightDarkMode } from '@/utility/darkMode';
// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }: InitArgs) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  lightDarkMode(initValues.settings.colorTheme);
};

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value; // This is a way to trigger a re-render of the sheet, see relay.ts for more information.
  beaconPulse.value = old + 1;
  console.log('onChange -> Example Sheet Relay', character);
};

export const onSettingsChange = (e:any) => { Object.assign(initValues.settings, e.settings);lightDarkMode(e.settings.colorTheme)};

export const onSharedSettingsChange = () => {};

export const onTranslationsRequest = () => ({});

export const onDragOver = (e:any) => {
  // console.log(e)
};
export const onDropOver = async (e:any) => {
  const sampleData = {
    "type": "dropOver",
    "coordinates": {
        "left": 567.40625,
        "top": 340.40625
    },
    "dropData": {
        "pageName": "Criminal",
        "categoryName": "Backgrounds",
        "expansionId": 33335
    }
}
const dispatch = dispatchRef.value as Dispatch; // Need a different Relay instance when handling sheet-actions

  console.log(e)
  // const dp = dispatch.compendiumRequest({ query: 'DD 5th Edition SRD'}) ;Promise<{
  //   data: Object
  //   errors: Array<Error>
  //   extensions: Record<string, any>
  // }>
  // console.log(dp)
  dispatch.compendiumRequest({
    query: `pages(name: "` + e.dropData.pageName + `") {
  name
  content
  properties
  category {
    name
    cardBody
    cardHeader
    cardAttributes
  }
  book {
    name
  }
}`
})
.then(response => {
    // if (response.success) {
    console.log(response)
        console.log("Compendium Entry Found:", response.data);
        // Handle the data (e.g., update character sheet or display information)
    // } else {
    //     console.error("Compendium request failed", response.error);
    // }
})
.catch(error => {
    console.error("Compendium request error:", error);
});
};

// export const getCompendium = async (query:any) =>{
//   dispatch.compendiumRequest(query): Promise<{
//     data: Object
//     errors: Array<Error>
//     extensions: Record<string, any>
//   }>
// // }