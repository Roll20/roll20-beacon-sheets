<template>
  <div class="combat-tab">
    <div class="combat-tab-body">
      <div class="body-left">
        <div class="weapons-block">
          <h3>Weapons</h3>
          <div class="weapons-body">
            <Item v-for="weapon in inventory.weapons" :key="weapon._id" :item="weapon" :canShowInChat="false" />
          </div>
          <div class="parry-action" v-if="canParry">
            <span>Parry</span>
            <button class="parry-btn" title="Parry" @click="parryRoll()"><img :src="DIE_ICON" alt="Parry" /></button>
          </div>
        </div>
        <div class="armor-block">
          <h3>Armor</h3>
          <div class="armor-body">
            <Item v-for="armor in inventory.armors" :key="armor._id" :item="armor" :canRoll="false" />
          </div>
        </div>
        <div class="armor-block">
          <h3>Shields</h3>
          <div class="armor-body">
            <Item v-for="shield in inventory.shields" :key="shield._id" :item="shield" :canRoll="false" />
          </div>
        </div>
      </div>
      <div class="body-right">
        <div class="fighting-stance-block">
          <h3>Fighting Stance</h3>
          <div class="select-row">
            <label for="fightingStance">Type:</label>
            <select name="fightingStance" id="fightingStance" v-model="character.fightingStance">
              <option value="standard">Standard</option>
              <option value="offensive">Offensive</option>
              <option value="defensive">Defensive</option>
              <option value="movement">Movement</option>
            </select>
          </div>
          <div class="value-display">
            <label for="potential">Potential:</label>
            <span>{{ character.potential }}</span>
          </div>
          <div class="value-display">
            <label for="defense">Defense:</label>
            <span>{{ character.defense }}</span>
          </div>
          <div class="value-display">
            <label for="speed">Speed:</label>
            <span>{{ character.speed }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import Item from '@/components/parts/Item.vue';
import { parryRoll } from '@/system/rolls';
import { computed } from 'vue';

const character = useCharacterStore();
const inventory = useInventoryStore();

const DIE_ICON = new URL('@/assets/d10.svg', import.meta.url).href;

const canParry = computed(() => {
  return inventory.weapons.length > 0 && (character.fightingStance === 'standard' || character.fightingStance === 'defensive');
});
</script>

<style scoped lang="scss">
.combat-tab {
  h3 {
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #8b4513;
  }

  label {
    margin-right: 0.5rem;
  }

  .combat-tab-body {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .body-left,
  .body-right {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .select-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    select {
      width: 110px; // To align with the inputs below
      padding: 0.25rem;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid #7a7971;
      border-radius: 3px;
      box-sizing: border-box;
    }
  }

  .value-display {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  label {
    width: 70px;
  }

  .value-display span {
    width: 100px;
    padding: 0.25rem;
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid #7a7971;
    border-radius: 3px;
    margin-bottom: 0.5rem;
  }

  .parry-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    padding-right: 36px; // Align with the weapon roll buttons above
  }

  .parry-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    transition: all 0.2s ease;
  }

  .parry-btn:hover {
    background: #e3f2fd;
    border-color: #bbdefb;
    border-radius: 4px;
  }

  .parry-btn img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
}
</style>
