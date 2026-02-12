<template>
  <div class="autocomplete-input" :class="{ disabled, readonly }">
    <datalist :id="datalistId">
      <option
        v-for="(option, i) in options"
        :key="i"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </datalist>
    <TextInput
      :list="datalistId"
      :model-value="modelValue"
      @update:modelValue="onChildUpdate"
      @clear="emitClear"
      :disabled="disabled"
      :readonly="readonly"
      :aria-label="ariaLabel || placeholder || 'Autocomplete input'"
      :placeholder="placeholder"
      :clear-on-esc="clearOnEsc"
      :show-clear-when="showClearWhen"
      :clear-aria-label="clearAriaLabel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import TextInput from './TextInput.vue';

interface Option {
  label: string
  value: string | number
}

const props =  withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  showDefaultOption?: boolean
  defaultOptionLabel?: string
  disabled?: boolean
  readonly?: boolean
  ariaLabel?: string
  placeholder?: string
  clearOnEsc?: boolean
  showClearWhen?: 'always' | 'hasValue' | 'hover'
  clearAriaLabel?: string
}>(), {
  clearOnEsc: false,
  showClearWhen: 'hover',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null | undefined): void
  (e: 'change', value: string | number | null): void
  (e: 'clear'): void;
}>()

const {
  modelValue,
  options,
  showDefaultOption = false,
  defaultOptionLabel = 'Choose...',
  disabled = ref(false),
  readonly = ref(false),
  ariaLabel,
  placeholder,
  clearOnEsc,
  showClearWhen,
  clearAriaLabel,
} = toRefs(props)

const datalistId = `datalist-${uuidv4()}`;

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value || null
  emit('update:modelValue', value)
  emit('change', value)
}

function onChildUpdate(value: string | number | null | undefined) {
  emit('update:modelValue', value)
  emit('change', value ?? null)
}

function emitClear() {
  emit('clear')
}
</script>

<style lang="scss" scoped>
.autocomplete-input {
  position: relative;
  display: inline-flex;
}

.autocomplete-input select {
  padding-right: 2rem;
}

.autocomplete-input .clear-btn {
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
}

.autocomplete-input.disabled .clear-btn,
.autocomplete-input.readonly .clear-btn {
  display: none;
}

.autocomplete-input:not(:hover):not(:focus-within) .clear-btn {
  display: none;
}

.autocomplete-input.disabled select {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
