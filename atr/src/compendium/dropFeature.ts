import { FeatureSchema } from '@/schemas/feature';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { type DropContext, type CompendiumResults } from './drop';
import { createPageRequest } from './drop';
import { dispatchRef } from '@/relay/relay';
import { v4 as uuidv4 } from 'uuid';
import { type TagGroup, useTagsStore } from '@/sheet/stores/tags/tagsStore';
import z from 'zod';
import { processItemTags } from '@/utility/effectsCalculator';
import { useBiographyStore } from '@/sheet/stores/biography/biographyStore';

type Feature = z.infer<typeof FeatureSchema>;

export const onDropFeature = async ({
  payload,
  effects,
  tags,
  spells,
  cascade
}: DropContext): Promise<string | void> => {
  
  let resolvedSpells = spells;
  if (!resolvedSpells && payload['data-spells'] && Array.isArray(payload['data-spells'])) {
    resolvedSpells = payload['data-spells'];
    delete payload['data-spells'];
  }

  const result = FeatureSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid feature data', result.error);
    return;
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
  
  let resolvedEffects = effects;
  if (!resolvedEffects && resolvedSpells && Array.isArray(resolvedSpells) && resolvedSpells.length > 0) {
    resolvedEffects = {
      label: result.data.label || payload.label || 'Effects',
      enabled: true,
      toggleable: false,
      removable: false,
      effects: [],
    };
  }

  if (resolvedEffects && resolvedSpells && Array.isArray(resolvedSpells)) {
    try {
      const spellHydrationPromises = resolvedSpells.map(
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
      resolvedEffects.spells = hydratedSpells;
    } catch (e) {
      console.error('Failed to hydrate spells from compendium.', e);
    }
  }
  const featuresStore = useFeaturesStore();
  const effectsStore = useEffectsStore();

  if (resolvedEffects && Array.isArray(resolvedEffects.spells) && cascade?.spellSourceId) {
    if (!resolvedEffects.spellSources || resolvedEffects.spellSources.length === 0) {
      resolvedEffects.spells.forEach((spell: Record<string, any>) => {
        spell.spellSourceId = cascade.spellSourceId;
      });
    }
  }

  if (
    resolvedEffects &&
    resolvedEffects.spellSources &&
    Array.isArray(resolvedEffects.spellSources) &&
    resolvedEffects.spellSources.length > 0 &&
    resolvedEffects.spells &&
    Array.isArray(resolvedEffects.spells)
  ) {
    const sourceIdMap = new Map<number, string>();
    const sourceRegex = /^\$source:(\d+)$/;

    resolvedEffects.spellSources.forEach((source: Record<string, any>, index: number) => {
      const newId = source._id || uuidv4();
      source._id = newId;
      sourceIdMap.set(index, newId);
    });

    resolvedEffects.spells.forEach((spell: Record<string, any>) => {
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

  if (resolvedEffects) {
    processItemTags(resolvedEffects.actions, 'action');
    processItemTags(resolvedEffects.spells, 'spell');

    const newEffect = effectsStore.getEmptyEffect(resolvedEffects);
    effectsStore.update(newEffect);
    result.data.effectId = newEffect._id;
  }

  const newFeature = featuresStore.getEmptyFeature(result.data as Partial<Feature>);
  if (cascade?.source) newFeature.source = cascade.source;
  
  featuresStore.update(newFeature);

  if (result.data.group === 'core-personality-traits') {
    const biographyStore = useBiographyStore();
    biographyStore.corePersonality = result.data.label;
  }

  return newFeature._id;
};
