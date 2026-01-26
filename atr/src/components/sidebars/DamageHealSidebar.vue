<template>
  <div class="view-container">
    <div class="columns columns-2">
      <div class="total-hp span-2">
        <div>
          <span class="total-hp__value">{{ combat.life.hitPoints }} / {{ combat.getHitPointsMax().value.final }}</span>
          <span class="total-hp__label">{{ $t('titles.hit-points') }}</span>
        </div>
        <div v-if="combat.getTemporaryHitPoints().value.final > 0">
          <span class="total-hp__value">{{ combat.getTemporaryHitPoints().value.final }}</span>
          <span class="total-hp__label">{{ $t('titles.temporary-hit-points') }}</span>
        </div>
      </div>
      <label class="span-1 adjustment">
        {{ $t('titles.adjustment') }}
        <input v-model.number="amount" type="number" min="0" class="amount-input__field" />
      </label>
      <label v-if="initialTempHp > 0" class="span-1 temp-hp">
        <input type="checkbox" v-model="applyToTempHpFirst" />
        {{ $t('actions.apply-to-temp-hp') }}
      </label>
    </div>
    <!--
    <form @submit.prevent="applyDamage">
      <div class="hp-status">
        <div class="hp-status__item">
          <span class="hp-status__value"
            >{{ combat.life.hitPoints }} / {{ combat.getHitPointsMax().value.final }}</span
          >
          <span class="hp-status__label">{{ $t('titles.hp') }}</span>
        </div>
        <div class="hp-status__item" v-if="combat.getTemporaryHitPoints().value.final > 0">
          <span class="hp-status__value">{{ combat.getTemporaryHitPoints().value.final }}</span>
          <span class="hp-status__label">{{ $t('titles.temporary-hit-points') }}</span>
        </div>
      </div>
      <label class="amount-input">
        <span class="amount-input__label">{{ $t('titles.value') }}</span>
        <input v-model.number="amount" type="number" min="0" class="amount-input__field" />
      </label>

      <label v-if="initialTempHp > 0" class="apply-temp-hp">
        <input type="checkbox" v-model="applyToTempHpFirst" />
        {{ $t('actions.apply-to-temp-hp') }}
      </label>

      <div class="actions">
        <div class="split-button">
          <button type="button" class="split-button__main" @click="applyDamage">
            {{ $t(damageTypes[selectedDamageType].label) }}
          </button>
          <div class="split-button__dropdown-wrapper">
            <button
              type="button"
              class="split-button__toggle"
              @click="isDropdownOpen = !isDropdownOpen"
              aria-haspopup="true"
              :aria-expanded="isDropdownOpen"
            >
              ▼
            </button>
            <ul v-if="isDropdownOpen" class="split-button__menu" role="menu">
              <li v-for="(item, key) in damageTypes" :key="key">
                <button
                  @click="selectDamageType(key as DamageTypeKey)"
                  class="split-button__menu-item"
                  role="menuitem"
                >
                  {{ $t(item.label) }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <button type="button" class="actions__heal-button" @click="applyHealing">
          {{ $t('titles.heal') }}
        </button>
      </div>
    </form> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { useSidebar } from './useSidebar';
import { useI18n } from 'vue-i18n';

type DamageTypeKey = 'quarter' | 'half' | 'normal' | 'double';

const props = defineProps<{
  initialTempHp: number;
}>();

const { t } = useI18n();
const combat = useCombatStore();
const sidebar = useSidebar();

const amount = ref<number>(0);
const selectedDamageType = ref<DamageTypeKey>('normal');
const isDropdownOpen = ref(false);
const applyToTempHpFirst = ref(props.initialTempHp > 0);

const damageTypes: Record<DamageTypeKey, { label: string; multiplier: number }> = {
  quarter: { label: 'titles.damage-application.quarter', multiplier: 0.25 },
  half: { label: 'titles.damage-application.half', multiplier: 0.5 },
  normal: { label: 'titles.damage', multiplier: 1 },
  double: { label: 'titles.damage-application.double', multiplier: 2 },
};

const selectDamageType = (type: DamageTypeKey) => {
  selectedDamageType.value = type;
  isDropdownOpen.value = false;
  applyDamage();
};
const applyDamage = () => {
  const multiplier = damageTypes[selectedDamageType.value].multiplier;
  let damageToDeal = Math.floor(amount.value * multiplier);

  if (damageToDeal <= 0) {
    sidebar.close();
    return;
  }

  if (applyToTempHpFirst.value && props.initialTempHp > 0) {
    const tempHp = combat.getTemporaryHitPoints().value.final;
    const damageToTemp = Math.min(damageToDeal, tempHp);
    combat.life.temporary -= damageToTemp;
    damageToDeal -= damageToTemp;
  }

  if (damageToDeal > 0) {
    combat.life.hitPoints = Math.max(0, combat.life.hitPoints - damageToDeal);
  }

  sidebar.close();
};

const applyHealing = () => {
  if (amount.value <= 0) {
    sidebar.close();
    return;
  }

  const maxHp = combat.getHitPointsMax().value.final;

  combat.life.hitPoints = Math.min(maxHp, combat.life.hitPoints + amount.value);

  sidebar.close();
};

const sum = () => {
  applyHealing();
};

const subtract = () => {
  applyDamage();
};
defineExpose({
  sum,
  subtract
});
</script>

<style scoped lang="scss">
.total-hp {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-disabled);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  justify-content: center;
  gap: 10rem;
  &__value {
    font-size: var(--size-font-xxxlarge);
    font-weight: bold;
    text-align: center;
    display: block;
  }
  &__label {
    font-size: var(--size-font-medium);
    color: var(--color-secondary);
    display: block;
    text-align: center;
  }
}
label:has(input[type=checkbox]) {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 0.5rem;
  align-self: end;
  align-items: center;
  justify-self: anchor-center;
  padding-bottom: 0.5rem;
}
.view-container:not(:has(.temp-hp)) {
  .adjustment {
    grid-column: 1 / -1;
    text-align: center;
    input {
      text-align: center;
    }
  }
}
/*.view-container {
  padding: 1rem;
}

.hp-status {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 0.75rem;
  background-color: #f0f8ff;
  border-radius: 8px;

  &__item {
    display: flex;
    flex-direction: column;
  }
  &__value {
    font-size: 1.5em;
    font-weight: bold;
  }
  &__label {
    font-size: 0.8em;
    color: #555;
    text-transform: uppercase;
  }
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.amount-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-weight: bold;
    font-size: 1.1em;
  }
  &__field {
    font-size: 2em;
    padding: 0.5rem;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.apply-temp-hp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1em;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;

  input[type='checkbox'] {
    width: 1.2em;
    height: 1.2em;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.split-button {
  display: flex;
  flex-grow: 1;
  position: relative;

  &__main {
    flex-grow: 1;
    background-color: #a12c2c;
    color: white;
    border: none;
    border-radius: 4px 0 0 4px;
    padding: 1rem;
    font-weight: bold;
    cursor: pointer;
  }

  &__toggle {
    background-color: #8b0000;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 1rem 0.5rem;
    cursor: pointer;
    border-left: 1px solid #a12c2c;
  }

  &__main:hover,
  &__toggle:hover {
    background-color: #c43434;
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    list-style: none;
    padding: 0;
    margin: 0.25rem 0 0 0;
    z-index: 10;
  }

  &__menu-item {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    border-bottom: 1px solid #eee;

    &:hover {
      background-color: #f0f0f0;
    }
    &:last-child {
      border-bottom: none;
    }
  }
}

.actions__heal-button {
  flex-grow: 1;
  background-color: #006400;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #008000;
  }
}
*/
</style>
