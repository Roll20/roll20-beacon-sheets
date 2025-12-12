import { useNPCStore } from '@/sheet/stores/character/npcStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import type { Character, Dispatch, DropArgs } from '@roll20-official/beacon-sdk';

type CompendiumProperties = {
  Category: string;
  Description: string;
  Expansion: number;
  Name: string;
  Source: string;
  Token: string;
  expansion: number;
  'data-Attack': 16;
  'data-Damage': number;
  'data-Defense': number;
  'data-Feats': number;
  'data-HealthBad': number;
  'data-HealthCritical': number;
  'data-HealthGood': number;
  'data-HealthOkay': number;
  'data-Level': number;
  'data-List': boolean;
  'data-MentalResistance': number;
  'data-Perception': number;
  'data-Potential': number;
  'data-Protection': number;
  'data-SpecialAbilities': string;
  'data-Traits': string;
  'data-Speed': number;
  'data-Stamina': number;
  'data-Stealth': number;
  'data-description': string;
};

export type CompendiumData = {
  name: string;
  properties: CompendiumProperties;
};

export const initMonster = async ({ coordinates, dropData }: DropArgs, dispatch: Dispatch, character: Character) => {
  const npc = useNPCStore();
  const settings = useSettingsStore();

  console.log('initMonster -> Tainted Grail Relay', coordinates, dropData, dispatch, character);
  const { pageName, expansionId } = dropData;

  // Set the actor type to NPC.
  settings.setActorType('npc');

  try {
    const compendiumData = await dispatch.compendiumRequest({
      query: `pages(name: "${pageName}") {
              name
              properties
          }`,
    });

    let matchedItem: CompendiumData | null = null;
    if (compendiumData.data.ruleSystem?.pages) {
      if (Array.isArray(compendiumData.data.ruleSystem?.pages)) {
        matchedItem = compendiumData.data.ruleSystem?.pages.find(
          (item: any) => item.name === pageName && (item.properties.Expansion === expansionId || item.properties.expansion === expansionId),
        ) as CompendiumData | null;
      } else {
        matchedItem = compendiumData.data.ruleSystem?.pages as CompendiumData | null;
      }
    }

    if (!matchedItem) {
      throw new Error('No item found');
    }

    //       tiny: 1,
    //       small: 1,
    //       medium: 1,
    //       large: 2,
    //       huge: 3,
    //       gargantuan: 4,
    // Set monster token -- hardcoded to huge size for now.
    await dispatch.updateTokensByCharacter({
      characterId: character.id,
      token: {
        name: pageName,
        imgsrc: matchedItem.properties.Token,
        width: 3 * 70,
        height: 3 * 70,
      },
    });

    npc.prefillFromCompendium(matchedItem);
  } catch (error) {
    console.error('Error fetching item:', error);
  }

  console.log('initMonster -> Tainted Grail Relay', coordinates, dropData, dispatch, character);
};
