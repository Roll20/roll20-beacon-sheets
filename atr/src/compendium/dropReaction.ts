import { useBiographyStore } from "@/sheet/stores/biography/biographyStore";
import { type DropContext } from "./drop";
import { ReactionCompendiumSchema } from "@/schemas/reaction";

export const onDropPositiveReaction = async ({ payload }: DropContext) => {
  const result = ReactionCompendiumSchema.safeParse(payload);
  if (!result.success) {
    console.error("Invalid positive reaction data", result.error);
    return;
  }
  useBiographyStore().positiveReaction = result.data.label;
};

export const onDropNegativeReaction = async ({ payload }: DropContext) => {
  const result = ReactionCompendiumSchema.safeParse(payload);
  if (!result.success) {
    console.error("Invalid negative reaction data", result.error);
    return;
  }
  useBiographyStore().negativeReaction = result.data.label;
};
