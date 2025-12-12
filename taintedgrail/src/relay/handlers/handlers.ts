import type { Character, Dispatch, DragArgs, DropArgs, InitArgs } from '@roll20-official/beacon-sdk';
import { initValues, beaconPulse, dispatchRef, dragOverPulse } from '../relay';
import { CategoryType, useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';
import { useNPCStore } from '@/sheet/stores/character/npcStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export const onInit = ({ character, settings, compendiumDropData }: InitArgs, dispatch: Dispatch) => {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null;
  console.log('onInit -> Tainted Grail Relay');
};

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export const onChange = async ({ character }: { character: Record<string, any> }) => {
  const old = beaconPulse.value; // This is a way to trigger a re-render of the sheet, see relay.ts for more information.
  beaconPulse.value = old + 1;
  console.log('onChange -> Tainted Grail Relay', character);
};

export const onSettingsChange = () => {};

export const onSharedSettingsChange = () => {};

export const onTranslationsRequest = () => ({});

export const onDragOver = (entity: DragArgs) => {
  dragOverPulse.value = true;

  // Item is moved outside of the sheet.
  if (!entity.coordinates || !entity.dragData) dragOverPulse.value = false;

  // If item has been dragged over and not moved (or dropped on another sheet), reset.
  setTimeout(() => {
    dragOverPulse.value = false;
  }, 2000);
};

export const onDropOver = async (entity: DropArgs) => {
  const inventory = useInventoryStore();
  const dispatch = dispatchRef.value as Dispatch;
  try {
    // The results we receive here are from multiple expansions.
    const compendiumData = await dispatch.compendiumRequest({
      query: `pages(name: "${entity.dropData.pageName}") {
			name
			properties
		}`,
    });

    let matchedItem = null;
    if (compendiumData.data.ruleSystem?.pages) {
      if (Array.isArray(compendiumData.data.ruleSystem?.pages)) {
        matchedItem = compendiumData.data.ruleSystem?.pages.find(
          (item: any) =>
            item.name === entity.dropData.pageName &&
            (item.properties.Expansion === entity.dropData.expansionId || item.properties.expansion === entity.dropData.expansionId),
        );
      } else {
        matchedItem = compendiumData.data.ruleSystem?.pages;
      }
    }

    if (!matchedItem) {
      throw new Error('No item found');
    }

    // Remove the dragOver overlay.
    dragOverPulse.value = false;

    // Pass along disciplines to the Ways store to handle further.
    if (entity.dropData.categoryName === 'Disciplines') {
      const { addDiscipline } = useWaysStore();
      addDiscipline(matchedItem);
      return;
    }

    // Otherwise, toss it over to the inventory store.
    inventory.addItem(matchedItem, entity.dropData.categoryName as CategoryType);
  } catch (error) {
    console.error('Error fetching item:', error);
  }
};
