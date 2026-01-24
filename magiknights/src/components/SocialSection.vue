<script setup>
import { useSheetStore } from '@/stores';

import RepeatingItem from './RepeatingItem.vue';
import RepeatingSection from './RepeatingSection.vue';
import Collapsible from './Collapsible.vue';

const sheet = useSheetStore();
const props = defineProps({
  name: String
});

</script>

<template>
  <div class="social-section">
    <div class="social-header">
      <h5>name</h5>
      <h5>heart stage</h5>
      <h5>SP</h5>
      <h5>bond ability</h5>
    </div>
    <RepeatingSection :name="`${name}-social`">
      <RepeatingItem :class="`${name}-social-item`" v-for="item in sheet.sections[`${name}-social`].rows" :key="item._id" :name="`${name}-social`" :row="item">
        <Collapsible class="social-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
          <template v-slot:collapsed>
            <span>{{ item.name || 'New Bond' }}</span>
            <span class="heart-stage-label">{{ sheet.heartStageData.find(s => s.value === item.heartStage)?.label || 'Neutral' }}</span>
            <span>{{ item.points }}</span>
            <span>{{ item.bond_ability }}</span>
          </template>
          <template v-slot:expanded>
            <input type="text" class="underline" v-model="item.name" placeholder="NPC Name">
            <div class="heart-stage-row">
              <select class="underline heart-stage-select" v-model="item.heartStage">
                <option v-for="stage in sheet.heartStageData" :key="stage.value" :value="stage.value">{{ stage.label }}</option>
              </select>
              <span class="sp-threshold-hint">
                {{ sheet.heartStageData.find(s => s.value === item.heartStage)?.min ?? 0 }}–{{ Math.min(sheet.heartStageData.find(s => s.value === item.heartStage)?.max ?? 0, 99) }} SP
              </span>
              <span v-if="sheet.getHeartStageForSP(Number(item.points) || 0) !== item.heartStage" class="sp-mismatch-hint">
                (SP suggests: {{ sheet.heartStageData.find(s => s.value === sheet.getHeartStageForSP(Number(item.points) || 0))?.label }})
              </span>
            </div>
            <input type="number" class="underline" v-model="item.points">
            <textarea class="underline" v-model="item.bond_ability" placeholder="Bond ability..."></textarea>
          </template>
        </Collapsible>
      </RepeatingItem>
    </RepeatingSection>
  </div>
</template>

<style lang="scss">
.social-section{
  display: grid;
  grid-template-columns: 1fr 90px 40px 1fr;
  gap: 1px;
  &,
  .repcontainer{
    background-color: var(--borderColor);
  }
  .rep-add-button{
    grid-column: 1;
  }
  .rep-edit-button{
    grid-column: 4;
  }
  :is(.social-header,.repeating-section,.repcontainer,.repitem,.social-content){
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    gap: inherit;
    padding: 0;
  }
  .social-header,.repcontainer{
    padding: 1px;
  }
  .social-header{
    *{
      background-color: var(--masterBack);
    }
  }
  .repeating-section{
    background-color: var(--masterBack);
  }
  .social-content{
    :not(:first-child){
      background-color: var(--masterBack);
      border: 0;
    }
  }
  .heart-stage-label{
    font-size: 0.85em;
    text-align: center;
  }
  .heart-stage-select{
    font-size: 0.85em;
  }
  .heart-stage-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sp-threshold-hint {
    font-size: 0.7em;
    opacity: 0.6;
    text-align: center;
  }
  .sp-mismatch-hint {
    font-size: 0.7em;
    color: #e90;
    text-align: center;
    font-style: italic;
  }
}
</style>
