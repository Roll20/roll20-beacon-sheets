<template>
  <div :class="['themecard', 'card', 'card--double-sided', `themecard--${colorPalette}`]" :data-flipped="flipped">
    <div class="card__container">
      <div class="card__side card__side--front">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title" v-if="theme.isFellowship">
            Crew<br/>Theme Card
            <SvgIcon class="decorator" icon="Crew" />
          </h2>
          <h2 class="title" v-else-if="theme.isLoadout">
            Loadout<br/>Theme Card
            <SvgIcon class="decorator" icon="Loadout" />
          </h2>
          <h2 class="title" v-else>Theme Card</h2>
          <CardDecoration :theme="cardTheme"/>
        </div>
        <div class="card__body" :class="{ 'card__body--fellowship': theme.isFellowship, 'card__body--loadout': theme.isLoadout }">
          <div class="card__header-separator" v-if="cardType !== 'theme'"></div>
          <div class="card__section theme-meta" v-if="!theme.isFellowship && !theme.isLoadout">
            <div class="theme-meta__book">
              <div class="theme-meta__mights">
                <template v-for="(might, index) in spine.themeMights" :key="might">
                  <div class="theme-might image-toggle">
                    <input type="radio" :name="`theme-might-${theme._id}`" :value="might" v-model="selectedMight"/>
                    <SvgIcon :icon="might" />
                  </div>
                  <SvgIcon icon="Divider" v-if="index < spine.themeMights.length - 1" />
                </template> 
              </div>
              <div class="theme-meta__type">
                <SelectInput v-model="theme.themebook" :allowCustom="true" :options="types" :showDefaultOption="true" defaultOptionLabel="Type"/>
              </div>
            </div>
          </div>
          <div class="card__section tags">
            <div class="card__section theme-powers">
              <OverlayScrollbarsComponent
                :defer="true"
                :options="{ scrollbars: { autoHide: 'move'} }"
                :events="scrollEvents"
                ref="scroll"
                :class="['scroll-area', { 'scroll-area--not-at-start': isScrollNotAtStart, 'scroll-area--at-end': isScrollAtEnd }]"
              >
                <div :class="`list taglist taglist--${cardType}`">
                  <TagBox v-for="(power, index) in visibleTags" :key="power._id" :isActive="power.checked" :isDisabled="power.name.trim() === ''" :isBurnt="power.burnt" :isWeakness="power.type === 'Weakness'">
                    <div class="theme-tag" :class="{'theme-tag--loadout': theme.isLoadout}">
                      <div class="power-toggle image-toggle">
                        <template v-if="!(power.name.trim() === '')">
                          <input type="checkbox" v-model="power.checked" :disabled="power.name.trim() === '' || power.burnt">
                          <SvgIcon icon="Power"/>
                        </template>
                      </div>
                      <TextInput
                        v-model="power.name"
                        :disabled="power.burnt"
                        :class="{'line-through': power.burnt }"
                        :placeholder="(index === 0 && !theme.isLoadout)
                          ? 'Theme Title'
                          : (power.type === 'Weakness' ? 'Weakness Tag' : 'Power Tag')"
                        :autoHidePlaceholder="true"
                        @clear="clearTheme(power)"/>
                      <div class="broken-toggle image-toggle" v-if="theme.isLoadout" :class="{'broken': theme.isLoadout && power.type === 'Weakness'}">
                        <template v-if="!(power.name.trim() === '')">
                          <input
                            type="checkbox"
                            v-model="power.type"
                            true-value="Weakness"
                            false-value="Power"
                            :disabled="power.name.trim() === '' || power.burnt"
                          >
                          <SvgIcon icon="Broken"/>
                        </template>
                      </div>
                      <div class="burnt-toggle image-toggle" :class="{'broken': theme.isLoadout && power.type === 'Weakness'}">
                        <template v-if="!(power.name.trim() === '')">
                          <input type="checkbox" v-model="power.burnt" :disabled="power.name.trim() === '' || power.type === 'Weakness'" @click="scratchPower(power)">
                          <SvgIcon icon="Burn"/>
                        </template>
                      </div>
                    </div>
                  </TagBox>
                </div>
              </OverlayScrollbarsComponent>
            </div>
            <!-- <div class="card__section theme-weaknesses" v-if="!theme.isLoadout">
              <div class="list">
                <TagBox v-for="weakness in weaknesses" :key="weakness._id" :isWeakness="true" :isActive="weakness.checked" :isDisabled="weakness.name.trim() === ''">
                  <div class="theme-tag">
                    <div class="weakness-toggle image-toggle">
                      <template v-if="!(weakness.name.trim() === '')">
                        <input type="checkbox" v-model="weakness.checked" :disabled="weakness.name.trim() === ''">
                        <SvgIcon icon="Weakness"/>
                      </template>
                    </div>
                    <TextInput v-model="weakness.name" @clear="clearTheme(weakness)" placeholder="Weakness Tag" :autoHidePlaceholder="true"/>
                  </div>
                </TagBox>
              </div>
            </div> -->
          </div>
          <div class="card__section theme-quest" v-if="!theme.isLoadout">
            <h3 class="title break-padding">{{ questLabel }}</h3>
            <textarea v-model="theme.quest.description" class="smart-textarea notes" spellcheck="false"></textarea>
            <div class="quest-progress">
              <div class="quest-progress-item" v-for="progress in ['Decay', 'Upgrade']" :key="progress">
                <RangeBar v-model="theme.quest[progress.toLowerCase() as QuestImprovement]" :max="3" />
                <span class="title">{{ progress }}</span>
              </div>
            </div>
          </div>
          <div class="card__section theme-quest" v-else>
            <div class="quest-progress quest-progress--loadout">
              <div class="quest-progress-item">
                <RangeBar v-model="theme.quest.upgrade" :max="3" />
                <span class="title">Upgrade</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card__footer"  @click="flipped = !flipped">
          <OtherScape />
          <CardDecoration :theme="cardTheme"/>
        </div>
      </div>
      <div class="card__side card__side--back">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title" v-if="theme.isFellowship">
            Crew<br/>Theme Card
            <SvgIcon class="decorator" icon="Crew" />
          </h2>
          <h2 class="title" v-else-if="theme.isLoadout">
            Loadout<br/>Theme Card
            <SvgIcon class="decorator" icon="Loadout" />
          </h2>
          <h2 class="title" v-else>Theme Card</h2>
          <CardDecoration :theme="cardTheme"/>
        </div>
        <div class="card__body" :class="{ 'card__body--fellowship': theme.isFellowship, 'card__body--loadout': theme.isLoadout }">
          <div class="card__section theme-improvements">
            <h3 class="title break-padding">Specials</h3>
            <div class="list improvement-list">
              <template  v-for="improvement in theme.specialImprovements" :key="improvement._id" >
                <div class="improvement-item">
                  <div class="improvement__title">
                    <div class="improvement-toggle image-toggle">
                      <input type="checkbox" v-model="improvement.checked" />
                      <SvgIcon icon="Check"/>
                    </div>
                    <TextInput v-model="improvement.name" placeholder="Special" :autoHidePlaceholder="!improvement.checked" @clear="improvement.description='';improvement.checked=false"/>
                  </div>
                  <textarea v-if="improvement.checked" v-model="improvement.description" class="smart-textarea improvement" placeholder="Description" spellcheck="false"></textarea>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="card__footer"  @click="flipped = !flipped">
          <OtherScape />
          <CardDecoration :theme="cardTheme"/>
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
import { spine } from '@/spine/spine';
import { themesStore, type Theme, type ThemeMight, type QuestImprovement, type Tag } from '@/sheet/stores/themes/themesStore';
import SvgIcon from '../shared/SvgIcon.vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';
import TagBox from '../shared/TagBox.vue';
import OtherScape from '../logo/OtherScape.vue';
import CyberEffect from '../shared/CyberEffect.vue';
import { useOverlayScrollArea } from '@/utility/useOverlayScrollArea';
import CardDecoration from '../shared/CardDecoration.vue';

const props = withDefaults(defineProps<{
  theme: Theme;
  visiblePowers?: number;
  visibleWeaknesses?: number;
  visibleLoadout?: number;
}>(), {
  visiblePowers: 7,
  visibleWeaknesses: 3,
  visibleLoadout: 14
});

const themes = themesStore();
const powers = computed(() => props.theme.isLoadout ? props.theme.tags : props.theme.tags.filter(tag => tag.type === 'Power'));
const weaknesses = computed(() => props.theme.tags.filter(tag => tag.type === 'Weakness'));
// const improvements = computed(() => {
//   const source = props.theme.isFellowship ? 'Fellowship' : (props.theme.might as ThemeMight);
//   return [...spine.themes[source].improvements, ...spine.themes['Variable'].improvements]
//     .map(imp => ({ value: imp, label: imp }));
// });

const selectedImprovementNames = computed(() =>
  (props.theme.specialImprovements ?? [])
    .map(i => (i.name ?? '').trim())
    .filter(n => n !== '')
);

// const optionsForImprovement = (currentValue: string) =>
//   improvements.value.filter(o => o.value === currentValue || !selectedImprovementNames.value.includes(o.value));

const flipped = ref(false);

const selectedMight = ref<ThemeMight>(props.theme.isFellowship || props.theme.isLoadout ? 'Self' : props.theme.might);

const clearTheme = (tag:Tag) => {
  tag.checked = false;
  tag.burnt = false;
};

const types = computed(() => {
  const list = [...spine.themes[selectedMight.value].types, ...spine.themes['Variable'].types];
  return list.map(t => ({ value: t, label: t }));
});

watch(selectedMight, (newMight) => {
  if (!props.theme.isFellowship && !props.theme.isLoadout && newMight !== props.theme.might) {
    themes.updateTheme({ _id: props.theme._id, might: newMight, themebook: '' });
  }
});

const scratchPower = (power:Tag) => {
  //power.checked = !power.burnt;
};

const visiblePowers = computed(() => {
  const limit = props.theme.isLoadout ? props.visibleLoadout : props.visiblePowers;
  return powers.value.filter((p, index) => {
    if (index < limit) return true;
    else { return powers.value[index-1].name.trim() !== '' || p.name.trim() !== '' }
  });
});

const visibleWeaknesses = computed(() => {
  return weaknesses.value.filter((w, index) => {
    if (index < props.visibleWeaknesses) return true;
    else { return weaknesses.value[index-1].name.trim() !== '' || w.name.trim() !== '' }
  });
});

const visibleTags = computed(() => {
  if(props.theme.isLoadout) return visiblePowers.value;
  else return [...visiblePowers.value, ...visibleWeaknesses.value];
});

const showScrollbar = computed(() => {
  if(props.theme.isLoadout) return true;
  const limit = props.theme.isLoadout ? props.visibleLoadout : props.visiblePowers;
  return (visiblePowers.value.length > limit);
});

const scrollAreaHeight = computed(() => {
  const rows = props.theme.isLoadout ? props.visibleLoadout : props.visiblePowers+props.visibleWeaknesses;
  const gaps = Math.max(rows - 1, 0);
  return `calc(30px * ${rows} + 5px * ${gaps} + 1px)`;
});

const questLabel = computed(() => {
  const map = {
    'Self': 'Identity',
    'Mythos': 'Ritual',
    'Noise': 'Itch'
  };
  if (props.theme.isFellowship || props.theme.isLoadout) return 'Motivation';
  else return map[props.theme.might as ThemeMight];
});

const colorPalette = computed(() => {
  if(props.theme.isFellowship) return 'fellowship';
  else if(props.theme.isLoadout) return 'loadout';
  return selectedMight.value.toLowerCase();
});

const cardType = computed(() => {
  if(props.theme.isFellowship) return 'crew';
  else if(props.theme.isLoadout) return 'loadout';
  return 'theme';
});

const cardTheme = computed(() => {
  if(props.theme.isFellowship) return 'crew';
  else if(props.theme.isLoadout) return 'loadout';
  return props.theme.might.toLowerCase();
});

const {
  scroll,
  isScrollAtEnd,
  isScrollNotAtStart,
  resetScrollState,
  syncScrollState,
  scrollEvents
} = useOverlayScrollArea();

watch([showScrollbar, visibleTags], async ([hasScrollbar]) => {
  if (!hasScrollbar) {
    resetScrollState();
    return;
  }

  await nextTick();
  syncScrollState();
}, { immediate: true });
</script>

<style lang="scss" scoped>
  .themecard--self {
    --color-palette-default: var(--color-self);
    --color-palette-highlight: var(--color-self-highlight);
    --color-palette-dark: var(--color-self-dark);
  }
  .themecard--mythos {
    --color-palette-default: var(--color-mythos);
    --color-palette-highlight: var(--color-mythos-highlight);
    --color-palette-dark: var(--color-mythos-dark);
  }
  .themecard--noise {
    --color-palette-default: var(--color-noise);
    --color-palette-highlight: var(--color-noise-highlight);
    --color-palette-dark: var(--color-noise-dark);
  }
  .themecard--fellowship {
    --color-palette-default: var(--color-fellowship);
    --color-palette-highlight: var(--color-fellowship-highlight);
    --color-palette-dark: var(--color-fellowship-dark);
  }
  .themecard--loadout {
    --color-palette-default: var(--color-loadout);
    --color-palette-highlight: var(--color-loadout-highlight);
    --color-palette-dark: var(--color-loadout-dark);
  }
  .card {
    width: var(--card-width);
    height: var(--card-height);
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
  .taglist {
    margin-top: -4px;
  }
  .fellowship-table {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .quest-progress {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin-top: 10px;
    &--loadout {
      grid-template-columns: 1fr;
    }
    .title {
      font-size: var(--font-size-xsmall);
    }
  }
  .theme-meta {
    &__book {
      display: grid;
      grid-template-columns: min-content 1fr;
      gap: 10px;
      justify-content: center;
      padding: 6px 0 0 0;
    }
    &__mights {
      display: flex;
      gap: 3px;
      justify-content: center;
      input:hover + .svg-icon {
        fill: rgb(var(--color-palette-foreground) / 0.5);
      }
      input:checked + .svg-icon { 
        fill: rgb(var(--color-palette-highlight));
      }
    }
    .image-toggle {
      width: 18px;
      height: 18px;
    }
    .svg-icon {
      width: 18px;
      height: 18px;
      fill: rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
    }
    .select-input {
      min-height: 21px;
    }
  }
  .theme-tag {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    align-items: center;
    position: relative;
    height: 30px;
    .power-toggle, .weakness-toggle {
      opacity: 0!important;
    }
    .text-input {
      width: calc(100% - 15px);
    }
    &:deep(.text-input) {
      input {
        border-bottom: 0!important;
      }
    }
    &--loadout {
      grid-template-columns: min-content 1fr min-content min-content;
      .text-input {
        width: calc(100% - 5px);
      }
    }
    &:has(.broken-toggle.broken) {
      .text-input {
        width: calc(100% + 16px);
      }
    }
  }
  .burnt-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    transition: opacity ease 0.2s;
    opacity: 1;
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
  .broken-toggle {
    height: calc(var(--toggle-size) - 2px);
    width: calc(var(--toggle-size) - 2px);
    margin-right: 5px;
    position: relative;
    transition: left ease 0.2s;
    left: 0;
    &:not(:empty):after {
      width: 40%;
      height: 40%;
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgb(var(--color-palette-background));
      z-index: 1;
    }
    input {
      z-index: 3;
    }
    &.broken {
      left: 21px;
    }
    .svg-icon {
      width: 100%;
      height: 100%;
      fill: rgb(var(--color-palette-foreground));
      z-index: 2;
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
  }
  .power-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: #CCC;
      opacity: 0.65;
    }
    &:has(input:checked) {
      .svg-icon {
        fill: var(--color-positive);
        opacity: 1;
      }
    }
    &:has(input:disabled) {
      opacity: 0.35;
      input { cursor: not-allowed; }
    }
  }
  .weakness-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    border-radius: 3px;
    .svg-icon {
      width: 8px;
      height: 8px;
      fill: var(--color-negative);
      opacity: 0.5;
    }
    &:has(input:checked) {
      background-color: var(--color-negative);
      .svg-icon {
        opacity: 1;
      }
    }
    &:has(input:disabled) {
      opacity: 0.35;
      input { cursor: not-allowed; }
    }
  }
  .improvement-list {
    gap: 12px;
  }
  .smart-textarea.improvement {
    min-height: auto;
    height: 44px;
  }
  .card__body--fellowship {
    .smart-textarea.improvement {
      min-height: auto;
      height: 41px;
    }
  }
  .card__side--back {
    .card__body--fellowship {
      padding-top: 0;
    }
  }
  .theme-powers {
    .taglist:not(.taglist--loadout) .tag-box:first-child {
      :deep(.theme-tag) {
        input {
          font-family: var(--font-family-title);
          font-size: var(--font-size-large);
          font-weight: bold;
        }
      }
    }
  }
  .quest-progress-item {
    .title {
      font-size: 10px;
      font-family: var(--font-family-body);
    }
  }
  .theme-powers {
    min-height: 229px;
  }
  .card__body--fellowship {
    .theme-powers {
      min-height: 252px;
    }
  }
  .scroll-area {
    height: v-bind(scrollAreaHeight);
    width: calc(100% + 7px);
    padding: 5px 7px 0 0;
    box-sizing: border-box;
    margin-top: -5px;
    max-height: 427px;
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
  }
  .notes {
    min-height: auto;
    height: 50px;
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
  .tags {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .card__header-separator {
    height: 1px;
    background-color: rgb(var(--color-palette-default) / var(--color-palette-disabled));
    margin-top: 9px;
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
</style>