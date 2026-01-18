<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();

const categories = {
  mana: { label: 'Mana', keys: ['manaAttunement'] },
  attack: { label: 'Spell Attack', keys: ['spellFocus'] },
  dc: { label: 'Spell DC', keys: ['channeling'] },
  special: { label: 'Special', keys: ['quickCast', 'wardingFocus'] }
};
</script>

<template>
  <div class="implement-qualities-selector">
    <div class="qualities-summary" v-if="sheet.activeImplementQualities.length > 0">
      <span class="summary-label">Active:</span>
      <span class="quality-tag" v-for="q in sheet.activeImplementQualities" :key="q">{{ q }}</span>
    </div>

    <div class="modifiers-summary">
      <span v-if="sheet.hasManaAttunement" class="mod-badge mana">
        MP: MCO x 3
      </span>
      <span v-if="sheet.implementSpellAttackBonus !== 0" class="mod-badge attack">
        Spell Attack: +{{ sheet.implementSpellAttackBonus }}
      </span>
      <span v-if="sheet.implementSpellDCBonus !== 0" class="mod-badge dc">
        Spell DC: +{{ sheet.implementSpellDCBonus }}
      </span>
    </div>

    <div v-for="(cat, catKey) in categories" :key="catKey" class="quality-category">
      <div class="category-label">{{ cat.label }}</div>
      <div class="quality-grid">
        <label
          v-for="key in cat.keys"
          :key="key"
          class="quality-item"
          :class="{ active: sheet.magical_implement.qualities[key] }"
          :title="sheet.implementQualityDefs[key]?.effect"
        >
          <input
            type="checkbox"
            v-model="sheet.magical_implement.qualities[key]"
          />
          <span class="quality-name">{{ sheet.implementQualityDefs[key]?.name }}</span>
          <span class="quality-effect">{{ sheet.implementQualityDefs[key]?.effect }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.implement-qualities-selector {
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

    &.mana {
      background: #1565c0;
      color: white;
    }

    &.attack {
      background: #2e7d32;
      color: white;
    }

    &.dc {
      background: #6a1b9a;
      color: white;
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
