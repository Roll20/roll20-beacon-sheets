import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { FeatureSchema } from "@/schemas/feature";
import { z } from "zod";
import { type CascadeData, type DropContext } from "./drop";
import { RaceSchema } from "@/schemas/race";
import { onDropFeature } from "./dropFeature";
import { levels } from "./dropClass"

export type Feature = z.infer<typeof FeatureSchema>;

export type DropFeatureOptions = {
  features: Record<string, Feature[]>,
  levelOverride?: number,
  updateSubrace?: boolean,
  onlyExpired?: boolean,
  previousLevels?: number[],
  cascade?: CascadeData
}

export async function dropAncestryFeatures({
  features,
  levelOverride,
  updateSubrace = false,
  onlyExpired = false,
  previousLevels,
  cascade
}: DropFeatureOptions) {
  const ownerLevel = levelOverride || 1;
  for (const [level, featuresArr] of Object.entries(features)) {
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
      
      const newCascade = {...cascade};
      if (newCascade?.source) newCascade.source = `${levels[levelKey]} ${newCascade.source}`;

      const newId = await onDropFeature({payload: feature, effects, tags, cascade: newCascade});
      if (newId) {
        if(updateSubrace)
          useProgressionStore().ancestry.subraceFeatureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
        else 
          useProgressionStore().ancestry.featureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
      }
    }
  }
}

export const onDropRace = async ({
  payload,
  features,
  expansionId,
}: DropContext)  => {
  const result = RaceSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid subclass data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  progressionStore.removeSubrace();
  progressionStore.removeRace();

  progressionStore.ancestry.name = result.data.name;
  progressionStore.ancestry.sourceBook = expansionId!;
  progressionStore.ancestry.compendiumData.race = features ? JSON.stringify(features) : null;

  const level = progressionStore.getLevel || 1;

  progressionStore.addFeaturesToAncestry(1, level, true);
};