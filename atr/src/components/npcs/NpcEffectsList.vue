<template>
  <div v-if="effects.length > 0" class="npc-effects">
    <div class="npc-effects__header">
      <h3 class="npc-effects__title">{{ t('titles.active-effects') }}</h3>
    </div>
    <div class="npc-effects__list">
      <div
        v-for="effectParent in effects"
        :key="effectParent._id"
        class="npc-effects__group"
        :class="{ 'npc-effects__group--disabled': !effectParent.enabled }"
      >
        <div class="npc-effects__group-header">
          <div class="npc-effects__controls">
            <label
              v-if="effectParent.toggleable"
              class="npc-effects__toggle-wrap"
              :title="t(effectParent.enabled ? 'actions.disable-effect' : 'actions.enable-effect')"
            >
              <input
                type="checkbox"
                class="npc-effects__toggle"
                :checked="effectParent.enabled"
                @change="toggleEffect(effectParent)"
              />
            </label>
            <span class="npc-effects__label">{{ effectParent.label }}</span>
          </div>
          <button
            v-if="effectParent.removable"
            class="npc-effects__remove-button"
            :title="t('actions.delete-effect')"
            @click="removeEffect(effectParent)"
          >
            ×
          </button>
        </div>
        <div class="npc-effects__breakdown">
          <div
            v-for="effect in effectParent.effects"
            :key="effect._id"
            class="npc-effects__single-effect"
          >
            <div
              class="npc-effects__status"
              :class="
                effectParent.enabled
                  ? 'npc-effects__status--active'
                  : 'npc-effects__status--inactive'
              "
              :title="
                effectParent.enabled
                  ? t('titles.effects-status.active')
                  : t('titles.effects-status.inactive')
              "
            ></div>
            <div class="npc-effects__details">
              <span class="npc-effects__description">{{ createDescription(effect) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { type SingleEffect, type Effect } from '@/sheet/stores/modifiers/modifiersStore';

const props = defineProps<{
  effects: Effect[];
}>();
const { t } = useI18n();
const store = useNpcStore();
const emit = defineEmits(['toggle-effect', 'remove-effect']);

//Emits an event to toggle the enabled state of an effect.
const toggleEffect = (effectToToggle: Effect) => {
  emit('toggle-effect', effectToToggle._id);
};

// Emits an event to remove an effect from the NPC's effect list.
const removeEffect = (effectToRemove: Effect) => {
  emit('remove-effect', effectToRemove._id);
};

//Creates a human-readable description for a single effect instance.
const createDescription = (effect: SingleEffect): string => {
  const value =
    typeof effect.value === 'string' && !/^-?\d+(\.\d+)?$/.test(effect.value)
      ? `"${effect.value}"`
      : effect.value;

  const operationClean = effect.operation.replace(/-formula/g, '');
  return `[${operationClean.toUpperCase()}] ${value} -> "${effect.attribute}"`;
};
</script>

<style lang="scss" scoped>
.npc-effects {
  display: flex;
  flex-direction: column;
}
.npc-effects__header {
  margin-top: 1rem;
}
.npc-effects__title {
  margin: 0;
}
.npc-effects__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  border: 1px solid #eee;
  padding: 0.75rem;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
.npc-effects__group {
  display: flex;
  flex-direction: column;
  transition: opacity 0.2s ease;
}
.npc-effects__group--disabled {
  opacity: 0.5;
}
.npc-effects__group--disabled .npc-effects__label {
  text-decoration: line-through;
}
.npc-effects__group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}
.npc-effects__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.npc-effects__remove-button {
  background: none;
  display: flex;
  border: none;
  color: #a12c2c;
  z-index: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 1.4em;
  line-height: 1;
  border-radius: 4px;
}
.npc-effects__remove-button:hover {
  color: #f5222d;
  background-color: #fff1f0;
}
.npc-effects__label {
  font-weight: bold;
}
.npc-effects__breakdown {
  display: flex;
  flex-direction: column;
  padding-left: 1.75rem;
  margin-top: 0.25rem;
  gap: 0.25rem;
}
.npc-effects__single-effect {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
}
.npc-effects__status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.npc-effects__status--active {
  background-color: #52c41a;
}
.npc-effects__status--inactive {
  background-color: #bfbfbf;
}
.npc-effects__details {
  display: flex;
  flex-direction: column;
}
.npc-effects__description {
  font-size: 0.9em;
  color: #555;
}
</style>
