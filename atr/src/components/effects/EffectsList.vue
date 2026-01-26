<template>
  <div class="effects-list-section">
    <div class="effects-list-section__header">
      <h3 class="effects-list-section__title">{{ $t('titles.active-effects') }}</h3>
    </div>
    <div class="effects-list">
      <div
        v-for="effectParent in effectsStore.visibleEffects"
        :key="effectParent._id"
        class="effects-group"
        :class="{ 'effects-group--disabled': !effectParent.enabled }"
      >
        <div class="effects-group__header">
          <div class="effects-group__controls">
            <label
              class="effects-group__toggle-wrap"
              :title="$t(effectParent.enabled ? 'actions.disable-effect' : 'actions.enable-effect')"
            >
              <input
                type="checkbox"
                class="effects-group__toggle"
                :checked="effectParent.enabled"
                @change="toggleEffect(effectParent)"
              />
            </label>
            <span class="effects-group__label">{{ effectParent.label }}</span>
          </div>
          <button
            v-if="effectParent.removable"
            class="effects-group__remove-button"
            :title="$t('actions.delete-effect')"
            @click="removeEffect(effectParent)"
          >{{ $t('actions.delete') }}</button>
        </div>

        <div v-if="Array.isArray(effectParent.pickers) && effectParent.pickers.length > 0" class="pickers">
          <div v-for="(picker, index) in effectParent.pickers" :key="index" class="picker">
            <label>
              {{ picker.label }}
              <select :class="{'picker-unselected': !picker.value}" v-model="picker.value">
                <option :value="undefined">Choose...</option>
                <option v-for="option in picker.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div class="effects-group__effects">
          <div v-for="effect in effectParent.effects" :key="effect._id" class="effects-single">
            <div
              class="effects-single__status"
              :class="getEffectStatusClass(effectParent, effect)"
              :title="getEffectStatusTitle(effectParent, effect)"
            ></div>
            <div class="effects-single__details">
              <span class="effects-single__description">{{ createDescription(effect) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import {
  useEffectsStore,
  type Effect,
  type SingleEffect,
} from '@/sheet/stores/modifiers/modifiersStore';
import { computed } from 'vue';

const { t } = useI18n();
const effectsStore = useEffectsStore();

const toggleEffect = (effect: Effect) => {
  effectsStore.update({ _id: effect._id, enabled: !effect.enabled });
};

const removeEffect = (effect: Effect) => {
  const confirmationMessage = t('warnings.confirm-delete-effect', { label: effect.label });
  if (confirm(confirmationMessage)) {
    effectsStore.remove(effect._id);
  }
};

const getEffectStatusClass = (effectParent: Effect, effect: SingleEffect) => {
  return effectsStore.isEffectSingleActive(effectParent, effect)
    ? 'effects-single__status--active'
    : 'effects-single__status--inactive';
};

const getEffectStatusTitle = (effectParent: Effect, effect: SingleEffect) => {
  if (!effectParent.enabled) return t('titles.effects-status.inactive-parent');
  if (!effectsStore.isEffectSingleActive(effectParent, effect) && effect.required) {
    return t('titles.effects-status.inactive-requires', { state: effect.required });
  }
  return effectsStore.isEffectSingleActive(effectParent, effect)
    ? t('titles.effects-status.active')
    : t('titles.effects-status.inactive');
};

const createDescription = (effect: SingleEffect): string => {
  const value =
    effect.value !== undefined
      ? typeof effect.value === 'string' && !/[-+]?\d+/g.test(effect.value)
        ? `"${effect.value}"`
        : effect.value
      : effect.formula;

  return `[${effect.operation}] ${value} -> "${effect.attribute}"`;
};
</script>

<style lang="scss" scoped>
.effects-list-section {
  display: flex;
  flex-direction: column;
}
.effects-list-section__header {
  margin-top: 1rem;
}
.effects-list-section__title {
  margin: 0;
}
.effects-list {
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

.effects-group {
  display: flex;
  flex-direction: column;
  transition: opacity 0.2s ease;
}

.effects-group--disabled {
  opacity: 0.5;
}
.effects-group--disabled .effects-group__label {
  text-decoration: line-through;
}

.effects-group__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.effects-group__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.effects-group__remove-button {
  background: none;
  display: flex;;
  border: none;
  color: #e70909;
  z-index: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 1.4em; 
  line-height: 1; 
  border-radius: 4px;
}
.effects-group__remove-button:hover {
  color: #f5222d;
  background-color: #fff1f0;
}

.effects-group__label {
  font-weight: bold;
}

.effects-group__effects {
  display: flex;
  flex-direction: column;
  padding-left: 1.75rem;
  margin-top: 0.25rem;
  gap: 0.25rem;
}

.effects-single {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
}

.effects-single__status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.effects-single__status--active {
  background-color: #52c41a;
}
.effects-single__status--inactive {
  background-color: #bfbfbf;
}

.effects-single__details {
  display: flex;
  flex-direction: column;
}

.effects-single__description {
  font-size: 0.9em;
  color: #555;
}
.pickers {
  margin-top: 1rem;
  display: block;
  width: 100%;
  .picker {
    select {
      width: 100%;
    }
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
