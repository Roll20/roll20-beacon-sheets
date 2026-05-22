<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <label>
        {{ $t('titles.hit-dice') }}
        <select v-model="localHitDice.mode">
          <option value="automatic">{{ $t('titles.proficiency-levels.automatic') }}</option>
          <option value="manual">{{ $t('titles.manual') }}</option>
        </select>
      </label>

      <div v-if="localHitDice.mode === 'manual'" class="manual-settings columns columns-5">
        <label class="span-1" v-for="size in config.hitDieSize" :key="size">
          {{ parseDiceTitle(size) }}:
          <input type="number" v-model.number="localHitDice.total[size]" min="0" />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useSidebar } from './useSidebar';
import { config } from '@/config';
import { jsonClone } from '@/utility/jsonTools';
const progressionStore = useProgressionStore();
const localHitDice = reactive({ ...jsonClone(progressionStore.hitDice) });
const form = ref<HTMLFormElement | null>(null);

watch(localHitDice, (newValue) => {
  if (newValue.mode === 'automatic') {
    for (const key in localHitDice.total) {
      localHitDice.total[key as keyof typeof localHitDice.total] = 0;
    }
  }
});

const parseDiceTitle = (dice: string) => {
  const [amount, size] = dice.split('d').map(Number);
  return amount === 1 ? `d${size}` : `${amount}d${size}`;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  progressionStore.hitDice = { ...localHitDice };
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
}
</style>
