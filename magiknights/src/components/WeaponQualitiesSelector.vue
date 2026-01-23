<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();

const categories = {
  trade: { label: 'Trade-Off (Per-Roll Choice)', keys: ['accurate', 'massive'] },
  trigger: { label: 'Triggered (On Roll 16+)', keys: ['forceful', 'ensnaring', 'staggeringBlow'] },
  special: { label: 'Special', keys: ['coupled', 'veilPiercing', 'twoHanded'] }
};

// Warning for two-handed + shield conflict
const hasTwoHandedConflict = computed(() => {
  return sheet.soul_weapon.qualities.twoHanded && sheet.knight_hasShield;
});
</script>

<template>
  <div class="weapon-qualities-selector">
    <div class="qualities-summary" v-if="sheet.activeWeaponQualities.length > 0">
      <span class="summary-label">Active:</span>
      <span class="quality-tag" v-for="q in sheet.activeWeaponQualities" :key="q">{{ q }}</span>
    </div>

    <div class="modifiers-summary" v-if="sheet.veilPiercingUsed && sheet.soul_weapon.qualities.veilPiercing">
      <span class="mod-badge used">Veil-Piercing: Used this encounter</span>
    </div>

    <div v-if="hasTwoHandedConflict" class="conflict-warning">
      Two-Handed weapon cannot be used with a shield!
    </div>

    <div v-for="(cat, catKey) in categories" :key="catKey" class="quality-category">
      <div class="category-label">{{ cat.label }}</div>
      <div class="quality-grid">
        <label
          v-for="key in cat.keys"
          :key="key"
          class="quality-item"
          :class="{ active: sheet.soul_weapon.qualities[key] }"
          :title="sheet.weaponQualityDefs[key]?.effect"
        >
          <input
            type="checkbox"
            v-model="sheet.soul_weapon.qualities[key]"
          />
          <span class="quality-name">{{ sheet.weaponQualityDefs[key]?.name }}</span>
          <span class="quality-effect">{{ sheet.weaponQualityDefs[key]?.effect }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.weapon-qualities-selector {
  display: grid;
  gap: var(--tiny-gap);
}

.qualities-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;

  .summary-label {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--header-blue);
  }

  .quality-tag {
    font-size: 0.7rem;
    padding: 2px 6px;
    background: var(--header-blue);
    color: white;
    border-radius: 3px;
  }
}

.modifiers-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .mod-badge {
    font-size: 0.75rem;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 3px;

    &.used {
      background: #9e9e9e;
      color: white;
    }
  }
}

.conflict-warning {
  font-size: 0.8rem;
  color: #c62828;
  font-weight: bold;
  padding: 4px 8px;
  background: rgba(198, 40, 40, 0.1);
  border: 1px solid #c62828;
  border-radius: 4px;
}

.quality-category {
  display: grid;
  gap: 4px;
}

.category-label {
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--header-blue);
  border-bottom: 1px solid var(--borderColor);
  padding-bottom: 2px;
}

.quality-grid {
  display: grid;
  gap: 2px;
}

.quality-item {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 2px 8px;
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  border: 1px solid transparent;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background: rgba(74, 74, 138, 0.15);
    border-color: var(--header-blue);

    .quality-name {
      color: var(--header-blue);
      font-weight: bold;
    }
  }

  input[type="checkbox"] {
    grid-row: span 2;
    align-self: center;
    margin: 0;
    width: 16px;
    height: 16px;
  }

  .quality-name {
    font-weight: 500;
  }

  .quality-effect {
    font-size: 0.7rem;
    color: #666;
  }
}

html.dark {
  .quality-item {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(74, 74, 138, 0.3);
    }

    .quality-effect {
      color: #aaa;
    }
  }
}
</style>
