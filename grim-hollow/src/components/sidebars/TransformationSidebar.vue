<template>
  <form ref="form" class="view-container" @submit.prevent="save">
    <div class="columns columns-4">
      <label class="field span-3">
        {{ $t('titles.name') }}
        <input
          v-model="localTransformation.name"
          :readonly="isTransformationLocked"
        />
      </label>
      <label class="span-1">
        {{ $t('titles.level') }}:
        <div class="columns columns-5">
          <select
            class="span-3"
            v-model="localTransformation.level"
          >
            <option v-for="i in 5" :key="i-1" :value="i-1">{{ i-1 === 0 ? '-' : i-1 }}</option>
          </select>
          <button type="button" class="span-2 button button--negative" @click="remove"><SvgIcon icon="delete" /></button>
        </div>
      </label>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
import type { TransformationProgression } from '@/sheet/stores/progression/progressionStore';
import SvgIcon from '../shared/SvgIcon.vue';

const form = ref<HTMLFormElement | null>(null);

const progression = useProgressionStore();
const localTransformation = ref<TransformationProgression>(jsonClone(progression.transformation));
const featuresToRemove = ref<FeatureId[]>([]);

const isTransformationLocked = computed(() => {
  return progression.transformation.sourceBook > -1 && !shouldRemove.value;
});
const shouldRemove = ref(false);

const save = async () => {
  if (form.value && !form.value.reportValidity()) return;

  if(shouldRemove.value) {
    progression.removeTransformation();
  }

  // Handle Transformation level changes
  const previousLevel = progression.transformation.level;
  const newLevel = localTransformation.value.level;
  if(previousLevel < newLevel) { //Level up
    await useProgressionStore().addFeaturesToTransformation(
      previousLevel + 1,
      newLevel,
      //true
    );
    useProgressionStore().removeTransformationExpiredFeatures(newLevel);
  } else if(previousLevel > newLevel) { //Level down
    const previousLevels = Array.from({ length: previousLevel - newLevel }, (_, i) => previousLevel - i);
    useProgressionStore().removeTransformationFeatures(newLevel);
    useProgressionStore().addFeaturesToTransformation(
      1,
      newLevel,
      true,
      previousLevels
    );
  }

  progression.transformation.name = localTransformation.value.name;
  progression.transformation.level = localTransformation.value.level;
  useSidebar().close();
};

const remove = () => {
  localTransformation.value.name = '';
  localTransformation.value.level = 0;
  shouldRemove.value = true;
};
defineExpose({
  save
});
</script>

<style lang="scss" scoped>
.field {
  position: relative;
  &:has(input[readonly]) {
    position: relative;
    input {
      cursor: not-allowed;
      outline: none;
    }
    &:after {
      content: '🔒';
      position: absolute;
      right: 4px;
      bottom: 4px;
      font-size: var(--size-font-large);
    }
  }
}
label {
  opacity: 1!important;
}
button[disabled] {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.35;
}
</style>
