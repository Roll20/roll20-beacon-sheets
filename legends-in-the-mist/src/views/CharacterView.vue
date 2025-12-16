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
.sheet {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  &__cards {
    display: grid;
    grid-template-columns: 184px repeat(v-bind(numberOfCards), 1fr);
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.35));
    .card-slot {
      position: relative;
      height: 460px;
      width: 100%;
      .card {
        position: absolute;
        top: 0;
        right: 0;
      }
      &:hover, &:focus-within {
        z-index: calc(v-bind(numberOfCards) + 1)!important;
      }
      &:not(:last-child) {
        .card__side {
          box-shadow: 10px 0px 30px rgba(0, 0, 0, 0.65);
        }
      }
    }
  }
  &__trackers {
    display: flex;
    gap: 20px;
  }
  &__add-tracker {
    border: 2px dashed #a4b5a6;
    width: 184px;
    height: 71px;
    background: none;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #a4b5a6;
    gap: 5px;
    .svg-icon {
      width: 12px;
      height: 12px;
      fill: #a4b5a6;
    }
    cursor: pointer;
    &:hover {
      border-style: solid;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
  }
  .trackingchip + &__add-tracker {
    width: 71px;
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
  }
}
@media (min-width: 1150px) {
  .sheet {
    &__cards {
      .card-slot {
        &:not(:last-child) {
          .card__side {
            box-shadow: none
          }
        }
      }
    }
  }
}
</style>
