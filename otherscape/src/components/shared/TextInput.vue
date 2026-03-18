<template>
  <div class="text-input" :class="[{ 'has-value': hasValue, disabled, readonly, 'has-clear': showClear, 'auto-hide': autoHidePlaceholder }]">
    <input
      ref="inputEl"
      :type="type"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @keydown.esc="clearOnEsc && clear()"
      @focus="isFocused = true"
      @blur="onBlur"
      :aria-label="ariaLabel || placeholder || 'Text input'"
      :list="list"
      spellcheck="false"
      v-tooltip="displayValue !== modelValue ? { content: modelValue, delay: { show: 1000 } } : ''"
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
  autoHidePlaceholder?: boolean
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
const isFocused = ref(false);

const hasValue = computed(() => (modelValue.value ?? '').length > 0);

function getTruncatedValue(): string {
  if (isFocused.value || !hasValue.value || !inputEl.value) {
    return modelValue.value;
  }

  const computedStyle = window.getComputedStyle(inputEl.value);
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const inputWidth = inputEl.value.offsetWidth - paddingLeft - paddingRight;
  
  if (!inputWidth) return modelValue.value;

  const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const ellipsis = '...';

  // Measure text width using canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return modelValue.value;

  ctx.font = font;
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  const availableWidth = inputWidth - ellipsisWidth;

  let displayText = modelValue.value;
  if(ctx.measureText(displayText).width <= inputWidth) {
    return displayText; // No truncation needed
  } else {
    while (ctx.measureText(displayText).width > availableWidth && displayText.length > 0) {
      displayText = displayText.slice(0, -1);
    }
    return displayText + ellipsis;
  }
}

const displayValue = computed(() => getTruncatedValue());

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
  isFocused.value = false;
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

const currentPlaceholder = computed(() => {
  if (props.autoHidePlaceholder && isFocused.value) {
    return '';
  }
  return placeholder.value;
});

defineExpose({ focus, clear });
</script>

<style lang="scss" scoped>
.text-input {
  position: relative;
  display: flex;
  align-items: center;
}

.line-through {
  input {
    text-decoration: line-through;
  }
}

.text-input.has-clear.has-value {
  input {
    padding-right: 2rem; /* room for the clear button */
  }
}
.text-input input {
  border: 0;
  background: transparent;
  border-bottom: 1px solid rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
  color: var(--color-text-primary);
  min-width: 100%;
  &:hover:not(:focus) {
    border-color: rgb(var(--color-palette-foreground) / 0.5);
  }
  &:focus {
    border-color: rgb(var(--color-palette-highlight));
  }
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
    fill: var(--color-text-primary);
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
  }
  &.has-clear {
    input {
      padding-left: 2rem;
    }
  }
}

.text-input:not(:hover):not(:focus-within) .clear-btn {
  display: none;
}
.text-input.auto-hide:not(:hover):not(:focus-within) input {
  &::placeholder {
    color: transparent;
  }
}
input {
  font-family: var(--font-family-body);
}
</style>
