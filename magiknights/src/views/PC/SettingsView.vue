<script setup>
import { useSheetStore, useAppStore, useMetaStore } from '@/stores';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';

const sheet = useSheetStore();
const appStore = useAppStore();
const meta = useMetaStore();

const exportSheetData = () => {
  const data = appStore.dehydrateStore();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const characterName = meta.name || 'character';
  const safeName = characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `${safeName}-export.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importSheetData = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.attributes?.sheet) {
      throw new Error('Invalid file format: missing sheet data');
    }

    const { name, bio, gmNotes, avatar, attributes } = data;
    appStore.hydrateStore(attributes, { name, bio, gmNotes, avatar });

    alert('Character data imported successfully!');
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }

  event.target.value = ''; // Reset for re-import
};
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

    <h3>Tallies & Resources</h3>
    <NotchContainer class="tallies-and-pools" notchType="wedge">
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
    </NotchContainer>

    <h3>Detention Tickets</h3>
    <NotchContainer class="detention-section" notchType="wedge">
      <div v-if="sheet.detentionTickets > 0" class="detention-tickets-display">
        <span class="detention-label">Detention Tickets: {{ sheet.detentionTickets }}</span>
        <span class="detention-note">Each = 1 Free Time. Skipping = +1 Trauma/day</span>
      </div>
      <div class="detention-counter">
        <label>Detention Tickets</label>
        <input type="number" min="0" class="underline detention-input" v-model.number="sheet.detentionTickets">
      </div>
    </NotchContainer>

    <h3>Sleep &amp; Daily Limits</h3>
    <NotchContainer class="sleep-daily-container" notchType="wedge">
      <div class="sleep-effect-section">
        <label class="properties-header">Sleep Effect</label>
        <div class="sleep-effect-options">
          <label v-for="(data, key) in sheet.sleepEffectData" :key="key" class="sleep-option" :class="{ active: sheet.sleepEffect === key }">
            <input type="radio" :value="key" v-model="sheet.sleepEffect" />
            <span class="sleep-option-name">{{ data.name }}</span>
            <span class="sleep-option-detail">
              <template v-if="data.stressRecovery > 0">-{{ data.stressRecovery }} Stress, -{{ data.exhaustionRecovery }} Exhaustion</template>
              <template v-if="data.note">{{ data.note }}</template>
            </span>
          </label>
        </div>
      </div>
      <div class="daily-limits-section">
        <label class="properties-header">Daily Limits</label>
        <div class="daily-limits-grid">
          <label class="daily-limit-item">
            <input type="checkbox" v-model="sheet.sealImplantGiven" />
            <span>Seal Implant Given</span>
          </label>
          <label class="daily-limit-item">
            <input type="checkbox" v-model="sheet.sealImplantReceived" />
            <span>Seal Implant Received</span>
          </label>
          <label class="daily-limit-item">
            <input type="checkbox" v-model="sheet.manaConduitUsed" />
            <span>Mana Conduit Used</span>
          </label>
        </div>
        <div class="soul-sacrifice-tracker">
          <label>Soul Sacrifice</label>
          <div class="soul-sacrifice-display">
            <input type="number" min="0" :max="sheet.soulSacrificeMax" v-model.number="sheet.soulSacrificeCount" class="underline soul-sacrifice-input" />
            <span class="soul-sacrifice-max">/ {{ sheet.soulSacrificeMax }} (career)</span>
          </div>
        </div>
      </div>
    </NotchContainer>

    <h3>Elemental Summon</h3>
    <NotchContainer class="summon-container" notchType="wedge">
      <div class="summon-header-row">
        <h4>Elemental Summon</h4>
        <label class="summon-active-toggle">
          <input type="checkbox" v-model="sheet.elementalSummon.active" />
          <span>Active</span>
        </label>
      </div>
      <Collapsible class="basic-item" :default="sheet.elementalSummon.collapsed" @collapse="sheet.elementalSummon.collapsed = !sheet.elementalSummon.collapsed">
        <template v-slot:expanded>
          <div class="flex-box half-gap grow-label">
            <label for="summon-name">Name</label>
            <input class="underline" type="text" v-model="sheet.elementalSummon.name" id="summon-name">
          </div>
          <div class="summon-stats-grid">
            <label>HP</label>
            <input type="number" class="underline" v-model.number="sheet.elementalSummon.hp">
            <span>/</span>
            <input type="number" class="underline" v-model.number="sheet.elementalSummon.hpMax">
            <label>Armor</label>
            <input type="number" class="underline" v-model.number="sheet.elementalSummon.armor">
            <label>Attack</label>
            <input type="number" class="underline" v-model.number="sheet.elementalSummon.attack">
            <label>Damage</label>
            <input type="text" class="underline" v-model="sheet.elementalSummon.damage">
            <label>Move</label>
            <input type="number" class="underline" v-model.number="sheet.elementalSummon.move">
          </div>
          <div class="grid">
            <label class="properties-header" for="summon-description">Notes</label>
            <textarea class="underline" id="summon-description" v-model="sheet.elementalSummon.description"></textarea>
          </div>
        </template>
        <template v-slot:collapsed>
          <span>{{ sheet.elementalSummon.name || 'No Summon' }}
            <span v-if="sheet.elementalSummon.active" class="summon-active-badge">Active</span>
          </span>
        </template>
      </Collapsible>
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

    <h3>Data Management</h3>
    <NotchContainer class="data-management-section" notchType="wedge">
      <div class="data-management-grid">
        <div class="data-action">
          <h4>Export Character</h4>
          <p>Download all character data as JSON.</p>
          <button class="mode-switch-btn" @click="exportSheetData">Export JSON</button>
        </div>
        <div class="data-action">
          <h4>Import Character</h4>
          <p>Replace character data from a JSON file.</p>
          <label class="mode-switch-btn import-btn">
            Import JSON
            <input type="file" accept=".json" @change="importSheetData" hidden>
          </label>
        </div>
      </div>
    </NotchContainer>
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
    padding: var(--half-gap);
  }

  .tallies-section {
    display: flex;
    gap: var(--gap);
    align-items: center;
    padding: var(--half-gap) var(--gap);
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
    select { width: 100%; margin-top: 4px; }
    .club-position-bonus {
      font-size: 0.8em;
      margin: 4px 0 0;
      opacity: 0.8;
      font-style: italic;
    }
  }

  .detention-section {
    display: grid;
    gap: var(--half-gap);
    padding: var(--half-gap);
  }

  .detention-counter {
    display: flex;
    align-items: center;
    gap: var(--half-gap);
    padding: 4px var(--half-gap);
    font-size: 0.85em;
    .detention-input { width: 4ch; text-align: center; }
  }

  .detention-tickets-display {
    display: flex;
    flex-direction: column;
    padding: 4px var(--half-gap);
    background: rgba(200, 80, 80, 0.1);
    border-radius: 4px;
    .detention-label { font-weight: bold; font-size: 0.85em; }
    .detention-note { font-size: 0.75em; opacity: 0.7; font-style: italic; }
  }

  .sleep-daily-container {
    padding: var(--half-gap);

    .sleep-effect-section {
      margin-bottom: 8px;
    }

    .sleep-effect-options {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sleep-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 0.85em;
      cursor: pointer;

      &.active {
        background: rgba(100, 150, 255, 0.15);
      }

      input[type="radio"] {
        margin: 0;
      }
    }

    .sleep-option-name {
      font-weight: 600;
      white-space: nowrap;
    }

    .sleep-option-detail {
      opacity: 0.7;
      font-size: 0.85em;
    }

    .daily-limits-section {
      margin-top: 8px;
    }

    .daily-limits-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .daily-limit-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85em;
      cursor: pointer;

      input[type="checkbox"] {
        margin: 0;
      }
    }

    .soul-sacrifice-tracker {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85em;

      label {
        font-weight: 600;
      }
    }

    .soul-sacrifice-display {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .soul-sacrifice-input {
      width: 36px;
      text-align: center;
    }

    .soul-sacrifice-max {
      opacity: 0.7;
    }
  }

  .summon-container {
    padding: var(--half-gap);

    .summon-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 { margin: 0; }
    }
    .summon-active-toggle {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.85em;
      cursor: pointer;
      input[type="checkbox"] { margin: 0; }
    }
    .summon-stats-grid {
      display: grid;
      grid-template-columns: auto 1fr auto 1fr;
      gap: 4px var(--half-gap);
      align-items: center;
      font-size: 0.9em;
      label { font-weight: 600; }
      input { max-width: 60px; }
    }
    .summon-active-badge {
      font-size: 0.75em;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(100, 200, 100, 0.3);
    }
  }

  .fortune-pool-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--half-gap) var(--gap);
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

  .data-management-section {
    padding: var(--half-gap);
  }

  .data-management-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap);
  }

  .data-action {
    display: flex;
    flex-direction: column;
    gap: var(--half-gap);

    h4 {
      margin: 0;
    }

    p {
      margin: 0;
      font-size: 0.85em;
      color: #666;
    }
  }

  .import-btn {
    display: inline-block;
    text-align: center;
    cursor: pointer;
  }
}
</style>
