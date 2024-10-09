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

const sheet = useSheetStore();
const studentAttributes = [
  {
    name: 'student_armor',
    image: 'student-shield',
    crown: false,
    text: 'Armor',
    readonly: false
  },
  {
    name: 'student_move',
    image: 'move',
    crown: false,
    text: 'Move',
    readonly: false
  },
  {
    name: 'student_attack',
    image: 'attack',
    crown: false,
    text: 'Attack',
    readonly: false,
    click: () => sheet.rollStudentAttack()
  },
  {
    name: 'student_damage',
    image: 'student-damage',
    crown: false,
    text: 'Damage',
    readonly: false,
    click: () => sheet.rollStudentDamage()
  }
];
</script>

<template>
  <div class="student-view">

    <SplitMods :attributes="studentAttributes" class="student-split">
      <template v-slot:content>
        <ImageBackedLabel image="studied">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.studied" class="rest-check">
          </template>
          <template v-slot:text>
            Studied
          </template>
        </ImageBackedLabel>
        <ImageBackedLabel image="apple">
          <template v-slot:value>
            <input type="checkbox" v-model="sheet.rested" class="rest-check">
          </template>
          <template v-slot:text>
            Fed/Rested
          </template>
        </ImageBackedLabel>
      </template>
    </SplitMods>
    <NotchContainer class="student-ability" notchType="none" width="thick">
      <h4>Student Ability</h4>
      <Collapsible class="student-ability-content" :default="sheet.student_ability.collapsed" @collapse="sheet.student_ability.collapsed = !sheet.student_ability.collapsed">
        <template v-slot:collapsed>
          <h5>{{ sheet.student_ability.name }}</h5>
          <span class="student-description-display">{{ sheet.student_ability.description }}</span>
        </template>
        <template v-slot:expanded>
          <input class="underline" type="text" v-model="sheet.student_ability.name" placeholder="Ability Name">
          <textarea class="underline" v-model="sheet.student_ability.description" placeholder="Description"></textarea>
        </template>
      </Collapsible>
    </NotchContainer>
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
  .student-ability{
    padding: var(--half-gap);
    display: grid;
    gap: var(--half-gap);
  }
  .student-ability-content{
    display: grid;
    gap: var(--half-gap);
    .student-description-display{
      white-space: pre-wrap;
    }
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
</style>