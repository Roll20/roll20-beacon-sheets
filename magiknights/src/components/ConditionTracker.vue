<script setup>
import { ref } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from './NotchContainer.vue';

const sheet = useSheetStore();
const isExpanded = ref(false);

const conditionCategories = {
  mental: {
    label: 'Mental',
    conditions: [
      { key: 'distressed', name: 'Distressed', effect: '-1 to checks, can\'t Take Careful actions' },
      { key: 'horrified', name: 'Horrified', effect: '+1 Stress, Disadvantage on checks, move 0' },
      { key: 'berserk', name: 'Berserk', effect: 'Advantage on STR attacks, can\'t use Formations' }
    ]
  },
  physical: {
    label: 'Physical',
    conditions: [
      { key: 'bleeding', name: 'Bleeding', effect: '-2 HP/round until Medicine DC 12' },
      { key: 'burning', name: 'Burning', effect: '-5 HP/round, DEX DC 12 to end' },
      { key: 'exposed', name: 'Exposed', effect: 'Only one Free Action, Prone' },
      { key: 'paralyzed', name: 'Paralyzed', effect: 'No Actions, auto-hit' },
      { key: 'prone', name: 'Prone', effect: 'Disadvantage on ranged, melee have adv vs you' },
      { key: 'restrained', name: 'Restrained', effect: 'Move 0, Disadvantage on attacks/DEX' }
    ]
  },
  depletion: {
    label: 'Depletion',
    conditions: [
      { key: 'depleted', name: 'Depleted', effect: '-1 spell DC/attack, no Bonus Actions' },
      { key: 'drained', name: 'Drained', effect: 'Can\'t regain HP/MP, Disadvantage on checks' },
      { key: 'silenced', name: 'Silenced', effect: 'Can\'t speak or cast verbal spells' },
      { key: 'soulSiphoned1', name: 'Soul-Siphoned I', effect: 'Minor soul drain effects' },
      { key: 'soulSiphoned2', name: 'Soul-Siphoned II', effect: 'Moderate soul drain effects' },
      { key: 'soulSiphoned3', name: 'Soul-Siphoned III', effect: 'Severe soul drain effects' },
      { key: 'soulTainted', name: 'Soul-Tainted', effect: 'Disadvantage on all rolls' }
    ]
  },
  other: {
    label: 'Other',
    conditions: [
      { key: 'blinded', name: 'Blinded', effect: 'Auto-fail sight checks, Disadvantage on attacks' },
      { key: 'charmed', name: 'Charmed', effect: 'Can\'t attack charmer, charmer has social advantage' },
      { key: 'frightened', name: 'Frightened', effect: 'Disadvantage while source visible, can\'t move closer' },
      { key: 'incapacitated', name: 'Incapacitated', effect: 'No actions or reactions' },
      { key: 'invisible', name: 'Invisible', effect: 'Advantage on attacks, attacks vs you have disadvantage' },
      { key: 'poisoned', name: 'Poisoned', effect: 'Disadvantage on attacks and ability checks' },
      { key: 'stunned', name: 'Stunned', effect: 'Incapacitated, can\'t move, auto-fail STR/DEX saves' }
    ]
  }
};

const toggleCondition = (key) => {
  sheet.conditions[key] = !sheet.conditions[key];
};

const clearAllConditions = () => {
  Object.keys(sheet.conditions).forEach(key => {
    sheet.conditions[key] = false;
  });
};
</script>

<template>
  <NotchContainer width="thick" :notch="20" class="condition-container">
    <div class="condition-header" @click="isExpanded = !isExpanded">
      <h3>
        <span class="material-symbols-outlined expand-icon">{{ isExpanded ? 'expand_less' : 'expand_more' }}</span>
        conditions
      </h3>
      <div class="active-count" v-if="sheet.activeConditions.length > 0">
        {{ sheet.activeConditions.length }}
      </div>
    </div>

    <!-- Active conditions summary (always visible when collapsed) -->
    <div class="active-conditions" v-if="sheet.activeConditions.length > 0 && !isExpanded">
      <span
        v-for="condKey in sheet.activeConditions"
        :key="condKey"
        class="active-tag"
        @click.stop="toggleCondition(condKey)"
        :title="'Click to remove'"
      >
        {{ condKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/(\d)/g, ' $1') }}
        <span class="remove-x">×</span>
      </span>
    </div>

    <!-- Full condition panel -->
    <div v-if="isExpanded" class="condition-panel">
      <button class="clear-all-btn" @click.stop="clearAllConditions" v-if="sheet.activeConditions.length > 0">
        Clear All
      </button>

      <div
        v-for="(category, catKey) in conditionCategories"
        :key="catKey"
        class="condition-category"
      >
        <div class="category-label">{{ category.label }}</div>
        <div class="condition-grid">
          <label
            v-for="cond in category.conditions"
            :key="cond.key"
            class="condition-item"
            :class="{ active: sheet.conditions[cond.key] }"
            :title="cond.effect"
          >
            <input
              type="checkbox"
              :checked="sheet.conditions[cond.key]"
              @change="toggleCondition(cond.key)"
            />
            <span class="condition-name">{{ cond.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </NotchContainer>
</template>

<style lang="scss">
.condition-container {
  display: grid;
  gap: var(--tiny-gap);
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  h3 {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
  }

  .expand-icon {
    font-size: 18px;
  }

  &:hover {
    opacity: 0.8;
  }
}

.active-count {
  font-size: 0.75rem;
  background: var(--error-red);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.active-conditions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  padding: 2px 6px;
  background: #c62828;
  color: white;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: #b71c1c;
  }

  .remove-x {
    font-weight: bold;
  }
}

.condition-panel {
  display: grid;
  gap: var(--tiny-gap);
}

.clear-all-btn {
  width: 100%;
  padding: 6px;
  background: var(--borderColor);
  color: var(--masterBack);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;

  &:hover {
    opacity: 0.9;
  }
}

.condition-category {
  display: grid;
  gap: 4px;
}

.category-label {
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--header-blue);
  padding-bottom: 2px;
  border-bottom: 1px solid var(--borderColor);
}

.condition-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  border: 1px solid transparent;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background: rgba(198, 40, 40, 0.15);
    border-color: #c62828;

    .condition-name {
      color: #c62828;
      font-weight: bold;
    }
  }

  input[type="checkbox"] {
    margin: 0;
    width: 14px;
    height: 14px;
  }
}

.condition-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html.dark {
  .condition-item {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(198, 40, 40, 0.3);
    }
  }
}
</style>
