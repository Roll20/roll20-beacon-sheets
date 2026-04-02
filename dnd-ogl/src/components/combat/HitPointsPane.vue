<template>
  <div class="hit-points box">
    <div class="box__header">
      <SidebarLink
        componentName="DamageHealSidebar"
        :props="{ initialTempHp: combat.getTemporaryHitPoints() }"
        :options="{
          title: $t('actions.edit-hit-points'),
          hasSum:true,
          sumLabel: 'heal',
          hasSubtract: true,
          subtractLabel: 'damage'
        }"
        :label="`${$t('titles.hit-points')}`"
        icon="heart"
        display="icon-and-label"
      />
    </div>
    <div class="box__content">
      <input
        type="text"
        v-model="localValue"
        class="hit-points__input"
        @input="onInputFilter"
        @blur="onInput"
        @keyup.enter="onInput"
        ref="input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import CurrentMaxNumber from '../shared/CurrentMaxNumber.vue';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { ref, watch, computed } from 'vue';

const combat = useCombatStore();

const localValue = ref(combat.life.hitPoints);
const input = ref<HTMLInputElement | null>(null);
const maxHp = computed(() => combat.getHitPointsMax().value.final);

watch(
  () => combat.life.hitPoints,
  (val) => {
    localValue.value = val;
    if(val && val >= 0) {
      combat.deathSaves.failures = 0;
      combat.deathSaves.successes = 0;
      combat.deathSaves.condition = 'dying';
    }
  },
);

watch(
  () => maxHp.value,
  (newMaxHp, oldMaxHp) => {
    const change = newMaxHp - oldMaxHp;
    const updatedHp = combat.life.hitPoints + change;
    combat.life.hitPoints = Math.min(newMaxHp, Math.max(0, updatedHp));
  },
);

const onInputFilter = (event: Event) => {
  const inputEl = event.target as HTMLInputElement;
  const match = inputEl.value.match(/^([+-]?\d*)$/);
  if (!match) {
    inputEl.value = inputEl.value.slice(0, -1);
  }
};

const onInput = () => {
  const value = localValue.value.toString();
  let update = combat.life.hitPoints;
  const currentHp = combat.life.hitPoints;

  if (value.startsWith('-')) {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.max(0, currentHp - raw);
  } else if (value.startsWith('+')) {
    const raw = parseInt(value.slice(1)) || 0;
    update = Math.min(maxHp.value, currentHp + raw);
  } else {
    const raw = parseInt(value);
    if (!isNaN(raw)) {
      update = Math.min(maxHp.value, Math.max(0, raw));
    }
  }

  if (input.value) {
    input.value.blur();
  }

  combat.life.hitPoints = update;
  localValue.value = update;
};
</script>
<style lang="scss">
.sheet .hit-points.box {
    display: flex;
    flex-direction: column;
    height: 45px;
    align-self: self-end;
    justify-content: space-between;
  input {
    font-weight: var(--font-weight-medium);
    text-align: center;
    font-size: 30px;
    margin-top: -4px;
  }
}
</style>
