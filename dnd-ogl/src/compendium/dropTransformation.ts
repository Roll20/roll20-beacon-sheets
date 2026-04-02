import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { FeatureSchema } from "@/schemas/feature";
import { z } from "zod";
import { type CascadeData, type DropContext } from "./drop";
import { RaceSchema } from "@/schemas/race";
import { onDropFeature } from "./dropFeature";
import { levels } from "./dropClass"
import { TransformationSchema } from "@/schemas/transformation";

export type Feature = z.infer<typeof FeatureSchema>;

export type DropFeatureOptions = {
  features: Record<string, Feature[]>,
  levelOverride?: number,
  updateSubrace?: boolean,
  onlyExpired?: boolean,
  previousLevels?: number[],
  cascade?: CascadeData
}

export async function dropTransformationFeatures({
  features,
  levelOverride,
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
      let spells = undefined;
      if (feature["data-effects"]) {
        effects = feature["data-effects"];
        delete feature["data-effects"];
      }
      if (feature["data-tags"]) {
        tags = feature["data-tags"];
        delete feature["data-tags"];
      }
      if (feature["data-spells"]) {
        spells = feature["data-spells"];
        delete feature["data-spells"];
      }

      const levelKey = `level-${featureLevel}` as keyof typeof levels;
      
      const newCascade = {...cascade};
      if (newCascade?.source) newCascade.source = `${levels[levelKey]} ${newCascade.source}`;

      const newId = await onDropFeature({payload: feature, effects, tags, spells, cascade: newCascade});
      if (newId) {
        useProgressionStore().transformation.featureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
      }
    }
  }
}

export const onDropTransformation = async ({
  payload,
  features,
  expansionId,
}: DropContext)  => {
  const result = TransformationSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid transformation data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  progressionStore.removeTransformation();

  const level = 1;

  progressionStore.transformation.name = result.data.name;
  progressionStore.transformation.sourceBook = expansionId!;
  progressionStore.transformation.compendiumData.transformation = features ? JSON.stringify(features) : null;
  progressionStore.transformation.level = level;

  await progressionStore.addFeaturesToTransformation(1, level);

  progressionStore.removeTransformationExpiredFeatures(level);
};