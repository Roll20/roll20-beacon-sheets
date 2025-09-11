<template>
  <div class="magic-tab">
    <!-- Spells Section -->
    <div class="spells-section">
      <div class="spells-block">
        <h3>Spells</h3>
        <div class="spells-body">
          <div class="spell-item" v-for="spell in inventory.spells" :key="spell._id">
            <Item :item="spell" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import Item from '@/components/parts/Item.vue';

const inventory = useInventoryStore();
</script>

<style scoped lang="scss">
.magic-tab {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #8b4513;
  }

  .spells-section {
    flex: 1;

    .spells-block {
      .spells-body {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  }
}
</style>
