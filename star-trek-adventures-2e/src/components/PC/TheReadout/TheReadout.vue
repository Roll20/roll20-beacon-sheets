<template>
  <section 
    class="readout"
    :class="{
      'readout--active': formStarted
    }"
  >
    <h2 class="readout__header">Task Manager</h2>
    <aside class="readout__quick-roll-bar">
      <div v-for="key in rollStore.savedRolls.keys()" :key="key">
        <button 
          @click="rollStore.handleSavedRollClick(key)"
          :class="{
            'readout__saved-roll-button': true,
            'readout__saved-roll-button--active': rollStore.savedRollActive && key === rollStore.activeName,
          }"
        > 
          {{ key }} 
        </button>
      </div>
    </aside>
    <div 
      v-if="formStarted"
      class="readout__button-col"
    >
      <button 
        type="reset"
        class="readout__clear-button"
        @click="clearActiveStats"
      >
        Clear
      </button>
      <button 
        v-if="rollStore.savedRollActive"
        type="reset"
        @click="deleteSavedRoll"
      >
        Delete Roll
      </button>
    </div>
    <span 
      v-else
      class="readout__prompt"
    >
      Click an Attribute, Department, or Focus to start a roll!
    </span>
    <label 
    v-if="formStarted"
      class="readout__entry"
    >
      <span>Name</span>
      <input type="text" v-model="rollStore.activeName">
    </label>
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
    <div 
      v-if="formStarted"
      class="readout__button-col"
    >
      <button
        class="readout__roll-button"
        @click="rollStore.doRoll"
      >
        Roll
      </button>
      <button 
          class="readout__save-button"
          @click="rollStore.saveRoll"
        >
          <img src="../../../common/assets/add.svg" role="presentation">
          <span> Save </span>
      </button>
    </div>
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

const deleteSavedRoll = () => {
  rollStore.savedRolls.delete(rollStore.activeName)
  clearActiveStats();
}
</script>

<style lang="scss">
  .readout {
    display: grid;
    grid-column: span 12;
    grid-row: span 3;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;

    button {
      cursor: pointer;
      width: 100%;
    }

    &__empty,
    &__entry {
      grid-row: span 2;
    }

    &__empty,
    &__entry {
      grid-column: span 2;
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
        grid-column: span 2;
        font-size: .75rem;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        grid-column: span 2;
      }
    }

    &__header,
    &__prompt {
      display: flex;
      font-size: var(--subsection-header-size);
      line-height: var(--subsection-header-size);
      margin: 0;
    };

    &__header {
      grid-column: span 3;
      justify-content: flex-start;
    }

    &__prompt {
      grid-column: span 12;
      justify-content: center;
    }

    &__quick-roll-bar {
      grid-column: span 9;
      display: flex;
    }

    &__save-button {
      display: inline-flex;
      justify-content: center;
      img {
        height: 1rem;
        aspect-ratio: 1;
      }
    }

    &__button-col {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 2;
      grid-column: span 2;
    }

    &__clear-button {
      &:last-child{
        grid-row: 1/-1;
      }
    }
  }
</style>