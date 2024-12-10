<template>
    <div class="section-card">
      <div class="age-currency-container">
        <div>
          <div class="age-container-content">
            <input  class="age-input age-num-input" type="number" id="char.stunts" v-model="cash.tn" min="0" />
              <!-- Additional corner elements -->
            <div class="age-container-content-corner-top-right"></div>
            <div class="age-container-content-corner-bottom-left"></div>
          </div>
          <h1 class="age-section-header" style="text-align: center;">
            Resources
          </h1>
        </div>
      </div>
    </div>
</template>
<script setup>
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const cash = useInventoryStore().cash
</script>