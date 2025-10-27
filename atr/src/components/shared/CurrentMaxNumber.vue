<template>
  <div class="current-max-number">
    <button class="button-minus" @click="decrease">-</button>

    <div class="input-wrapper">
      <input
        type="text"
        class="input"
        v-model="localValue"
        @input="onInputFilter"
        @blur="onInput"
        @keyup.enter="onInput"
        ref="input"
      />
      <span class="divider">/</span>
      <span class="max">{{ max }}</span>
    </div>

    <button class="button-plus" @click="increase">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';


const props = defineProps<{
  count: number;
  max: number;
}>();

const localValue = ref(props.count);

watch(() => props.count, (val) => {
  localValue.value = val;
});

const input = ref<HTMLInputElement | null>(null);

const onInputFilter = (event: Event) => {
  const inputEl = event.target as HTMLInputElement;
  const match = inputEl.value.match(/^([+-]?\d*)$/);
  if (!match) {
    inputEl.value = inputEl.value.slice(0, -1);
  }
};

const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

const onInput = () => {
  const value = localValue.value.toString();
  let update = props.count;
  if (value[0] === '-') {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.max(0, props.count - raw);
  } else if (value[0] === '+') {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.min(props.max, props.count + raw);
  } else {
    const raw = Math.min(props.max, Math.max(0, parseInt(value))) || 0;
    update = raw;
  }
  if (input.value) {
    input.value.blur();
  }
  localValue.value = update;
  emit('update', update);
};

const decrease = () => {
  emit('update', Math.max(0, Math.max(props.count - 1, 0)));
};

const increase = () => {
  emit('update', Math.min(props.count + 1, props.max));
};
</script>

<style lang="scss" scoped>
.current-max-number {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  border: 1px solid var(--color-tertiary);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--color--background);
  color: var(--color-primary);

  .input-wrapper {
    position: relative;
    display: grid;
    grid-template-columns: 1fr min-content 1fr;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
    align-items: start;
  }

  .input {
    flex: 1;
    border: none;
    font-size: 1rem;
    padding-right: 2.5rem;
    text-align: right;
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
  }

  .input:focus {
    outline: none;
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
  }
  .button-minus {
    border-right: 1px solid var(--color-tertiary);
  }
  .button-plus {
    border-left: 1px solid var(--color-tertiary);
  }

  .button-minus:hover,
  .button-plus:hover {
    background-color: #ddd;
  }
}
</style>
