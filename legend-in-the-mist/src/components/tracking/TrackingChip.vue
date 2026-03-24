<template>
  <div :class="['trackingchip', 'chip', isTag ? 'chip--tag' : 'chip--status']">
    <div class="chip__title">
      <div class="chip__mode">
        <div class="chip__indicator" :class="{'chip__indicator--bonus': tracker.mode === 'bonus', 'chip__indicator--penalty': tracker.mode === 'penalty'}">
          <SvgIcon v-if="tracker.mode === 'bonus'" icon="Power" />
          <SvgIcon v-if="tracker.mode === 'penalty'" icon="Weakness" />
        </div>
        <select v-model="tracker.mode" :disabled="tracker.scratched">
          <option :value="undefined">Choose...</option>
          <option value="bonus">Bonus</option>
          <option value="penalty">Penalty</option>
        </select>
      </div>
      <TextInput v-model="tracker.name" class="chip__label" @clear="deleteChip" :placeholder="isTag ? 'Tag' : 'Status'" :disabled="tracker.scratched"/>
      <div class="scratched-toggle image-toggle" v-if="isTag">
        <template v-if="!(tracker.name.trim() === '')">
          <input type="checkbox" v-model="tracker.scratched" :disabled="tracker.name.trim() === '' || tracker.mode === 'penalty'"/>
          <SvgIcon icon="Scratched"/>
        </template>
      </div>
    </div>
    <div class="chip__stages">
      <div v-for="stage in [1, 2, 3, 4, 5, 6]" :key="stage" :class="`chip__stage chip__stage--${stage}`">
        <input type="checkbox" :checked="getStageValue(stage)" @change="setStageValue(stage, ($event.target as HTMLInputElement).checked)" :disabled="tracker.scratched" />
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
  --color-textinput-line: #8ba892;
  padding: 10px;
  background: var(--color-trackingchip-background);
  border-radius: 5px;
  display: inline-block;
  border: 2px solid rgba(0, 0, 0, 0.0);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  min-width: 184px;
  border: 2px solid #a4b5a6;
  box-sizing: border-box;
  &__label {
    width: 0px;
    min-width: 100%;
  }
  &__stages {
    display: flex;
    gap: 5px;
    justify-content: space-between;
  }
  &__stage {
    display: grid;
    grid-template-areas: "stack";
    background-color: var(--color-textinput-line);
    border-radius: 3px;
    color: var(--color-herocard-title);
    box-sizing: border-box;
    width: 21px;
    height: 21px;
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
    }
    &:has(input:checked) {
      background-color: var(--color-herocard-title);
      color: rgb(5, 44, 31);
      border: 2px solid white;
    }
    &:has(input:disabled) {
      input {
        cursor: not-allowed;
      }
      opacity: 0.5;
    }
  }
  &__title {
    position: relative;
    margin-bottom: 10px;
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
      &:disabled {
        cursor: not-allowed;
      }
    }
  }
  &__indicator {
    background-color: var(--color-textinput-line);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    .svg-icon {
      width: 8px;
      height: 8px;
    }
    &--bonus, &--penalty {
      background-color: var(--color-herocard-title);
    }
  }
  &:deep(.text-input) {
    input {
      color: var(--color-herocard-title);
      font-weight: bold;
      padding-left: 20px;
      &::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }
    }
    .svg-icon {
      fill: var(--color-herocard-title);
    }
    button {
      color: var(--color-herocard-title);
    }
  }
  &:deep(.svg-icon--Power) {
    svg {
      fill: var(--color-positive);
    }
  }
  &:deep(.svg-icon--Weakness) {
    svg {
      fill: var(--color-negative);
    }
  }
}
.chip--tag {
  --color-trackingchip-background: #CFB97D;
  --color-textinput-line: #a8a18b;
  border-color: #b5b0a4;
}
.chip--tag {
  .chip__title {
    position: relative;
    &:has(.scratched-toggle input:checked) {
      .scratched-toggle {
        opacity: 1;
      }
      :deep(.text-input) {
        input {
          padding-right: 20px;
          text-decoration: line-through;
        }
      }
    }
    &:hover, &:focus-within {
      .scratched-toggle {
        opacity: 1;
      }
      :deep(.text-input:not(.disabled)) {
        input {
          padding-right: 35px!important;
        }
        .clear-btn {
          right: 20px;
          display: block!important;
        }
      }
    }
  }
  .scratched-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    transition: opacity ease 0.2s;
    opacity: 0;
    position: absolute;
    top: calc(calc(50% - var(--toggle-size) / 2));
    right: 0;
    .svg-icon {
      width: var(--toggle-size);
      height: var(--toggle-size);
      fill: rgb(var(--color-palette-foreground));
    }
    &:has(input:checked) {
      input[type="text"] {
        text-decoration: line-through;
      }
      .svg-icon {
        fill: rgb(var(--color-palette-neon));
        filter: drop-shadow(0px 0px 5px rgb(var(--color-palette-foreground)));
      }
    }
    &:not(:has(input:checked)) {
      .svg-icon {
        opacity: 0.35;
      }
    }
    &:has(input:disabled) {
      input { cursor: not-allowed; }
    }
    &.broken {
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>