import { type Spell, useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { SpellSchema } from '@/schemas/spell';
import { processItemTags } from '@/utility/effectsCalculator';
import { v4 as uuidv4 } from 'uuid';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useTagsStore, type TagGroup } from '@/sheet/stores/tags/tagsStore';
import {
  type DropContext,
} from './drop';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { hydrateSpells } from './hydrateSpells';

export const onDropSpell = async ({ payload, effects, tags, npcId }: DropContext) => {
  const result = SpellSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid spell data', result.error);
    return;
  }

  console.log("Dropping spell:", result.data);


  const effectsStore = useEffectsStore();

  /*if (result.data.name && result.data.description?.default) {
    result.data.description.default += `\n\n[Spells:${result.data.name}]`;
  }*/

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

  let effectId: string | undefined;
  let effectObj: any = undefined;

  if (effects) {
    processItemTags(effects.actions, 'action');
    
    const effectsStore = useEffectsStore();
    effectObj = effectsStore.getEmptyEffect(effects);
    effectId = effectObj._id;
    result.data.effectId = effectId;
  }

  if (npcId) {
    const npcStore = useNpcStore();
    const npc = npcStore.npcs.find((n) => n._id === npcId);
    if (npc) {
      try {
        if (effectObj) {
          npc.effects.push(effectObj);
        }

        const spellsToHydrate = [result.data];
        const hydratedSpells = await hydrateSpells(spellsToHydrate);

        if (hydratedSpells.length > 0) {
          const hydratedSpell = hydratedSpells[0];

          if (npc.spellSources.length === 0) {
            const newSource = npcStore.getEmptyNpcSpellSource();
            newSource.name = "Spellcasting"; 
            newSource.isInnate = true;
            newSource.ability = 'wisdom'; 
            npc.spellSources.push(newSource);
          }

          if (
            !hydratedSpell.spellSourceId ||
            (typeof hydratedSpell.spellSourceId === 'string' &&
            hydratedSpell.spellSourceId.startsWith('$picker:'))
          ) {
             let sourceId = npc.spellSources[0]._id;
             
             if (hydratedSpell.spellSourceId && hydratedSpell.spellSourceId.startsWith('$picker:')) {
               const index = parseInt(hydratedSpell.spellSourceId.split(':')[1], 10);
               if (!isNaN(index) && index < npc.spellSources.length) {
                 sourceId = npc.spellSources[index]._id;
               }
             }
             
             hydratedSpell.spellSourceId = sourceId;
          }

          const newNpcSpell = npcStore.getEmptyNpcSpell(hydratedSpell as Partial<Spell>);
          npc.spells.push(newNpcSpell);
          
          npcStore.updateNpc(npc._id, { spells: npc.spells, effects: npc.effects, spellSources: npc.spellSources });
        }
      } catch (e) {
        console.error('Failed to hydrate and add spell to NPC.', e);
      }
    }
  } else {
    const effectsStore = useEffectsStore();
    const spellsStore = useSpellsStore();

    if (effectObj) {
      effectsStore.update(effectObj);
    }

    const newSpell = spellsStore.getEmptySpell(result.data as Partial<Spell>);
    spellsStore.updateSpell(newSpell);
  }
};
