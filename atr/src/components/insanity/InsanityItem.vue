<template>
  <div class="insanity-item">
    <SidebarLink
      componentName="InsanitySidebar"
      :props="{ insanity: insanity }"
      :options="{
        title: t('actions.edit-insanity'),
        hasSave: true,
        hasDelete: true,
      }"
      :label="insanity.result"
      class="insanity-item__title"
    />
    <div class="insanity-item__flags">
      <label :title="$t('tooltips.negative-reaction')">
        <input
          type="checkbox"
          :checked="insanity.isNegativeReaction"
          @change.stop="updateFlag('isNegativeReaction', $event)"
        />
        {{ $t('abbreviations.nr') }}
      </label>
      <label :title="$t('tooltips.trigger')">
        <input
          type="checkbox"
          :checked="insanity.isTrigger"
          @change.stop="updateFlag('isTrigger', $event)"
        />
        {{ $t('abbreviations.t') }}
      </label>
      <label :title="$t('tooltips.physical-manifestation')">
        <input
          type="checkbox"
          :checked="insanity.isPhysicalManifestation"
          @change.stop="updateFlag('isPhysicalManifestation', $event)"
        />
        {{ $t('abbreviations.pm') }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInsanityStore, type Insanity } from '@/sheet/stores/insanity/insanityStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';

const { t } = useI18n();
const props = defineProps<{
  insanity: Insanity;
}>();

const store = useInsanityStore();

const updateFlag = (flag: keyof Insanity, event: Event) => {
  const value = (event.target as HTMLInputElement).checked;
  store.update({ _id: props.insanity._id, [flag]: value });
};
</script>

<style lang="scss" scoped>
.insanity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.insanity-item__title {
  font-weight: bold;
}
.insanity-item__flags {
  display: flex;
  gap: 0.75rem;
}
.insanity-item__flags label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
