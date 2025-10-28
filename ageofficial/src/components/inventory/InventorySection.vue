<template>
  <div class="section inventory">
    <div class="add-item">
      
        </div>
    <div class="section__body inventory__body">
      <div style="margin-top:10px;">
        <!-- <span class="inventory__header">Carried Items - </span> -->
        <!-- <span :class="{ overburdened: inventory.isOverburdened }"
          >Slots: {{ inventory.totalEncumbrance }}/{{ inventory.carryCapacity }}</span
        > -->
        
    <div style="padding: 6px;width: min-content;min-width: 100%;" >
      
      <div style="width: 100%;display: flex;justify-content: space-between;padding:0 0 5px;gap:5px">
        <div style="padding: 15px 6px 6px;width: 100%;" v-if="inventory.items.length === 0">
          Your Inventory is empty. Add gear and weapons to your character.
        </div>
        <div style="display: flex;gap: 5px;">
          <div class="age-search-input"  v-if="inventory.items.length > 0">
              <input class="form-control " v-model="inventoryItemFilter" placeholder="Search by Item Name" />              
              <button class="age-icon-btn age-search-input-clear-btn" v-if="inventoryItemFilter" @click="inventoryItemFilter = ''">
                <font-awesome-icon :icon="['fa', 'circle-xmark']"/>
              </button>    
          </div>
          <div class="age-search-select"  v-if="inventory.items.length > 0">
            <select class="form-select" placeholder="Filter by Item Type" v-model="inventoryTypeFilter">
                <option value="" disabled hidden>Filter by Item Type</option>
                <option value="" v-if="inventoryTypeFilter">None</option>
                <option value="armor">Armor</option>
                <option value="consumable">Consumable</option>
                <option value="item">Item</option>
                <option value="shield">Shield</option>
                <option value="weapon">Weapon</option>
              </select>
          </div>     
        </div>
             
          <button class="link-btn age-icon-btn" @click="showModal = true" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;" v-tippy="{ content: 'Add Equipment' }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
          </button>
        </div>
      <div class="accordion age-accordion">
          <transition-group name="filtered-list" tag="div">
            <div class="accordion-item" v-for="(item, index) in filteredItems" :key="item._id">
            <InventoryItem  :item="item" :index="index" />
          </div>
          </transition-group>
          <div v-if="filteredItems.length === 0 && inventory.items.length > 0" class="no-results">
            No results found.
          </div>     
        </div>
        </div>
        <CurrencyView v-if="settings.incomeMode === 'currency'" />
        <ResourcesView v-if="settings.incomeMode === 'recources'" />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <InventoryModal :show="showModal" @close="showModal = false;resetItem()" :item="itemNew" :mode="'create'">
      <template #header>
        <h3 class="age-modal-header">Item Details</h3>
      </template>
    </InventoryModal>
  </Teleport>
</template>

<script setup>
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import InventoryItem from '@/components/inventory/InventoryItem.vue';
import CurrencyView from '../resources/CurrencyView.vue';
import ResourcesView from '@/components/resources/ResourcesView.vue';
import InventoryModal from './InventoryModal.vue';
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

const inventory = useInventoryStore();
const settings = useSettingsStore();
const showModal = ref(false);
const inventoryItemFilter = ref('');
const inventoryTypeFilter = ref('');
const debouncedSearchQuery = ref('');
const debouncedItemType = ref('');
// Debounce delay (in milliseconds)
const debounceDelay = 600;
let debounceTimer;
watch([inventoryItemFilter,inventoryTypeFilter], ([newQuery,newType]) => {
  // Clear the previous timeout if the user is still typing
  clearTimeout(debounceTimer);

  // Set up a new timeout to update debouncedSearchQuery after the delay
  debounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newQuery;
    debouncedItemType.value = newType;
  }, debounceDelay);
});

const filteredItems = computed(() => {
  return inventory.items.filter(item => {
    // Split the search query into words, and check each word against the item name
    const queryWords = debouncedSearchQuery.value.toLowerCase().split(' ');
    const itemName = item.name.toLowerCase();
    // Only include items where every word in searchQuery matches part of the name
    // return queryWords.every(word => (itemName.includes(word) && word.type === itemType));
    const matchesQuery = queryWords.every(word => itemName.includes(word));
    const matchesType = !debouncedItemType.value || item.type.toLowerCase() === debouncedItemType.value;

    return matchesQuery && matchesType;
  });
});

const itemNew = ref({
  _id: '',
  type: 'item',
  slots: '',
  name: '',
  description: '',
  quantity: 1
})
function resetItem(){
  itemNew.value = {
    _id: '',
    type: 'item',
    slots: '',
    name: '',
    description: '',
    quantity: 1
  }
}

</script>

<style scoped lang="scss">
.inventory {
  &__header {
    font-weight: 600;
  }

  &__body {
    flex-direction: column;
    display: grid;
    // grid-template-columns: 1fr 1fr;
    grid-template-columns: 1fr;
  }

  &__group {
    display: flex;
    flex-direction: column;
  }

  .overburdened {
    color: red;
  }
}
</style>
