<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <label class="effects-editor">
        {{ $t('titles.effects') }}
        <textarea v-model="effects" />
      </label>
    </form>
    <!-- <div class="effects-group__effects">
      <div v-for="ef in effect.effects" :key="ef._id" class="effects-single">
        <div
          class="effects-single__status"
          :class="getEffectStatusClass(effect, ef)"
          :title="getEffectStatusTitle(effect, ef)"
        ></div>
        <div class="effects-single__details">
          <span class="effects-single__description">{{ createDescription(ef) }}</span>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { type SingleEffect, useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { v4 as uuidv4 } from 'uuid';
import { stripIds } from '@/utility/jsonTools';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  effect: Effect;//Partial<Effect> | null;
}>();

const _id = props.effect?._id ?? uuidv4();

let initialEffects = JSON.stringify(
  stripIds(useEffectsStore().getEmptyEffect({ _id: _id })),
  null,
  2,
);

const effectsStore = useEffectsStore();

if (props.effect?._id) {
  const existing = effectsStore.effects.find(
    (e) => props.effect && e._id === props.effect._id,
  );
  if (existing) {
    try {
      initialEffects = JSON.stringify(stripIds(existing), null, 2);
    } catch {
      initialEffects = JSON.stringify(
        stripIds(useEffectsStore().getEmptyEffect({ _id })),
        null,
        2,
      );
    }
  }
}
const effects = ref(initialEffects);

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

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  let parsedEffects: Partial<Effect> = {};
  try {
    parsedEffects = JSON.parse(effects.value);
    parsedEffects._id = _id;
  } catch {
    const id = _id;
    parsedEffects = { _id: id };
  }
  effectsStore.update(parsedEffects);

  useSidebar().close();
};

const remove = () => {
  if (props.effect?._id) useFeaturesStore().remove(props.effect._id);
  useSidebar().close();
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
.view-container {
  height: 100%;
  min-height: 100%;
  form, label {
    height: 100%;
    min-height: 100%;
    display: block;
  }
  .effects-editor  {
    textarea {
      height: calc(100% - 2rem);
      min-height: calc(100% - 2rem);
      box-sizing: border-box;
    }
  }
}
</style>
