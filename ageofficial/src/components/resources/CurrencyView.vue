<template>
    <div class="section-card">
      <h1 class="age-section-header">
        Currency        
      </h1>
      <div class="age-currency-container">
                    <div class="age-currency-container__coin">
                      <div style="background-image: url(src/assets/currency/gold.png);
    height: 75px;
    width: 50px;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    left: -10px;
    top: -24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    font-family: 'Ringbearer', sans-serif;
    color: rgba(0, 0, 0, 0.7);"
    >
    <span style="padding-top:5px;" v-tippy="{ content: '<p>Gold</p><p>1 Gold = 10 Silver Pieces or 100 Copper Pieces</p>' }">
                            G
                          </span> 
  </div>
                      <!-- <div class="coin coin-gold">
                        <div class="front jump">
                          <div class="star"></div>
                          <span class="currency" v-tippy="{ content: '<p>Gold</p><p>1 Gold = 10 Silver Pieces or 100 Copper Pieces</p>' }">
                            G
                          </span>                          
                        </div>
                      </div> -->
                      <input type="number" class="currency__value" v-model="cash.gold" />
                    </div>
                    <div class="age-currency-container__coin">
                      <div style="background-image: url(src/assets/currency/silver.png);
    height: 75px;
    width: 50px;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    left: -10px;
    top: -24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    font-family: 'Ringbearer', sans-serif;
    color: rgba(0, 0, 0, 0.7);"
    >
    <span style="padding-top:5px;" v-tippy="{ content: '<p>Silver</p><p>1 Silver Piece = 10 Copper Pieces</p>' }">
                            S
                          </span> 
                          </div>
                      <!-- <div class="coin coin-silver">
                        <div class="front jump">
                          <div class="star"></div>
                          <span class="currency" v-tippy="{ content: '<p>Silver</p><p>1 Silver Piece = 10 Copper Pieces</p>' }">
                            S
                          </span>                          
                        </div>
                      </div> -->
                      <input type="number" class="currency__value" v-model="cash.silver" />
                    </div>
                    <div class="age-currency-container__coin">
                      <div style="background-image: url(src/assets/currency/copper.png);
    height: 75px;
    width: 50px;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    left: -10px;
    top: -24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    font-family: 'Ringbearer', sans-serif;
    color: rgba(0, 0, 0, 0.7);"
    >
    <span style="padding-top:5px;">
                            C
                          </span> 
                      <!-- <div class="coin coin-copper">
                        <div class="front jump">
                          <div class="star"></div>
                          <span class="currency" v-tippy="{ content: 'Copper' }">
                            C
                          </span>                          
                        </div>
                      </div> -->
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