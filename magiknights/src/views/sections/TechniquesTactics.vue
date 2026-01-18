<script setup>
import { ref } from 'vue';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import TechniqueItem from '@/components/TechniqueItem.vue';
import TacticItem from '@/components/TacticItem.vue';

import {useSheetStore} from '@/stores';

const sheet = useSheetStore();

// Collapsible section states
const techniquesCollapsed = ref(false);
const tacticsCollapsed = ref(false);

// Reset technique uses based on frequency
const resetEncounterTechniques = () => {
  sheet.resetTechniqueUses('1/Encounter');
};

const resetRoundTechniques = () => {
  sheet.resetTechniqueUses('1/Round');
};

const resetRestTechniques = () => {
  sheet.resetTechniqueUses('1/Rest');
  sheet.resetTechniqueUses('1/Phase');
};

const resetAllTechniques = () => {
  sheet.resetTechniqueUses('all');
};

// Common tactics library for quick adding
const commonTactics = [
  {
    name: 'Adept of Magic',
    description: 'Add +1 to your Reputation Level for calculating your total Mana Coefficient (MCO).',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+1 Rep for MCO',
    active: true
  },
  {
    name: 'Tough as Nails',
    description: 'Gain +2 Student HP and +2 HP per Magi-Knight Level while transformed. Points are retroactively received.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+2 Student HP, +2 HP/Level',
    active: true
  },
  {
    name: 'Magical Foresight',
    description: 'Add your MAM to your Dexterity Modifier when rolling Initiative. Attacks made against you during an Ambush do not gain Advantage.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+MAM to Initiative',
    active: true
  },
  {
    name: 'Combat Form Drills',
    description: 'Learn a second Combat Form. Once per Turn as a Free Action, switch between your two Combat Forms. Repeatable for a third form.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+1 Combat Form',
    active: true
  },
  {
    name: 'Combat Form Mastery',
    description: 'Upgrade all Combat Form modifiers. See Combat Forms document for detailed Mastery upgrades for each Form.',
    prerequisites: 'Level 9+, Combat Form Drills',
    effectType: 'Passive',
    automaticBonus: 'Enhanced Forms',
    active: true
  },
  {
    name: 'Disciplined Agility',
    description: 'Gain an additional Reaction each Round.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+1 Reaction/Round',
    active: true
  },
  {
    name: 'Elemental Bulwark',
    description: 'Reduce all Physical Damage you would receive by 3. Applied before other reduction effects.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '-3 Physical Damage',
    active: true
  },
  {
    name: 'Implement Mastery',
    description: 'When making a Weapon Attack with your Magical Implement, add your MAM to both your Attack and Damage in addition to any other modifiers.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+MAM to Implement Attacks',
    active: true
  },
  {
    name: 'Martial Artist',
    description: 'Unarmed Damage Die becomes 1d6. Choose DEX or STR for unarmed damage. Perform Unarmed Attack as Bonus Action. Unarmed Attacks gain Staggering Blow quality.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '1d6 Unarmed, Bonus Unarmed Attack',
    active: true
  },
  {
    name: 'Quicksword Technique',
    description: 'After making a Weapon Attack against a target, you no longer Provoke Attacks from them for the remainder of your turn. After making a Weapon Attack, you may Move 10 feet.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: 'No Provoke, +10ft Move',
    active: true
  },
  {
    name: 'Resilient Soul Crystal',
    description: 'Add +1 to a Statistic of your choice AND gain proficiency with one Roll to Resist (STR/DEX/CON), OR gain proficiency with Rolls to Resist: Magic.',
    prerequisites: 'None',
    effectType: 'Passive',
    automaticBonus: '+1 Stat or Magic Resist',
    active: true
  },
  {
    name: 'Shield of the Guardian',
    description: 'Reaction: Reduce damage to you or an adjacent ally by 3 + your Reputation Level. Applied before other reduction effects.',
    prerequisites: 'Wielding Knight\'s Force Shield',
    effectType: 'Reaction',
    automaticBonus: 'Protect Ally',
    active: true
  }
];

const addCommonTactic = (tactic) => {
  const tacticCopy = { ...tactic };
  sheet.addRow('tactics');
  const newTactic = sheet.sections.tactics.rows[sheet.sections.tactics.rows.length - 1];
  Object.assign(newTactic, tacticCopy);
};
</script>

<template>
  <NotchContainer class="technique-container" notchType="none" width="thick">
    <h3 class="header">techniques & tactics</h3>

    <!-- Battle Techniques Section -->
    <Collapsible :default="techniquesCollapsed" @collapse="techniquesCollapsed = !techniquesCollapsed">
      <template v-slot:collapsed>
        <div class="section-header">
          <h4 class="subheader">Battle Techniques</h4>
          <span class="count-badge">{{ sheet.sections.techniques.rows.length }}</span>
        </div>
      </template>
      <template v-slot:expanded>
        <div class="section-expanded">
          <div class="section-header-expanded">
            <h4 class="subheader">Battle Techniques</h4>
            <div class="reset-controls">
              <button @click="resetRoundTechniques" class="reset-btn small">Reset Round</button>
              <button @click="resetEncounterTechniques" class="reset-btn small">Reset Encounter</button>
              <button @click="resetRestTechniques" class="reset-btn small">Reset Rest</button>
              <button @click="resetAllTechniques" class="reset-btn">Reset All</button>
            </div>
          </div>

          <RepeatingSection name="techniques">
            <TechniqueItem v-for="row in sheet.sections.techniques.rows" :key="row._id" :item="row"/>
          </RepeatingSection>
        </div>
      </template>
    </Collapsible>

    <!-- Combat Tactics Section -->
    <Collapsible :default="tacticsCollapsed" @collapse="tacticsCollapsed = !tacticsCollapsed">
      <template v-slot:collapsed>
        <div class="section-header">
          <h4 class="subheader">Combat Tactics</h4>
          <span class="count-badge">{{ sheet.sections.tactics.rows.filter(t => t.active).length }} / {{ sheet.sections.tactics.rows.length }} Active</span>
        </div>
      </template>
      <template v-slot:expanded>
        <div class="section-expanded">
          <div class="section-header-expanded">
            <h4 class="subheader">Combat Tactics</h4>
          </div>

          <!-- Common Tactics Library -->
          <NotchContainer class="tactics-library" width="thin">
            <details>
              <summary class="library-summary">Common Tactics Library (Quick Add)</summary>
              <div class="library-grid">
                <button
                  v-for="tactic in commonTactics"
                  :key="tactic.name"
                  @click="addCommonTactic(tactic)"
                  class="library-btn"
                  :title="tactic.description"
                >
                  {{ tactic.name }}
                  <span class="library-bonus">{{ tactic.automaticBonus }}</span>
                </button>
              </div>
            </details>
          </NotchContainer>

          <RepeatingSection name="tactics">
            <TacticItem v-for="row in sheet.sections.tactics.rows" :key="row._id" :item="row"/>
          </RepeatingSection>
        </div>
      </template>
    </Collapsible>
  </NotchContainer>
</template>

<style lang="scss" scoped>
.technique-container {
  display: grid;
  padding: var(--tiny-gap);
  grid-template-columns: 1fr;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
}

.section-header-expanded {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-expanded {
  display: grid;
  gap: 0.5rem;
}

.subheader {
  color: var(--header-blue);
  font-weight: bold;
  font-size: large;
  margin: 0;
}

.count-badge {
  padding: 0.2rem 0.6rem;
  background: var(--header-blue);
  color: white;
  border-radius: 12px;
  font-size: small;
  font-weight: bold;
}

.reset-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reset-btn {
  padding: 0.3rem 0.8rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: small;
}

.reset-btn.small {
  padding: 0.2rem 0.5rem;
  font-size: x-small;
}

.reset-btn:hover {
  opacity: 0.8;
}

.tactics-library {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

.library-summary {
  color: var(--header-blue);
  font-weight: bold;
  cursor: pointer;
  padding: 0.3rem;
}

.library-summary:hover {
  background: var(--notch-color);
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.library-btn {
  padding: 0.5rem;
  background: var(--notch-color);
  border: 2px solid var(--header-blue);
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: all 0.2s;
}

.library-btn:hover {
  background: var(--header-blue);
  color: white;
}

.library-bonus {
  font-size: x-small;
  opacity: 0.8;
  font-weight: bold;
}
</style>