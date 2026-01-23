<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from '@/components/NotchContainer.vue';

const sheet = useSheetStore();
</script>

<template>
  <NotchContainer class="squire-container" width="thick" notchType="curve">
    <h4 @click="sheet.squire.collapsed = !sheet.squire.collapsed" class="squire-header">
      Magi-Squire
      <span class="collapse-indicator">{{ sheet.squire.collapsed ? '▶' : '▼' }}</span>
    </h4>

    <div v-if="!sheet.squire.collapsed" class="squire-content">
      <div class="squire-row">
        <label for="squire-name">Name</label>
        <input class="underline" type="text" v-model="sheet.squire.name" id="squire-name" placeholder="Squire's name">
      </div>

      <div class="squire-stats-row">
        <div class="squire-stat">
          <span class="stat-label">Damage</span>
          <span class="stat-value">{{ sheet.squireDamage }}</span>
        </div>
        <div class="squire-stat">
          <span class="stat-label">Student Armor</span>
          <span class="stat-value">{{ sheet.squire.studentArmor }}</span>
        </div>
        <div class="squire-stat">
          <span class="stat-label">Knight Armor</span>
          <span class="stat-value">{{ sheet.squire.knightArmor }} (+2 melee)</span>
        </div>
      </div>

      <div class="squire-blips-section">
        <div class="blip-group">
          <span class="blip-label">Health (6)</span>
          <div class="blip-row">
            <label v-for="(_, idx) in sheet.squire.healthBlips" :key="'hp-'+idx" class="blip-check">
              <input type="checkbox" v-model="sheet.squire.healthBlips[idx]" />
            </label>
          </div>
        </div>
        <div class="blip-group">
          <span class="blip-label">Mana (3)</span>
          <div class="blip-row">
            <label v-for="(_, idx) in sheet.squire.manaBlips" :key="'mp-'+idx" class="blip-check">
              <input type="checkbox" v-model="sheet.squire.manaBlips[idx]" />
            </label>
          </div>
        </div>
      </div>

      <div class="squire-spells">
        <span class="section-label">Spell Paths (max 2)</span>
        <div class="spell-path-row">
          <select v-model="sheet.squire.spellPath1">
            <option value="">-- Select Path --</option>
            <option v-for="path in sheet.squireSpellPaths" :key="path" :value="path">{{ path }}</option>
          </select>
          <select v-model="sheet.squire.spellPath2">
            <option value="">-- Select Path --</option>
            <option v-for="path in sheet.squireSpellPaths" :key="path" :value="path">{{ path }}</option>
          </select>
        </div>
      </div>

      <div class="squire-row">
        <label for="squire-skills">Skills (+2 assist on Squire Skills)</label>
        <textarea class="underline" v-model="sheet.squire.skills" id="squire-skills" placeholder="Squire's skills..." rows="2"></textarea>
      </div>

      <div class="squire-row">
        <label for="squire-notes">Notes</label>
        <textarea class="underline" v-model="sheet.squire.notes" id="squire-notes" placeholder="Notes about your Squire..." rows="2"></textarea>
      </div>
    </div>

    <div v-else class="squire-collapsed-summary">
      <span v-if="sheet.squire.name">{{ sheet.squire.name }}</span>
      <span v-else class="placeholder">No squire</span>
      <span v-if="sheet.squire.name" class="squire-dmg-badge">{{ sheet.squireDamage }}</span>
    </div>
  </NotchContainer>
</template>

<style lang="scss">
.squire-container {
  .squire-header {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    .collapse-indicator {
      font-size: 0.7em;
      opacity: 0.6;
    }
  }

  .squire-content {
    display: grid;
    gap: var(--half-gap);
    margin-top: var(--half-gap);
  }

  .squire-row {
    display: grid;
    gap: 2px;
    label {
      font-size: 0.8em;
      font-weight: bold;
      opacity: 0.8;
    }
  }

  .squire-stats-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .squire-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    .stat-label {
      font-size: 0.7em;
      opacity: 0.7;
      font-weight: bold;
    }
    .stat-value {
      font-size: 0.9em;
      font-weight: bold;
    }
  }

  .squire-blips-section {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .blip-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .blip-label {
    font-size: 0.75em;
    font-weight: bold;
    opacity: 0.8;
  }

  .blip-row {
    display: flex;
    gap: 4px;
  }

  .blip-check {
    cursor: pointer;
    input {
      width: 16px;
      height: 16px;
    }
  }

  .squire-spells {
    display: grid;
    gap: 4px;
    .section-label {
      font-size: 0.8em;
      font-weight: bold;
      opacity: 0.8;
    }
    .spell-path-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      select {
        flex: 1;
        min-width: 120px;
      }
    }
  }

  .squire-collapsed-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9em;
    padding: 2px 0;
    .placeholder {
      opacity: 0.5;
      font-style: italic;
    }
  }

  .squire-dmg-badge {
    font-size: 0.75em;
    background: rgba(100, 150, 200, 0.2);
    padding: 1px 6px;
    border-radius: 3px;
    font-weight: bold;
  }
}
</style>
