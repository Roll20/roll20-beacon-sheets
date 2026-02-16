import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { type DropContext } from "./drop";
import { SubraceSchema } from "@/schemas/subrace";

export const onDropSubrace = async ({
  payload,
  features,
  expansionId,
}: DropContext)  => {
  const result = SubraceSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid subclass data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  //First we check for a compatible race
  const inCompatible = Object.entries(result.data["data-compatibility"] || {}).find(([key, value]) => {
    return progressionStore.ancestry.name.trim().toLowerCase() === value.name.trim().toLowerCase() &&
      (value.sourceBook !== undefined
        ? value.sourceBook === progressionStore.ancestry.sourceBook
        : true);
  });

  if(!inCompatible) return;

  progressionStore.removeSubrace();

  progressionStore.ancestry.subrace = result.data.name;
  progressionStore.ancestry.subraceSourceBook = expansionId!;
  progressionStore.ancestry.compendiumData.subrace = features ? JSON.stringify(features) : null;

  const level = progressionStore.getLevel || 1;

  progressionStore.addFeaturesToAncestry(1, level, false, true);

  const characterLevel = progressionStore.getLevel || 0;
  progressionStore.removeAncestryExpiredFeatures(characterLevel);
};