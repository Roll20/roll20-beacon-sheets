<template>
  <div class="damage-type" v-if="Array.isArray(damage) && damage.length > 0">
    <div :class="containerClass">
      <div class="damage-type__header">
        <span>{{ $t('titles.damage') }}</span>
        <span v-if="showCrit">{{ $t('titles.crit') }}</span>
        <span>{{ $t('titles.ability-bonus') }}</span>
        <span>{{ $t('titles.damage-type') }}</span>
        <span></span>
      </div>
      <div v-for="(roll, index) in damage" :key="index" class="damage-type__row">
        <input type="text" v-model="roll.damage" placeholder="1d6 + 2" />
        <input
          v-if="showCrit"
          type="text"
          v-model="roll.critDamage"
          :placeholder="getDiceFromExpression(roll.damage)"
        />
        <select v-model="roll.ability">
          <option value="none">{{ $t(`titles.none`) }}</option>
          <option v-for="ability in config.abilities" :key="ability" :value="ability">
            {{ $t(`abbreviations.${ability}`) }}
          </option>
        </select>
        <select v-model="roll.type">
          <option v-for="type in config.dicePoolTypes" :key="type" :value="type">
            {{ $t(`titles.dice-pool-types.${type}`) }}
          </option>
        </select>
        <button type="button" class="button button--negative" @click="removeDamageRoll(index)"><SvgIcon icon="delete" /></button>
      </div>
    </div>
    <button type="button" class="damage-type__add button button--tertiary" @click="addDamageRoll">
      <strong>{{ $t('actions.add-damage-roll') }}</strong>
    </button>
  </div>
  <button
    type="button"
    class="damage-type__add button button--tertiary"
    @click="addDamageRoll"
    v-else
  >
    <strong>{{ $t('actions.add-damage-roll') }}</strong>
  </button>
</template>

<script setup lang="ts">
import { config } from '@/config';
import { computed } from 'vue';
import { getDiceFromExpression } from '@/utility/getDiceFromExpression';
import SvgIcon from '@/components/shared/SvgIcon.vue';
import { type DamageRoll } from '@/sheet/stores/actions/damage';

const props = defineProps<{
  damage: DamageRoll[];
  showCrit?: boolean;
}>();

const removeDamageRoll = (index: number) => {
  props.damage.splice(index, 1);
};

const addDamageRoll = () => {
  props.damage.push({
    ability: 'none',
    damage: '',
    type: config.dicePoolTypes[0],
    critDamage: '',
  });
};

const containerClass = computed(() => {
  const classes = ['damage-type__container'];
  if (props.showCrit) {
    classes.push('damage-type__container--with-crit');
  }
  return classes;
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>[]): void;
}>();
</script>

<style lang="scss" scoped>
.damage-type {
  border-radius: 5px;
  border: 1px solid var(--color-tertiary);
  &:has(.damage-type__container) {
    padding: var(--size-gap-small);
  }
  &__container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr min-content;
    gap: 10px 5px;
    margin-bottom: 10px;

    &--with-crit {
      grid-template-columns: 1fr 1fr 60px 1.5fr min-content;
    }
  }
  &__header {
    font-weight: bold;
    display: contents;
  }
  &__row {
    display: contents;
    input,
    select {
      width: 100%;
      box-sizing: border-box;
      font-size: var(--size-font-medium);
      border: 1px solid var(--color-primary);
      border-radius: 3px;
      padding: 0.5rem;
    }
    button {
      width: 25px;
    }
  }
  button {
    font-size: var(--size-font-medium);
  }
  /*
  &__add {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    border: 0;
    border-radius: 5px;
    background-color: transparent;
    padding: 5px;
    cursor: pointer;
  }
  &__container + &__add {
    background-color: var(--color-disabled);
  }
  */
}
</style>
