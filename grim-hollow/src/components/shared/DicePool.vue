<template>
  <button class="dice-pool" :title="t('actions.roll')" @click.stop="handleClick">
    {{ simplifiedExpression }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ModifiedDicePool, DicePool } from '@/sheet/stores/modifiers/modifiersStore';
import { createDiceExpression } from '@/utility/simplifyDiceExpression';
import { useI18n } from 'vue-i18n';
import { type DamageRollArgs, performDamageRoll } from '@/utility/roll';
import { useRollDialogStore } from '@/sheet/stores/dialogs/rollDialogStore';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';

const { t } = useI18n();
const props = defineProps<{
  pool: ModifiedDicePool;
  rollArgs: DamageRollArgs; 
}>();
const simplifiedExpression = computed(() => {
  return createDiceExpression(props.pool.value.final);
});

const rollDialogStore = useRollDialogStore();
const combat = useCombatStore();

const handleClick = (event: MouseEvent) => {
  if (combat.shouldDisplayRollDialog(event)) {
    event.preventDefault();
    event.stopPropagation();
    rollDialogStore.open('damage', props.rollArgs);
  } else {
    performDamageRoll(props.rollArgs);
  }
};
</script>

<style lang="scss" scoped>
/* Optional future styling */

.dice-pool {
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
    color: var(--color-highlight);
  }
}

.roll-bonus {
  font-weight: bold;
}

.roll-bonus--positive {
  color: green;
}

.roll-bonus--negative {
  color: red;
}
</style>
