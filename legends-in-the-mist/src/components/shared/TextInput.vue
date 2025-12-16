<template>
  <div class="text-input" :class="[{ 'has-value': hasValue, disabled, readonly }]">
    <input
      ref="inputEl"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @keydown.esc="clearOnEsc && clear()"
      @blur="onBlur"
      :aria-label="ariaLabel || placeholder || 'Text input'"
      :list="list"
    />

    <button
      v-if="showClear"
      class="clear-btn"
      type="button"
      @click="clear"
      :aria-label="clearAriaLabel"
      :disabled="disabled || readonly"
    >
      <SvgIcon icon="Close" />
    </button>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/shared/SvgIcon.vue';
import { computed, ref, toRef } from 'vue'

type InputType = 'text' | 'search' | 'email' | 'url' | 'tel' | 'password'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  type?: InputType
  list?: string
  disabled?: boolean
  readonly?: boolean
  clearOnEsc?: boolean
  showClearWhen?: 'always' | 'hasValue' | 'hover'
  ariaLabel?: string
  clearAriaLabel?: string
}>(), {
  type: 'text',
  clearOnEsc: false,
  showClearWhen: 'hover',
  list: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'clear'): void;
}>()

const modelValue = toRef(props, 'modelValue');
const placeholder = toRef(props, 'placeholder');
const type = toRef(props, 'type');
const disabled = toRef(props, 'disabled');
const readonly = toRef(props, 'readonly');
const clearOnEsc = toRef(props, 'clearOnEsc');
const showClearWhen = toRef(props, 'showClearWhen');
const ariaLabel = toRef(props, 'ariaLabel');
const clearAriaLabel = toRef(props, 'clearAriaLabel');

const inputEl = ref<HTMLInputElement | null>(null);

const hasValue = computed(() => (modelValue.value ?? '').length > 0);

const showClear = computed(() => {
  if (disabled.value || readonly.value) return false;
  if (showClearWhen.value === 'always') return true;
  if (showClearWhen.value === 'hover') return hasValue.value;
  return hasValue.value;
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function onBlur(e: Event) {
  const target = e.target as HTMLInputElement;
  if(target.value.trim() === '') clear(false);
}

function clear(returnFocus:boolean | MouseEvent = true) {
  if (disabled.value || readonly.value) return;
  emit('update:modelValue', '');
  emit('clear');
  if (returnFocus) inputEl.value?.focus();
};

function focus() {
  inputEl.value?.focus();
}

defineExpose({ focus, clear });
</script>

<style lang="scss" scoped>
.text-input {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.line-through {
  input {
    text-decoration: line-through;
  }
}

.text-input input {
  padding-right: 2rem; /* room for the clear button */
  border: 0;
  background: transparent;
  border-bottom: 1px solid var(--color-textinput-line);
}

input[list]::-webkit-calendar-picker-indicator {
  display: none!important;
}
input[list] {
  appearance: none!important;
  -webkit-appearance: none!important;
  -moz-appearance: none!important;
}

.text-input .clear-btn {
  position: absolute;
  right: 0.5rem;
  inset-block-start: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  .svg-icon {
    width: 8px;
    height: 8px;
  }
  &:hover, &:focus {
    .svg-icon {
      fill: var(--color-negative);
    }
  }
}

.text-input.disabled .clear-btn,
.text-input.readonly .clear-btn {
  display: none;
}

/* Optional: only show clear on hover if desired */
.text-input:not(.disabled):not(.readonly):hover .clear-btn {
  /* works with showClearWhen: 'hover', but we still guard with hasValue in JS */
}

.text-input--centered {
  input {
    text-align: center;
    padding-left: 2rem;
  }
}

.text-input:not(:hover):not(:focus-within) .clear-btn {
  display: none;
}
</style>
