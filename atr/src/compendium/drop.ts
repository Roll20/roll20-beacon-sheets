import { type DropArgs } from "@roll20-official/beacon-sdk/lib/types/dragAndDrop";
import { onDropEquipment } from "./dropEquipment";
import { onDropSpell } from "./dropSpell";
import { type Character, type CompendiumResults as DefaultCompendiumResults } from "@roll20-official/beacon-sdk/lib/types/partials";
import { dispatchRef } from "@/relay/relay";
import { onDropFeature } from "./dropFeature";
import { onDropClass } from "./dropClass";
import { z } from "zod";

import { FeatureSchema } from "@/schemas/feature";
import { onDropSubclass } from "./dropSubclass";
import { onDropSubrace } from "./dropSubrace";
import { onDropRace } from "./dropRace";
import { onDropBackground } from "./dropBackground";
import { onDropMonster, setToken } from "./dropMonster";
import { type Dispatch } from "@roll20-official/beacon-sdk";
import { SpellSchema } from "@/schemas/spell";

type Feature = z.infer<typeof FeatureSchema>;

export type compendiumCategory = "Spells" | "Survival Gear" | "Features" | "Feats" | "Classes" | "Subclasses" | "Races" | "Subraces" | "Backgrounds" | "Artistry Maneuvers" | "Fighting Styles" | "Sharpshooting Maneuvers" | "Slip Tricks" | "Ammunition" | "Armor" | "Firearms and Explosives" | "Boost Enhancements" | "Optional Background Features" | "Otherwordly Traits" | "Racial Templates" | "Clothing" | "Animals and Gear" | "Drugs" | "Tools" | "Vehicles" | "Monsters" | "Armor Modifications" | "Firearm Modifications" | "Firearm Accessories"| "Melee and Missile Modifications" | "Melee and Missile Weapons" | "Vehicle Modifications" | "Miscellaneous Magic Items" |"Brews" | "Magic Weapons" | "Magic Armor"| "Wondrous Items" | "Mutations";

export type CompendiumPage = {
  id: string;
  name: string;
  properties: {
    Category: compendiumCategory | string;
    Expansion: number;
    "data-List": "true" | "false";
    [key: string]: any;
  };
  book: {
    name: string;
    itemId: string;
  };
};

export type CompendiumResults = DefaultCompendiumResults & {
  data?: {
    ruleSystem?: {
      category?: {
        pages?: CompendiumPage[];
      }
    }
  }
};

export const createPageRequest = (categoryName: string, pageName: string) => `
id
category(name: "${categoryName}") {
  id
  pages(name: "${decodeURIComponent(pageName)}") {
    id
    name
    properties
    book {
      name
      itemId
    }
    category {
      name
    }
  }
}
`;

export type CascadeData = {
  spellSourceId?: string;
  source?: string;
}

export type CompendiumSpell = z.infer<typeof SpellSchema>;
export type DropContext = {
  payload: Record<string, any>;
  effects?: Record<string, any>;
  tags?: string[];
  features?: Record<string, Feature[]>;
  spells?: CompendiumSpell[];
  expansionId?: number;
  cascade?: CascadeData;
  npcId?: string;
  isNewSheet?: boolean;
  dispatch?: Dispatch;
  character?: Character
};

export const dropHandlers: Record<compendiumCategory, (ctx: DropContext) => void> = {
  "Spells": onDropSpell,
  "Survival Gear": onDropEquipment,
  "Features": onDropFeature,
  "Feats": onDropFeature,
  "Classes": onDropClass,
  "Subclasses": onDropSubclass,
  "Races": onDropRace,
  "Subraces": onDropSubrace,
  "Backgrounds": onDropBackground,
  "Artistry Maneuvers": onDropFeature,
  "Fighting Styles": onDropFeature,
  "Sharpshooting Maneuvers": onDropFeature,
  "Slip Tricks": onDropFeature,
  "Ammunition": onDropEquipment,
  "Armor": onDropEquipment,
  "Firearms and Explosives": onDropEquipment,
  "Boost Enhancements": onDropFeature,
  "Optional Background Features": onDropFeature,
  "Otherwordly Traits": onDropFeature,
  "Racial Templates": onDropSubrace,
  "Clothing": onDropEquipment,
  "Animals and Gear": onDropEquipment,
  "Drugs": onDropEquipment,
  "Tools": onDropEquipment,
  "Vehicles": onDropEquipment,
  "Firearm Modifications": onDropEquipment,
  "Firearm Accessories": onDropEquipment,
  "Armor Modifications": onDropEquipment,
  "Melee and Missile Modifications": onDropEquipment,
  "Vehicle Modifications": onDropEquipment,
  "Monsters": onDropMonster,
  "Miscellaneous Magic Items": onDropEquipment,
  "Brews": onDropEquipment,
  "Magic Weapons": onDropEquipment,
  "Magic Armor": onDropEquipment,
  "Wondrous Items": onDropEquipment,
  "Mutations": onDropFeature,
  "Melee and Missile Weapons": onDropEquipment

};

export const drag = async ({ dropData }: DropArgs, dispatch?: Dispatch, isNewSheet = false, character?: Character) => {
  const { pageName, expansionId } = dropData;
  const  category = dropData.categoryName as compendiumCategory | string;
  const request = createPageRequest(category, pageName);
  
  const actualDispatch = dispatch ?? dispatchRef.value;
  const response:CompendiumResults = await actualDispatch.compendiumRequest({ query: request })

  if (response.errors)
    throw new Error("Expected a compendium request, but instead got an error.");
  if (!response?.data?.ruleSystem?.category?.pages)
    throw new Error("Could not find a page, you probably need to relog.");

  const { pages } = response.data.ruleSystem.category;
  const correctPageIndex = pages.findIndex(
    (page: CompendiumPage) => +page.book.itemId === +expansionId
  );

  const page = pages[correctPageIndex];
  console.log("Dropping page", page);
  if (dropHandlers.hasOwnProperty(category)) {
    if(page.properties.hasOwnProperty('data-payload')) {
      try {
        console.log(page.properties);

        const payload = JSON.parse(page.properties['data-payload']);

        // Extract effects if present
        let tags = undefined;
        if (payload['data-tags']) {
          tags = payload['data-tags'];
          delete payload['data-tags'];
        }

        // Extract features if present
        let features = undefined;
        if (payload['data-features']) {
          features = payload['data-features'];
          delete payload['data-features'];
        }

        let spells = undefined;
        if (payload['data-spells']) {
          spells = payload['data-spells'];
          delete payload['data-spells'];
        }

        // Extract effects if present
        let effects = undefined;
        if (payload['data-effects']) {
          effects = payload['data-effects'];
          delete payload['data-effects'];
        }

        const dropHandler = dropHandlers[category as compendiumCategory];
        await dropHandler({payload, effects, tags, features, spells, expansionId, isNewSheet, dispatch: actualDispatch, character }); 

        if(isNewSheet) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 500ms delay
          setToken({ characterId: character!.id, payload, dispatch: actualDispatch });
        }
      } catch (e) {
        console.error("Failed to parse data-payload", e);
      }
    }
  }
};