<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <label>
        {{ $t('titles.spell-slots') }}
        <select v-model="localSlots.mode">
          <option value="automatic">{{ $t('titles.proficiency-levels.automatic') }}</option>
          <option value="manual">{{ $t('titles.manual') }}</option>
        </select>
      </label>

      <div v-if="localSlots.mode === 'manual' && config.casterTypes.hasOwnProperty('pact')" class="manual-settings columns columns-1">
        <div class="columns columns-3 header">
          <span class="span-1">{{ $t(`titles.level`) }}:</span>
          <span class="span-1">{{ $t('titles.standard-slots') }}</span>
          <span class="span-1">{{ $t('titles.pact-slots') }}</span>
        </div>
        <div v-for="level in config.spellLevels.length-1" :key="level" class="columns columns-3">
          <span class="span-1">{{ $t(`titles.spell-levels.${level}`) }}:</span>
          <input class="span-1" type="number" v-model.number="localSlots.total.standard[level-1]" min="0" :placeholder="$t('titles.standard-slots')" />
          <input class="span-1" type="number" v-model.number="localSlots.total.pact[level-1]" min="0" :placeholder="$t('titles.pact-slots')" />
        </div>
      </div>
      <div v-else-if="localSlots.mode === 'manual'" class="manual-settings columns columns-3">
        <label class="span-1" v-for="level in config.spellLevels.length-1" :key="level">
          {{ $t(`titles.spell-levels.${level}`) }}
          <input type="number" v-model.number="localSlots.total.standard[level-1]" min="0" />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { useSidebar } from './useSidebar';
import { config } from '@/config';
import { jsonClone } from '@/utility/jsonTools';

const spellsStore = useSpellsStore();
const localSlots = reactive({ ...jsonClone(spellsStore.slots) });
const form = ref<HTMLFormElement | null>(null);

watch(localSlots, (newValue) => {
  if (newValue.mode === 'automatic') {
    for (let i = 0; i < config.spellLevels.length-1; i++) {
      localSlots.total.standard[i] = 0;
      localSlots.total.pact[i] = 0;
    }
  }
});

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  spellsStore.slots = { ...localSlots };
  useSidebar().close();
};
defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.manual-settings {
  margin-top: 1rem;
  label {
    text-align: center;
    text-transform: capitalize;
    input {
      text-align: center;
    }
  }
  div {
    &:not(:first-child) {
      margin-top: var(--size-gap-medium);
    }
    input {
      text-align: center;
    }
  }
  .header {
    span:not(:first-child) {
      text-align: center
    };
    span {
      font-weight: var(--weight-bold);
    }
  }
}
</style>
