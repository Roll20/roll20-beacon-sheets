import { useProgressionStore } from "@/sheet/stores/progression/progressionStore";
import { FeatureSchema } from "@/schemas/feature";
import { z } from "zod";
import { type SpellCastingProgression, type Spell } from "@/sheet/stores/spells/spellsStore";

import { useSpellsStore } from "@/sheet/stores/spells/spellsStore";
import { SubclassSchema } from "@/schemas/subclass";
import { type AbilityKey } from "@/sheet/stores/abilities/abilitiesStore";
import { type DropContext } from "./drop";

export type Feature = z.infer<typeof FeatureSchema>;

export const onDropSubclass = async ({
  payload,
  features,
  expansionId,
}: DropContext)  => {
  const result = SubclassSchema.safeParse(payload);
  if(!result.success) {
    console.error("Invalid subclass data", result.error);
    return;
  }

  const progressionStore = useProgressionStore();

  //First we check for a compatible class
  const compatibleClass = progressionStore.classes.find(c => {
    return result.data["data-compatibility"]?.some(comp => 
      comp.name.trim().toLowerCase() === c.name.trim().toLowerCase() &&
      (comp.sourceBook !== undefined
        ? comp.sourceBook === c.sourceBook
        : true)
    );
  });

  if(!compatibleClass) return;

  //Then we check if we subclass is unlocked;
  if(compatibleClass.subclassUnlockLevel <= 0 || compatibleClass.level < compatibleClass.subclassUnlockLevel) return;

  //Then we check if we already have a subclass and erase any previous features
  progressionStore.removeSubclass(compatibleClass._id);

  compatibleClass.subclass = result.data.name;
  compatibleClass.subclassSourceBook = expansionId;

  if (result.data.spellcasting && result.data.spellcasting !== 'none' && result.data['data-spellSource']) {
    //first we check if class has an spellcasting source associated with it:
    if(compatibleClass.spellSourceId) {
      const existingSource = useSpellsStore().sources.find(s => s._id === compatibleClass.spellSourceId);
      if(existingSource) useSpellsStore().removeSource(existingSource);
    }

    const newSource = useSpellsStore().getEmptySource({ ...result.data['data-spellSource'] });
    useSpellsStore().updateSource(newSource);
    compatibleClass.spellSourceId = newSource._id;
    compatibleClass.spellcasting = result.data.spellcasting as SpellCastingProgression;
  }

  compatibleClass.compendiumData.subclass = features ? JSON.stringify(features) : null;
  await progressionStore.addFeaturesToClass(compatibleClass._id, 1, compatibleClass.level, false, true);
  progressionStore.removeClassFeatures(compatibleClass._id, false, true, 20);
};