import { config } from '@/config';
import { EquipmentSchema } from '@/schemas/equipment';
import { type Equipment, useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import {  type DropContext } from './drop';
import { type TagGroup } from '@/sheet/stores/tags/tagsStore';
import { v4 as uuidv4 } from 'uuid';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { processItemTags } from '@/utility/effectsCalculator';
import { hydrateSpells } from './hydrateSpells';

export const onDropEquipment = async ({
  payload,
  effects,
  tags,
  spells,
}: DropContext) => {
  if (payload.value && !payload.value.currency) {
    payload.value.currency = config.currencyTypes[0];
  }
  const result = EquipmentSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid equipment data', result.error);
    return;
  }
  if (effects && spells && Array.isArray(spells)) {
    effects.spells = await hydrateSpells(spells);
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


  const newEquipment = equipmentStore.getEmptyEquipment(result.data as Partial<Equipment>);
  equipmentStore.update(newEquipment);
};
