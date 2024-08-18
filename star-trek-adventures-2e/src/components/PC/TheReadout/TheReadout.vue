<template>
  <section 
    class="readout"
    :class="{
      'readout--active': formStarted
    }"
  >
    <button 
      v-if="formStarted"
      type="reset"
      class="readout__clear-button"
      @click="clearActiveStats"
    >
      Clear
    </button>
    <span 
      v-else
      class="readout__prompt"
    >
      Click an Attribute, Department, or Focus to start a roll!
    </span>
    <label 
      v-if="attribute"
      class="readout__entry"
    >
      <span>Attribute</span>
      <input type="text" disabled :value="AttributesEnum[attribute]">
    </label>
    <span v-else-if="formStarted" class="readout__empty">
      Choose an attribute!
    </span>
    <label 
      v-if="department"
      class="readout__entry"
    >
      <span>Department</span>
      <input type="text" disabled :value="DepartmentsEnum[department]">
    </label>
    <span v-else-if="formStarted" class="readout__empty">
      Choose a Department!
    </span>
    <label 
      v-if="focus"
      class="readout__entry"
    >
      <span>Focus</span>
      <input type="text" disabled :value="focus">
    </label>
    <button
      v-if="formStarted"
      class="readout__roll-button"
      @click="rollStore.doRoll"
    >
      Roll
    </button>
  </section>
</template>

<script setup lang="ts">
import { type ActiveStats, useRollStore } from '@/sheet/stores/rollStore/rollStore';
import { AttributeKey, AttributesEnum, DepartmentKey, DepartmentsEnum } from '@/system/gameTerms';
import { computed } from 'vue';

const rollStore = useRollStore();

const getStat = (stat: keyof ActiveStats) => {
  const value = rollStore.activeStats[stat]
  return value
}

const attribute = computed(() => 
  getStat("attribute") as AttributeKey | undefined
)
const department = computed(() => 
  getStat("department") as DepartmentKey | undefined
)
const focus = computed(() => 
  getStat("focus") as string | undefined
)

const formStarted = computed(() => {
  const state = (attribute.value || department.value || focus.value);
  return state;
})

const clearActiveStats = () => {
  delete rollStore.activeStats.attribute
  delete rollStore.activeStats.department
  delete rollStore.activeStats.focus
}

</script>

<style lang="scss">
  .readout {
    display: grid;
    grid-column: span 12;
    grid-row: span 2;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;

    button,
    &__empty,
    &__entry {
      grid-row: span 2;
    }

    &__empty,
    &__entry {
      grid-column: span 3;
    }

    &__empty {
      display:flex;
      grid-column: span 3;

      justify-content: center;
      align-content: center;
    }

    &__entry {
      display: grid;

      grid-template-columns: subgrid;
      grid-template-rows: subgrid;

      span {
        grid-column: span 3;
        font-size: .75rem;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        grid-column: span 3;
      }
    }

    &__prompt {
      display: flex;
      grid-column: span 12;
      justify-content: center;
      margin: 0;
      font-size: .75rem;
    }
  }
</style>