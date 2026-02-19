<template>
  <div class="incrementor-input" :class="{ disabled, readonly }">
    <button class="button-minus" @click="decrease" :disabled="disabled || readonly">-</button>

    <div class="input-wrapper">
      <input
        type="text"
        class="input"
        :value="localValue"
        @input="onInputFilter"
        @blur="onInput"
        @keyup.enter="onInput"
        ref="inputEl"
        :disabled="disabled"
        :readonly="readonly"
        :aria-label="ariaLabel || placeholder || 'Incrementor input'"
      />
      <template v-if="max">
        <span class="divider">/</span>
        <span class="max">{{ max }}</span>
      </template>
    </div>

    <button class="button-plus" @click="increase" :disabled="disabled || readonly">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: number;
  max?: number;
  min?: number;
  disabled?: boolean;
  readonly?: boolean;
  ariaLabel?: string;
  placeholder?: string;
}>(), {
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const localValue = ref(props.modelValue);
const disabled = toRef(props, 'disabled');
const readonly = toRef(props, 'readonly');
const ariaLabel = toRef(props, 'ariaLabel');
const placeholder = toRef(props, 'placeholder');

watch(() => props.modelValue, (val) => {
  localValue.value = val;
});

const inputEl = ref<HTMLInputElement | null>(null);

const onInputFilter = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const match = el.value.match(/^([+-]?\d*)$/);
  if (!match) {
    el.value = el.value.slice(0, -1);
  }
};

const onInput = () => {
  const value = (inputEl.value?.value ?? localValue.value.toString()).trim();
  let update = props.modelValue;
  const minValue = props.min ?? -Infinity;
  const maxValue = props.max ?? Infinity;

  if (value[0] === '-') {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.max(minValue, props.modelValue - raw);
  } else if (value[0] === '+') {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.min(maxValue, props.modelValue + raw);
  } else {
    const parsed = parseInt(value);
    const raw = Number.isNaN(parsed) ? 0 : parsed;
    update = Math.min(maxValue, Math.max(minValue, raw));
  }
  
  if (inputEl.value) {
    inputEl.value.blur();
  }
  
  localValue.value = update;
  emit('update:modelValue', update);
};

const decrease = () => {
  if (disabled.value || readonly.value) return;
  const newValue = Math.max(props.min || -Infinity, props.modelValue - 1);
  emit('update:modelValue', newValue);
};

const increase = () => {
  if (disabled.value || readonly.value) return;
  const newValue = Math.min(props.modelValue + 1, props.max || Infinity);
  emit('update:modelValue', newValue);
};

function focus() {
  inputEl.value?.focus();
}

defineExpose({ focus });
</script>

<style lang="scss" scoped>
.incrementor-input {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  border: 1px solid var(--color-tertiary);
  overflow: hidden;
  background-color: var(--color--background);
  color: var(--color-primary);

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.readonly {
    opacity: 0.8;
    cursor: default;
  }

  .input-wrapper {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    align-items: start;
  }

  .input {
    flex: 1;
    border: none;
    font-size: 1rem;
    padding-right: 2.5rem;
    text-align: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0;
    margin: 0;
    -moz-appearance: textfield;
    background: transparent;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &:focus {
      outline: none;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .max {
    color: var(--color-tertiary);
    white-space: nowrap;
    box-sizing: border-box;
    width: 100%;
    display: block;
  }

  .button-minus,
  .button-plus {
    background-color: var(--color-disabled);
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    width: 2.5rem;
    user-select: none;
    color: var(--color-secondary);
    font-size: var(--size-font-large);

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:hover:not(:disabled) {
      background-color: #ddd;
    }
  }

  .button-minus {
    border-right: 1px solid var(--color-tertiary);
  }

  .button-plus {
    border-left: 1px solid var(--color-tertiary);
  }
}
</style>