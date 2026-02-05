<template>
  <div class="herocard card card--double-sided" :data-flipped="flipped">
    <div class="card__container">
      <div class="card__side card__side--front">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title">Hero Card</h2>
        </div>
        <div class="card__body">
          <div class="card__section character-name">
            <input type="text" v-model="meta.name" placeholder="Character Name" />
          </div>
          <div class="card__section player-name">
            <h3 class="title break-padding">Player Name</h3>
            <input type="text" v-model="hero.player"/>
          </div>
          <div class="card__section fellowship-relationships">
            <h3 class="title break-padding">Fellowship Relationships</h3>
            <div class="fellowship-table-header break-padding">
              <h4 class="title">Companion</h4>
              <h4 class="title">Relationship</h4>
            </div>
            <div class="table fellowship-table">
              <div class="table__body">
                <div class="table__row" v-for="relationship in hero.fellowshipRelations" :key="relationship._id">
                  <TextInput v-model="relationship.companion" />
                  <TextInput v-model="relationship.tag" />
                </div>
              </div>
            </div>
            <div class="promises">
              <span class="title">Promises</span>
              <RangeBar :count="hero.promise" :max="5" v-model="hero.promise"/>
            </div>
          </div>
          <div class="card__section quintessences">
            <h3 class="title break-padding">
              Quintessences
              <SvgIcon class="decorator" icon="Quintessences" />
            </h3>
            <div class="list">
              <SelectInput v-for="quintessence in hero.quintessences" :key="quintessence._id" v-model="quintessence.name" :options="filteredOptionsFor(quintessence.name)" showClearWhen="hover"/>
            </div>
          </div>
          <div class="card__section notes">
            <h3 class="title break-padding">Notes</h3>
            <textarea v-model="hero.notes" class="smart-textarea"></textarea>
          </div>
        </div>
        <div class="card__footer">
          <LegendsInTheMist />
        </div>
      </div>
      <div class="card__side card__side--back">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title">Hero Card</h2>
        </div>
        <div class="card__body">
          <div class="card__section backpack">
            <h3 class="title break-padding">
              Backpack
              <SvgIcon class="decorator" icon="Backpack" />
            </h3>
            <div class="list taglist">
              <div class="theme-tag" v-for="item in hero.backpack" :key="item._id">
                <div class="power-toggle image-toggle">
                  <input type="checkbox" v-model="item.checked" :disabled="item.name.trim() === '' || item.scratched">
                  <SvgIcon icon="Power"/>
                </div>
                <TextInput v-model="item.name" @clear="clearTheme(item)" :class="{ 'line-through': item.scratched }" />
                <div class="scratched-toggle image-toggle">
                  <input type="checkbox" v-model="item.scratched" :disabled="item.name.trim() === ''" @click="scratchPower(item)">
                  <SvgIcon icon="Scratched"/>
                </div>
              </div>
            </div>
          </div>
          <div class="card__section fulfillments">
            <h3 class="title break-padding">Moments of Fulfillment</h3>
            <div class="list fulfillment-list">
              <div class="fulfillment" v-for="fulfillment in hero.fulfillments" :key="fulfillment._id">
                <label>
                  <div class="fulfillment-toggle image-toggle">
                    <input type="checkbox" v-model="fulfillment.marked" />
                    <SvgIcon icon="Check"/>
                  </div>
                  <span :class="{ 'line-through': fulfillment.marked }">{{ fulfillment.description }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="card__footer">
          <SonsOfOak />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TextInput from '../shared/TextInput.vue';
import RangeBar from '../shared/RangeBar.vue';
import SelectInput from '../shared/SelectInput.vue';
import { heroStore } from '@/sheet/stores/hero/heroStore';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { spine } from '@/spine/spine';
import SonsOfOak from '../logo/SonsOfOak.vue';
import LegendsInTheMist from '../logo/LegendsInTheMist.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import { type Tag } from '@/sheet/stores/themes/themesStore';

const meta = metaStore();
const hero = heroStore();
const quintessenceOptions = spine.quintessences.map(q => ({ value: q, label: q }));
const flipped = ref(false);

const sortedFellowshipRelations = computed(() => {
  return [...hero.fellowshipRelations].sort((a, b) => {
    const aHasContent = (a.companion?.trim() || '') !== '' || (a.tag?.trim() || '') !== '';
    const bHasContent = (b.companion?.trim() || '') !== '' || (b.tag?.trim() || '') !== '';
    
    // Items with content come first
    if (aHasContent && !bHasContent) return -1;
    if (!aHasContent && bHasContent) return 1;
    return 0;
  });
});

const sortedQuintessences = computed(() => {
  return [...hero.quintessences].sort((a, b) => {
    const aHasName = (a.name?.trim() || '') !== '';
    const bHasName = (b.name?.trim() || '') !== '';
    
    // Items with names come first
    if (aHasName && !bHasName) return -1;
    if (!aHasName && bHasName) return 1;
    return 0;
  });
});

const selectedNames = computed(() =>
  hero.quintessences
    .map(q => (q.name ?? '').trim())
    .filter(n => n !== '')
);

const baseOptions = spine.quintessences.map(q => ({ value: q, label: q }));


const filteredOptionsFor = (currentValue: string) =>
  baseOptions.filter(o => o.value === currentValue || !selectedNames.value.includes(o.value));

const clearTheme = (tag:Tag) => {
  tag.checked = false;
  tag.scratched = false;
};

const scratchPower = (power:Tag) => {
  //power.checked = !power.scratched;
};
</script>

<style lang="scss" scoped>
  .card {
    width: 184px;
    height: var(--card-height);
    --color-textinput-line: var(--color-herocard-line);
    --color-section-title-background: var(--color-herocard-line);
    --color-rangebar-border: var(--color-herocard-title-box);
    --color-textarea: var(--color-section-title-background);
    --color-textarea-hover: var(--color-herocard-title-box);
    --color-logo: rgba(0, 0, 0, 0.5);
    &__side {
      background-color: var(--color-herocard-background);
      border: 2px solid rgba(0,0,0,0);//var(--color-herocard-border);
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: min-content 1fr min-content;
      &--back {
        .card__body {
          padding-top: 0;
        }
      }
    }
    &__header {
      background-color: var(--color-herocard-title-box);
      color: var(--color-herocard-title);
      padding: 5px 0;
    }
    &__footer {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--color-herocard-title-box);
      height: 30px;
    }
    &__body {
      padding: 5px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
  .itemlist {
    gap: 6px;
  }
  .theme-tag {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    align-items: center;
  }
  .scratched-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    .svg-icon {
      width: var(--toggle-size);
      height: var(--toggle-size);
      fill: #928680;
    }
    &:has(input:checked) {
      input[type="text"] {
        text-decoration: line-through;
      }
      .svg-icon {
        fill: black
      }
    }
    &:has(input:disabled) {
      opacity: 0.35;
      input { cursor: not-allowed; }
    }
  }
  .power-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    background-color: #d7c8bd;
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: var(--color-positive);
      opacity: 0.65;
    }
    &:has(input:checked) {
      background-color: var(--color-positive);
      .svg-icon {
        fill: white;
        opacity: 1;
      }
    }
    &:has(input:disabled) {
      opacity: 0.35;
      input { cursor: not-allowed; }
    }
  }
  .fulfillment-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    background-color: #d7c8bd;
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: transparent;
      opacity: 0.65;
    }
    &:has(input:checked) {
      background-color: var(--color-herocard-title-box);
      .svg-icon {
        fill: white;
        opacity: 1;
        width: 10px;
        height: 10px;
      }
    }
    &:has(input:disabled) {
      opacity: 0.35;
      input { cursor: not-allowed; }
    }
  }
  .fellowship-table-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: var(--font-size-small);
    .title {
      background-color: #fef8f0;
    }
  }
  .fellowship-table {
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
    position: relative;
    &:after {
      position: absolute;
      content: '';
      left: 50%;
      top: 0;
      width: 1px;
      height: 100%;
      background-color: var(--color-herocard-line);
    }
  }
  .promises {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 10px;
  }
  .character-name {
    input {
      text-align: center;
      font-size: var(--font-size-xlarge);
      border: 0;
      &::placeholder {
        color: var(--color-herocard-line);
      }
    }
  }
  .player-name {
    input {
      text-align: center;
    }
  }
  .smart-textarea {
    height: 82px; 
  }
  .fulfillment-list {
    gap: 12px;
  }
  .fulfillment label {
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: start;
    gap: 5px;
    text-align: left;
    input {
      margin: 0;
    }
    span {
      font-size: var(--font-size-medium);
      font-family: Arial, Helvetica, sans-serif;
    }
  }
</style>