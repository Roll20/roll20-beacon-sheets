import { dispatchRef } from "@/relay/relay";
import { createPageRequest, type CompendiumResults, type CompendiumPage } from "./drop";
import { transformers} from "./dnd-transformers";
import { type CompendiumSpell } from "./drop";

/**
 * Takes an array of spell stubs (name and other properties) and returns a
 * fully hydrated and transformed array of spell objects from the compendium.
 */
export const hydrateSpells = async (spellStubs: CompendiumSpell[]): Promise<CompendiumSpell[]> => {
  if (!spellStubs || !Array.isArray(spellStubs) || spellStubs.length === 0) {
    return [];
  }

  try {
    const spellHydrationPromises = spellStubs.map(
      async (spellStub: { name: string; [key: string]: any }) => {
        if (!spellStub.name) return null; 

        const request = createPageRequest('Spells', spellStub.name);
        const response: CompendiumResults = await dispatchRef.value.compendiumRequest({
          query: request,
        });

        if (response.errors || !response?.data?.ruleSystem?.category?.pages) {
          console.warn(`Could not find compendium spell: "${spellStub.name}". Skipping hydration.`);
          return null;
        }

        const systemId = response.data?.ruleSystem?.id;
        const allPages = response.data.ruleSystem.category.pages;

        let page: CompendiumPage | undefined;

        page = allPages.find(p => String(p.book.itemId) === '5') || allPages[0];
      
        
        if (!page) return null;

        let fullSpellData;
        
        if (page.properties.hasOwnProperty('data-payload')) {
          fullSpellData = JSON.parse(page.properties['data-payload']);
        } else if (transformers['Spells']) {
          const transformer = transformers['Spells'];
          const rawPayload = { name: page.name, ...page.properties };
          fullSpellData = transformer(rawPayload, page.book, page.properties);
        } else {
          console.warn(`Could not transform legacy spell: "${spellStub.name}". Returning original data.`);
          return spellStub;
        }
                
        return { ...fullSpellData, ...spellStub };
      },
    );
      
    return (await Promise.all(spellHydrationPromises)).filter(Boolean) as CompendiumSpell[];
  } catch (e) {
    console.error('Failed to hydrate spells from compendium.', e);
    return []; 
  }
};