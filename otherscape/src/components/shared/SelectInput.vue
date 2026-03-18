<template>
  <div class="select-input" :class="{ disabled, readonly, 'has-clear': showClear, 'placeholder': !hasValue }">
    <TextInput
      v-show="isCustomMode"
      v-model="customValue"
      @update:modelValue="updateCustomValue"
      @clear="clearCustomValue"
      placeholder="Custom..."
      ref="customValueEl"
    />
    <span
      v-if="!isCustomMode"
      class="select-display"
      :title="selectedDisplayLabel"
    >{{ selectedDisplayLabel }}</span>
    <select
      v-if="!isCustomMode"
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
        v-for="(option, i) in uniqueOptions"
        :key="i"
        :value="option.value"
        :disabled="allowedOptions ? !allowedOptions.some(o => o.value === option.value) : false"
      >
        {{ option.label }}
      </option>
      <option v-if="allowCustom" value="...">Custom...</option>
    </select>
    <button
      v-if="showClear && !isCustomMode"
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
  allowedOptions?: Option[];
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
const hasOptionForModelValue = computed(() => {
  const currentValue = modelValue.value;
  if (currentValue === null || currentValue === undefined || currentValue === '') return true;
  return uniqueOptions.value.some(option => String(option.value) === String(currentValue));
});

const isCustomMode = computed(() => {
  return Boolean(props.allowCustom && modelValue.value && (modelValue.value === '...' || !hasOptionForModelValue.value));
});

const clearCustomValue = () => {
  const value = showDefaultOption ? '' : undefined;
  customValue.value = '';
  emit('update:modelValue', value);
  emit('change', value === undefined ? null : value);
};

const updateCustomValue = (value: string) => {
  emit('update:modelValue', value);
  emit('change', value);
}

watch(() => modelValue.value, (val:any) => {
  if (val === '...') {
    customValue.value = '';
    nextTick(() => {
      customValueEl.value?.focus();
    });
    return;
  }

  if (isCustomMode.value) {
    customValue.value = String(val ?? '');
    return;
  }

  customValue.value = '';
});

const uniqueOptions = computed(() => {
  const unique: Option[] = [];
  props.options.forEach(opt => {
    if (!unique.some(u => u.value === opt.value)) {
      unique.push(opt);
    }
  });
  return unique;
});

const selectedDisplayLabel = computed(() => {
  const currentValue = modelValue.value;
  if (currentValue === '...') {
    return props.defaultOptionLabel ?? 'Choose...';
  }
  if (currentValue === null || currentValue === undefined || currentValue === '') {
    return props.defaultOptionLabel ?? 'Choose...';
  }

  const selected = uniqueOptions.value.find(option => String(option.value) === String(currentValue));
  if (selected) return selected.label;

  return String(currentValue);
});

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.select-input {
  position: relative;
  display: flex;
  select {
    border-bottom: 1px solid rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
    min-width: 100%;
    color: transparent!important; /* hide the default select text */
    option:disabled {
      color: var(--color-text-tertiary);
    }
  }
  &:hover:not(:focus-within) select {
    border-color: rgb(var(--color-palette-foreground) / 0.5);
  }
  &:focus-within select {
    border-color: rgb(var(--color-palette-highlight));
  }
}

.select-input.has-clear {
  select, .select-display {
    padding-right: 2rem;
  }
}

.text-input {
  min-width: 100%;
}

.select-display {
  font-family: var(--font-family-body);
  font-size: var(--font-size-medium);
  position: absolute;
  left: 0;
  bottom: 2px;
  width: 100%;
  pointer-events: none;
  color: var(--color-text-primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
  box-sizing: border-box;
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
    fill: var(--color-text-primary);
    
  }
  &:hover, &:focus {
    .svg-icon {
      fill: var(--color-negative)!important;
    }
  }
}

.select-input:hover, select-input:focus-within {
  .clear-btn {
    .svg-icon {
      fill: var(--color-text-primary);
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
