import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { type CascadeData, type DropContext } from "./drop";
import { BackgroundSchema } from "@/schemas/background";
import { type Feature } from "./dropClass";
import { levels } from "./dropClass"
import { onDropFeature } from "./dropFeature";

export type DropFeatureOptions = {
  features: Record<string, Feature[]>,
  levelOverride?: number,
  onlyExpired?: boolean,
  previousLevels?: number[],
}

export async function dropBackgroundFeatures({
  features,
  levelOverride,
  onlyExpired = false,
  previousLevels
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
      
      const cascade:CascadeData = {
        source: `${levels[levelKey]} ${useProgressionStore().background.name}`,
      };

      const newId = await onDropFeature({payload: feature, effects, tags, cascade});
      if (newId) {
        useProgressionStore().background.featureIds.push({ level: ownerLevel, id: newId, expirantionLevel: feature.validUntilLevel });
      }
    }
  }
}

export const onDropBackground = async ({
  payload,
  features,
  expansionId,
}: DropContext)  => {
  const result = BackgroundSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid subclass data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  progressionStore.removeBackground();

  progressionStore.background.name = result.data.name;
  progressionStore.background.sourceBook = expansionId!;
  progressionStore.background.compendiumData = features ? JSON.stringify(features) : null;

  const level = progressionStore.getLevel || 1;

  progressionStore.addFeaturesToBackground(1, level);

  const characterLevel = progressionStore.getLevel || 0;
  progressionStore.removeBackgroundExpiredFeatures(characterLevel);
};