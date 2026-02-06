import { FeatureSchema } from '@/schemas/feature';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { type DropContext, type CompendiumResults } from './drop';
import { v4 as uuidv4 } from 'uuid';
import { type TagGroup, useTagsStore } from '@/sheet/stores/tags/tagsStore';
import z from 'zod';
import { processItemTags } from '@/utility/effectsCalculator';
import { hydrateSpells } from './hydrateSpells';

type Feature = z.infer<typeof FeatureSchema>;

export const onDropFeature = async ({
  payload,
  effects,
  tags,
  spells,
  cascade,
}: DropContext): Promise<string | void> => {
  // JORGE - cascade.spellSourceId should have the spellsourceId
  // of the class that is dropping this feature, if any.
  const result = FeatureSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid feature data', result.error);
    return;
  }

  if (spells && spells.length > 0 && !effects) {
    effects = {
      label: payload.label || 'Feature Effects',
      enabled: true,
      toggleable: false,
      removable: false,
    };
  }

  if (tags && tags.length > 0) {
    const id = uuidv4();
    const newGroups: TagGroup = {
      _id: id,
      tags: [],
      category: 'feature',
    };
    tags.forEach((tag) => {
      const newTag = { _id: uuidv4(), text: tag };
      newGroups.tags.push(newTag);
    });
    useTagsStore().update(newGroups);
    result.data.tagId = id;
  }

  if (effects && spells && Array.isArray(spells)) {
    effects.spells = await hydrateSpells(spells);
  }
  const featuresStore = useFeaturesStore();
  const effectsStore = useEffectsStore();

  if (effects && effects.spells && cascade?.spellSourceId) {
    if (!effects.spellSources || effects.spellSources.length === 0) {
      effects.spells.forEach((spell: Record<string, any>) => {
        spell.spellSourceId = cascade.spellSourceId;
      });
    }
  }

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

  if (effects) {
    processItemTags(effects.actions, 'action');
    processItemTags(effects.spells, 'spell');

    const newEffect = effectsStore.getEmptyEffect(effects);
    effectsStore.update(newEffect);
    result.data.effectId = newEffect._id;
  }

  const newFeature = featuresStore.getEmptyFeature(result.data as Partial<Feature>);
  if (cascade?.source) newFeature.source = cascade.source;

  featuresStore.update(newFeature);

  return newFeature._id;
};
