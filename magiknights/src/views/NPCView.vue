<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import { useMetaStore } from '@/stores/metaStore';
import NotchContainer from '@/components/NotchContainer.vue';

const sheet = useSheetStore();
const meta = useMetaStore();

const isHorde = computed(() => sheet.npc_type === 'horde');

const npcTypeOptions = [
  { value: 'horde', label: 'Horde' },
  { value: 'vassal', label: 'Vassal' },
  { value: 'adversary', label: 'Adversary' },
  { value: 'nemesis', label: 'Nemesis' },
  { value: 'harbinger', label: 'Harbinger' }
];

const sizeOptions = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

const creatureTypes = ['Outsider', 'Mortal', 'Construct', 'Undead', 'Beast', 'Aberration'];

const damageTypes = [
  { value: 'physical', label: 'Physical' },
  { value: 'magical', label: 'Magical' },
  { value: 'true', label: 'True Damage' }
];

const toggleUnitDefeated = (index) => {
  sheet.npc_horde_hp[index].defeated = !sheet.npc_horde_hp[index].defeated;
};
</script>

<template>
  <div class="npc-view">
    <!-- Header Section -->
    <NotchContainer width="thick" :notch="20" class="npc-header">
      <div class="header-row">
        <input
          type="text"
          class="npc-name-input"
          v-model="sheet.npc_name"
          placeholder="NPC Name"
        />
        <button class="mode-toggle" @click="sheet.sheet_mode = 'pc'">
          Switch to PC
        </button>
      </div>
      <div class="type-row">
        <select v-model="sheet.npc_type">
          <option v-for="opt in npcTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="separator">|</span>
        <select v-model="sheet.npc_size">
          <option v-for="size in sizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <select v-model="sheet.npc_creature_type">
          <option v-for="ct in creatureTypes" :key="ct" :value="ct">{{ ct }}</option>
        </select>
      </div>
      <label class="whisper-toggle">
        <input type="checkbox" v-model="sheet.npc_whisper_rolls" />
        <span>Whisper rolls to GM only</span>
      </label>
    </NotchContainer>

    <!-- Stats Section -->
    <div class="stats-grid">
      <NotchContainer width="thick" :notch="15" class="stat-box">
        <h3>armor</h3>
        <input type="number" v-model="sheet.npc_armor" />
      </NotchContainer>
      <NotchContainer width="thick" :notch="15" class="stat-box">
        <h3>move</h3>
        <div class="move-display">
          <input type="number" v-model="sheet.npc_move" />
          <span>ft</span>
        </div>
      </NotchContainer>
      <NotchContainer width="thick" :notch="15" class="stat-box clickable" @click="sheet.rollNPCCheck('physical')">
        <h3>physical</h3>
        <div class="check-display">
          <span class="sign">{{ sheet.npc_physical_check >= 0 ? '+' : '' }}</span>
          <input type="number" v-model="sheet.npc_physical_check" @click.stop />
        </div>
      </NotchContainer>
      <NotchContainer width="thick" :notch="15" class="stat-box clickable" @click="sheet.rollNPCCheck('magical')">
        <h3>magical</h3>
        <div class="check-display">
          <span class="sign">{{ sheet.npc_magical_check >= 0 ? '+' : '' }}</span>
          <input type="number" v-model="sheet.npc_magical_check" @click.stop />
        </div>
      </NotchContainer>
    </div>

    <!-- HP Section -->
    <NotchContainer width="thick" :notch="20" class="hp-section">
      <h3>hit points</h3>

      <!-- Horde HP (4 separate pools) -->
      <div v-if="isHorde" class="horde-hp-grid">
        <div
          v-for="(unit, index) in sheet.npc_horde_hp"
          :key="index"
          class="horde-unit"
          :class="{ defeated: unit.defeated || unit.current <= 0 }"
        >
          <div class="unit-label">Unit {{ index + 1 }}</div>
          <div class="unit-hp">
            <input type="number" v-model="unit.current" :disabled="unit.defeated" />
            <span>/</span>
            <input type="number" v-model="unit.max" />
          </div>
          <button class="defeat-btn" @click="toggleUnitDefeated(index)">
            {{ unit.defeated ? 'Revive' : 'Defeat' }}
          </button>
        </div>
      </div>

      <!-- Single HP Pool (non-horde) -->
      <div v-else class="single-hp">
        <input type="number" v-model="sheet.npc_hp.current" class="hp-current" />
        <span class="hp-separator">/</span>
        <input type="number" v-model="sheet.npc_hp.max" class="hp-max" />
      </div>

      <div v-if="isHorde" class="active-units">
        Active Units: {{ sheet.npc_active_units }} / 4
      </div>
    </NotchContainer>

    <!-- Attacks Section -->
    <div class="attacks-grid">
      <!-- Primary Attack -->
      <NotchContainer width="thick" :notch="20" class="attack-section">
        <h3>primary attack</h3>
        <div class="attack-row">
          <input type="text" v-model="sheet.npc_primary_attack.name" placeholder="Attack Name" class="attack-name" />
        </div>
        <div class="attack-stats">
          <div class="attack-stat" v-if="!isHorde">
            <label>Attack</label>
            <input type="number" v-model="sheet.npc_primary_attack.attackBonus" />
          </div>
          <div class="attack-stat" v-if="isHorde">
            <label>DC (4/3/2/1)</label>
            <div class="dc-inputs">
              <input type="number" v-model="sheet.npc_primary_attack.attackDC[0]" />
              <input type="number" v-model="sheet.npc_primary_attack.attackDC[1]" />
              <input type="number" v-model="sheet.npc_primary_attack.attackDC[2]" />
              <input type="number" v-model="sheet.npc_primary_attack.attackDC[3]" />
            </div>
          </div>
          <div class="attack-stat">
            <label>Range</label>
            <input type="text" v-model="sheet.npc_primary_attack.range" />
          </div>
          <div class="attack-stat" v-if="!isHorde">
            <label>Damage</label>
            <input type="text" v-model="sheet.npc_primary_attack.damage" />
          </div>
          <div class="attack-stat" v-if="isHorde">
            <label>Dmg (4/3/2/1)</label>
            <div class="dc-inputs">
              <input type="text" v-model="sheet.npc_primary_attack.hordeDamage[0]" />
              <input type="text" v-model="sheet.npc_primary_attack.hordeDamage[1]" />
              <input type="text" v-model="sheet.npc_primary_attack.hordeDamage[2]" />
              <input type="text" v-model="sheet.npc_primary_attack.hordeDamage[3]" />
            </div>
          </div>
          <div class="attack-stat">
            <label>Type</label>
            <select v-model="sheet.npc_primary_attack.damageType">
              <option v-for="dt in damageTypes" :key="dt.value" :value="dt.value">{{ dt.label }}</option>
            </select>
          </div>
        </div>
        <textarea v-model="sheet.npc_primary_attack.special" placeholder="Special abilities..." class="attack-special"></textarea>
        <div class="attack-buttons">
          <button class="roll-btn" @click="sheet.rollNPCAttack('primary')">
            {{ isHorde ? 'Show DC' : 'Attack' }}
          </button>
          <button class="roll-btn damage" @click="sheet.rollNPCDamage('primary')">Damage</button>
        </div>
      </NotchContainer>

      <!-- Secondary Attack -->
      <NotchContainer width="thick" :notch="20" class="attack-section">
        <h3>secondary attack</h3>
        <div class="attack-row">
          <input type="text" v-model="sheet.npc_secondary_attack.name" placeholder="Attack Name" class="attack-name" />
        </div>
        <div class="attack-stats">
          <div class="attack-stat" v-if="!isHorde">
            <label>Attack</label>
            <input type="number" v-model="sheet.npc_secondary_attack.attackBonus" />
          </div>
          <div class="attack-stat" v-if="isHorde">
            <label>DC (4/3/2/1)</label>
            <div class="dc-inputs">
              <input type="number" v-model="sheet.npc_secondary_attack.attackDC[0]" />
              <input type="number" v-model="sheet.npc_secondary_attack.attackDC[1]" />
              <input type="number" v-model="sheet.npc_secondary_attack.attackDC[2]" />
              <input type="number" v-model="sheet.npc_secondary_attack.attackDC[3]" />
            </div>
          </div>
          <div class="attack-stat">
            <label>Range</label>
            <input type="text" v-model="sheet.npc_secondary_attack.range" />
          </div>
          <div class="attack-stat" v-if="!isHorde">
            <label>Damage</label>
            <input type="text" v-model="sheet.npc_secondary_attack.damage" />
          </div>
          <div class="attack-stat" v-if="isHorde">
            <label>Dmg (4/3/2/1)</label>
            <div class="dc-inputs">
              <input type="text" v-model="sheet.npc_secondary_attack.hordeDamage[0]" />
              <input type="text" v-model="sheet.npc_secondary_attack.hordeDamage[1]" />
              <input type="text" v-model="sheet.npc_secondary_attack.hordeDamage[2]" />
              <input type="text" v-model="sheet.npc_secondary_attack.hordeDamage[3]" />
            </div>
          </div>
          <div class="attack-stat">
            <label>Type</label>
            <select v-model="sheet.npc_secondary_attack.damageType">
              <option v-for="dt in damageTypes" :key="dt.value" :value="dt.value">{{ dt.label }}</option>
            </select>
          </div>
        </div>
        <textarea v-model="sheet.npc_secondary_attack.special" placeholder="Special abilities..." class="attack-special"></textarea>
        <div class="attack-buttons">
          <button class="roll-btn" @click="sheet.rollNPCAttack('secondary')">
            {{ isHorde ? 'Show DC' : 'Attack' }}
          </button>
          <button class="roll-btn damage" @click="sheet.rollNPCDamage('secondary')">Damage</button>
        </div>
      </NotchContainer>
    </div>

    <!-- Additional Stats -->
    <div class="extra-stats-grid">
      <NotchContainer width="thick" :notch="15" class="extra-stat">
        <h3>invasion level</h3>
        <input type="number" v-model="sheet.npc_invasion_level" />
      </NotchContainer>
      <NotchContainer width="thick" :notch="15" class="extra-stat">
        <h3>horrific rating</h3>
        <input type="text" v-model="sheet.npc_horrific_rating" placeholder="—" />
      </NotchContainer>
      <NotchContainer width="thick" :notch="15" class="extra-stat clickable" @click="sheet.rollNPCGloomGems()">
        <h3>gloom gems</h3>
        <input type="text" v-model="sheet.npc_inert_spectral_energy" placeholder="1d4" @click.stop />
      </NotchContainer>
    </div>

    <!-- Traits Section -->
    <NotchContainer width="thick" :notch="20" class="traits-section">
      <div class="traits-header">
        <h3>traits & abilities</h3>
        <button class="add-btn" @click="sheet.addNPCTrait()">+ Add Trait</button>
      </div>
      <div class="traits-list">
        <div v-for="trait in sheet.npc_traits" :key="trait._id" class="trait-item">
          <div class="trait-header-row">
            <input type="text" v-model="trait.name" placeholder="Trait Name" class="trait-name" />
            <button class="remove-btn" @click="sheet.removeNPCTrait(trait._id)">×</button>
          </div>
          <textarea v-model="trait.description" placeholder="Trait description..." class="trait-desc"></textarea>
        </div>
        <div v-if="sheet.npc_traits.length === 0" class="no-traits">
          No traits added yet. Click "+ Add Trait" to add one.
        </div>
      </div>
    </NotchContainer>

    <!-- Notes Section -->
    <NotchContainer width="thick" :notch="20" class="notes-section">
      <h3>notes</h3>
      <textarea v-model="sheet.npc_notes" placeholder="Additional notes, tactics, behavior..." class="notes-textarea"></textarea>
    </NotchContainer>
  </div>
</template>

<style lang="scss">
.npc-view {
  display: grid;
  gap: var(--half-gap);
}

.npc-header {
  display: grid;
  gap: var(--tiny-gap);

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--half-gap);
  }

  .npc-name-input {
    flex: 1;
    font-size: 1.5rem;
    font-weight: bold;
    border: none;
    border-bottom: 2px solid var(--borderColor);
    background: transparent;
    padding: 4px 0;
  }

  .mode-toggle {
    padding: 6px 12px;
    background: var(--borderColor);
    color: var(--masterBack);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;

    &:hover {
      opacity: 0.9;
    }
  }

  .type-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;

    select {
      padding: 4px 8px;
      border: 1px solid var(--borderColor);
      border-radius: 4px;
      background: var(--masterBack);
    }

    .separator {
      color: var(--borderColor);
    }
  }

  .whisper-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    cursor: pointer;

    input {
      width: 16px;
      height: 16px;
    }

    &:has(input:checked) span {
      color: var(--header-blue);
      font-weight: bold;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--half-gap);
}

.stat-box {
  display: grid;
  gap: var(--tiny-gap);
  text-align: center;

  &.clickable {
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  h3 {
    margin: 0;
  }

  input {
    width: 60px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    padding: 4px;
    margin: 0 auto;
  }

  .move-display, .check-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  .sign {
    font-size: 1.2rem;
    font-weight: bold;
  }
}

.hp-section {
  display: grid;
  gap: var(--half-gap);

  h3 {
    text-align: center;
    margin: 0;
  }
}

.horde-hp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--half-gap);
}

.horde-unit {
  display: grid;
  gap: 4px;
  text-align: center;
  padding: 8px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;

  &.defeated {
    opacity: 0.5;
    background: rgba(0, 0, 0, 0.1);
  }

  .unit-label {
    font-weight: bold;
    font-size: 0.8rem;
  }

  .unit-hp {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;

    input {
      width: 40px;
      text-align: center;
      border: 1px solid var(--borderColor);
      border-radius: 4px;
      padding: 4px;
    }
  }

  .defeat-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
    background: #c62828;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #b71c1c;
    }
  }
}

.single-hp {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  input {
    width: 80px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    padding: 8px;
  }

  .hp-separator {
    font-size: 1.5rem;
    font-weight: bold;
  }
}

.active-units {
  text-align: center;
  font-weight: bold;
  color: var(--header-blue);
}

.attacks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--half-gap);
}

.attack-section {
  display: grid;
  gap: var(--tiny-gap);

  h3 {
    margin: 0;
    text-align: center;
  }

  .attack-name {
    width: 100%;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
  }

  .attack-stats {
    display: grid;
    gap: 8px;
  }

  .attack-stat {
    display: grid;
    gap: 4px;

    label {
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--header-blue);
    }

    input, select {
      padding: 4px 8px;
      border: 1px solid var(--borderColor);
      border-radius: 4px;
    }

    input[type="number"] {
      width: 60px;
    }
  }

  .dc-inputs {
    display: flex;
    gap: 4px;

    input {
      width: 40px;
      text-align: center;
    }
  }

  .attack-special {
    width: 100%;
    min-height: 60px;
    padding: 8px;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    resize: vertical;
    font-size: 0.85rem;
  }

  .attack-buttons {
    display: flex;
    gap: 8px;
  }

  .roll-btn {
    flex: 1;
    padding: 8px;
    background: var(--header-blue);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      opacity: 0.9;
    }

    &.damage {
      background: #c62828;
    }
  }
}

.extra-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--half-gap);
}

.extra-stat {
  display: grid;
  gap: var(--tiny-gap);
  text-align: center;

  &.clickable {
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  h3 {
    margin: 0;
  }

  input {
    width: 80px;
    text-align: center;
    padding: 4px 8px;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    margin: 0 auto;
  }
}

.traits-section {
  display: grid;
  gap: var(--half-gap);

  .traits-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }

    .add-btn {
      padding: 4px 12px;
      background: var(--header-blue);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .traits-list {
    display: grid;
    gap: var(--half-gap);
  }

  .trait-item {
    display: grid;
    gap: 4px;
    padding: 8px;
    border: 1px solid var(--borderColor);
    border-radius: 4px;

    .trait-header-row {
      display: flex;
      gap: 8px;
    }

    .trait-name {
      flex: 1;
      font-weight: bold;
      padding: 4px 8px;
      border: 1px solid var(--borderColor);
      border-radius: 4px;
    }

    .remove-btn {
      width: 28px;
      height: 28px;
      background: #c62828;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;

      &:hover {
        background: #b71c1c;
      }
    }

    .trait-desc {
      width: 100%;
      min-height: 60px;
      padding: 8px;
      border: 1px solid var(--borderColor);
      border-radius: 4px;
      resize: vertical;
      font-size: 0.85rem;
    }
  }

  .no-traits {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
  }
}

.notes-section {
  display: grid;
  gap: var(--tiny-gap);

  h3 {
    margin: 0;
  }

  .notes-textarea {
    width: 100%;
    min-height: 100px;
    padding: 8px;
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    resize: vertical;
  }
}
</style>
