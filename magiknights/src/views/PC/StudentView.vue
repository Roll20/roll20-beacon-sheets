<script setup>

import { useSheetStore } from '@/stores/sheetStore';

import SplitMods from '@/components/SplitMods.vue';
import BackgroundItems from '@/components/BackgroundItems.vue';
import ImageBackedLabel from '@/components/ImageBackedLabel.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import SocialSection from '@/components/SocialSection.vue';
import NotchContainer from '@/components/NotchContainer.vue';
import MagiSquire from '@/components/MagiSquire.vue';

const sheet = useSheetStore();
const studentAttributes = [
  {
    name: 'student_armor',
    image: 'student-shield',
    text: 'Armor',
    readonly: false
  },
  {
    name: 'student_move',
    image: 'move',
    text: 'Move',
    readonly: false
  },
  {
    name: 'student_attack',
    image: 'attack',
    text: 'Attack',
    readonly: false,
    click: () => sheet.rollStudentAttack()
  },
  {
    name: 'student_damage',
    image: 'student-damage',
    text: 'Damage',
    readonly: false,
    click: () => sheet.rollStudentDamage()
  }
];

function studentAbilitySummary()
{
  if (sheet.student_ability.description.length > 100){
    return sheet.student_ability.description.substring(0, 100) + "...";
  }
  return sheet.student_ability.description;
}
</script>

<template>
  <div class="student-view">

    <SplitMods :attributes="studentAttributes" class="student-split">
      <template v-slot:content>
        <ImageBackedLabel image="studied">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.studiedCombat" class="rest-check">
          </template>
          <template v-slot:text>
            Studied [C]
          </template>
        </ImageBackedLabel>
        <ImageBackedLabel image="studied">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.studiedSchool" class="rest-check">
          </template>
          <template v-slot:text>
            Studied [S]
          </template>
        </ImageBackedLabel>
        <ImageBackedLabel image="apple">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.wellFed" class="rest-check">
          </template>
          <template v-slot:text>
            Well Fed
          </template>
        </ImageBackedLabel>
        <ImageBackedLabel image="apple">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.rested" class="rest-check">
          </template>
          <template v-slot:text>
            Rested
          </template>
        </ImageBackedLabel>
      </template>
    </SplitMods>
    <div v-if="sheet.detentionTickets > 0" class="detention-tickets-display">
      <span class="detention-label">Detention Tickets: {{ sheet.detentionTickets }}</span>
      <span class="detention-note">Each = 1 Free Time. Skipping = +1 Trauma/day</span>
    </div>
    <div class="detention-counter">
      <label>Detention Tickets</label>
      <input type="number" min="0" class="underline detention-input" v-model.number="sheet.detentionTickets">
    </div>
    <NotchContainer class="sleep-daily-container" notchType="none" width="thick">
      <h4>Sleep &amp; Daily Limits</h4>
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
    <NotchContainer class="student-ability" notchType="none" width="thick">
      <h4>Student Ability</h4>
      <Collapsible class="student-ability-content" :default="sheet.student_ability.collapsed" @collapse="sheet.student_ability.collapsed = !sheet.student_ability.collapsed">
        <template v-slot:collapsed>
        <div class="student-ability-button">
          <button disabled @click="sheet.studentAbilityToChat">{{ sheet.student_ability.name || 'Ability Name' }}</button>
        </div>
          <label class="student-ability-description-collapsed">{{ studentAbilitySummary() }}</label>
        </template>
        <template v-slot:expanded>
          <input class="underline" type="text" v-model="sheet.student_ability.name" placeholder="Ability Name">
          <textarea class="underline" v-model="sheet.student_ability.description" placeholder="Description"></textarea>
        </template>
      </Collapsible>
    </NotchContainer>
    <div>
      <notch-container class="student-type">
      <h4>Student Type</h4>
      <input class="underline student-type" type="text" v-model="sheet.student_type" placeholder="Enter Student Type">
    </notch-container>
    <NotchContainer class="fate-card" width="thick" notchType="wedge">
      <h4>Fate Card</h4>
      <select v-model="sheet.fate.card" class="fate-select underline">
        <option value="" selected>Select Card</option>
        <option v-for="card in ['king', 'queen', 'knight', 'dame', 'squire', 'damsel']" :key="card" :value="card">{{ card }}</option>
      </select>
      <select class="underline" v-model="sheet.fate.name">
        <option value="" selected>Select Person</option>
        <option v-for="person in sheet.sections['npc-social'].rows" :key="person.id || 'new-person'" :value="person.id || 'New Person'">{{ person.name || 'New Person' }}</option>
        <option v-for="person in sheet.sections['squadron-social'].rows" :key="person.id || 'new-squadmate'" :value="person.id || 'New Person'">{{ person.name || 'New Squadmate' }}</option>
        <!--  -->
      </select>
    </NotchContainer>
    </div>

    <div class="gear-section">
      <NotchContainer>
        <h4>gear</h4>
        <RepeatingSection name="gear">
          <RepeatingItem v-for="item in sheet.sections.gear.rows" :key="item._id" :row="item" name="gear"
            class="gear-item">
            <NotchContainer notchType="none">
            <Collapsible class="gear-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
              <template v-slot:collapsed>
                <span>{{ item.name }}</span>
              </template>
              <template v-slot:expanded>
                <input class="underline" type="text" v-model="item.name" placeholder=" Item name">
                <textarea class="underline" v-model="item.description" placeholder=" Item description"></textarea>
              </template>
            </Collapsible>
            </NotchContainer>
          </RepeatingItem>
        </RepeatingSection>
      </NotchContainer>
    </div>
  </div>
  <h4>NPC Bonds</h4>
    <NotchContainer class="notebook">
      <SocialSection name="npc" />
    </NotchContainer>
  <h4>Magi-Knight Bonds</h4>
    <NotchContainer class="notebook">
      <SocialSection name="squadron" />
    </NotchContainer>

  <!-- Herald Section - Per compendium: Herald bond affects spell tier access -->
  <NotchContainer class="herald-container" width="thick" notchType="curve">
    <h4>Herald Connection</h4>
    <div class="herald-content">
      <div class="flex-box half-gap grow-label">
        <label for="herald-name">Herald Name</label>
        <input class="underline" type="text" v-model="sheet.herald.name" id="herald-name" placeholder="Enter Herald's name">
      </div>
      <div class="flex-box half-gap grow-label">
        <label for="herald-bond-level">Bond Level</label>
        <select class="underline" v-model="sheet.herald.bondLevel" id="herald-bond-level">
          <option :value="1">I - Initial Bond</option>
          <option :value="2">II - Strengthened</option>
          <option :value="3">III - Deep Connection</option>
          <option :value="4">IV - Profound Bond</option>
          <option :value="5">V - Ultimate Bond</option>
        </select>
      </div>
      <div class="herald-tier-access">
        <span class="tier-label">Spell Tier Access:</span>
        <span class="tier-badges">
          <span class="tier-badge unlocked">I</span>
          <span class="tier-badge unlocked">II</span>
          <span class="tier-badge unlocked">III</span>
          <span class="tier-badge unlocked">IV</span>
          <span class="tier-badge unlocked">V</span>
          <span class="tier-badge" :class="{ 'unlocked': sheet.tierVIUnlocked, 'locked': !sheet.tierVIUnlocked }">
            VI
            <span v-if="!sheet.tierVIUnlocked" class="lock-icon" title="Requires Bond Level IV+">🔒</span>
          </span>
        </span>
      </div>
      <div class="grid">
        <label class="properties-header" for="herald-notes">Notes</label>
        <textarea class="underline" v-model="sheet.herald.notes" id="herald-notes" placeholder="Notes about your Herald..."></textarea>
      </div>
    </div>
  </NotchContainer>

  <!-- Magi-Squire Companion -->
  <MagiSquire />
</template>

<style lang="scss">
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
.student-view {
  display: grid;
  gap: var(--half-gap);
  grid-auto-flow: dense;

  >.base-split {
    grid-column: 1 / -1;
  }

  .npc-social-item{
    max-height: 20cap;
  }
  .student-split,
  .backgroundItems {
    grid-column: 1 / -1;
  }

  .gear-section{
    grid-column: 1 / -1;
  }

  .notebook {
    grid-column: 1;
    max-height: 4px;
  }

  .fate-card{
    margin-top: 0.7cap;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 40px;
    align-content: start;
    place-items: center;
    padding: var(--half-gap);
    align-self: start;
    gap: var(--half-gap);
    h4{
      grid-column: 1 / -1;
    }
    select{
      justify-self: stretch;
    }
    .fate-select{
      text-transform: capitalize;
    }
  }
  .student-type{
    text-align: center;
  }
  .student-ability-button{
   position: relative;
   left: -6px;
   top: -5px;
  }
  .student-ability{
    padding: var(--half-gap);
    display: grid;
  }
  .student-ability-content{
    vertical-align: top;
    gap: var(--half-gap);
    .student-description-display{
      white-space: pre-wrap;
    }
    padding: 10px;
    min-height: 99px;
    max-height: 99px;
  }
  .rest-check{
    height: 100%;
    width: 100%;
    cursor: pointer;
    border-radius: 100%;
    display: grid;
    place-items: center;
    font-size: 250%;
    &:checked{
      &:before{
        content:'check';
        font-family: 'Material Symbols Outlined';
      }
    }
  }
  .gear-section{
    grid-column: 1 / -1;
    .repcontainer {
      display: grid;
      grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
      grid-column: 1 / -1;
    }
    .gear-content{
      display: grid;
      gap: var(--tiny-gap);
      min-height: 1em;
    }
  }

  .notebook {
    display: grid;
    grid-template-columns: subgrid;
    align-items: start;
  }

  @container (500px < width) {
    grid-template-columns: 1fr 1fr;
  }

  .skill-container {
    grid-column: 1;
  }
}

// Herald Section Styles
.herald-container {
  .herald-content {
    display: grid;
    gap: var(--half-gap);
  }

  .herald-tier-access {
    display: flex;
    align-items: center;
    gap: var(--half-gap);
    flex-wrap: wrap;
    padding: var(--tiny-gap) 0;

    .tier-label {
      font-weight: bold;
      color: var(--header-blue);
      font-size: 0.85rem;
    }

    .tier-badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .tier-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      transition: all 0.2s ease;

      &.unlocked {
        background: var(--header-blue);
        color: white;
      }

      &.locked {
        background: #666;
        color: #aaa;
        position: relative;

        .lock-icon {
          font-size: 0.6rem;
          margin-left: 2px;
        }
      }
    }
  }

  h4 {
    color: var(--header-blue);
  }

  .grow-label {
    color: var(--header-blue);
  }

  .properties-header {
    color: var(--header-blue);
  }
}

html.dark {
  .herald-container {
    .tier-badge.locked {
      background: #444;
      color: #888;
    }
  }
}

.sleep-daily-container {
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
    color: rgba(255, 255, 255, 0.6);
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
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>