<template>
  <div class="herocard card card--double-sided" :data-flipped="flipped">
    <div class="card__container">
      <div class="card__side card__side--front">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title">Character Card</h2>
          <CardDecoration :theme="'hero'"/>
        </div>
        <div class="card__body">
          <div class="card__section character-name">
            <input type="text" v-model="meta.name" placeholder="Character Name" spellcheck="false" />
          </div>
          <div class="card__section player-name">
            <h3 class="title break-padding">Player Name</h3>
            <input type="text" v-model="hero.player" spellcheck="false"/>
          </div>
          <div class="card__section essence">
            <h3 class="title break-padding">Essence</h3>
            <EssenceTracker :essences="hero.essences" />
          </div>
          <div class="card__section fellowship-relationships">
            <h3 class="title break-padding">Crew Relationships</h3>
            <div class="fellowship-table-header break-padding">
              <h4 class="title">Crew Member</h4>
              <h4 class="title">Relationship</h4>
            </div>
            <OverlayScrollbarsComponent
              :defer="true"
              :options="{ scrollbars: { autoHide: 'move'} }"
              :events="crewScrollEvents"
              ref="crewScroll"
              :class="['scroll-area','scroll-area--crew', { 'scroll-area--not-at-start': crewIsScrollNotAtStart, 'scroll-area--at-end': crewIsScrollAtEnd }]"
            >
              <div class="table fellowship-table">
                <div class="table__body">
                  <div class="table__row" v-for="relationship in hero.fellowshipRelations" :key="relationship._id">
                    <TextInput v-model="relationship.companion" />
                    <div class="relationship-tag">
                      <TextInput v-model="relationship.tag" @clear="relationship.burnt = false" :disabled="relationship.burnt"/>
                      <div class="burnt-toggle image-toggle">
                        <template v-if="!(relationship.tag.trim() === '')">
                          <input type="checkbox" v-model="relationship.burnt" :disabled="relationship.tag.trim() === ''"/>
                          <SvgIcon icon="Burn"/>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </OverlayScrollbarsComponent>
          </div>
        </div>
        <div class="card__footer"  @click="flipped = !flipped">
          <OtherScape />
          <CardDecoration :theme="'hero'"/>
        </div>
      </div>
      <div class="card__side card__side--back">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title">Hero Card</h2>
          <CardDecoration :theme="'hero'"/>
        </div>
        <div class="card__body">
          <!-- <div class="card__section backpack">
            <h3 class="title break-padding">
              Backpack
              <SvgIcon class="decorator" icon="Backpack" />
            </h3>
            <div class="list taglist">
              <div class="theme-tag" v-for="item in hero.backpack" :key="item._id">
                <div class="power-toggle image-toggle">
                  <input type="checkbox" v-model="item.checked" :disabled="item.name.trim() === '' || item.burnt">
                  <SvgIcon icon="Power"/>
                </div>
                <TextInput v-model="item.name" @clear="clearTheme(item)" :class="{ 'line-through': item.burnt }" />
                <div class="burnt-toggle image-toggle">
                  <input type="checkbox" v-model="item.burnt" :disabled="item.name.trim() === ''" @click="scratchPower(item)">
                  <SvgIcon icon="Burnt"/>
                </div>
              </div>
            </div>
          </div> -->
          <div class="card__section fulfillments">
            <div class="title break-padding evolution">
              <h3>Evolution</h3>
              <RangeBar v-model="hero.promise" :max="5" />
            </div>
            <OverlayScrollbarsComponent
              :defer="true"
              :options="{ scrollbars: { autoHide: 'move'} }"
              :events="fulfillmentsScrollEvents"
              ref="fulfillmentsScroll"
              :class="['scroll-area', { 'scroll-area--not-at-start': fulfillmentsIsScrollNotAtStart, 'scroll-area--at-end': fulfillmentsIsScrollAtEnd }]"
            >
              <div class="list fulfillment-list">
                <div class="fulfillment" v-for="fulfillment in visibleFulfillments" :key="fulfillment._id">
                  <SelectInput
                    v-model="fulfillment.description"
                    :allowCustom="true"
                    :options="spine.fulfillments.map(desc => ({ value: desc, label: desc }))"
                    :allowedOptions="optionsForFulfillment(fulfillment.description)"
                    :showDefaultOption="true"
                    defaultOptionLabel="Moments of Evolution"
                    showClearWhen="hover"
                    :autoHidePlaceholder="true"/>
                </div>
              </div>
            </OverlayScrollbarsComponent>
          </div>
          <div class="card__section specials">
            <h3 class="title break-padding">Specials</h3>
             <OverlayScrollbarsComponent
                :defer="true"
                :options="{ scrollbars: { autoHide: 'move'} }"
               :events="specialsScrollEvents"
               ref="specialsScroll"
               :class="['scroll-area','scroll-area--specials', { 'scroll-area--not-at-start': specialsIsScrollNotAtStart, 'scroll-area--at-end': specialsIsScrollAtEnd }]"
              >
                <div class="list improvement-list">
                  <template  v-for="special in visibleSpecials" :key="special._id" >
                    <div class="improvement-item">
                      <div class="improvement__title">
                        <div class="improvement-toggle image-toggle">
                          <input type="checkbox" v-model="special.checked" />
                          <SvgIcon icon="Check"/>
                        </div>
                        <TextInput v-model="special.name" placeholder="Special" :autoHidePlaceholder="!special.checked" @clear="special.description='';special.checked=false"/>
                      </div>
                      <textarea v-if="special.checked" v-model="special.description" class="smart-textarea improvement" placeholder="Description" spellcheck="false"></textarea>
                    </div>
                  </template>
                </div>
              </OverlayScrollbarsComponent>
          </div>
        </div>
        <div class="card__footer"  @click="flipped = !flipped">
          <OtherScape />
          <CardDecoration :theme="'hero'"/>
        </div>
      </div>
      <div class="card__fader"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import TextInput from '../shared/TextInput.vue';
import RangeBar from '../shared/RangeBar.vue';
import SelectInput from '../shared/SelectInput.vue';
import { heroStore } from '@/sheet/stores/hero/heroStore';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { spine } from '@/spine/spine';
import SonsOfOak from '../logo/SonsOfOak.vue';
import LegendsInTheMist from '../logo/LegendsInTheMist.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import type { Tag } from '@/sheet/stores/themes/themesStore';
import EssenceTracker from '../essence/EssenceTracker.vue';
import OtherScape from '../logo/OtherScape.vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';
import { useOverlayScrollArea } from '@/utility/useOverlayScrollArea';
import CardDecoration from '../shared/CardDecoration.vue';

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

const fulfillmentLimits = computed<Record<string, number>>(() => {
  return spine.fulfillments.reduce((acc, desc) => {
    acc[desc] = (acc[desc] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});

const takenFulfillmentCounts = computed<Record<string, number>>(() => {
  return hero.fulfillments.reduce((acc, item) => {
    const desc = (item.description ?? '').trim();
    if (!desc || fulfillmentLimits.value[desc] === undefined) return acc;

    acc[desc] = (acc[desc] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});

const optionsForFulfillment = (currentValue?: string) => {
  const current = (currentValue ?? '').trim();

  return Object.keys(fulfillmentLimits.value)
    .filter(desc => {
      const taken = takenFulfillmentCounts.value[desc] ?? 0;
      const limit = fulfillmentLimits.value[desc] ?? 0;
      return desc === current || taken < limit;
    })
    .map(desc => ({ value: desc, label: desc }));
};

const clearTheme = (tag:Tag) => {
  tag.checked = false;
  tag.burnt = false;
};

const scratchRelationship = (relationship: typeof hero.fellowshipRelations[0]) => {
  relationship.burnt = !relationship.burnt;
};

const visibleFulfillments = computed(() => {
  const limit = 6; // show at least 3 evolutions, even if they are empty
  return hero.fulfillments.filter((p, index) => {
    if (index < limit) return true;
    else { return hero.fulfillments[index-1].description && hero.fulfillments[index-1].description?.trim() !== '' || p.description && p.description.trim() !== ''}
  });
});
const visibleSpecials = computed(() => {
  const limit = 6; // show at least 3 evolutions, even if they are empty
  return hero.specials.filter((p, index) => {
    if (index < limit) return true;
    else { return hero.specials[index-1].checked || p.checked}
  });
});
const {
  scroll: crewScroll,
  isScrollAtEnd: crewIsScrollAtEnd,
  isScrollNotAtStart: crewIsScrollNotAtStart,
  resetScrollState: resetCrewScrollState,
  syncScrollState: syncCrewScrollState,
  scrollEvents: crewScrollEvents
} = useOverlayScrollArea();
const {
  scroll: fulfillmentsScroll,
  isScrollAtEnd: fulfillmentsIsScrollAtEnd,
  isScrollNotAtStart: fulfillmentsIsScrollNotAtStart,
  resetScrollState: resetFulfillmentsScrollState,
  syncScrollState: syncFulfillmentsScrollState,
  scrollEvents: fulfillmentsScrollEvents
} = useOverlayScrollArea();
const {
  scroll: specialsScroll,
  isScrollAtEnd: specialsIsScrollAtEnd,
  isScrollNotAtStart: specialsIsScrollNotAtStart,
  resetScrollState: resetSpecialsScrollState,
  syncScrollState: syncSpecialsScrollState,
  scrollEvents: specialsScrollEvents
} = useOverlayScrollArea();

watch(() => hero.fellowshipRelations.length, async (count) => {
  if (!count) {
    resetCrewScrollState();
    return;
  }

  await nextTick();
  syncCrewScrollState();
}, { immediate: true });

watch(visibleFulfillments, async (items) => {
  if (!items.length) {
    resetFulfillmentsScrollState();
    return;
  }

  await nextTick();
  syncFulfillmentsScrollState();
}, { immediate: true });

watch(visibleSpecials, async (items) => {
  if (!items.length) {
    resetSpecialsScrollState();
    return;
  }

  await nextTick();
  syncSpecialsScrollState();
}, { immediate: true });
</script>

<style lang="scss" scoped>
  .card {
    width: var(--card-width);
    height: var(--card-height);

    --color-palette-default: var(--color-herocard);
    --color-palette-highlight: var(--color-herocard-highlight);
    --color-palette-dark: var(--color-herocard-dark);

    --color-textinput-line: rgb(var(--color-palette-foreground));
    --color-section-title-background: rgb(var(--color-palette-dark));
    --color-rangebar-border: rgb(var(--color-palette-default));
    --color-textarea: rgb(var(--color-palette-dark));
    --color-textarea-hover: rgb(var(--color-palette-default));
    &__side {
      box-sizing: border-box;
      display: grid;
      grid-template-rows: min-content 1fr min-content;
      box-shadow: 0 0 10px rgb(var(--color-palette-shadow));
      border-radius: 5px;
      &--back {
        .card__body {
          padding-top: 0;
        }
      }
    }
    &__header {
      background-color: rgb(var(--color-palette-default));
      color: var(--color-text-secondary);
      padding: 5px 0;
      border-radius: 5px 5px 0 0;
      .decorator {
        fill:  var(--color-text-tertiary)!important;
      }
    }
     &__footer {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(var(--color-palette-default));
      height: 30px;
      border-radius: 0 0 5px 5px;
      svg {
        fill: var(--color-text-secondary);
      }
    }
    &__body {
      padding: 0 5px 5px 5px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: rgb(var(--color-palette-background));
    }
  }
  .itemlist {
    gap: 6px;
  }
  .fulfillment-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    background-color: rgb(var(--color-palette-default) / 0.25);
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: transparent;
      opacity: 0.65;
    }
    &:hover {
      background-color: rgb(var(--color-palette-default) / 0.5);
    }
    &:has(input:checked) {
      background-color: rgb(var(--color-palette-highlight));
      .svg-icon {
        fill: rgb(var(--color-palette-foreground));
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
    font-size: var(--font-size-xsmall);
    .title {
      font-size: 10px;
      font-family: var(--font-family-body);
      background-color: rgb(var(--color-palette-dark) / 0.5);
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
      background-color: var(--color-text-tertiary);
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
      font-size: var(--font-size-large);
      border: 0;
      font-family: var(--font-family-title);
      color: var(--color-text-primary);
      font-weight: bold;
      padding-top: 5px;
      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }
  }
  .player-name {
    input {
      text-align: center;
      font-family: var(--font-family-body);
      color: var(--color-text-primary);
    }
  }
  .smart-textarea {
    height: 55px; 
  }
  .fulfillment-list {
    gap: 12px;
    color: var(--color-text-primary);
    font-family: var(--font-family-body);
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
      font-size: var(--font-size-small);
      font-family: var(--font-family-body);
    }
  }
  .improvement-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    background-color: rgb(var(--color-palette-default) / 0.25);
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: transparent;
      opacity: 0.65;
    }
    &:hover {
      background-color: rgb(var(--color-palette-default) / 0.5);
    }
    &:has(input:checked) {
      background-color: rgb(var(--color-palette-highlight));
      .svg-icon {
        fill: rgb(var(--color-palette-foreground));
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
  .improvement__title {
    display: grid;
    grid-template-columns: min-content 1fr;
    gap: 5px;
    text-align: left;
  }
  .improvement-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .scroll-area {
    height: 191px;
    width: calc(100% + 7px);
    padding: 5px 7px 0 0;
    box-sizing: border-box;
    margin-top: -5px;
    &:before, &:after {
      content: '';
      position: absolute;
      left: 0;
      width: calc(100% - 7px);
      height: var(--tag-box-height);
      pointer-events: none;
      display: block;
      z-index: 999;
    }
    &:before {
      background: linear-gradient(rgb(var(--color-palette-background)) , rgb(var(--color-palette-background) / 0));
      top: 0;
    }
    &:after {
      background: linear-gradient(rgb(var(--color-palette-background) / 0) , rgb(var(--color-palette-background)));
      bottom: 0;
    }
    &--at-end:after,
    &:not(.scroll-area--not-at-start):before {
      display: none;
    }
    &--specials {
      height: 253px;
    }
    &--crew {
      height: 153px;
    }
  }
  .card__fader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(var(--color-palette-character));
    opacity: 0;
    pointer-events: none;
    border-radius: 5px;
    transition: opacity var(--card-transition-duration) ease;
    z-index: 9999;
  }
  .evolution {
    display: flex;
    align-items: center;
    padding-left: 5px!important;
    padding-right: 5px!important;
    box-sizing: border-box;
    justify-content: space-around;
    h3 {
      font-size: var(--font-size-small);
    }
  }
  :deep(.range-bar) {
    .range-bar__option--checked {
      border-color: rgb(var(--color-palette-foreground) / 0.50);
    }
  }
  .relationship-tag {
    position: relative;
    &:has(.burnt-toggle input:checked) {
      .burnt-toggle {
        opacity: 1;
      }
      :deep(.text-input) {
        input {
          padding-right: 20px;
          text-decoration: line-through;
        }
      }
    }
    &:hover, &:focus-within {
      .burnt-toggle {
        opacity: 1;
      }
      :deep(.text-input:not(.disabled)) {
        input {
          padding-right: 35px!important;
        }
        .clear-btn {
          right: 20px;
          display: block!important;
        }
      }
    }
  }
  .burnt-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    transition: opacity ease 0.2s;
    opacity: 0;
    position: absolute;
    top: calc(calc(50% - var(--toggle-size) / 2));
    right: 0;
    .svg-icon {
      width: var(--toggle-size);
      height: var(--toggle-size);
      fill: rgb(var(--color-palette-foreground));
    }
    &:has(input:checked) {
      input[type="text"] {
        text-decoration: line-through;
      }
      .svg-icon {
        fill: rgb(var(--color-palette-neon));
        filter: drop-shadow(0px 0px 5px rgb(var(--color-palette-foreground)));
      }
    }
    &:has(input:disabled) {
      input { cursor: not-allowed; }
    }
    &.broken {
      opacity: 0;
      pointer-events: none;
    }
  }
</style>