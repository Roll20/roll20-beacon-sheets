<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="manual-senses-grid">
        <label
          v-for="senseKey in config.senses"
          :key="senseKey"
          :class="{ 'has-active-effect': getActiveEffectLabels(senseKey).length > 0 }"
          v-tooltip="getTooltipContent(senseKey)"
        >
          {{ $t(`titles.sense.${senseKey}`) }}
          <input type="number" v-model.number="localManualSenses[senseKey]" min="0" />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSidebar } from './useSidebar';
import { type SenseKey, useSensesStore, type ManualSenses } from '@/sheet/stores/senses/sensesStore';
import { config } from '@/config';
import { jsonClone } from '@/utility/jsonTools';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const sensesStore = useSensesStore();
const effectsStore = useEffectsStore();

const form = ref<HTMLFormElement | null>(null);

const sidebar = useSidebar();

const localManualSenses = ref<ManualSenses>(jsonClone(sensesStore.manualSenses));

const getActiveEffectLabels = (senseKey: SenseKey): string[] => {
  const effectKey = `sense-${senseKey}`;
  return effectsStore.getActiveEffectLabels(effectKey);
};

const getTooltipContent = (senseKey: SenseKey) => {
  const labels = getActiveEffectLabels(senseKey);
  if (labels.length === 0) return null; 
  return `${t('titles.effects-status.modified-by-effect')}:\n- ${labels.join('\n- ')}`;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;
  sensesStore.manualSenses = localManualSenses.value;
  sidebar.close();
};

defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.manual-senses-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
