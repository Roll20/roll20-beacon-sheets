<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label>
          {{ $t('titles.background') }}
          <div class="columns columns-11">
            <div class="field span-10">
              <input type="text" v-model="localBackground.name" :readonly="isLocked"/>
            </div>
            <button :disabled="disabledRemoveBackground" class="span-1 button button--negative" type="button" @click="() => { removedBackground = true; localBackground.name = ''; }"><SvgIcon icon="delete" /></button>
          </div>
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { jsonClone } from '@/utility/jsonTools';
import { useSidebar } from './useSidebar';
import { type BackgroundProgression, type RaceProgression, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import SvgIcon from '../shared/SvgIcon.vue';

const progressionStore = useProgressionStore();

const localBackground = ref<BackgroundProgression>(jsonClone(progressionStore.background));
const form = ref<HTMLFormElement | null>(null);

const removedBackground = ref(false);

const isLocked = computed(() => {
  return (localBackground.value.name && localBackground.value.sourceBook && localBackground.value.sourceBook > 0) ? true : false;
});

const disabledRemoveBackground = computed(() => {
  return (!localBackground.value.name || localBackground.value.name.trim() === '') ? true : false;
});

const removeBackground = () => {
  progressionStore.removeBackground();
}

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  if(removedBackground.value) removeBackground();

  progressionStore.background.name = localBackground.value.name;

  useSidebar().close();
};

defineExpose({
  save,
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
