<script setup>
import { useSheetStore } from '@/stores';
import NotchContainer from '@/components/NotchContainer.vue';

const sheet = useSheetStore();
</script>

<template>
  <div class="settings-view">
    <h3>Sheet Mode</h3>
    <p class="settings-description">
      Switch between Player Character and NPC/Monster sheet modes.
    </p>
    <NotchContainer class="sheet-mode-section" notchType="wedge">
      <div class="mode-info">
        <span>Current Mode: <strong>Player Character</strong></span>
        <button class="mode-switch-btn" @click="sheet.sheet_mode = 'npc'">
          Switch to NPC Sheet
        </button>
      </div>
    </NotchContainer>

    <h3>Token Settings</h3>
    <p class="settings-description">
      Configure token images for automatic switching when transforming between Student and Magi-Knight forms.
      Paste the full URL of your uploaded Roll20 token images below.
    </p>
    <div class="token-images-grid">
      <NotchContainer class="token-image-field" notchType="wedge">
        <h4>Student Token Image</h4>
        <input
          class="underline"
          type="text"
          v-model="sheet.studentTokenImage"
          placeholder="Paste student form token image URL"
        >
      </NotchContainer>
      <NotchContainer class="token-image-field" notchType="wedge">
        <h4>Magi-Knight Token Image</h4>
        <input
          class="underline"
          type="text"
          v-model="sheet.knightTokenImage"
          placeholder="Paste magi-knight form token image URL"
        >
      </NotchContainer>
    </div>

    <h3>Tallies & Resources</h3>
    <div class="tallies-and-pools">
      <div class="tallies-section">
        <div class="tally-group">
          <label class="tally-label">Budget Tallies</label>
          <input type="number" class="tally-input" min="0" v-model.number="sheet.budgetTallies">
        </div>
        <div class="tally-group">
          <label class="tally-label">Training Tallies</label>
          <div class="tally-counter">
            <input type="number" class="tally-input" min="0" :max="sheet.trainingTalliesMax" v-model.number="sheet.trainingTallies">
            <span class="tally-max">/ {{ sheet.trainingTalliesMax }}</span>
          </div>
        </div>
        <div class="tally-group">
          <label class="tally-label">Club Tallies</label>
          <div class="tally-counter">
            <input type="number" class="tally-input" min="0" :max="sheet.clubTalliesMax" v-model.number="sheet.clubTallies">
            <span class="tally-max">/ {{ sheet.clubTalliesMax }}</span>
          </div>
        </div>
        <div class="tally-group">
          <label class="tally-label">Resounding Growths</label>
          <input type="number" class="tally-input" min="0" v-model.number="sheet.resoundingGrowths">
        </div>
      </div>
      <div class="club-position-section">
        <label class="tally-label">Club Position</label>
        <select class="underline" v-model="sheet.clubPosition">
          <option v-for="(data, key) in sheet.clubPositionData" :key="key" :value="key">{{ data.name }}</option>
        </select>
        <p v-if="sheet.clubPositionData[sheet.clubPosition]?.bonus" class="club-position-bonus">{{ sheet.clubPositionData[sheet.clubPosition].bonus }}</p>
      </div>
      <div v-if="sheet.statIncreasesAvailable > 0" class="stat-increases-section">
        <label class="tally-label">Stat Increases</label>
        <span class="stat-increases-count" :class="{ 'needs-attention': sheet.statIncreasesMissing > 0 }">
          {{ sheet.statIncreasesApplied }}/{{ sheet.statIncreasesAvailable }} applied
        </span>
        <span v-if="sheet.statIncreasesMissing > 0" class="stat-increases-reminder">
          {{ sheet.statIncreasesMissing }} increase(s) available at levels {{ sheet.statIncreaseLevels.filter(l => l <= sheet.level).join(', ') }}
        </span>
      </div>
      <div class="fortune-pool-section">
        <label class="fortune-pool-toggle">
          <input type="checkbox" v-model="sheet.fortunePoolEnabled">
          <span class="tally-label">Fortune Pool</span>
        </label>
        <template v-if="sheet.fortunePoolEnabled">
          <div class="fortune-pool-counter">
            <input type="number" class="tally-input" min="0" :max="sheet.fortunePoolMax" v-model.number="sheet.fortunePool">
            <span class="tally-max">/ {{ sheet.fortunePoolMax }} Fortune</span>
          </div>
          <p class="fortune-pool-desc">Spend 1: +1d6 to non-combat Skill Check</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.settings-view {
  display: grid;
  gap: var(--gap);
  padding: var(--half-gap);

  h3 {
    margin: 0;
    color: var(--header-blue, #4a4a8a);
  }

  .settings-description {
    font-size: 0.9em;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }

  .token-images-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap);
  }

  .token-image-field {
    padding: var(--half-gap);

    h4 {
      margin-bottom: var(--half-gap);
      text-align: center;
    }

    input {
      width: 100%;
      font-size: 0.85em;
    }
  }

  .sheet-mode-section {
    padding: var(--half-gap);
  }

  .mode-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--half-gap);
  }

  .mode-switch-btn {
    padding: 8px 16px;
    background: var(--header-blue, #4a4a8a);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      opacity: 0.9;
    }
  }

  .tallies-and-pools {
    display: grid;
    gap: var(--gap);
  }

  .tallies-section {
    display: flex;
    gap: var(--gap);
    align-items: center;
    padding: var(--half-gap) var(--gap);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    flex-wrap: wrap;

    .tally-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .tally-label {
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .tally-input {
      width: 4ch;
      text-align: center;
      padding: 2px 4px;
    }
    .tally-counter {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .tally-max {
      font-size: 0.85em;
      opacity: 0.7;
    }
  }

  .stat-increases-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--half-gap);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    .stat-increases-count {
      font-weight: bold;
      font-size: 0.9em;
      &.needs-attention { color: #e90; }
    }
    .stat-increases-reminder {
      font-size: 0.75em;
      font-style: italic;
      opacity: 0.8;
      text-align: center;
    }
  }

  .club-position-section {
    padding: var(--half-gap) var(--gap);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    select { width: 100%; margin-top: 4px; }
    .club-position-bonus {
      font-size: 0.8em;
      margin: 4px 0 0;
      opacity: 0.8;
      font-style: italic;
    }
  }

  .fortune-pool-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--half-gap) var(--gap);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    .fortune-pool-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
    .fortune-pool-counter {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fortune-pool-desc {
      font-size: 0.75em;
      opacity: 0.8;
      font-style: italic;
      margin: 0;
    }
  }
}
</style>
