<template>
  <section class="readout">
    <label 
      v-if="department"
      class="readout__entry"
    >
      <span>Department</span>
      <input type="text" disabled :value="DepartmentsEnum[department]">
    </label>
    <label 
      v-if="attribute"
      class="readout__entry"
    >
      <span>Attribute</span>
      <input type="text" disabled :value="AttributesEnum[attribute]">
    </label>
    <label 
      v-if="focus"
      class="readout__entry"
    >
      <span>Focus</span>
      <input type="text" disabled :value="focus">
    </label>
  </section>
</template>

<script setup lang="ts">
import { ActiveStats, useRollStore } from '@/sheet/stores/rollStore/rollStore';
import { AttributeKey, AttributesEnum, DepartmentKey, DepartmentsEnum } from '@/system/gameTerms';
import { computed } from 'vue';

const rollStore = useRollStore();

const getStat = (stat: keyof ActiveStats) => {
  const value = rollStore.activeStats[stat]
  return value
}

const department = computed(() => getStat("department") as DepartmentKey | undefined)
const attribute = computed(() => getStat("attribute") as AttributeKey | undefined)
const focus = computed(() => getStat("focus") as string | undefined)

</script>

<style lang="scss">
  .readout {
    display: grid;
    grid-column: span 12;
    grid-template-columns: subgrid;

    &__entry {
      display: grid;
      grid-column: span 3;
      grid-template-columns: subgrid;
      span {
        grid-column: span 3;
        font-size: .75rem;;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        grid-column: span 3;
      }
    }
  }
</style>