<template>
    <div class="section-card">
      <h1 class="age-section-header">
        Currency        
      </h1>
      <div class="age-currency-container">
                    <div class="age-currency-container__coin">
                      <div class="age-currency-container__coin-gold">
                        <span style="padding-top:5px;" v-tippy="{ content: '<p>Gold</p><p>1 Gold = 10 Silver Pieces or 100 Copper Pieces</p>' }">
                          G
                        </span>
                      </div>
                      <input type="number" class="currency__value" v-model="cash.gold" />
                    </div>
                    <div class="age-currency-container__coin">
                      <div  class="age-currency-container__coin-silver">
                        <span style="padding-top:5px;" v-tippy="{ content: '<p>Silver</p><p>1 Silver Piece = 10 Copper Pieces</p>' }">
                          S
                        </span> 
                      </div>
                      <input type="number" class="currency__value" v-model="cash.silver" />
                    </div>
                    <div class="age-currency-container__coin">
                      <div  class="age-currency-container__coin-copper">
                        <span style="padding-top:5px;">
                          C
                        </span> 
                      </div>
                      <input type="number" class="currency__value" v-model="cash.copper" />
                    </div>                    
                  </div>
    </div>
</template>
<script setup>
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const cash = useInventoryStore().cash
</script>