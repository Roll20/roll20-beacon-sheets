import { useFeaturesStore } from "@/sheet/stores/features/faturesStore";
import { ClassSchema } from "@/schemas/class";

import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { onDropFeature } from "./dropFeature";
import { FeatureSchema } from "@/schemas/feature";
import { z } from "zod";
import { type SpellCastingProgression, type Spell } from "@/sheet/stores/spells/spellsStore";

import { useSpellsStore } from "@/sheet/stores/spells/spellsStore";
import { type AbilityKey } from "@/sheet/stores/abilities/abilitiesStore";
import type { DropContext, CascadeData } from "./drop";

export type Feature = z.infer<typeof FeatureSchema>;

const parseOwnerLevel = (lowner:string, compendiumData:Record<string, Feature[]>): Record<string, Feature[]> => {
  const dataStr = JSON.stringify(compendiumData);
  const regex = /\$ownerlevel/g;
  const dynamicFormula = `@{${lowner.toLowerCase().replace(/ /g, '-')}-level}`;
  return JSON.parse(dataStr.replace(regex, dynamicFormula));
}


export const levels = {
  'level-1': '1st-level',
  'level-2': '2nd-level',
  'level-3': '3rd-level',
  'level-4': '4th-level',
  'level-5': '5th-level',
  'level-6': '6th-level',
  'level-7': '7th-level',
  'level-8': '8th-level',
  'level-9': '9th-level',
  'level-10': '10th-level',
  'level-11': '11th-level',
  'level-12': '12th-level',
  'level-13': '13th-level',
  'level-14': '14th-level',
  'level-15': '15th-level',
  'level-16': '16th-level',
  'level-17': '17th-level',
  'level-18': '18th-level',
  'level-19': '19th-level',
  'level-20': '20th-level'
}

export type DropFeatureOptions = {
  features: Record<string, Feature[]>,
  updatedClass: any,
  levelOverride?: number,
  updateSubclass?: boolean,
  onlyExpired?: boolean,
  previousLevels?: number[],
  cascade?: CascadeData
}

export async function dropClassFeatures({
  features,
  updatedClass,
  levelOverride,
  updateSubclass = false,
  onlyExpired = false,
  previousLevels,
  cascade = {},
}: DropFeatureOptions) {

  const ownerLevel = levelOverride !== undefined ? levelOverride : updatedClass.level;
  const leveledFeatures = parseOwnerLevel(updatedClass.name, features);
  for (const [level, featuresArr] of Object.entries(leveledFeatures)) {
    const featureLevel = parseInt(level.replace('level-', ''));
    if (ownerLevel !== featureLevel) continue;
    for (const feature of featuresArr) {

      if(
        onlyExpired &&
        (
          !feature.validUntilLevel
          || !(previousLevels && previousLevels.includes(feature.validUntilLevel))
        ) 
      ) continue;
      
      let effects = undefined;
      let tags = undefined;
      if (feature["data-effects"]) {
        effects = feature["data-effects"];
        delete feature["data-effects"];
      }
      if (feature["data-tags"]) {
        tags = feature["data-tags"];
        delete feature["data-tags"];
      }

      const levelKey = `level-${featureLevel}` as keyof typeof levels;
      const name = updateSubclass ? updatedClass.subclass : updatedClass.name;
      cascade.source = `${levels[levelKey]} ${name}`;

      const newId = await onDropFeature({payload: feature, effects, tags, cascade});
      if (newId) {
        if(updateSubclass)
          updatedClass.subclassFeatureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
        else 
          updatedClass.featureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
      }
    }
  }
}

export const onDropClass = async ({
  payload,
  features,
  expansionId,
}: DropContext) => {
  const result = ClassSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid class data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  const existing = progressionStore.classes.find(
    c => c.name === result.data.name && c.sourceBook === expansionId
  );

  let updatedClass = undefined;

  if (existing) {
    // const update = {
    //   ...existing,
    //   level: (existing.level || 1) + 1,
    // }
    // existing.level = (existing.level || 1) + 1;
    // updatedClass = update;
    // progressionStore.updateClass(update);
  } else {
    const newClass = {
      ...progressionStore.getEmptyClass(),
      name: result.data.name,
      sourceBook: expansionId || -1,
      level: 1,
      hitDie: result.data.hitDie,
      hitPoints: [parseInt(result.data.hitDie.split('d')[1])],
      subclassUnlockLevel: result.data.subclassUnlockLevel || -1,
      compendiumData: {
        class: features? JSON.stringify(features) : null,
        subclass: null,
      }
    };

    if (result.data.spellcasting && result.data.spellcasting !== 'none' && result.data['data-spellSource']) {
      const newSource = useSpellsStore().getEmptySource({ ...result.data['data-spellSource'] });
      useSpellsStore().updateSource(newSource);
      newClass.spellSourceId = newSource._id;
      newClass.spellcasting = result.data.spellcasting as SpellCastingProgression;
    }

    updatedClass = newClass;
    progressionStore.classes.push(newClass);
  }

  const cascade: CascadeData | undefined =
    updatedClass?.spellSourceId &&
    useSpellsStore().sources.find(s => s._id === updatedClass?.spellSourceId) ?
    {
      spellSourceId: updatedClass.spellSourceId,
    } : undefined
  ;

  if (features && !existing) {
    await dropClassFeatures({features, updatedClass, cascade});
  }

};

