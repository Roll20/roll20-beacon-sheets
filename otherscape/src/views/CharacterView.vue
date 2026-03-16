<template>
  <div class="view view--character">
    <div class="sheet">
      <div class="sheet__cards">
        <div class="card-slot" :style="{ zIndex: themes.themes.length + 1 }">
          <HeroCard class="sheet__hero-card" />
        </div>
        <div v-for="(theme, index) in themes.themes" :key="theme._id" class="card-slot" :style="{ zIndex: themes.themes.length - index }">
          <ThemeCard :theme="theme" />
        </div>
      </div>
      <div class="sheet__trackers">
        <TrackingChip 
          v-for="tracker in trackers.trackers" 
          :key="tracker._id" 
          ref="trackerRefs"
          :tracker="tracker" 
        />
        <button class="sheet__add-tracker" type="button" @click="addTracker">
          <SvgIcon icon="Add" />
          <span v-if="trackers.trackers.length === 0" class="title">Add Tracker</span>
        </button>
      </div>
    </div>
    <div class="sheet__roller">
      <DiceRoller />
    </div>
  </div>
</template>

<script setup lang="ts">
import { sheetStore } from '@/sheet/stores';
import { themesStore } from '@/sheet/stores/themes/themesStore';
import { trackersStore } from '@/sheet/stores/trackers/trackersStore';
import HeroCard from '@/components/hero/HeroCard.vue';
import ThemeCard from '@/components/theme/ThemeCard.vue';
import TrackingChip from '@/components/tracking/TrackingChip.vue';
import DiceRoller from '@/components/roller/DiceRoller.vue';
import { nextTick, ref } from 'vue';
import SvgIcon from '@/components/shared/SvgIcon.vue';

const themes = themesStore();
const trackers = trackersStore();

sheetStore();

const numberOfCards = themes.themes.length;
const trackerRefs = ref<InstanceType<typeof TrackingChip>[]>([]);

const addTracker = async () => {
  trackers.updateTracker();
  
  await nextTick();
  
  const lastRef = trackerRefs.value[trackerRefs.value.length - 1];
  if (lastRef?.$el) {
    const input = lastRef.$el.querySelector('input[type="text"]');
    if (input) {
      input.focus();
    }
  }
};
</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;
.view--character {
  padding-bottom: 60px;
}
.sheet {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  &__cards {
    display: grid;
    grid-template-columns: var(--card-width) repeat(v-bind(numberOfCards), 1fr);
    width: 100%;
    &:has(.card-slot:hover) {
      .card-slot:not(:hover) {
        //transform: scale(0.95);
        .card__fader {
          opacity: 0.5;        
        }
      }
    }
    .card-slot {
      position: relative;
      height: var(--card-height);
      width: 100%;
      transform-origin: center center;
      transition: transform var(--card-transition-duration) ease;
      .card {
        position: absolute;
        top: 0;
        right: 0;
      }
      &:hover {
        z-index: calc(v-bind(numberOfCards) + 2)!important;
        transform: scale(1.05);
      }
      &:has(+ .card-slot:hover) {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      &:has(+ .card-slot + .card-slot:hover) {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      &:has(+ .card-slot + .card-slot + .card-slot:hover) {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      &:has(+ .card-slot + .card-slot + .card-slot + .card-slot:hover) {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      &:has(+ .card-slot + .card-slot + .card-slot + .card-slot + .card-slot:hover) {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      .card__side {
        .card__header, .card__body, .card__footer {
          z-index: 1;
        }
        &:before, &:after {
          content: '';
          position: absolute;
          top: 0;
          width: var(--card-shadow-size);
          height: 100%;
          mask-image: linear-gradient(
            180deg,rgb(var(--color-palette-shadow)/0) 0%,
            rgb(var(--color-palette-shadow)) calc(0% + var(--card-shadow-size)),
            rgb(var(--color-palette-shadow)) calc(100% - var(--card-shadow-size)),
            rgb(var(--color-palette-shadow)/0) 100%
          );
          transition: opacity var(--card-transition-duration) ease;
          opacity: 0.75;
          pointer-events: none;
        }
        &:before {
          left: calc(-1 * calc(var(--card-shadow-size) - 5px));
          background: linear-gradient(90deg,rgb(var(--color-palette-shadow)/0) 0%, rgb(var(--color-palette-shadow)) 100%);
        }
        &:after {
          right: calc(-1 * calc(var(--card-shadow-size) - 5px));
          background: linear-gradient(90deg,rgb(var(--color-palette-shadow)) 0%, rgb(var(--color-palette-shadow)/0) 100%);
        }
      }
      &:first-child {
        .card__side:before {
          display: none;
          content: none;
        }
      }
      &:last-child {
        .card__side:after {
          display: none;
          content: none;
        }
      }  
    }
  }
  &__trackers {
    display: flex;
    gap: 20px;
  }
  &__add-tracker {
    border: 2px dashed rgb(var(--color-herocard));
    width: var(--card-width);
    height: 79px;
    background: none;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    span {
      color: rgb(var(--color-herocard));
    }
    gap: 5px;
    .svg-icon {
      width: 12px;
      height: 12px;
      fill: rgb(var(--color-herocard));
    }
    cursor: pointer;
    &:hover {
      border: 2px solid rgb(var(--color-palette-highlight));
      box-shadow: 0 0 10px rgb(var(--color-palette-shadow) / 0.5);
      span {
        color: rgb(var(--color-palette-highlight));
      }
      color: rgb(var(--color-palette-highlight));
      .svg-icon {
        fill: rgb(var(--color-palette-highlight));
      }
    }
  }
  .trackingchip + &__add-tracker {
    width: 79px;
    .title {
      font-size: 36px;
      font-weight: bold;
      line-height: 36px;
    }
  }
  &__roller {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 9999;
  }
}
@media (min-width: #{vars.$sheet-width}) {
  .sheet {
    &__cards {
      .card-slot .card__side {
        &:before, &:after {
          opacity: 0;
        }
      }
      .card-slot:hover .card__side {
        &:before, &:after {
          opacity: 0.75;
        }
      }
    }
  }
}
</style>
