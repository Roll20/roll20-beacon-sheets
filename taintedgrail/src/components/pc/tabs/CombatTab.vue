<template>
  <div class="combat-tab">
    <div class="combat-tab-body">
      <div class="body-left">
        <div class="weapons-block">
          <div class="section-header">
            <h3>Weapons</h3>
            <button class="add-btn" title="Add custom weapon" @click="openCustomItemModal('weapon')">+</button>
          </div>
          <div class="weapons-body">
            <ItemComponent v-for="weapon in inventory.weapons" :key="weapon._id" :item="weapon" :canShowInChat="false" />
          </div>
          <div class="parry-action" v-if="canParry">
            <span>Parry</span>
            <button class="parry-btn" title="Parry" @click="parryRoll()"><img :src="DIE_ICON" alt="Parry" /></button>
          </div>
        </div>
        <div class="armor-block">
          <div class="section-header">
            <h3>Armor</h3>
            <button class="add-btn" title="Add custom armor" @click="openCustomItemModal('armor')">+</button>
          </div>
          <div class="armor-body">
            <ItemComponent v-for="armor in inventory.armors" :key="armor._id" :item="armor" :canRoll="false" />
          </div>
        </div>
        <div class="armor-block">
          <div class="section-header">
            <h3>Shields</h3>
            <button class="add-btn" title="Add custom shield" @click="openCustomItemModal('shield')">+</button>
          </div>
          <div class="armor-body">
            <ItemComponent v-for="shield in inventory.shields" :key="shield._id" :item="shield" :canRoll="false" />
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
            <span class="combat-value">{{ character.potential }}</span>
            <img
              :src="PENCIL_ICON"
              class="pencil-icon"
              alt="Edit potential bonuses"
              title="Edit potential bonuses"
              @click="openBonusModal('potential')"
            />
          </div>
          <div class="value-display">
            <label for="defense">Defense:</label>
            <span class="combat-value">{{ character.defense }}</span>
            <img
              :src="PENCIL_ICON"
              class="pencil-icon"
              alt="Edit defense bonuses"
              title="Edit defense bonuses"
              @click="openBonusModal('defense')"
            />
          </div>
          <div class="value-display">
            <label for="speed">Speed:</label>
            <span class="combat-value">{{ character.speed }}</span>
            <img
              :src="PENCIL_ICON"
              class="pencil-icon"
              alt="Edit speed bonuses"
              title="Edit speed bonuses"
              @click="openBonusModal('speed')"
            />
          </div>
        </div>
      </div>
    </div>

    <CombatBonusesModal :show="showBonusModal" :stat="selectedBonusStat" @close="closeBonusModal" />
    <CustomCombatItemModal :show="showCustomItemModal" :type="customItemType" @close="closeCustomItemModal" />
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import ItemComponent from '@/components/parts/ItemComponent.vue';
import CombatBonusesModal from '@/components/modals/CombatBonusesModal.vue';
import CustomCombatItemModal from '@/components/modals/CustomCombatItemModal.vue';
import { parryRoll } from '@/system/rolls';
import { computed, ref } from 'vue';

const character = useCharacterStore();
const inventory = useInventoryStore();

const DIE_ICON = new URL('@/assets/d10.svg', import.meta.url).href;
const PENCIL_ICON = new URL('@/assets/pencil.svg', import.meta.url).href;
const showBonusModal = ref(false);
const selectedBonusStat = ref<'potential' | 'defense' | 'speed'>('potential');
const showCustomItemModal = ref(false);
const customItemType = ref<'weapon' | 'armor' | 'shield'>('weapon');

const canParry = computed(() => {
  return inventory.weapons.length > 0 && (character.fightingStance === 'standard' || character.fightingStance === 'defensive');
});

const openBonusModal = (stat: 'potential' | 'defense' | 'speed') => {
  selectedBonusStat.value = stat;
  showBonusModal.value = true;
};

const closeBonusModal = () => {
  showBonusModal.value = false;
};

const openCustomItemModal = (type: 'weapon' | 'armor' | 'shield') => {
  customItemType.value = type;
  showCustomItemModal.value = true;
};

const closeCustomItemModal = () => {
  showCustomItemModal.value = false;
};
</script>

<style scoped lang="scss">
.combat-tab {
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
    gap: 0.5rem;
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

  .value-display .combat-value {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    width: 90px;
    padding: 0.15rem 0.6rem;
    background: linear-gradient(180deg, #efe1c2 0%, #e4d1aa 100%);
    border: 1px solid #8d6b3f;
    border-radius: 3px;
    color: #4d3921;
    font-weight: 700;
    letter-spacing: 0.02em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 1px 1px rgba(0, 0, 0, 0.2);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  .pencil-icon {
    width: 14px;
    height: 14px;
    margin-left: 0.35rem;
    cursor: pointer;
    opacity: 0.85;
    transition: opacity 0.15s ease;
  }

  .pencil-icon:hover {
    opacity: 1;
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
