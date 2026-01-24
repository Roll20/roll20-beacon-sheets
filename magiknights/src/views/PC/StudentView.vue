<script setup>

import { useSheetStore } from '@/stores/sheetStore';
import { computed } from 'vue';

import SplitMods from '@/components/SplitMods.vue';
import BackgroundItems from '@/components/BackgroundItems.vue';
import ImageBackedLabel from '@/components/ImageBackedLabel.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import SocialSection from '@/components/SocialSection.vue';
import NotchContainer from '@/components/NotchContainer.vue';


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

// Studied toggle: cycles empty → X (Combat) → O (School) → XO (Both) → empty
const studiedDisplay = computed(() => {
  if (sheet.studiedCombat && sheet.studiedSchool) return 'XO';
  if (sheet.studiedCombat) return 'X';
  if (sheet.studiedSchool) return 'O';
  return '';
});

function cycleStudied() {
  if (!sheet.studiedCombat && !sheet.studiedSchool) {
    sheet.studiedCombat = true;
  } else if (sheet.studiedCombat && !sheet.studiedSchool) {
    sheet.studiedCombat = false;
    sheet.studiedSchool = true;
  } else if (!sheet.studiedCombat && sheet.studiedSchool) {
    sheet.studiedCombat = true;
  } else {
    sheet.studiedCombat = false;
    sheet.studiedSchool = false;
  }
}

const studiedTooltip = computed(() => {
  if (sheet.studiedCombat && sheet.studiedSchool) {
    return 'Studied [Combat] + [School]\n'
      + 'Combat: +1d8 to a Weapon Attack roll (one-time use). Expires at Sleep Phase or when used.\n'
      + 'School: +1d8 to a Student Class Check (one-time use). Expires at end of School Phase or when used.';
  }
  if (sheet.studiedCombat) {
    return 'Studied [Combat]\n'
      + 'Earned by choosing the "Combat Training" activity during Free Time Phase\n'
      + 'Grants +1d8 to a Weapon Attack roll (one-time use)\n'
      + 'Expires at Sleep Phase or when used, whichever comes first';
  }
  if (sheet.studiedSchool) {
    return 'Studied [School]\n'
      + 'Earned by choosing the "Study and Complete Homework" activity during Free Time Phase\n'
      + 'Grants +1d8 to a Student Class Check (one-time use)\n'
      + 'Expires at end of School Phase or when used, whichever comes first';
  }
  return 'Studied Effect\n'
    + 'Click to cycle: Empty → X (Combat) → O (School) → XO (Both)\n'
    + 'X = Studied [Combat]: +1d8 to Weapon Attack (one-time use)\n'
    + 'O = Studied [School]: +1d8 to Student Class Check (one-time use)';
});

// Nourished toggle: cycles empty → X (Well Fed) → O (Rested) → XO (Both) → empty
const nourishedDisplay = computed(() => {
  if (sheet.wellFed && sheet.rested) return 'XO';
  if (sheet.wellFed) return 'X';
  if (sheet.rested) return 'O';
  return '';
});

function cycleNourished() {
  if (!sheet.wellFed && !sheet.rested) {
    sheet.wellFed = true;
  } else if (sheet.wellFed && !sheet.rested) {
    sheet.wellFed = false;
    sheet.rested = true;
  } else if (!sheet.wellFed && sheet.rested) {
    sheet.wellFed = true;
  } else {
    sheet.wellFed = false;
    sheet.rested = false;
  }
}

const nourishedTooltip = computed(() => {
  if (sheet.wellFed && sheet.rested) {
    return 'Well Fed + Well Rested\n'
      + 'Well Fed: Reroll all dice on a Physical Skill Check (one-time use). Expires at Sleep Phase.\n'
      + 'Well Rested: Reroll all dice on a Mental Skill Check (one-time use). Lost at start of next Sleep Phase.';
  }
  if (sheet.wellFed) {
    return 'Well Fed\n'
      + 'Earned by choosing "Visit a Restaurant" during Free Time Phase, or from attending a School Festival\n'
      + 'Reroll all dice on a Physical Skill Check (one-time use)\n'
      + 'Expires at Sleep Phase';
  }
  if (sheet.rested) {
    return 'Well Rested\n'
      + 'Earned from Refreshing or Average sleep during Sleep Phase\n'
      + 'Reroll all dice on a Mental Skill Check (one-time use)\n'
      + 'Lost at the start of the next Sleep Phase';
  }
  return 'Nourished/Rested Effect\n'
    + 'Click to cycle: Empty → X (Well Fed) → O (Well Rested) → XO (Both)\n'
    + 'X = Well Fed: Reroll Physical Skill Check dice (one-time use)\n'
    + 'O = Well Rested: Reroll Mental Skill Check dice (one-time use)';
});
</script>

<template>
  <div class="student-view">

    <SplitMods :attributes="studentAttributes" class="student-split">
      <template v-slot:content>
        <ImageBackedLabel image="studied" :title="studiedTooltip">
          <template v-slot:value>
            <span class="rest-check studied-toggle" @click="cycleStudied">{{ studiedDisplay }}</span>
          </template>
          <template v-slot:text>
            Studied
          </template>
        </ImageBackedLabel>
        <ImageBackedLabel image="apple" :title="nourishedTooltip">
          <template v-slot:value>
            <span class="rest-check studied-toggle" @click="cycleNourished">{{ nourishedDisplay }}</span>
          </template>
          <template v-slot:text>
            Rested
          </template>
        </ImageBackedLabel>
      </template>
    </SplitMods>
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
          <option :value="1">I - Envoy of Doom</option>
          <option :value="2">II - Envoy of Imitation</option>
          <option :value="3">III - Medium of Doubt</option>
          <option :value="4">IV - Mentor of Advent</option>
          <option :value="5">V - Advocate of Hope</option>
        </select>
      </div>
      <div class="herald-tier-access">
        <span class="tier-label">Spell Tier Access:</span>
        <span class="tier-badges">
          <span v-for="tier in ['I','II','III','IV','V','VI']" :key="tier"
                class="tier-badge"
                :class="{ 'unlocked': sheet.isTierUnlocked(tier), 'locked': !sheet.isTierUnlocked(tier) }"
                :title="!sheet.isTierUnlocked(tier) ? (tier === 'VI' ? 'Requires Level 14+ and Herald Bond IV+' : 'Requires higher level') : ''">
            {{ tier }}
            <span v-if="!sheet.isTierUnlocked(tier)" class="lock-icon">🔒</span>
          </span>
        </span>
      </div>
      <div class="grid">
        <label class="properties-header" for="herald-notes">Notes</label>
        <textarea class="underline" v-model="sheet.herald.notes" id="herald-notes" placeholder="Notes about your Herald..."></textarea>
      </div>
    </div>
  </NotchContainer>

</template>

<style lang="scss">
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
  .studied-toggle{
    font-weight: bold;
    user-select: none;
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

</style>