<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();

const categories = {
  attack: { label: 'Attack Modifiers', keys: ['accurate', 'rapidFire', 'veilPiercing'] },
  damage: { label: 'Damage Modifiers', keys: ['scatter', 'vicious'] },
  special: { label: 'Special', keys: ['longRange', 'silenced'] }
};
</script>

<template>
  <div class="gun-qualities-selector">
    <div class="qualities-summary" v-if="sheet.activeGunQualities.length > 0">
      <span class="summary-label">Active:</span>
      <span class="quality-tag" v-for="q in sheet.activeGunQualities" :key="q">{{ q }}</span>
    </div>

    <div class="modifiers-summary" v-if="sheet.gunQualityAttackBonus !== 0 || sheet.gunQualityDamageBonus !== 0">
      <span v-if="sheet.gunQualityAttackBonus !== 0" class="mod-badge attack">
        Attack: {{ sheet.gunQualityAttackBonus >= 0 ? '+' : '' }}{{ sheet.gunQualityAttackBonus }}
      </span>
      <span v-if="sheet.gunQualityDamageBonus !== 0" class="mod-badge damage">
        Damage: {{ sheet.gunQualityDamageBonus >= 0 ? '+' : '' }}{{ sheet.gunQualityDamageBonus }}
      </span>
      <span v-if="sheet.gunCritRange !== 20" class="mod-badge crit">
        Crit: {{ sheet.gunCritRange }}-20
      </span>
    </div>

    <div v-for="(cat, catKey) in categories" :key="catKey" class="quality-category">
      <div class="category-label">{{ cat.label }}</div>
      <div class="quality-grid">
        <label
          v-for="key in cat.keys"
          :key="key"
          class="quality-item"
          :class="{ active: sheet.soul_gun.qualities[key] }"
          :title="sheet.gunQualityDefs[key]?.effect"
        >
          <input
            type="checkbox"
            v-model="sheet.soul_gun.qualities[key]"
          />
          <span class="quality-name">{{ sheet.gunQualityDefs[key]?.name }}</span>
          <span class="quality-effect">{{ sheet.gunQualityDefs[key]?.effect }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.gun-qualities-selector {
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

    &.attack {
      background: #2e7d32;
      color: white;
    }

    &.damage {
      background: #c62828;
      color: white;
    }

    &.crit {
      background: #f9a825;
      color: black;
    }
  }
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
