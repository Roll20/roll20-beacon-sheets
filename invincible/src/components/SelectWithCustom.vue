<template>
  <div class="select-with-custom relative inline-block w-full text-sm font-lexend">
    
    <span
      v-if="!isFocused"
      @click="startEdit"
      aria-hidden="true"
      :class="computedSpanClass"
    >
      {{ displayLabel }}
    </span>

    
    <select
      v-if="!isCustomMode && isOptionVal"
      ref="selectRef"
      :value="modelValue ?? ''"
      @change="onSelectChange"
      @focus="onSelectFocus"
      @blur="onSelectBlur"
      :class="[
        isFocused
          ? (selectClass || 'w-full border-2 border-black rounded p-1 font-bold text-black bg-white focus:outline-none focus:ring-0 cursor-pointer')
          : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
      ]"
    >
      
      <option value="" class="text-zinc-400 font-space-grotesk font-bold border-0 outline-none">
        {{ placeholder }}
      </option>
      
      
      <option
        v-for="opt in sortedOptions"
        :key="opt.value"
        :value="opt.value"
        :disabled="disabledOptions?.includes(opt.value)"
        class="font-space-grotesk font-bold border-0 outline-none"
      >
        {{ opt.label }}
      </option>

      
      <hr v-if="props.hasCustom">

      
      <option v-if="props.hasCustom" value="__CUSTOM__" class="font-space-grotesk font-bold border-0 outline-none">
        Custom...
      </option>
    </select>

    
    <LazyInput
      v-else
      ref="customInputRef"
      :model-value="isEnteringNewCustom ? '' : (modelValue ?? '')"
      @update:model-value="onCustomInputUpdate"
      @focus="onCustomInputFocus"
      @blur="onCustomInputBlur"
      placeholder="Enter custom value..."
      :class="[
        isFocused
          ? (inputClass || 'w-full border-2 border-black rounded p-1 font-bold text-black bg-white focus:outline-none')
          : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, nextTick } from 'vue';
import LazyInput from '@/components/LazyInput.vue';

interface OptionItem {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    options: OptionItem[];
    disabledOptions?: string[];
    placeholder: string;
    spanClass?: string;
    selectClass?: string;
    inputClass?: string;
    hasCustom?: boolean;
  }>(),
  {
    disabledOptions: () => [],
    hasCustom: true,
  }
);

const computedSpanClass = computed(() => {
  if (props.spanClass) {
    if (!props.modelValue) {
      return props.spanClass
        .replace('text-zinc-700', 'text-zinc-400')
    }
    return props.spanClass;
  }
  return [
    'cursor-pointer select-span block py-1 px-2 border border-dashed border-zinc-300 rounded hover:border-black font-bold text-center bg-zinc-50 hover:bg-white transition-colors',
    !props.modelValue ? 'text-zinc-400 font-normal italic' : 'text-black'
  ];
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const isFocused = ref(false);
const isCustomMode = ref(false);
const isEnteringNewCustom = ref(false);

const selectRef = ref<HTMLSelectElement | null>(null);
const customInputRef = ref<any>(null);

const sortedOptions = computed(() => {
  return [...props.options].sort((a, b) => a.label.localeCompare(b.label));
});

const isOptionVal = computed(() => {
  if (!props.modelValue) return true;
  return props.options.some(o => o.value === props.modelValue);
});

const displayLabel = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const opt = props.options.find(o => o.value === props.modelValue);
  return opt ? opt.label : props.modelValue;
});

const startEdit = () => {
  isFocused.value = true;
  isEnteringNewCustom.value = false;
  if (!isOptionVal.value) {
    isCustomMode.value = true;
    nextTick(() => {
      customInputRef.value?.focus();
    });
  } else {
    isCustomMode.value = false;
    nextTick(() => {
      if (selectRef.value) {
        selectRef.value.focus();
        if (typeof selectRef.value.showPicker === 'function') {
          try {
            selectRef.value.showPicker();
          } catch (err) {
            console.error('Failed to show picker:', err);
          }
        }
      }
    });
  }
};

const onSelectFocus = () => {
  isFocused.value = true;
  isEnteringNewCustom.value = false;
};

const onCustomInputFocus = () => {
  isFocused.value = true;
  isCustomMode.value = true;
};

const onSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const val = target.value;
  if (val === '__CUSTOM__') {
    isEnteringNewCustom.value = true;
    isCustomMode.value = true;
    nextTick(() => {
      customInputRef.value?.focus();
    });
  } else {
    emit('update:modelValue', val === '' ? null : val);
    isFocused.value = false;
  }
};

const onSelectBlur = () => {
  setTimeout(() => {
    if (!isCustomMode.value) {
      isFocused.value = false;
    }
  }, 150);
};

const onCustomInputUpdate = (val: string | number) => {
  const strVal = String(val).trim();
  if (strVal === '') {
    emit('update:modelValue', null);
  } else {
    const matchedOpt = props.options.find(
      o => o.value === strVal || o.label.toLowerCase() === strVal.toLowerCase()
    );
    if (matchedOpt) {
      emit('update:modelValue', matchedOpt.value);
    } else {
      emit('update:modelValue', strVal);
    }
  }
  isEnteringNewCustom.value = false;
  isCustomMode.value = false;
  isFocused.value = false;
};

const onCustomInputBlur = () => {
  setTimeout(() => {
    isEnteringNewCustom.value = false;
    isFocused.value = false;
    isCustomMode.value = false;
  }, 150);
};

watch(
  () => props.modelValue,
  () => {
    if (!isFocused.value) {
      isCustomMode.value = false;
    }
  }
);
</script>
<style scoped lang="scss">
</style>
