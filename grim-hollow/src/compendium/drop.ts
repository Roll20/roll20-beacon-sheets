import { type DropArgs } from '@roll20-official/beacon-sdk/lib/types/dragAndDrop';
import { onDropEquipment } from './dropEquipment';
import { onDropSpell } from './dropSpell';
import {
  type Character,
  type CompendiumResults as DefaultCompendiumResults,
} from '@roll20-official/beacon-sdk/lib/types/partials';
import { dispatchRef } from '@/relay/relay';
import { onDropFeature } from './dropFeature';
import { onDropClass } from './dropClass';
import { z } from 'zod';

import { transformers } from './dnd-transformers';
import { onDropTransformation } from './dropTransformation';
import { FeatureSchema } from "@/schemas/feature";
import { onDropSubclass } from "./dropSubclass";
import { onDropSubrace } from "./dropSubrace";
import { onDropRace } from "./dropRace";
import { onDropBackground } from "./dropBackground";
import { onDropMonster, setToken } from "./dropMonster";
import { type Dispatch } from "@roll20-official/beacon-sdk";
import { SpellSchema } from "@/schemas/spell";

type Feature = z.infer<typeof FeatureSchema>;

export type compendiumCategory =
  | 'Spells'
  | 'Features'
  | 'Feats'
  | 'Classes'
  | 'Subclasses'
  | 'Species'
  | 'Species Options'
  | 'Backgrounds'
  | 'Fighting Styles'
  | 'Armor'
  | 'Items'
  | 'Races'
  | 'Subraces'
  | 'Monsters'
  | 'Transformations'
  | 'Transformation Boons'
  | 'Adventurer Talents'
  | 'Ammunition'
  | 'Compound Options'
  | 'Epic Boons'
  | 'Equipment'
  | 'Gifts of Damnation'
  | 'Magic Items'
  | 'Shadowsteel Curses'
  | 'Traits'
  | 'Weapons'
  | 'Armor Modifications'
  | 'Trapper Gadgets'
  | 'Mutations';

export type CompendiumPage = {
  id: string;
  name: string;
  properties: {
    Category: compendiumCategory | string;
    Expansion: number;
    'data-List': 'true' | 'false';
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
      };
    };
  };
};

export const createPageRequest = (categoryName: string, pageName?: string) => {
const pages = pageName ? `
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
`
: `
pages {
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
`;
const request = `
id
category(name: "${categoryName}") {
  id
  ${pages}  
}
`
return request;
};

export type CascadeData = {
  spellSourceId?: string;
  source?: string;
};

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
  character?: Character;
};

export const dropHandlers: Record<compendiumCategory, (ctx: DropContext) => void> = {
  Spells: onDropSpell,
  Features: onDropFeature,
  Feats: onDropFeature,
  Classes: onDropClass,
  Subclasses: onDropSubclass,
  Races: onDropRace,
  Species: onDropRace,
  'Species Options': onDropSubrace,
  Backgrounds: onDropBackground,
  'Fighting Styles': onDropFeature,
  Armor: onDropEquipment,
  Monsters: onDropMonster,
  Items: onDropEquipment,
  Subraces: onDropSubrace,
  Transformations: onDropTransformation,
  'Transformation Boons': onDropFeature,
  'Adventurer Talents': onDropFeature,
  Ammunition: onDropEquipment,
  'Compound Options': onDropFeature,
  'Epic Boons': onDropFeature,
  Equipment: onDropEquipment,
  'Gifts of Damnation': onDropFeature,
  'Magic Items': onDropEquipment,
  'Shadowsteel Curses': onDropSpell,
  Traits: onDropFeature,
  Weapons: onDropEquipment,
  'Armor Modifications': onDropFeature,
  'Trapper Gadgets': onDropFeature,
  Mutations: onDropFeature,
};

export const drag = async (
  { dropData, coordinates }: DropArgs,
  dispatch?: Dispatch,
  isNewSheet = false,
  character?: Character,
) => {
  const { pageName, expansionId } = dropData;
  const category = dropData.categoryName as compendiumCategory | string;
  const request = createPageRequest(category, pageName);

  const actualDispatch = dispatch ?? dispatchRef.value;
  const response: CompendiumResults = await actualDispatch.compendiumRequest({ query: request });

  if (response.errors) throw new Error('Expected a compendium request, but instead got an error.');
  if (!response?.data?.ruleSystem?.category?.pages)
    throw new Error('Could not find a page, you probably need to relog.');

  const { pages } = response.data.ruleSystem.category;
  const correctPageIndex = pages.findIndex(
    (page: CompendiumPage) => +page.book.itemId === +expansionId,
  );

  const page = pages[correctPageIndex];
  console.log('Dropping page', page);

  let npcId: string | undefined = undefined;
  if (coordinates) {
    const elements = document.elementsFromPoint(coordinates.left, coordinates.top);
    const targetEl = elements.find((el) => el.closest('[data-npc-id]'));
    console.log('Elements at drop point:', elements);
    if (targetEl) {
      npcId = targetEl.closest('[data-npc-id]')?.getAttribute('data-npc-id') || undefined;
    }
  }

  if (dropHandlers.hasOwnProperty(category)) {
    try {
      let payload;

      if (page.properties.hasOwnProperty('data-payload')) {
        payload = JSON.parse(page.properties['data-payload']);
        if (
          category === 'Monsters' &&
          (!payload.token || payload.token.length === 0) &&
          page.properties.Token
        ) {
          payload.token = page.properties.Token;
        }
      } else if (transformers[category]) {
        const transformer = transformers[category];
        const rawPayload = { name: page.name, book: page.book, properties: page.properties };
        payload = transformer(rawPayload, page.book, page.properties);
      } else {
        console.error(
          `Item is not in native format and no transformer was found for category: "${category}".`,
        );
        return;
      }

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
      await dropHandler({
        payload,
        effects,
        tags,
        features,
        spells,
        expansionId,
        isNewSheet,
        npcId,
        dispatch: actualDispatch,
        character,
      });

      if (isNewSheet) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 500ms delay
        setToken({ characterId: character!.id, payload, dispatch: actualDispatch });
      }
    } catch (e) {
      console.error('Failed to parse data-payload', e);
    }
  }
};
