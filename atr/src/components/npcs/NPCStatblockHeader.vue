<template>
  <!-- The npc header element -->
  <div
    v-if="!companionMode"
    class="npc-statblock__header"
    :class="{ 'npc-statblock__header--companion': companionMode }"
  >
    <h3 v-if="!editMode" class="npc-statblock__name">{{ npc.name }}</h3>
    <input v-else v-model="localNpc.name" class="npc-statblock__name-input" required />

    <!-- Container for header action buttons -->
    <div class="npc-statblock__header-controls">
      <!-- Collapse/Expand button -->
      <!-- <button v-if="showCollapseControl" @click="$emit('update:isCollapsed', !isCollapsed)">
        {{ isCollapsed ? t('actions.expand') : t('actions.collapse') }}
      </button> -->
      <!-- Delete button, visible only in edit mode for non-default NPCs -->
      <button
        v-if="editMode && !npc.isDefault && showCollapseControl"
        @click="$emit('delete')"
        class="npc-statblock__delete-button"
      >
        {{ t('actions.delete') }}
      </button>
    </div>
  </div>

  <!-- Special header for "Companion" mode, which acts as a single large button that opens sidebar-->
  <div v-else class="npc-statblock__header npc-statblock__header--companion">
    <div
      v-if="npc.token"
      class="npc-token-display"
      @mouseenter="showCollapseControl && (showFullPreview = true)"
      @mouseleave="showCollapseControl && (showFullPreview = false)"
    >
      <img :src="npc.token" alt="Companion Token" class="npc-token-display__thumbnail" />
      <div v-if="showFullPreview && showCollapseControl" class="npc-token-display__full-preview">
        <img :src="npc.token" alt="Full Companion Token" />
      </div>
    </div>
    <button v-if="!editMode && showCollapseControl" class="npc-statblock__name-button" @click="$emit('open-edit')">
      <h3 class="npc-statblock__name">{{ npc.name }}</h3>
    </button>
    <h3 v-else-if="!editMode" class="npc-statblock__name">{{ npc.name }}</h3>
    <input v-else v-model="localNpc.name" class="npc-statblock__name-input" required />
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Npc } from '@/sheet/stores/npc/npcStore';

const { t } = useI18n();
const showFullPreview = ref(false);

defineProps({
  npc: { type: Object as PropType<Npc>, required: true },
  localNpc: { type: Object as PropType<Npc>, required: true },
  editMode: { type: Boolean, required: true },
  // A flag for special "companion" styling and behavior.
  companionMode: { type: Boolean, default: false },
  // Whether to show the collapse/expand control.
  showCollapseControl: { type: Boolean, default: true },
  // The current collapsed state.
  isCollapsed: { type: Boolean, required: true },
});

defineEmits(['update:isCollapsed', 'delete', 'open-edit']);
</script>

<style lang="scss" scoped>
.npc-statblock__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;

  &--companion {
    margin-bottom: 0;
    justify-content: flex-start;
  }
}

.npc-statblock__name {
  margin: 0;
  font-size: 1.5em;
}

.npc-statblock__name-input {
  font-size: 1.5em;
  font-weight: bold;
  border: 1px dashed var(--color-tertiary-container);
  width: 100%;
  box-sizing: border-box;
}

.npc-statblock__header-controls {
  display: flex;
  gap: 0.5rem;
}

.npc-statblock__delete-button {
  background-color: var(--color-danger-container);
  color: var(--color-on-danger-container);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: var(--size-border-radius-small);
  cursor: pointer;
}

.npc-statblock__name-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  width: 100%;

  h3 {
    margin: 0;
    font-size: 1.5em;
    font-weight: bold;
    &:hover {
      color: var(--color-highlight);
    }
  }
}

.npc-token-display {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;
  border: 2px solid var(--color-box);

  &__thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &__full-preview {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 10px;
    width: 200px;
    height: 200px;
    border: 2px solid var(--color-box);
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 100;
    pointer-events: none;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }
  }
}
</style>
