<template>
  <div class="item-row" :class="{ compact: isCompact }">
    <!-- Icon -->
    <div v-if="!isCompact" class="item-icon">
      <img v-if="item.icon" :src="item.icon" :alt="item.name" />
      <div v-else class="icon-placeholder">
        <img :src="DEFAULT_ITEM" alt="Default Item" />
      </div>
    </div>

    <!-- Name -->
    <div class="item-name" :class="{ compact: isCompact }">
      {{ item.name }}
    </div>

    <!-- Dynamic Content -->
    <div class="item-content" :class="{ compact: isCompact }">
      <slot name="content">
        <span v-if="isWeapon">Damage: {{ weaponItem.damage }} | Range: {{ weaponItem.range }}</span>
        <span v-if="isArmor">Protection: {{ armorProtection }}</span>
        <span v-if="isSpell">MP Cost: {{ spellItem.mpCost }} | Cast Time: {{ spellItem.castTime }}</span>
      </slot>
    </div>

    <!-- Action Icons -->
    <div class="item-actions" :class="{ compact: isCompact }">
      <slot name="actions">
        <button v-if="canRoll" class="roll-btn" :class="{ compact: isCompact }" title="Roll" @click="roll()">
          <img :src="DIE_ICON" alt="Roll" />
        </button>
        <button v-if="canShowInChat" class="roll-btn" :class="{ compact: isCompact }" title="Show in Chat" @click="sendItemToChat(item)">
          <img :src="SPEECH_BUBBLE_ICON" alt="Show in Chat" />
        </button>
        <button class="delete-btn" :class="{ compact: isCompact }" title="Delete" @click="inventory.removeItem(item)">
          <img :src="TRASH_ICON" alt="Delete" />
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { CategoryType } from '@/sheet/stores/inventory/inventoryStore';
import type { AnyItem, Weapon, Armor, Spell } from '@/sheet/stores/inventory/inventoryStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { sendItemToChat, magicRoll, weaponRoll } from '@/system/rolls';

const inventory = useInventoryStore();
const character = useCharacterStore();

const DIE_ICON = new URL('@/assets/d10.svg', import.meta.url).href;
const DEFAULT_ITEM = new URL('@/assets/item.svg', import.meta.url).href;
const TRASH_ICON = new URL('@/assets/trash.svg', import.meta.url).href;
const SPEECH_BUBBLE_ICON = new URL('@/assets/speech-bubble.svg', import.meta.url).href;

const props = withDefaults(
  defineProps<{
    item: AnyItem;
    canShowInChat?: boolean;
    canRoll?: boolean;
    isCompact?: boolean;
  }>(),
  {
    canShowInChat: true,
    canRoll: true,
  },
);

const isWeapon = computed(() => props.item.type === CategoryType.WEAPON);
const isArmor = computed(() => props.item.type === CategoryType.ARMOR);
const isSpell = computed(() => props.item.type === CategoryType.SPELL);

const weaponItem = computed(() => props.item as Weapon);
const armorItem = computed(() => props.item as Armor);
const spellItem = computed(() => props.item as Spell);

const armorProtection = computed(() => {
  if (
    character.fightingStance === 'offensive' &&
    armorItem.value.offensiveProtection != undefined &&
    armorItem.value.offensiveProtection != null
  ) {
    return armorItem.value.offensiveProtection;
  } else if (
    character.fightingStance === 'defensive' &&
    armorItem.value.defensiveProtection != undefined &&
    armorItem.value.defensiveProtection != null
  ) {
    return armorItem.value.defensiveProtection;
  } else {
    return armorItem.value.standardProtection;
  }
});

const roll = () => {
  if (isWeapon.value) weaponRoll(weaponItem.value);
  else if (isSpell.value) magicRoll(spellItem.value);
};
</script>

<style scoped>
.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  min-height: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.item-row:hover {
  border-color: #bbb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-row.compact {
  gap: 6px;
  padding: 3px;
  min-height: 20px;
}

.item-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid black;
}

.item-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 2px;
}

.icon-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-placeholder img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.6;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
  max-width: 130px;
  flex-shrink: 0;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-name.compact {
  max-width: 175px;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.item-content {
  flex: 1;
  color: #5a6c7d;
  font-size: 0.85em;
  font-weight: 500;
}

.item-content.compact {
  font-size: 0.75em;
}

.item-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.item-actions.compact {
  gap: 1px;
}

.roll-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.roll-btn.compact,
.delete-btn.compact {
  padding: 3px;
  width: 22px;
  height: 22px;
  border-radius: 2px;
}

.roll-btn img,
.delete-btn img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.roll-btn.compact img,
.delete-btn.compact img {
  width: 12px;
  height: 12px;
}

.roll-btn:hover {
  background: #e3f2fd;
  border-color: #bbdefb;
}

.delete-btn:hover {
  background: #f44336;
  border-color: #d32f2f;
}

.delete-btn:hover img {
  filter: brightness(0) invert(1);
}
</style>
