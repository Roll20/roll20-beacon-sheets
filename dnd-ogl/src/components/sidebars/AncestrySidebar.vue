<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label>
          {{ $t('titles.race') }}
          <div class="columns columns-11">
            <div class="field span-10">
              <input type="text" v-model="localAncestry.name" :readonly="isLocked"/>
            </div>
            <button :disabled="disabledRemoveRace" class="span-1 button button--negative" type="button" @click="() => { removedRace = true; localAncestry.name = ''; localAncestry.subrace = ''; }"><SvgIcon icon="delete" /></button>
          </div>
        </label>
        <label>
          {{ $t('titles.subrace') }}
          <div class="columns columns-11">
            <div class="field span-10">
              <input type="text" v-model="localAncestry.subrace" :readonly="isLocked || !localAncestry.name.trim()"/>
            </div>
            <button :disabled="disabledRemoveSubrace" class="span-1 button button--negative" type="button" @click="() => { removedSubrace = true; localAncestry.subrace = ''; }"><SvgIcon icon="delete" /></button>
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
import { type RaceProgression, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import SvgIcon from '../shared/SvgIcon.vue';

const localAncestry = ref<RaceProgression>(jsonClone(useProgressionStore().ancestry));
const form = ref<HTMLFormElement | null>(null);

const progressionStore = useProgressionStore();

const removedRace = ref(false);
const removedSubrace = ref(false);

const isLocked = computed(() => {
  return (localAncestry.value.name && localAncestry.value.sourceBook && localAncestry.value.sourceBook > 0) ? true : false;
});

const disabledRemoveRace = computed(() => {
  return (!localAncestry.value.name || localAncestry.value.name.trim() === '') ? true : false;
});

const disabledRemoveSubrace = computed(() => {
  return (!localAncestry.value.subrace || localAncestry.value.subrace.trim() === '') ? true : false;
});


const removeRace = () => {
  progressionStore.removeRace();
}

const removeSubrace = () => {
  progressionStore.removeSubrace();
}

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  if(removedRace.value) removeRace();
  else if(removedSubrace.value) removeSubrace();

  progressionStore.ancestry.name = localAncestry.value.name;
  progressionStore.ancestry.subrace = localAncestry.value.subrace;

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
