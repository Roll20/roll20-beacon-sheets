<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="speed-list">
        <div v-for="key in speedKeys" :key="key" class="speed-sidebar__item">
          <label class="speed-sidebar__label">{{ $t(`titles.speeds.${key}`) }}</label>
          <div class="speed-sidebar__inputs">
            <div
              class="speed-sidebar__base-input-wrapper"
              :class="{ 'has-active-effect': getActiveEffectLabels(key).length > 0 }"
              v-tooltip="getTooltipContent(key)"
            >
              <input
                type="number"
                v-model.number="localSpeed[key].base"
                class="speed-sidebar__input speed-sidebar__input--base"
                min="0"
              />
            </div>
            <input
              type="text"
              v-model="localSpeed[key].description"
              class="speed-sidebar__input speed-sidebar__input--desc"
              :placeholder="$t('titles.description')"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCombatStore, type SpeedData, type SpeedKey } from '@/sheet/stores/combat/combatStore';
import { jsonClone } from '@/utility/jsonTools';
import { useSidebar } from './useSidebar';
import { config } from '@/config';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useI18n } from 'vue-i18n';
import { effectKeys } from '@/effects.config';

const combat = useCombatStore();
const speedKeys = config.speeds;
const effectsStore = useEffectsStore();
const { t } = useI18n();
const localSpeed = ref<Record<SpeedKey, SpeedData>>(jsonClone(combat.speed));
const form = ref<HTMLFormElement | null>(null);

const getActiveEffectLabels = (speedKey: SpeedKey): string[] => {
  return effectsStore.getActiveEffectLabels(effectKeys[`${speedKey}-speed`]);
};

const getTooltipContent = (speedKey: SpeedKey) => {
  const labels = getActiveEffectLabels(speedKey);
  if (labels.length === 0) return null;
  return `${t('titles.effects-status.modified-by-effect')}:\n- ${labels.join('\n- ')}`;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  combat.speed = localSpeed.value;
  useSidebar().close();
};

defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.speed-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: var(--size-gap-large);
}

.speed-sidebar__item {
  display: flex;
  flex-direction: column;
  gap: var(--size-gap-xsmall);
  position: relative;
}

.speed-sidebar__label {
  font-weight: var(--font-weight-bold);
  padding-top: 0.3rem;
}

.speed-sidebar__inputs {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: var(--size-gap-medium);
}
</style>
