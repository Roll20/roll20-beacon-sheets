<template>
  <form ref="form" class="view-container" @submit.prevent="save">
    <div class="class-list">
      <div v-for="cls in localClasses" :key="cls._id">
        <ClassItem
          :classData="cls"
          :spellSourceData="localClassSpellSource(cls.spellSourceId)"
          @update="(patch: Partial<ClassProgression>) => updateLocalClass(cls._id, patch)"
          @updateSpellSource="(patch: Partial<SpellSource>) => updateLocalSpellSource(cls.spellSourceId, patch)"
          @remove="removeLocalClass(cls._id)"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  type HitPointsMode,
  useProgressionStore,
  type ClassProgression,
} from '@/sheet/stores/progression/progressionStore';
import { useSpellsStore, type Spell } from '@/sheet/stores/spells/spellsStore';
import ClassItem from './ClassItem.vue';
import { useSidebar } from './useSidebar';
import { jsonClone } from '@/utility/jsonTools';
import type { StandardSpellSource, SpellSource } from '@/sheet/stores/spells/spellsStore';
import { config } from '@/config';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import type { FeatureId } from '@/sheet/stores/progression/progressionStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { dropClassFeatures } from '@/compendium/dropClass';
import { type CascadeData } from '@/compendium/drop';
const form = ref<HTMLFormElement | null>(null);

const progression = useProgressionStore();
const spells = useSpellsStore();

const localClasses = ref<ClassProgression[]>(jsonClone(progression.classes));
const localSpellSources = ref<SpellSource[]>(jsonClone(spells.sources));

const classIdsToRemove = ref<string[]>([]);
const sourcesToRemove = ref<string[]>([]);
const spellIdsToRemove = ref<string[]>([]);

const featuresToRemove = ref<FeatureId[]>([]);

const localClassSpellSource = (id: string): StandardSpellSource => {
  return (
    (localSpellSources.value.find((s) => s._id === id) as StandardSpellSource) ||
    (spells.getEmptySource({
      _id: id,
      name: '',
      type: 'ability',
    }) as StandardSpellSource)
  );
};

const removeLocalClass = (classId: string) => {
  const classIndex = localClasses.value.findIndex((c) => c._id === classId);
  if (classIndex < 0) return;

  const classToRemove = localClasses.value[classIndex];

  featuresToRemove.value = [...featuresToRemove.value, ...classToRemove.featureIds, ...classToRemove.subclassFeatureIds];

  const spellSourceId = localClasses.value[classIndex].spellSourceId;
  sourcesToRemove.value.push(spellSourceId);

  classIdsToRemove.value.push(classId);

  const spellsToDelete = spells.spells.filter((spell) => spell.spellSourceId === spellSourceId);
  for (const spell of spellsToDelete) {
    spellIdsToRemove.value.push(spell._id);
  }

  localClasses.value.splice(classIndex, 1);
  const spellSourceIndex = localSpellSources.value.findIndex((s) => s._id === spellSourceId);
  if (spellSourceIndex >= 0) {
    localSpellSources.value.splice(spellSourceIndex, 1);
  }
};

const hitPointsMode: HitPointsMode = useProgressionStore().hitPointsMode;

const add = () => {
  const newClass = useProgressionStore().getEmptyClass();
  localClasses.value.push(newClass);
  const newSPellSource: StandardSpellSource = {
    _id: newClass.spellSourceId,
    name: newClass.name,
    type: 'ability',
    ability: config.abilities[0],
  };
  localSpellSources.value.push(newSPellSource);
};

const updateLocalClass = (_id: string, patch: Partial<ClassProgression>) => {
  const classIndex = localClasses.value.findIndex((c) => c._id === _id);
  if (classIndex >= 0) {
    Object.assign(localClasses.value[classIndex], patch);
    updateHitDie(localClasses.value[classIndex], patch.hitDie !== undefined);

    if (patch.spellcasting) {
      const spellSourceIndex = localSpellSources.value.findIndex(
        (s) => s._id === localClasses.value[classIndex].spellSourceId,
      );
      if (spellSourceIndex >= 0 && patch.spellcasting === 'none') {
        localSpellSources.value.splice(spellSourceIndex, 1);
      } else if (spellSourceIndex < 0 && patch.spellcasting !== 'none') {
        const newSpellSource: SpellSource = spells.getEmptySource({
          _id: localClasses.value[classIndex].spellSourceId,
          name: localClasses.value[classIndex].name,
          type: 'ability',
        });
        localSpellSources.value.push(newSpellSource);
      }
    }
  }

  if (patch.name) {
    const spellSourceIndex = localSpellSources.value.findIndex(
      (s) => s._id === localClasses.value[classIndex].spellSourceId,
    );
    if (spellSourceIndex >= 0) {
      localSpellSources.value[spellSourceIndex].name = patch.name;
    }
  }
};

const updateLocalSpellSource = (_id: string, patch: Partial<SpellSource>) => {
  const index = localSpellSources.value.findIndex((c) => c._id === _id);
  if (index >= 0) {
    Object.assign(localSpellSources.value[index], patch);
  }
};

const updateHitDie = (cls: ClassProgression, changedHitDie: boolean) => {
  cls.hitPoints = Array.from({ length: cls.level }, (_, i) => {
    const size = parseInt(cls.hitDie.split('d')[1]);
    const amountOfDice = parseInt(cls.hitDie.split('d')[0]);
    if (hitPointsMode === 'manual' && i === 0) {
      return cls.hitPoints[i];
    } else if (cls.hitPoints[i] && !changedHitDie) {
      return cls.hitPoints[i];
    } else if (hitPointsMode === 'average') {
      return i === 0 ? size * amountOfDice : (Math.ceil(size / 2) + 1) * amountOfDice;
    } else if (hitPointsMode === 'rolled') {
      if (i === 0) {
        return size * amountOfDice;
      } else {
        const diceRoll = new DiceRoll(cls.hitDie);
        diceRoll.roll();
        return diceRoll.total;
      }
    } else {
      return 0;
    }
  });
};

const save = async () => {
  if (form.value && !form.value.reportValidity()) return;

  // Handle class level changes
  await Promise.all(localClasses.value.map(async cls => {
    const previous = progression.classes.find(c => c._id === cls._id);
    if(previous && previous.level !== cls.level && cls?.compendiumData?.class) {
      const previousLevel = previous.level;
      const currentLevel = cls.level;
      try {
        const classFeatures = JSON.parse(cls.compendiumData.class);

        const cascade: CascadeData | undefined =
          cls?.spellSourceId &&
         localSpellSources.value.find(s => s._id === cls?.spellSourceId) ?
          {
            spellSourceId: cls.spellSourceId,
          } : undefined
        ;
        
        if(previous.level < cls.level) {
          for(let lvl = previousLevel + 1; lvl <= currentLevel; lvl++) {
            await dropClassFeatures({features:classFeatures, updatedClass:cls, levelOverride:lvl, cascade});
            if(lvl > cls.subclassUnlockLevel && cls.subclass && cls.compendiumData.subclass) {
              const subclassFeatures = JSON.parse(cls.compendiumData.subclass) || {};
              await dropClassFeatures({features:subclassFeatures, updatedClass:cls, levelOverride:lvl, updateSubclass:true, cascade});
            }
          }
          featuresToRemove.value = [
            ...featuresToRemove.value,
            ...cls.featureIds.filter(f => f.expirantionLevel && f.expirantionLevel < cls.level+1),
          ];
          cls.featureIds = cls.featureIds.filter(f => !f.expirantionLevel || f.expirantionLevel >= cls.level+1);
          if (cls.level >= cls.subclassUnlockLevel) {
            featuresToRemove.value = [
              ...featuresToRemove.value,
              ...cls.subclassFeatureIds.filter(f => f.expirantionLevel && f.expirantionLevel < cls.level+1),
            ];
            cls.subclassFeatureIds = cls.subclassFeatureIds.filter(f => !f.expirantionLevel || f.expirantionLevel >= cls.level+1);
          }
        } else if(previous.level > cls.level) {
          featuresToRemove.value = [
            ...featuresToRemove.value,
            ...cls.featureIds.filter(f => f.level > cls.level),
          ];
          const previousLevels = Array.from({ length: previousLevel - cls.level }, (_, i) => previousLevel - i);
          for(let lvl = currentLevel; lvl >= 1; lvl--) {
            await dropClassFeatures({features:classFeatures, updatedClass:cls, levelOverride:lvl, updateSubclass:false, onlyExpired:true, previousLevels, cascade});
          }
          if (cls.level < cls.subclassUnlockLevel) {
              featuresToRemove.value = [
                ...featuresToRemove.value,
                ...cls.subclassFeatureIds,
              ];
              if(cls.subclassSpellcasting !== 'none' && cls.spellSourceId) {
                sourcesToRemove.value.push(cls.spellSourceId);
              }
              cls.subclass = '';
              cls.subclassFeatureIds = [];
              cls.subclassSourceBook = -1;
              cls.subclassSpellcasting = 'none';
          } else {
            featuresToRemove.value = [
              ...featuresToRemove.value,
              ...cls.subclassFeatureIds.filter(f => f.level > cls.level),
            ];
          }
        }
      } catch {
        console.warn('Error leveling up class');
      }
    }
  }));

  // Handle Ancestry and Background level changes
  const previousLevel = progression.getLevel;
  const newLevel = localClasses.value.reduce((sum, cls) => sum + cls.level, 0);
  if(previousLevel < newLevel) { //Level up
    await useProgressionStore().addFeaturesToAncestry(
      previousLevel + 1,
      newLevel,
      true,
      true
    );
    useProgressionStore().removeAncestryExpiredFeatures(newLevel);

    await useProgressionStore().addFeaturesToBackground(
      previousLevel + 1,
      newLevel
    );
    useProgressionStore().removeBackgroundExpiredFeatures(newLevel);
  } else if(previousLevel > newLevel) { //Level down
    const previousLevels = Array.from({ length: previousLevel - newLevel }, (_, i) => previousLevel - i);
    useProgressionStore().removeAncestryFeatures(newLevel);
    useProgressionStore().addFeaturesToAncestry(
      1,
      newLevel,
      true,
      true,
      true,
      previousLevels
    );  

    useProgressionStore().removeBackgroundFeatures(newLevel);
    useProgressionStore().addFeaturesToBackground(
      1,
      newLevel,
      true,
      previousLevels
    );
  }

  for (const id of classIdsToRemove.value) {
    progression.removeClass(id);
  }

  for (const id of spellIdsToRemove.value) {
    const existing = spells.spells.find((s) => s.spellSourceId === id);
    if(existing) spells.removeSpell(existing);
  }

  for (const feature of featuresToRemove.value) {
    useFeaturesStore().remove(feature.id);
  }

  for (const id of sourcesToRemove.value) {
    const existing = spells.sources.find((s) => s._id === id);
    if(existing) spells.removeSource(existing);
  }
  
  progression.classes = localClasses.value;
  spells.userSources = localSpellSources.value;

  useSidebar().close();
};
defineExpose({
  save,
  add,
});
</script>

<style lang="scss" scoped>
.view-container {
}
.class-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-gap-medium);
}
</style>
