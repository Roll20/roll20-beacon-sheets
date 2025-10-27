import { type Spell, useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { SpellSchema } from '@/schemas/spell';
import { processItemTags } from '@/utility/effectsCalculator';
import { v4 as uuidv4 } from 'uuid';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useTagsStore, type TagGroup } from '@/sheet/stores/tags/tagsStore';
import { type CompendiumResults, createPageRequest, type DropContext } from './drop';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { dispatchRef } from '@/relay/relay';

export const onDropSpell = async ({
  payload,
  effects,
  tags,
  npcId
}: DropContext) => {
  const result = SpellSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid spell data', result.error);
    return;
  }

  const effectsStore = useEffectsStore();

  if (result.data.name && result.data.description?.default) {
    result.data.description.default += `\n\n[Spells:${result.data.name}]`;
  }

  if (tags && tags.length > 0) {
    const id = uuidv4();
    const newGroups: TagGroup = {
      _id: id,
      tags: [],
      category: 'spell',
    };
    tags.forEach((tag) => {
      const newTag = { _id: uuidv4(), text: tag };
      newGroups.tags.push(newTag);
    });
    useTagsStore().update(newGroups);
    result.data.tagId = id;
  }

  if (effects) {
    processItemTags(effects.actions, 'action');

    const newEffect = effectsStore.getEmptyEffect(effects);
    effectsStore.update(newEffect);
    result.data.effectId = newEffect._id;
  }

  if(npcId) {
    const npcStore = useNpcStore();
    const npc = npcStore.npcs.find(n => n._id === npcId);
    if(npc) {
      const spells: Array<{ name: string; [key: string]: any }> = [result.data];
      try {
        const spellHydrationPromises = spells.map(
          async (spellStub: { name: string; [key: string]: any }) => {
            if (!spellStub.name) return null; 
  
            const request = createPageRequest('Spells', spellStub.name);
            const response: CompendiumResults = await dispatchRef.value.compendiumRequest({
              query: request,
            });
  
            if (response.errors || !response?.data?.ruleSystem?.category?.pages?.[0]) {
              console.warn(
                `Could not find compendium spell: "${spellStub.name}". Skipping hydration.`,
              );
              return null; 
            }
  
            const page = response.data.ruleSystem.category.pages[0];
            if (page.properties['data-payload']) {
              const fullSpellData = JSON.parse(page.properties['data-payload']);
              return { ...fullSpellData, ...spellStub };
            }
  
            return spellStub;
          },
        );
        
        const hydratedSpells = (await Promise.all(spellHydrationPromises)).filter(Boolean);

        hydratedSpells.forEach(spell => {
          const index = parseInt(spell.spellSourceId.split(':')[1]);
          const sourceId = index < npc.spellSources.length ? npc.spellSources[index]._id :  npc.spellSources[0]._id;
          spell.spellSourceId = sourceId;
        });

        const newSpell = npcStore.getEmptyNpcSpell(hydratedSpells[0] as Partial<Spell>);
        npc.spells.push(newSpell);
      } catch (e) {
        console.error('Failed to hydrate spells from compendium.', e);
      }
    }
  } else {
    const spell = useSpellsStore();
    const newSpell = spell.getEmptySpell(result.data as Partial<Spell>);
    spell.updateSpell(newSpell);
  }
};
