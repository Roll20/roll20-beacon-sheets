<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-200 ease-in-out outline-none"
    :class="modelValue ? 'bg-primary' : 'bg-zinc-300'"
    v-tooltip="modelValue ? 'Disable' : 'Enable'"
  >
    <span
      class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black shadow-sm ring-0 transition duration-200 ease-in-out -translate-y-0.5"
      :class="modelValue ? 'translate-x-4.5' : '-translate-x-0.5'"
    />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>
