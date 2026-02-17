<template>
  <div class="section traits">
    <h3>Traits and Abilities</h3>
    <div class="section__body traits__body">
      <!-- Traits -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Traits</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="trait in inventory.traits" :key="trait._id">
            <ItemComponent :item="trait" :canRoll="false" />
          </div>
        </div>
      </div>

      <!-- Special Abilities -->
      <div class="traits__group">
        <div class="traits__header">
          <span>Special Abilities</span>
        </div>
        <div class="traits__divider"></div>
        <div class="traits__content">
          <div class="traits__item" v-for="specialAbility in inventory.specialAbilities" :key="specialAbility._id">
            <ItemComponent :item="specialAbility" :canRoll="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import ItemComponent from '@/components/parts/ItemComponent.vue';

const inventory = useInventoryStore();
</script>

<style scoped lang="scss">
.traits {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    font-size: 1.2rem;
    padding: 0.25rem 0;
  }

  &__divider {
    height: 1px;
    background-color: #7a7971;
    margin: 0.25rem 0 0.5rem 0;
  }
}
</style>
