import { config } from '@/config';
import { EquipmentSchema } from '@/schemas/equipment';
import { type Equipment, useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { dispatchRef } from '@/relay/relay';
import { createPageRequest, type DropContext } from './drop';
import { type TagGroup } from '@/sheet/stores/tags/tagsStore';
import { v4 as uuidv4 } from 'uuid';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { type Spell } from '@/sheet/stores/spells/spellsStore';
import { type Feature } from './dropClass';
import { type CompendiumResults } from './drop';
import { processItemTags } from '@/utility/effectsCalculator';

export const onDropEquipment = async ({
  payload,
  effects,
  tags,
  spells,
}: DropContext) => {
  const result = EquipmentSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid equipment data', result.error);
    return;
  }
  if (effects && spells && Array.isArray(spells)) {
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
      effects.spells = hydratedSpells;
    } catch (e) {
      console.error('Failed to hydrate spells from compendium.', e);
    }
  }
  const equipmentStore = useEquipmentStore();
  const effectsStore = useEffectsStore();

  if (
    effects &&
    effects.spellSources &&
    Array.isArray(effects.spellSources) &&
    effects.spellSources.length > 0 &&
    effects.spells &&
    Array.isArray(effects.spells)
  ) {
    const sourceIdMap = new Map<number, string>();
    const sourceRegex = /^\$source:(\d+)$/;

    effects.spellSources.forEach((source: Record<string, any>, index: number) => {
      const newId = source._id || uuidv4();
      source._id = newId;
      sourceIdMap.set(index, newId);
    });

    effects.spells.forEach((spell: Record<string, any>) => {
      if (typeof spell.spellSourceId === 'string') {
        const match = spell.spellSourceId.match(sourceRegex);
        if (match && match[1]) {
          const sourceIndex = parseInt(match[1], 10);
          if (sourceIdMap.has(sourceIndex)) {
            spell.spellSourceId = sourceIdMap.get(sourceIndex)!;
          } else {
            //Defaults to first source if index is invalid
            spell.spellSourceId = sourceIdMap.get(0) || '';
          }
        }
      }
    });
  }

  if (tags && tags.length > 0) {
    const id = uuidv4();
    const newGroups: TagGroup = {
      _id: id,
      tags: [],
      category: 'equipment',
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
    processItemTags(effects.spells, 'spell');

    const newEffect = effectsStore.getEmptyEffect(effects);
    effectsStore.update(newEffect);
    result.data.effectId = newEffect._id;
  }

  //Fix Equipment Value
  if (result.data.value && !result.data.value.currency) {
    result.data.value.currency = config.currencyTypes[0];
  }

  const newEquipment = equipmentStore.getEmptyEquipment(result.data as Partial<Equipment>);
  equipmentStore.update(newEquipment);
};
