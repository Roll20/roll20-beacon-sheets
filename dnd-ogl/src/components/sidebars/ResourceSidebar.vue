<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label class="span-1">
          {{ $t('titles.name') }} *
          <input v-model="name" required />
        </label>
        <!-- <label class="span-1">
          {{ $t('titles.count') }} *
          <input type="number" v-model="count" required />
        </label> -->
        <label class="span-1">
          {{ $t('titles.max') }} *
          <input type="string" v-model="max" required />
        </label>
      </div>
      <hr />
      <div class="refresh columns columns-3">
        <h3>{{ $t('titles.refresh-options') }}</h3>
        <label class="span-1">
          {{ $t('titles.short-rest') }}
          <select v-model="refreshOnShortRest">
            <option value="none">{{ $t('titles.none') }}</option>
            <option value="all">{{ $t('titles.all') }}</option>
            <option value="fixed-value">{{ $t('titles.fixed-value') }}</option>
          </select>
          <input
            type="text"
            v-model="refreshOnShortRestAmount"
            placeholder="1d4"
            v-if="refreshOnShortRest === 'fixed-value'"
          />
        </label>
        <label class="span-1">
          {{ $t('titles.long-rest') }}
          <select v-model="refreshOnLongRest">
            <option value="none">{{ $t('titles.none') }}</option>
            <option value="all">{{ $t('titles.all') }}</option>
            <option value="fixed-value">{{ $t('titles.fixed-value') }}</option>
          </select>
          <input
            type="text"
            v-model="refreshOnLongRestAmount"
            placeholder="1d4"
            v-if="refreshOnLongRest === 'fixed-value'"
          />
        </label>
        <label class="span-1">
          {{ $t('titles.dawn') }}
          <select v-model="refreshOnDawn">
            <option value="none">{{ $t('titles.none') }}</option>
            <option value="all">{{ $t('titles.all') }}</option>
            <option value="fixed-value">{{ $t('titles.fixed-value') }}</option>
          </select>
          <input
            type="text"
            v-model="refreshOnDawnAmount"
            placeholder="1d4"
            v-if="refreshOnDawn === 'fixed-value'"
          />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSidebar } from './useSidebar';
import {
  useResourcesStore,
  type Resource,
  type RefreshType,
} from '@/sheet/stores/resources/resourcesStore';
import { v4 as uuidv4 } from 'uuid';
import { re } from 'mathjs';
import { useI18n } from 'vue-i18n';
import { parseFormulaAndEvaluate } from '@/sheet/stores/formulas';
const { t } = useI18n();

const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  resource: (Partial<Resource> & { sourceEffectId?: string }) | null;
}>();

const _id = props.resource?._id ?? uuidv4();
const name = ref(props.resource?.name ?? '');
const count = ref(props.resource?.count ?? 0);
const max = ref(props.resource?.max ?? '0');
const refreshOnShortRest = ref<RefreshType>(props.resource?.refreshOnShortRest ?? 'none');
const refreshOnLongRest = ref<RefreshType>(props.resource?.refreshOnLongRest ?? 'none');
const refreshOnDawn = ref<RefreshType>(props.resource?.refreshOnDawn ?? 'none');
const refreshOnShortRestAmount = ref(props.resource?.refreshOnShortRestAmount ?? '');
const refreshOnLongRestAmount = ref(props.resource?.refreshOnLongRestAmount ?? '');
const refreshOnDawnAmount = ref(props.resource?.refreshOnDawnAmount ?? '');
const isNew = computed(() => !props.resource?._id);
const store = useResourcesStore();

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const resourcePatch: Partial<Resource> & { sourceEffectId?: string } = {
    _id,
    name: name.value.trim(),
    count: props.resource?._id ? count.value : parseFormulaAndEvaluate(max.value),
    max: max.value,
    refreshOnShortRest: refreshOnShortRest.value,
    refreshOnShortRestAmount: refreshOnShortRestAmount.value.trim(),
    refreshOnLongRest: refreshOnLongRest.value,
    refreshOnLongRestAmount: refreshOnLongRestAmount.value.trim(),
    refreshOnDawn: refreshOnDawn.value,
    refreshOnDawnAmount: refreshOnDawnAmount.value.trim(),
  };

  if (props.resource?.sourceEffectId) {
    resourcePatch.sourceEffectId = props.resource.sourceEffectId;
  }

  store.update(resourcePatch);
  useSidebar().close();
};

const remove = () => {
  if (props.resource) {
    store.remove(props.resource as Resource);
  }
  useSidebar().close();
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
h3 {
  margin-bottom: 0;
  text-align: center;
}
hr {
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-disabled);
  margin-top: var(--size-gap-large);
}
</style>
