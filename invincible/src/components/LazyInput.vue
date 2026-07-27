<template>
  <input
    ref="inputRef"
    :value="localValue"
    @input="onInput"
    @focus="onFocus"
    @blur="commit"
    @keydown="onKeydown"
    :placeholder="calculatedPlaceholder"
    spellcheck="false"
  />
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    isNumber?: boolean;
    isIncremental?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
  }>(),
  {
    isNumber: false,
    isIncremental: false,
  }
);

const calculatedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  if (props.isNumber && props.isIncremental) return String(props.modelValue ?? '');
  return '';
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const localValue = ref(String(props.modelValue ?? ''));
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = String(newVal ?? '');
  }
);

watch(
  [() => props.min, () => props.max],
  ([newMin, newMax]) => {
    if (!props.isNumber) return;
    const num = Number(props.modelValue);
    const parsed = isNaN(num) ? 0 : num;
    let clamped = parsed;

    if (newMin !== undefined && clamped < newMin) {
      clamped = newMin;
    }
    if (newMax !== undefined && clamped > newMax) {
      clamped = newMax;
    }

    if (clamped !== parsed) {
      emit('update:modelValue', clamped);
      localValue.value = String(clamped);
    }
  }
);

const onInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let val = input.value;

  if (props.isNumber) {
    
    const startsWithMinus = val.startsWith('-');
    const startsWithPlus = props.isIncremental && val.startsWith('+');
    const digits = val.replace(/\D/g, '');
    val = (startsWithMinus ? '-' : startsWithPlus ? '+' : '') + digits;
    
    
    input.value = val;
  }

  localValue.value = val;
};

const commit = () => {
  const val = localValue.value;
  if (props.isNumber) {
    
    if (val === '' || val === '-' || val === '+') {
      const revertValue = props.modelValue !== undefined ? Number(props.modelValue) : 0;
      const finalRevert = isNaN(revertValue) ? 0 : revertValue;
      emit('update:modelValue', finalRevert);
      nextTick(() => {
        localValue.value = String(props.modelValue ?? finalRevert);
      });
    } else {
      let parsed = 0;
      const isAdd = val.startsWith('+');
      const isSub = val.startsWith('-');

      if (props.isIncremental && (isAdd || isSub)) {
        const currentVal = Number(props.modelValue);
        const base = isNaN(currentVal) ? 0 : currentVal;
        const offset = Number(val.slice(1));
        const offsetNum = isNaN(offset) ? 0 : offset;

        if (isAdd) {
          parsed = base + offsetNum;
        } else {
          parsed = base - offsetNum;
        }
      } else {
        const num = Number(val);
        parsed = isNaN(num) ? 0 : num;
      }

      
      if (props.min !== undefined && parsed < props.min) {
        parsed = props.min;
      }
      if (props.max !== undefined && parsed > props.max) {
        parsed = props.max;
      }

      emit('update:modelValue', parsed);
      nextTick(() => {
        localValue.value = String(props.modelValue ?? parsed);
      });
    }
  } else {
    emit('update:modelValue', val);
    nextTick(() => {
      localValue.value = String(props.modelValue ?? val);
    });
  }
};

const onFocus = () => {
  if (props.isNumber && props.isIncremental) {
    localValue.value = '';
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    (event.target as HTMLInputElement).blur();
  }
};

defineExpose({
  focus: () => {
    inputRef.value?.focus();
  }
});
</script>
