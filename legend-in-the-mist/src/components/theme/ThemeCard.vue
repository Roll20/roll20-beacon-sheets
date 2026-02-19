<template>
  <div :class="['themecard', 'card', 'card--double-sided', `themecard--${selectedMight.toLowerCase()}`]" :data-flipped="flipped">
    <div class="card__container">
      <div class="card__side card__side--front">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title" v-if="theme.isFellowship">
            Fellowship<br/>Theme Card
            <SvgIcon class="decorator" icon="Campfire" />
          </h2>
          <h2 class="title" v-else>Theme Card</h2>
        </div>
        <div class="card__body" :class="{ 'card__body--fellowship': theme.isFellowship }">
          <div class="card__section theme-meta" v-if="!theme.isFellowship">
            <div class="theme-meta__mights break-padding">
              <div class="theme-might image-toggle" v-for="might in spine.themeMights" :key="might">
                <input type="radio" :name="`theme-might-${theme._id}`" :value="might" v-model="selectedMight"/>
                <SvgIcon :icon="might" />
              </div>
            </div>
            <div class="theme-meta__book">
              <span class="title">Type</span>
              <SelectInput v-model="theme.themebook" :allowCustom="true" :options="types" />
            </div>
          </div>
          <div class="card__section theme-powers">
            <component :is="showScrollbar ? OverlayScrollbarsComponent : 'div'" 
              :defer="showScrollbar ? true : undefined"
              :options="showScrollbar ? { scrollbars: { autoHide: 'move' } } : undefined"
              :class="showScrollbar ? 'scroll-area' : ''">
              <div class="list taglist">
                <div class="theme-tag" v-for="power in visiblePowers" :key="power._id">
                  <div class="power-toggle image-toggle">
                    <input type="checkbox" v-model="power.checked" :disabled="power.name.trim() === '' || power.scratched">
                    <SvgIcon icon="Power"/>
                  </div>
                  <TextInput v-model="power.name" @clear="clearTheme(power)" :class="{ 'line-through': power.scratched }" />
                  <div class="scratched-toggle image-toggle">
                    <input type="checkbox" v-model="power.scratched" :disabled="power.name.trim() === ''" @click="scratchPower(power)">
                    <SvgIcon icon="Scratched"/>
                  </div>
                </div>
              </div>
            </component>
          </div>
          <div class="card__section theme-weaknesses">
            <div class="list">
              <div class="theme-tag" v-for="weakness in weaknesses" :key="weakness._id">
                <div class="weakness-toggle image-toggle">
                  <input type="checkbox" v-model="weakness.checked" :disabled="weakness.name.trim() === ''">
                  <SvgIcon icon="Weakness"/>
                </div>
                <TextInput v-model="weakness.name" @clear="clearTheme(weakness)"/>
              </div>
            </div>
          </div>
          <div class="card__section theme-quest">
            <h3 class="title break-padding">Quest</h3>
             <textarea v-model="theme.quest.description" class="smart-textarea notes"></textarea>
             <div class="quest-progress">
                <div class="quest-progress-item" v-for="progress in ['Abandon', 'Improve', 'Milestone']" :key="progress">
                  <RangeBar v-model="theme.quest[progress.toLowerCase() as QuestImprovement]" :max="3" />
                  <span class="title">{{ progress }}</span>
                </div>
             </div>
          </div>
        </div>
        <div class="card__footer">
          <LegendsInTheMist />
        </div>
      </div>
      <div class="card__side card__side--back">
        <div class="card__header" @click="flipped = !flipped">
          <h2 class="title" v-if="theme.isFellowship">
            Fellowship<br/>Theme Card
            <SvgIcon class="decorator" icon="Campfire" />
          </h2>
          <h2 class="title" v-else>Theme Card</h2>
        </div>
        <div class="card__body" :class="{ 'card__body--fellowship': theme.isFellowship }">
          <div class="card__section theme-improvements">
            <h3 class="title break-padding">Special Improvements</h3>
            <div class="list improvement-list">
              <template  v-for="improvement in theme.specialImprovements" :key="improvement._id" >
                <div class="improvement-item">
                  <div class="improvement__title">
                    <div class="improvement-toggle image-toggle">
                      <input type="checkbox" v-model="improvement.checked" />
                      <SvgIcon icon="Check"/>
                    </div>
                    <TextInput v-model="improvement.name" placeholder="Improvement"/>
                  </div>
                  <textarea v-if="improvement.checked" v-model="improvement.description" class="smart-textarea improvement" placeholder="Description"></textarea>
                </div>
              </template>
              <!-- <template  v-for="improvement in theme.specialImprovements" :key="improvement._id" >
                <TextInput v-if="optionsForImprovement(improvement.name).length === 0 || (improvement.name && !improvements.find(imp => imp.value === improvement.name))" v-model="improvement.name" />
                <SelectInput v-else v-model="improvement.name" :options="optionsForImprovement(improvement.name)" showClearWhen="hover"/>
              </template> -->
              <!-- <AutoCompleteInput v-for="improvement in theme.specialImprovements" :key="improvement._id" v-model="improvement.name" :options="optionsForImprovement(improvement.name)" /> -->
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
import { computed, ref, watch } from 'vue';
import TextInput from '../shared/TextInput.vue';
import RangeBar from '../shared/RangeBar.vue';
import SelectInput from '../shared/SelectInput.vue';
import { spine } from '@/spine/spine';
import { themesStore, type Theme, type ThemeMight, type QuestImprovement, type Tag } from '@/sheet/stores/themes/themesStore';
import SvgIcon from '../shared/SvgIcon.vue';
import LegendsInTheMist from '../logo/LegendsInTheMist.vue';
import SonsOfOak from '../logo/SonsOfOak.vue';
import AutoCompleteInput from '../shared/AutoCompleteInput.vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

const props = withDefaults(defineProps<{
  theme: Theme;
}>(), {
});

const themes = themesStore();
const powers = computed(() => props.theme.tags.filter(tag => tag.type === 'Power'));
const weaknesses = computed(() => props.theme.tags.filter(tag => tag.type === 'Weakness'));
const improvements = computed(() => {
  const source = props.theme.isFellowship ? 'Fellowship' : (props.theme.might as ThemeMight);
  return [...spine.themes[source].improvements, ...spine.themes['Variable'].improvements]
    .map(imp => ({ value: imp, label: imp }));
});

const selectedImprovementNames = computed(() =>
  (props.theme.specialImprovements ?? [])
    .map(i => (i.name ?? '').trim())
    .filter(n => n !== '')
);

const optionsForImprovement = (currentValue: string) =>
  improvements.value.filter(o => o.value === currentValue || !selectedImprovementNames.value.includes(o.value));

const flipped = ref(false);

const selectedMight = ref<ThemeMight>(props.theme.isFellowship ? 'Origin' : props.theme.might);

const clearTheme = (tag:Tag) => {
  tag.checked = false;
  tag.scratched = false;
};

const types = computed(() => {
  const list = [...spine.themes[selectedMight.value].types, ...spine.themes['Variable'].types];
  return list.map(t => ({ value: t, label: t }));
});

watch(selectedMight, (newMight) => {
  if (!props.theme.isFellowship && newMight !== props.theme.might) {
    themes.updateTheme({ _id: props.theme._id, might: newMight, themebook: '' });
  }
});

const scratchPower = (power:Tag) => {
  //power.checked = !power.scratched;
};

const visiblePowers = computed(() => {
  if (props.theme.isFellowship) {
    return powers.value;
  }
  return powers.value.filter((p, index) => {
    if (index < 10) return true;
    else { return powers.value[index-1].name.trim() !== '' || p.name.trim() !== '' }
  });
});

const showScrollbar = computed(() => {
  return (!props.theme.isFellowship && visiblePowers.value.length > 10);
});
</script>

<style lang="scss" scoped>
  .themecard--origin {
    --color-themecard-title-box: var(--color-origin);
    --color-themecard-line: #e1e6e3;
  }
  .themecard--adventure {
    --color-themecard-title-box: var(--color-adventure);
    --color-themecard-line: #e8dbdb;
  }
  .themecard--greatness {
    --color-themecard-title-box: var(--color-greatness);
    --color-themecard-line: #e6e6ea;
  }
  .card {
    width: 184px;
    height: var(--card-height);
    --color-textinput-line: var(--color-themecard-line);
    --color-section-title-background: var(--color-themecard-line);
    --color-rangebar-border: var(--color-themecard-title-box);
    --color-textarea: var(--color-section-title-background);
    --color-textarea-hover: var(--color-themecard-title-box);
    --color-logo: rgba(0, 0, 0, 0.5);
    &__side {
      background-color: var(--color-themecard-background);
      border: 2px solid rgba(0,0,0,0);//var(--color-themecard-border);
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: min-content 1fr min-content;
    }
    &__header {
      background-color: var(--color-themecard-title-box);
      color: var(--color-themecard-title);
      padding: 5px 0;
      .decorator {
        fill: var(--color-themecard-title)!important;
      }
    }
     &__footer {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--color-themecard-title-box);
      height: 30px;
    }
    &__body {
      padding: 0 5px 5px 5px;
      display: flex;
      flex-direction: column;
      gap: 10px;
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
    grid-template-columns: repeat(3, 1fr);
    margin-top: 10px;
    .title {
      font-size: var(--font-size-small);
    }
  }
  .theme-meta {
    &__mights {
      background-color: var(--color-themecard-line);
      display: flex;
      gap: 10px;
      justify-content: center;
      padding: 3px 0;
      input:checked + .svg-icon {
        fill: var(--color-themecard-title-box);
      }
    }
    .image-toggle {
      width: 18px;
      height: 18px;
    }
    .svg-icon {
      width: 18px;
      height: 18px;
      fill: white;
    }
    &__book {
      display: grid;
      grid-template-columns: min-content 1fr;
      align-items: baseline;
      gap: 3px;
    }
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
  .weakness-toggle {
    height: var(--toggle-size);
    width: var(--toggle-size);
    background-color: #d7c8bd;
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
        fill: white;
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
    height: 46px;
  }
  .card__body--fellowship {
    padding-top: 17px;
    .smart-textarea.improvement {
      min-height: auto;
      height: 43px;
    }
  }
  .card__side--back {
    .card__body--fellowship {
      padding-top: 0;
    }
  }
  .theme-powers {
    .taglist {
      :deep(.theme-tag:first-child) {
        input {
          font-size: var(--font-size-xlarge);
          //font-weight: bold;
        }
      }
    }
  }
  .quest-progress-item {
    .title {
      font-size: 10px;
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
    height: 229px;
    width: calc(100% + 7px);
    padding-right: 7px;
    box-sizing: border-box;
  }
  .notes {
    min-height: auto;
    height: 48px;
  }
  .improvement-toggle {
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
      background-color: var(--color-themecard-title-box);
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
</style>
<style>
  .os-scrollbar.os-scrollbar-vertical {
    .os-scrollbar-track {
      .os-scrollbar-handle {
        width: 3px;
      }
    }
  }
</style>