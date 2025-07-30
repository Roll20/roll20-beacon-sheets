<template>
  <div class="section inventory">
    <div class="section__header">Inventory</div>
    <div class="section__body inventory__body">
      <div>
        <span class="inventory__header">Carried Items - </span>
        <span :class="{ overburdened: inventory.isOverburdened }"
          >Slots: {{ inventory.totalEncumbrance }}/{{ inventory.carryCapacity }}</span
        >
        <div class="inventory__group">
          <InventoryItem v-for="item in inventory.items" :key="item._id" :item="item" />
        </div>
        <div class="add-item">
          <button class="link-btn" @click="inventory.addItem(false)">+ Add Item</button>
        </div>
      </div>
      <div>
        <div class="inventory__header">Stowed Items</div>
        <div class="inventory__group">
          <InventoryItem
            v-for="item in inventory.itemsStowed"
            :key="item._id"
            :item="item"
            is-stowed
          />
        </div>
        <div class="add-item">
          <button class="link-btn" @click="inventory.addItem(true)">+ Add Item</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import InventoryItem from '@/components/inventory/InventoryItem.vue';

const inventory = useInventoryStore();
</script>

<style scoped lang="scss">
.inventory {
  &__header {
    font-weight: 600;
  }

  &__body {
    flex-direction: column;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  &__group {
    height: 12rem;
    padding: 0 1rem;
    overflow: scroll;
    display: flex;
    flex-direction: column;
  }

  .overburdened {
    color: red;
  }
}
</style>
