<template>
  <div class="labeled-text-field">
    <!-- View mode -->
    <p v-if="!editMode">
      <strong>{{ label }}:</strong>
      {{ displayValue }}
      <span v-if="secondary">({{ secondary }})</span>
    </p>
    <!-- Edit mode -->
    <div v-else class="npc-statblock__edit-row">
      <strong>{{ label }}:</strong>
      <input
        :type="isNumeric ? 'number' : 'text'"
        :value="primary"
        @input="handleInput"
        :class="{ 'npc-statblock__ac-input': isNumeric }"
      />
      <!-- Secondary input is only shown if it is provided -->
      <template v-if="secondary !== undefined">
        <span>(</span>
        <input
          :value="secondary"
          @input="$emit('update:secondary', ($event.target as HTMLInputElement).value)"
          :placeholder="$t('titles.description')"
        />
        <span>)</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';


const props = defineProps({
  editMode: { type: Boolean, required: true },
  label: { type: String, required: true },
  primary: { type: [String, Number], required: true },
  secondary: { type: String, default: undefined },
  displayValue: { type: [String, Number], default: undefined },
  isNumeric: { type: Boolean, default: false },
});

const emit = defineEmits(['update:primary', 'update:secondary']);

//Handles input events and ensures that numeric inputs emit numbers to prevent prop type validation errors.
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.isNumeric ? Number(target.value) : target.value;
  emit('update:primary', value);
};

</script>

<style lang="scss" scoped>
.npc-statblock__edit-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  input {
    flex-grow: 1;
  }
}
.npc-statblock__ac-input {
  width: 50px;
  flex-grow: 0;
}
</style>