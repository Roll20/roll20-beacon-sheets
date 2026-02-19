<template>
  <div class="select-input" :class="{ disabled, readonly }">
    <TextInput
      v-show="allowCustom && (modelValue === '...' || !includesCustomOption) && modelValue"
      v-model="customValue"
      @update:modelValue="updateCustomValue"
      @clear="clearCustomValue"
      placeholder="Custom..."
      ref="customValueEl"
    />
    <select
      v-if="!(allowCustom && (modelValue === '...' || !includesCustomOption) && modelValue)"
      ref="selectEl"
      :value="modelValue"
      :disabled="disabled"
      :readonly="readonly"
      @change="onChange"
      :aria-label="ariaLabel || placeholder || 'Select input'"
    >
      <!-- Optional blank default option -->
      <option
        v-if="showDefaultOption"
        :value="''"
        disabled
        :selected="!modelValue"
      >
        {{ defaultOptionLabel }}
      </option>

      <!-- Options -->
      <option
        v-for="(option, i) in options"
        :key="i"
        :value="option.value"
      >
        {{ option.label }}
      </option>
      <option v-if="allowCustom" value="...">Custom...</option>
    </select>
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
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import SvgIcon from '@/components/shared/SvgIcon.vue';
import TextInput from './TextInput.vue';

interface Option {
  label: string
  value: string | number
}

const props =  withDefaults(defineProps<{
  modelValue: string | number | null | undefined
  options: Option[]
  showDefaultOption?: boolean
  defaultOptionLabel?: string
  disabled?: boolean
  readonly?: boolean
  ariaLabel?: string
  placeholder?: string
  clearOnEsc?: boolean
  showClearWhen?: 'never' | 'always' | 'hasValue' | 'hover'
  clearAriaLabel?: string
  allowCustom?: boolean 
}>(), {
  clearOnEsc: false,
  showClearWhen: 'never',
  allowCustom: false,
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

const selectEl = ref<HTMLSelectElement | null>(null);

const hasValue = computed(() => modelValue.value !== null && modelValue.value !== undefined && modelValue.value !== '');

const showClear = computed(() => {
  if (disabled.value || readonly.value) return false;
  if (showClearWhen.value === 'never') return false;
  if (showClearWhen.value === 'always') return true;
  if (showClearWhen.value === 'hover') return hasValue.value;
  return hasValue.value;
});

function clear(returnFocus:boolean | MouseEvent = true) {
  if (disabled.value || readonly.value) return;
  emit('update:modelValue', showDefaultOption ? undefined : '');
  emit('clear');
  if (returnFocus) selectEl.value?.focus();
};

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value || null
  emit('update:modelValue', value)
  emit('change', value)
}

function focus() {
  selectEl.value?.focus()
}

const getInitialCustomValue = () => {
  return modelValue.value === '...' ? '' : String(modelValue.value) || '';
};

const customValueEl = ref();
const customValue = ref<string>(getInitialCustomValue());
const includesCustomOption = computed(() => {
  if(!customValue.value) return true;
  return props.options.filter(opt => opt.value === customValue.value).length > 0;
});

const clearCustomValue = () => {
  const value = showDefaultOption ? '' : undefined;
  modelValue.value = value;
  customValue.value = '';
  emit('update:modelValue', value);
  emit('change', value === undefined ? null : value);
};

const updateCustomValue = (value: string) => {
  modelValue.value = value;
  emit('update:modelValue', value);
  emit('change', value);
}

watch(() => modelValue.value, (val:any) => {
  if (val === '...') {
    nextTick(() => {
      customValueEl.value?.focus();
    });
  }
});

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.select-input {
  position: relative;
  display: inline-flex;
}

.select-input select {
  padding-right: 2rem;
}

.select-input .clear-btn {
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

.select-input.disabled .clear-btn,
.select-input.readonly .clear-btn {
  display: none;
}

.select-input:not(:hover):not(:focus-within) .clear-btn {
  display: none;
}

.select-input.disabled select {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
