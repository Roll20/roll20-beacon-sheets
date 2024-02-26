<template>
  <div class="inventory-item">
    <div class="inventory-item__row">
      <button class="inventory-item__toggle" @click="toggleExpand">
        <span class="caret" :class="{ expanded }">►</span>
        <span class="label">{{ item.name }}</span>
      </button>
      <div class="inventory-item__type">
        {{ item.type }}
      </div>
      <div class="inventory-item__buttons">
        <button
          v-if="isEquippable && !isStowed"
          class="link-btn equip"
          :class="{ equipped: isEquipped }"
          title="Equip"
          @click="handleEquip"
        >
          {{ isEquipped ? 'Equipped' : 'Equip' }}
        </button>
        <button class="link-btn print" title="Print" @click="handlePrint">⮑</button>
        <button class="link-btn swap" title="Swap" @click="handleSwap">⇄</button>
        <button class="link-btn delete" title="Delete" @click="handleDelete">✕</button>
      </div>
    </div>

    <div class="inventory-item__expansion" :class="{ expanded }">
      <div class="inventory-item__top">
        <label :for="`name-${item._id}`">
          <span class="label">Name</span>
          <input :id="`name-${item._id}`" v-model="item.name" />
        </label>
        <label :for="`type-${item._id}`">
          <span class="label">Type</span>
          <select :id="`type-${item._id}`" v-model="item.type">
            <option value="item">Item</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="spell">Spell</option>
            <option value="consumable">Consumable</option>
          </select>
        </label>
        <label v-if="isWeapon" :for="`abilityScore-${item._id}`">
          <span class="label">Ability Score</span>
          <select :id="`abilityScore-${item._id}`" v-model="item.abilityScore">
            <option value="Strength">Strength</option>
            <option value="Endurance">Endurance</option>
            <option value="Charisma">Charisma</option>
            <option value="Aura">Aura</option>
            <option value="Thought">Thought</option>
          </select>
        </label>
        <label :for="`slots-${item._id}`">
          <span class="label">Slots</span>
          <input :id="`slots-${item._id}`" type="number" v-model="item.slots" />
        </label>
        <label v-if="isArmor" :for="`defense-${item._id}`">
          <span class="label">Def</span>
          <input :id="`defense-${item._id}`" type="number" v-model="item.defenseMod" />
        </label>
        <label v-if="isWeapon" :for="`dmg-${item._id}`">
          <span class="label">Dmg</span>
          <input :id="`dmg-${item._id}`" type="text" v-model="item.damage" />
        </label>
        <label v-if="isConsumable" :for="`quantity-${item._id}`">
          <span class="label">Qty.</span>
          <input :id="`quantity-${item._id}`" type="number" v-model="item.quantity" />
        </label>
      </div>
      <div class="inventory-item__bottom">
        <textarea
          placeholder="Description"
          :id="`description-${item._id}`"
          v-model="item.description"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const props = defineProps({
  item: { type: Object },
  isStowed: { type: Boolean },
});

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
  inventory.equipItem(props.item._id);
};
</script>

<style scoped lang="scss">
.inventory-item {
  max-width: 35em;
  .label {
    font-weight: 600;
    padding-right: 0.5rem;
  }

  &__row {
    display: grid;
    align-items: center;
    justify-content: space-between;
    grid-template-columns: 2fr 1fr 2fr;
    text-align: center;
  }

  &__type {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: bold;
    border-radius: 0.5rem;
    background-color: var(--examplesheet-primary);
    padding: 0.25rem;
    color: white;
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
