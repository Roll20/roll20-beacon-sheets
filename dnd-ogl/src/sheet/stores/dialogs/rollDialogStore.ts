import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

import type { D20RollArgs, DamageRollArgs } from '@/utility/roll';

export const useRollDialogStore = defineStore('rollDialog', () => {
  const isOpen = ref(false);
  const rollType = ref<'d20' | 'damage' | null>(null);
  const rollArgs = ref<D20RollArgs | DamageRollArgs | null>(null);
  const additionalBonus = ref('');
  const selectedMode = shallowRef<number | boolean>(0);

  function open(type: 'd20' | 'damage', args: D20RollArgs | DamageRollArgs) {
    isOpen.value = true;
    rollType.value = type;
    rollArgs.value = args;
    additionalBonus.value = '';
    selectedMode.value = type === 'd20' ? 0 : false;
  }

  function close() {
    isOpen.value = false;
    rollType.value = null;
    rollArgs.value = null;
    selectedMode.value = 0;
    additionalBonus.value = '';
  }

  return {
    isOpen,
    rollType,
    rollArgs,
    additionalBonus,
    selectedMode,
    open,
    close,
  };
});
