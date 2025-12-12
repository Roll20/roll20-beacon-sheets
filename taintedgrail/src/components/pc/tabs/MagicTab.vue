<template>
  <div class="magic-tab">
    <!-- Spells Section -->
    <div class="spells-section">
      <div class="spells-block">
        <div class="section-header">
          <h3>Spells</h3>
          <button class="add-btn" title="Add custom spell" @click="showCustomSpellModal = true">+</button>
        </div>
        <div class="spells-body">
          <div class="spell-item" v-for="spell in inventory.spells" :key="spell._id">
            <ItemComponent :item="spell" />
          </div>
        </div>
      </div>
    </div>

    <CustomSpellModal :show="showCustomSpellModal" @close="showCustomSpellModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import ItemComponent from '@/components/parts/ItemComponent.vue';
import CustomSpellModal from '@/components/modals/CustomSpellModal.vue';

const inventory = useInventoryStore();
const showCustomSpellModal = ref(false);
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

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .add-btn {
    width: 20px;
    height: 20px;
    border: 1px solid #7a7971;
    border-radius: 2px;
    background: transparent;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
  }

  .add-btn:hover {
    background-color: rgba(0, 0, 0, 0.08);
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
