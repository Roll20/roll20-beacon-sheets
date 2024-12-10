<template>
  <div class="accordion-header attack attack__row age-inventory-accordion-header" >
    <div>
      <div class="age-inventory-section age-item-armor-icon" v-if="item.type === 'armor'"></div>
      <div class="age-inventory-section age-item-item-icon" v-if="item.type === 'item'"></div>
      <div class="age-inventory-section age-item-weapon-icon" v-if="item.type === 'weapon'"></div>
      <div class="age-inventory-section age-item-consumable-icon" v-if="item.type === 'consumable'"></div>
      <div class="age-inventory-section age-item-shield-icon" v-if="item.type === 'shield'"></div>
    </div>
    <span class="label">{{ item.name }}</span>
    <div style="display: grid;align-items: center;grid-template-columns: 1fr;height: 100%;">
          <div class="inventory-item__quantity">
              <div class="inventory-item__quantity_minus" style="text-align: right;"><button @click="quantityMinus" :disabled="item.quantity === 0" v-if="item.type === 'consumable'">
                <font-awesome-icon :icon="['fa', 'square-minus']" />
              </button></div>
              <div class="inventory-item__quantity_total">{{ item.quantity }}</div>
              <div class="inventory-item__quantity_plus"><button @click="quantityPlus" v-if="item.type === 'consumable'">
                <font-awesome-icon :icon="['fa', 'square-plus']" />
              </button></div>
          </div>
        </div>
        
      <div style="display: grid;align-items: center;grid-template-columns: 1fr;height: 100%;"></div>
      <div style="display: grid;align-items: center;grid-template-columns: 1fr;height: 100%;">
        <div class="inventory-item__type__toggle">
            <label class="age-checkbox-toggle" v-if="item.type === 'armor' || item.type === 'weapon'  || item.type === 'shield'">
            <input type="checkbox" v-model="item.equipped" @change="handleEquip" />
            <span class="slider round"  v-tippy="{ content: 'Equipable' }"></span>
          </label>
          </div>  
      </div>
      <button type="button" class="config-btn age-icon-btn" @click="handlePrint" v-tippy="{ content: 'Share Equipment in chat'}">
          <font-awesome-icon :icon="['fa', 'comment']" />
      </button> 
      <button type="button" class="config-btn age-icon-btn" @click="showModal = true" v-tippy="{ content: 'Edit Equipment'}">
          <font-awesome-icon :icon="['fa', 'gear']" />
      </button> 

        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"  aria-expanded="true" aria-controls="collapseOne"></button>
    </div>
    <div :id="'collapse'+ index" class="accordion-collapse age-accordion-collapse collapsed collapse" data-bs-parent="#age-spell-accordion">
      <div class="accordion-body">

<div class="age-spell-accordion">
  <div>
    <h3>Description</h3>
    <div v-html="item.description"></div>
  </div>
  <div class="age-speel-details">
    Action: Majors
  </div>
</div>
</div>
    </div>
  <Teleport to="body">
    <InventoryModal :show="showModal" @close="showModal = false;" :item="item" @delete="handleDelete()">
      <template #header>
        <h3 class="age-modal-header">Item Details</h3>
      </template>
    </InventoryModal>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import InventoryModal from './InventoryModal.vue';
import { useAttackStore } from '@/sheet/stores/attack/attackStore';

const props = defineProps({
  item: { type: Object },
  isStowed: { type: Boolean },
  index: { type: Number },

});

const showModal = ref(false)

const expanded = ref(false);

const isEquipped = computed(() => {
  return isEquippable.value && props.item.equipped;
});

const isArmor = computed(() => {
  return props.item.type === 'armor';
});

const isWeapon = computed(() => {
  return props.item.type === 'weapon';
});

const isConsumable = computed(() => {
  return props.item.type === 'consumable';
});

const isEquippable = computed(() => {
  return isWeapon.value || isArmor.value;
});

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const handleSwap = () => {
  const inventory = useInventoryStore();
  inventory.swapItem(props.item._id, props.isStowed);
};

const handleDelete = () => {
  const inventory = useInventoryStore();
  inventory.removeItem(props.item._id, props.isStowed);
};

const handlePrint = () => {
  const inventory = useInventoryStore();
  inventory.printItem(props.item._id);
};

const handleEquip = () => {
  
  const inventory = useInventoryStore();
  const attack = useAttackStore();
  if(props.item.equipped){
    // item.equipAttack(props.item)
    // inventory.unEquipItem(props.item._id);
  } else {
    // item.removeAttack(props.item._id);
  }
};

const quantityPlus = () => {
  props.item.quantity++
}
const quantityMinus = () => {
  props.item.quantity--
}

</script>

<style scoped lang="scss">
.inventory-item {
  .label {
    font-weight: 600;
    padding-right: 0.5rem;
  }

  &__row {
    display: grid;
    align-items: center;
    gap: 1rem;
    padding: 2px;
    border: 1px solid #1e4e7a;
    margin: 6px;
    overflow: hidden;
    grid-template-columns: 2fr 1fr 1fr 1fr 30px;
    position: relative;
    border-radius: 8px;
  }

  &__type {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 400;
    border-radius: 0.5rem;
    background-color: var(--examplesheet-primary);
    padding: 0.25rem;
    color: white;
    text-align: center;
    &__toggle {
      display: flex;
      justify-content: center;
    }
  }
  &__quantity {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    &_minus button {
      background-color: transparent;
      color: #ff0000;
      border:none;
      font-size: 1.75rem;
      padding: 0;
    }
    &_minus button:disabled {
      color: lightgray;
    }
    &_total {
      line-height: 25px;
      font-weight: 600;
      font-size: 1.1rem;
      text-align: center;
    }
    &_plus button {
      background-color: transparent;
      color: #008000;
      border:none;
      font-size: 1.75rem;
      padding: 0;
    }
  }
  &__buttons {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    button {
      padding: 0 0.5rem;
      &.delete,
      &.swap {
        font-size: 1.25rem;
      }
      &.equip {
        &.equipped {
          color: var(--examplesheet-primary);
        }
      }
    }
  }

  &__toggle {
    font-weight: 600;
    display: inline-flex;
    gap: 1rem;
    align-items: center;
    .caret {
      line-height: 1rem;
      transform: rotate(0deg);
      transition: transform 0.2s ease-in-out;
      &.expanded {
        transform: rotate(-90deg);
      }
    }
  }

  &__expansion {
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s linear;

    &.expanded {
      opacity: 1;
      height: 9.5rem;
      pointer-events: all;
    }
  }

  &__top {
    padding: 0.5rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    input[type='number'] {
      max-width: 3rem;
    }
  }

  &__bottom {
    width: 100%;
    margin-bottom: 1rem;

    textarea {
      width: 100%;
      height: 5rem;
    }
  }
}
</style>
