<template>
  <div
    class="flex gap-0.5 mt-1 select-none"
    v-tooltip="tooltipInfo"
  >
    <button
      v-for="index in props.max"
      :key="index"
      type="button"
      @click="handleClick(index)"
      class="hover:scale-110 active:scale-95 transition-transform p-0.5 focus:outline-none cursor-pointer"
    >
      <span
        class="material-symbols-outlined text-base block"
        :class="getStarClass(index)"
        :style="getStarStyle(index)"
      >
        {{ props.icon }}
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { ModifiedValue } from '@/system/effects/calculateModifiedValue';
import { characterStore } from '@/sheet/stores';
import i18n from '@/i18n/i18n';

const { t } = i18n.global;

const props = withDefaults(defineProps<{
  modifiedValue?: ModifiedValue;
  max?: number;
  icon?: string;
  baseFilledClass?: string;
  bonusFilledClass?: string;
  penaltyClass?: string;
  emptyClass?: string;
}>(), {
  modifiedValue: () => ({ value: 0, modifiers: [], baseValue: 0 }),
  max: 6,
  icon: 'star',
  baseFilledClass: 'text-secondary',
  bonusFilledClass: 'text-secondary',
  penaltyClass: 'text-error',
  emptyClass: 'text-zinc-300',
});

const emit = defineEmits<{
  (e: 'update:baseValue', value: number): void;
}>();

const base = computed(() => Number(props.modifiedValue.baseValue) || 0);
const total = computed(() => Number(props.modifiedValue.value) || 0);

const getStarState = (index: number) => {
  const currentTotal = total.value;
  const currentBase = base.value;

  if (currentTotal >= index && currentBase >= index) {
    return 'base-filled';
  } else if (currentTotal >= index && currentBase < index) {
    return 'bonus-filled';
  } else if (currentTotal < index && currentBase >= index) {
    return 'penalty-lost';
  } else {
    return 'empty';
  }
};

const getStarClass = (index: number) => {
  const state = getStarState(index);
  switch (state) {
    case 'base-filled':
      return props.baseFilledClass;
    case 'bonus-filled':
      return props.bonusFilledClass;
    case 'penalty-lost':
      return props.penaltyClass;
    case 'empty':
    default:
      return props.emptyClass;
  }
};

const getStarStyle = (index: number) => {
  const state = getStarState(index);
  const fill = (state === 'base-filled' || state === 'bonus-filled') ? 1 : 0;
  return `font-variation-settings: 'FILL' ${fill}`;
};

const handleClick = (index: number) => {
  const currentTotal = total.value;
  let newValue = index;

  if (currentTotal === index) {
    newValue = index - 1;
  }

  newValue = Math.max(0, Math.min(props.max, newValue));
  const attr = props.modifiedValue.attributes?.[0];

  if (attr) {
    const sheet = characterStore();
    const customEffectId = `${attr}_custom`;
    const existingEffect = sheet.effects.effects.value.find((e: any) => e._id === customEffectId);
    const existingCustomValue = existingEffect ? Number(existingEffect.value) || 0 : 0;

    if (!isNaN(currentTotal)) {
      const newCustomValue = newValue - currentTotal + existingCustomValue;
      sheet.effects.updateEffect({
        _id: customEffectId,
        attribute: attr as any,
        value: newCustomValue,
        operation: 'add',
        label: t('sheet.custom_adjustment')
      });
    } else {
      const currentBase = base.value;
      sheet.effects.updateEffect({
        _id: customEffectId,
        attribute: attr as any,
        value: newValue - currentBase,
        operation: 'add',
        label: t('sheet.custom_adjustment')
      });
    }
  } else {
    emit('update:baseValue', newValue);
  }
};

const tooltipInfo = computed(() => {
  if (props.modifiedValue.error) {
    return props.modifiedValue.error;
  }
  if (!props.modifiedValue.modifiers || props.modifiedValue.modifiers.length === 0) {
    return 'No modifiers';
  }

  const content = `Base: ${props.modifiedValue.baseValue}<br/>` +
    props.modifiedValue.modifiers.map(m => {
      const sign = Number(m.value) >= 0 ? '+' : '';
      return `${m.name}: ${sign}${m.value}`;
    }).join('<br/>');

  return { content, html: true };
});
</script>
