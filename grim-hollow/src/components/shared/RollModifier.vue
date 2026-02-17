<template>
  <button :class="['roll-modifier', bonusClass]" :title="t('actions.roll')" @click.stop="handleClick">
    <span v-if="isPositive">+</span>{{ finalBonus }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { performD20Roll } from '@/utility/roll';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import { useRollDialogStore } from '@/sheet/stores/dialogs/rollDialogStore';
const { t } = useI18n();
const props = defineProps<{
  finalBonus: number;
  rollArgs: D20RollArgs; 
}>();

const emit = defineEmits(['rolled']);

const isPositive = computed(() => props.finalBonus >= 0);
const isNegative = computed(() => props.finalBonus < 0);

const bonusClass = computed(() => {
  if (isPositive.value) return 'roll-bonus--positive';
  if (isNegative.value) return 'roll-bonus--negative';
  return '';
});

const rollDialogStore = useRollDialogStore();

const handleClick = async (event: MouseEvent) => {
  if (event.altKey) {
    event.preventDefault();
    event.stopPropagation();
    rollDialogStore.open('d20', props.rollArgs);
  } else {
    const result = await performD20Roll({ ...props.rollArgs, whisper: false });
    emit('rolled', result);
  }
};
</script>

<style lang="scss" scoped>
/* Optional future styling */

.roll-modifier {
  font-weight: bold;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-family: inherit;
  display: inline;
  //text-decoration: underline;

  &:hover {
    //color: var(--color-highlight);
    color: red;
  }
}

.roll-bonus {
  font-weight: bold;
  color: #690000;
}

.roll-bonus--positive {
  //color: #690000;
  // color: green;
    color: #db0000;//#690000;
}

.roll-bonus--negative {
  //color: var(--color-highlight);
  // color: red;
    color: #db0000;//#690000;
}
</style>
