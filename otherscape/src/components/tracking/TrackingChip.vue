<template>
  <div :class="['trackingchip', 'chip', isTag ? 'chip--tag' : 'chip--status']">
    <div class="chip__title">
      <div class="chip__mode">
        <div class="chip__indicator" :class="{'chip__indicator--bonus': tracker.mode === 'bonus', 'chip__indicator--penalty': tracker.mode === 'penalty'}">
          <SvgIcon v-if="tracker.mode === 'bonus'" icon="Power" />
          <SvgIcon v-if="tracker.mode === 'penalty'" icon="Weakness" />
        </div>
        <select v-model="tracker.mode">
          <option :value="undefined">Choose...</option>
          <option value="bonus">Bonus</option>
          <option value="penalty">Penalty</option>
        </select>
      </div>
      <TextInput v-model="tracker.name" class="chip__label text-input--centered" @clear="deleteChip" placeholder="Tag"/>
    </div>
    <div class="chip__stages">
      <div v-for="stage in [1, 2, 3, 4, 5, 6]" :key="stage" :class="`chip__stage chip__stage--${stage}`">
        <input type="checkbox" :checked="getStageValue(stage)" @change="setStageValue(stage, ($event.target as HTMLInputElement).checked)" />
        <span>{{ stage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Tracker } from '@/sheet/stores/trackers/trackersStore';
import TextInput from '../shared/TextInput.vue';
import { computed } from 'vue';
import { trackersStore } from '@/sheet/stores/trackers/trackersStore';
import SvgIcon from '../shared/SvgIcon.vue';

const props = withDefaults(defineProps<{
  tracker: Tracker;
  }>(), {
});

const trackers = trackersStore();

const getStageValue = (stage: number): boolean => {
  const key = `level_${stage}` as const;
  return (props.tracker.stages as any)?.[key] ?? false;
};

const setStageValue = (stage: number, val: boolean): void => {
  const key = `level_${stage}` as const;
  if (!props.tracker.stages) return;
  (props.tracker.stages as any)[key] = val;
};

const deleteChip = (): void => {
  console.log(1);
  trackers.deleteTracker(props.tracker._id);
};

const isTag = computed(() => {
  return Object.values(props.tracker.stages).filter(value => value).length === 0;
});
</script>

<style lang="scss" scoped>
.chip {
  padding: 10px;
  background: rgb(var(--color-palette-background));
  border-radius: 5px;
  display: inline-block;
  box-shadow: 0 0 10px rgb(var(--color-palette-shadow));
  min-width: var(--card-width);
  border: 2px solid rgb(var(--color-palette-foreground) / 0.15);
  box-sizing: border-box;
  &__label {
    width: 0px;
    min-width: 100%;
    margin-bottom: 10px;
  }
  &__stages {
    display: flex;
    gap: 5px;
    justify-content: space-between;
  }
  &__stage {
    display: grid;
    grid-template-areas: "stack";
    background-color: rgb(var(--color-palette-default) / 0.25);
    box-sizing: border-box;
    width: 21px;
    height: 21px;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    input, span {
      grid-area: stack;
      place-self: center;
    }
    input {
      min-width: 100%;
      min-height: 100%;
      opacity: 0;
    }
    span {
      pointer-events: none;
      user-select: none;
      color: rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
      font-weight: bold;
      font-family: var(--font-family-title);
    }
    &:hover {
      background-color: rgb(var(--color-palette-default) / 0.5);
    }
    &:has(input:checked) {
      span {
        color: rgb(var(--color-palette-foreground) / 0.9);
      }
      // &:after {
      //   content: '';
      //   position: absolute;
      //   width: calc(100% - 2px);
      //   height: calc(50% - 2px);
      //   background-color: rgb(255 255 255 / 0.25);
      //   border-radius: 2px;
      //   top: 1px;
      //   left: 1px;
      //   pointer-events: none;
      // }
    }
    &--1 {
      &:has(input:checked) {
        background-color: #672ED3;
      }
    }
    &--2 {
      &:has(input:checked) {
        background-color: #842CE0;
      }
    }
    &--3 {
      &:has(input:checked) {
        background-color: #9521BA;
      }
    }
    &--4 {
      &:has(input:checked) {
        background-color: #A71695;
      }
    }
    &--5 {
      &:has(input:checked) {
        background-color: #C20C73;
      }
    }
    &--6 {
      &:has(input:checked) {
        background-color: #CD024C;
      }
    }
  }
  &__title {
    position: relative;
  }
  &__mode {
    width: var(--toggle-size);
    height: var(--toggle-size);
    display: grid;
    grid-template-areas: "stack";
    border-radius: 3px;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    cursor: pointer;
    > select, > div {
      width: var(--toggle-size);
      height: var(--toggle-size);
      grid-area: stack;
      place-self: center;
    }
    select {
      opacity: 0;
      cursor: pointer;
    }
    &:hover {
      .chip__indicator {
        background-color: rgb(var(--color-palette-default) / 0.5);
      }
    }
  }
  &__indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    background-color: rgb(var(--color-palette-default) / 0.25);

    .svg-icon {
      width: 8px;
      height: 8px;
    }
    &--bonus, &--penalty {
      // background-color: var(--color-herocard-title);
    }
  }
  &:deep(.text-input) {
    input {

      font-family: var(--font-family-title);
      font-size: var(--font-size-xlarge);
      padding-bottom: 5px;
      margin-top: -5px;
      &::placeholder {

      }
    }
    .svg-icon {
      //fill: var(--color-herocard-title);
    }
    button {

    }
  }
  &:deep(.svg-icon--Power) {
    svg {
      fill: rgb(var(--color-palette-highlight));
      filter: drop-shadow(0 0 5px rgb(var(--color-palette-shadow)));
    }
  }
  &:deep(.svg-icon--Weakness) {
    svg {
      fill: var(--color-negative);
      filter: drop-shadow(0 0 5px rgb(var(--color-palette-shadow)));
    }
  }
}
.chip--tag {
  --color-trackingchip-background: #CFB97D;
  --color-textinput-line: #a8a18b;
}
</style>