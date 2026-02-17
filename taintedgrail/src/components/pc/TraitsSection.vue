<template>
  <div class="section traits">
    <div class="section__body traits__body">
      <!-- Advantages -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Advantages</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="advantage in inventory.advantages" :key="advantage._id">
            <ItemComponent :item="advantage" :canRoll="false" :isCompact="true" />
          </div>
        </div>
      </div>

      <!-- Disadvantages -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Disadvantages</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="disadvantage in inventory.disadvantages" :key="disadvantage._id">
            <ItemComponent :item="disadvantage" :canRoll="false" :isCompact="true" />
          </div>
        </div>
      </div>

      <div class="traits__separator"></div>

      <!-- Torments -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Torments</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="torment in inventory.torments" :key="torment._id">
            <ItemComponent :item="torment" :canRoll="false" :isCompact="true" />
          </div>
        </div>
      </div>

      <!-- Routs -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Routs</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="rout in inventory.routs" :key="rout._id">
            <ItemComponent :item="rout" :canRoll="false" :isCompact="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import ItemComponent from '../parts/ItemComponent.vue';

const inventory = useInventoryStore();
</script>

<style scoped lang="scss">
.traits {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  &__separator {
    height: 1px;
    border-bottom: 1px solid #782e22;
    margin: 0.25rem 0 0.5rem 0;
  }

  &__group {
    display: flex;
    flex-direction: column;

    &__content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    &__item {
      padding: 0.25rem;
      border-radius: 0.25rem;
      background-color: #2c2c2c;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.25rem 0;
  }

  &__divider {
    height: 1px;
    background-color: #7a7971;
    margin: 0.25rem 0 0.5rem 0;
  }
}
</style>
