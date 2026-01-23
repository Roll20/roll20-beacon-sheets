<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();

const attachmentTypes = ['scope', 'magazine', 'rail', 'muzzle'];

function addAttachment() {
  sheet.soul_gun.attachments.push({ name: '', type: 'scope', effect: '' });
}

function removeAttachment(index) {
  sheet.soul_gun.attachments.splice(index, 1);
}

const showStyle = computed(() => {
  return sheet.availableGunStyles.length > 0;
});

const canMagDump = computed(() => {
  return sheet.gunTypeStats.md > 0;
});
</script>

<template>
  <div class="gun-config-selector">
    <!-- Gun Type -->
    <div class="gun-field">
      <label class="field-label">Gun Type</label>
      <select class="input-field" v-model="sheet.soul_gun.gunType">
        <option v-for="(data, key) in sheet.gunTypeData" :key="key" :value="key">
          {{ data.name }} ({{ data.abbr }})
        </option>
      </select>
    </div>

    <!-- Gun Stats Display -->
    <div class="gun-stats">
      <span class="stat-item"><strong>E-Range:</strong> {{ sheet.gunTypeStats.eRange }} ft</span>
      <span class="stat-item"><strong>Damage:</strong> {{ sheet.gunTypeStats.damage }}</span>
      <span class="stat-item"><strong>RF:</strong> {{ sheet.gunTypeStats.rf }}d8</span>
      <span class="stat-item" v-if="canMagDump"><strong>MD:</strong> {{ sheet.effectiveMD }}d8</span>
      <span class="stat-item" v-else><strong>MD:</strong> —</span>
    </div>

    <!-- Special Ability -->
    <div class="gun-special" v-if="sheet.gunTypeStats.special">
      <span class="special-label">Special:</span> {{ sheet.gunTypeStats.special }}
    </div>

    <!-- Gun Style (HDG/SMG only) -->
    <div class="gun-field" v-if="showStyle">
      <label class="field-label">Gun Style</label>
      <select class="input-field" v-model="sheet.soul_gun.gunStyle">
        <option value="">None</option>
        <option v-for="style in sheet.availableGunStyles" :key="style.key" :value="style.key">
          {{ style.name }}
        </option>
      </select>
      <div class="style-effect" v-if="sheet.soul_gun.gunStyle && sheet.gunStyleData[sheet.soul_gun.gunStyle]">
        {{ sheet.gunStyleData[sheet.soul_gun.gunStyle].effect }}
      </div>
    </div>

    <!-- Combat State -->
    <div class="gun-state">
      <label class="state-toggle">
        <input type="checkbox" v-model="sheet.soul_gun.aimed" />
        <span>Aimed (+1 to one die)</span>
      </label>
      <label class="state-toggle">
        <input type="checkbox" v-model="sheet.soul_gun.hasReloaded" />
        <span>Reloaded</span>
      </label>
    </div>

    <!-- Attachments -->
    <div class="attachments-section">
      <div class="section-header">
        <span class="field-label">Attachments</span>
        <button class="add-btn" @click="addAttachment">+</button>
      </div>
      <div v-for="(att, idx) in sheet.soul_gun.attachments" :key="idx" class="attachment-row">
        <input class="input-field att-name" type="text" v-model="att.name" placeholder="Name" />
        <select class="input-field att-type" v-model="att.type">
          <option v-for="t in attachmentTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <input class="input-field att-effect" type="text" v-model="att.effect" placeholder="Effect" />
        <button class="remove-btn" @click="removeAttachment(idx)">×</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.gun-config-selector {
  display: grid;
  gap: var(--tiny-gap);
}

.gun-field {
  display: grid;
  gap: 2px;

  .field-label {
    font-size: 0.7rem;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--header-blue);
  }

  .style-effect {
    font-size: 0.7rem;
    color: #666;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 2px;
  }
}

.gun-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  padding: 4px 6px;
  background: rgba(74, 74, 138, 0.08);
  border-radius: 3px;

  .stat-item {
    white-space: nowrap;
  }
}

.gun-special {
  font-size: 0.7rem;
  color: #555;
  padding: 2px 4px;

  .special-label {
    font-weight: bold;
    color: var(--header-blue);
  }
}

.gun-state {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .state-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    cursor: pointer;

    input[type="checkbox"] {
      margin: 0;
      width: 14px;
      height: 14px;
    }
  }
}

.attachments-section {
  display: grid;
  gap: 4px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .field-label {
      font-size: 0.7rem;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--header-blue);
    }

    .add-btn {
      padding: 0 6px;
      font-size: 0.8rem;
      background: var(--header-blue);
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      line-height: 1.4;

      &:hover {
        opacity: 0.85;
      }
    }
  }

  .attachment-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    gap: 4px;
    align-items: center;

    .att-name, .att-effect {
      font-size: 0.75rem;
      padding: 2px 4px;
    }

    .att-type {
      font-size: 0.7rem;
      padding: 1px 2px;
      width: auto;
    }

    .remove-btn {
      padding: 0 4px;
      font-size: 0.9rem;
      background: none;
      border: none;
      color: #c62828;
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: #e53935;
      }
    }
  }
}

html.dark {
  .gun-special {
    color: #aaa;
  }

  .gun-field .style-effect {
    color: #aaa;
    background: rgba(255, 255, 255, 0.05);
  }

  .gun-stats {
    background: rgba(74, 74, 138, 0.2);
  }
}
</style>
