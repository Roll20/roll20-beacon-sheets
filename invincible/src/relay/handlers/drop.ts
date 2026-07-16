import {
  type Dispatch,
  type CompendiumDragDropData,
  type DragCoordinates,
  type Character
} from '@roll20-official/beacon-sdk';
import { validateEntry, applyCompendiumData } from '@/utility/compendiumDrop';
import { applyNpcDrop } from '@/utility/applyNpcDrop';
import type { CompendiumCategory } from '@/schemas/compendium';
import { dispatchRef, initValues } from '@/relay/relay';
import { compendium } from '@/schemas/compendium';
import { NpcPayloadSchema } from '@/schemas/hydrate/npc';

export type DropArgs = {
  coordinates: DragCoordinates;
  dropData: CompendiumDragDropData;
};

export type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

export type DefaultCompendiumResults = {
  data: {
    ruleSystem?: Record<string, JSONValue>;
  };
  errors: Array<any>;
  extensions: Record<string, JSONValue>;
};

export type CompendiumPage = {
  id: string;
  name: string;
  properties: {
    Category: CompendiumCategory | string;
    Expansion: number;
    'data-List': 'true' | 'false';
    [key: string]: any;
  };
  children?: [
    {
      name: string;
      properties: Record<string, JSONValue>;
    }
  ];
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
  children {
    name
    properties
  }
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
  children {
    name
    properties
  }
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

export const fetchCompendiumPage = async (
  pageName: string,
  actualDispatch: Dispatch,
  categoryName: string,
): Promise<CompendiumPage | null> => {
  const request = createPageRequest(categoryName, pageName);
  const response: CompendiumResults = await actualDispatch.compendiumRequest({ query: request });

  if (response.errors) {
    console.error(`Error fetching compendium page "${pageName}" for category "${categoryName}":`, response.errors);
    return null;
  }

  const pages = response?.data?.ruleSystem?.category?.pages;
  if (pages && pages.length > 0) {
    const page = pages[0];
    if (page && page.properties) {
      if (!page.properties.Category) {
        page.properties.Category = categoryName;
      }
      return page;
    }
  }
  return null;
};

export const resolveDropData = async (node: any, dispatch: Dispatch): Promise<any> => {
  if (!node || typeof node !== 'object') return node;

  
  const hasCategory = 'categoryName' in node;
  const hasPage = 'pageName' in node;
  const isManualWrapper = 'data-payload' in node;

  if (hasCategory && hasPage && !isManualWrapper) {
    const cat = String(node.categoryName);
    const page = String(node.pageName);
    const resolvedPage = await fetchCompendiumPage(page, dispatch, cat);
    if (resolvedPage) {
      const resolved = await resolveDropData(resolvedPage, dispatch);
      if (node.activeModifiers) {
        resolved.activeModifiers = node.activeModifiers;
      }
      return resolved;
    }
    console.warn(`[compendiumDrop] Could not resolve reference to page "${page}" in category "${cat}"`);
    return null;
  }

  
  const properties = node.properties || node;
  const payload = properties['data-payload'] !== undefined ? properties['data-payload'] : node['data-payload'];
  const categoryName = properties.Category || properties.category || node.categoryName || node.Category || '';

  
  let rawChildren = node.children || properties['data-children'] || [];
  if (typeof rawChildren === 'string') {
    try {
      rawChildren = JSON.parse(rawChildren);
    } catch {
      rawChildren = [];
    }
  }

  const resolvedChildren: any[] = [];
  if (Array.isArray(rawChildren)) {
    for (const child of rawChildren) {
      const resolvedChild = await resolveDropData(child, dispatch);
      if (resolvedChild) {
        resolvedChildren.push(resolvedChild);
      }
    }
  }

  return {
    categoryName,
    'data-payload': payload,
    'data-children': resolvedChildren
  };
};

export const setToken = async ({ characterId, payload, dispatch }: { characterId: string; payload: Record<string, any>; dispatch: Dispatch }) => {
  const result = NpcPayloadSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid monster data', result.error);
    return;
  }
  
  await dispatch.updateTokensByCharacter({
    characterId: characterId,
    token: {
      name: result.data.name,
      imgsrc: result.data.token || result.data.avatar, 
      width: 70,
      height: 70,
    }
  });
}

export const drag = async (
  { dropData, coordinates }: DropArgs,
  dispatch?: Dispatch,
  isNewSheet = false,
  character?: Character,
) => {
  const { pageName, expansionId } = dropData;
  const category = dropData.categoryName as CompendiumCategory | string;
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

  try {
    if (page.properties.hasOwnProperty('data-payload')) {
      if (category === 'NPCs') {
        const isWrapper = typeof page.properties['data-payload'] === 'object' && page.properties['data-payload'] !== null && 'data-payload' in page.properties['data-payload'];
        
        let inputToValidate: any;
        if (isWrapper) {
          inputToValidate = await resolveDropData(page.properties['data-payload'], actualDispatch);
        } else {
          inputToValidate = await resolveDropData(page, actualDispatch);
        }
        await applyNpcDrop(inputToValidate, actualDispatch);
        
        if (isNewSheet) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); 
          const payloadToTokenize = inputToValidate['data-payload'] || {};
          await setToken({ characterId: character?.id || initValues.id || 'id', payload: payloadToTokenize, dispatch: actualDispatch });
        }
        return; 
      }
      
      const handler = compendium.find((entry) => entry.category === category);
      if (handler) {
        const isWrapper = typeof page.properties['data-payload'] === 'object' && page.properties['data-payload'] !== null && 'data-payload' in page.properties['data-payload'];
        
        let inputToValidate: any;
        if (isWrapper) {
          inputToValidate = await resolveDropData(page.properties['data-payload'], actualDispatch);
        } else {
          inputToValidate = await resolveDropData(page, actualDispatch);
        }

        const validation = validateEntry(inputToValidate, handler.schema);
        if (validation.success) {
          if (handler.onApply) {
            await handler.onApply(validation.data.node?.data ?? validation.data);
          } else {
            const rawTarget = handler.target;
            const resolvedTarget = typeof rawTarget === 'function' ? rawTarget() : rawTarget;
            applyCompendiumData(validation.data, resolvedTarget);
          }
        } else {
          console.error(`Validation failed for category "${category}": ${validation.error}`);
        }
      } else {
        console.error(`No handler found for category: "${category}".`);
      }
    } else {
      console.error(`Item has no payload.`);
      return;
    }

    if (isNewSheet) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      
    }
  } catch (e) {
    console.error('Failed to parse data-payload', e);
  }
};