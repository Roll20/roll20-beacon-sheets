<template>
  <div class="npc-statblock__section">
    <div class="npc-statblock__section-header">
      <h3>{{ title }}</h3>
      <!-- "Add" button in edit mode -->
      <button v-if="editMode" @click="$emit('add')" type="button" class="npc-statblock__add-button">
        {{ t('actions.add') }}
      </button>
    </div>
    <slot name="item" v-for="(item, index) in items" :item="item" :index="index"></slot>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';

const { t } = useI18n();

defineProps({
  title: { type: String, required: true },
  // The array of items to be rendered in the slot.
  items: { type: Array as PropType<any[]>, required: true },
  editMode: { type: Boolean, required: true },
});

defineEmits(['add']);
</script>

<style lang="scss" scoped>
.npc-statblock__section {
  margin-top: 1rem;
}
.npc-statblock__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  //margin-bottom: 0.5rem;
  h3 {
    margin: 0;
  }
}
.npc-statblock__add-button {
  border: 1px solid var(--color-tertiary-container);
  background-color: var(--color-background-secondary);
  cursor: pointer;
  border-radius: var(--size-border-radius-small);
}
</style>