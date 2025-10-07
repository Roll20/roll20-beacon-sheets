<template>
  <div :class="classes">
    <div class="spell-header__level">
      <span>{{ level }}</span>
      <svg viewBox="0 0 79 155" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M23.976,25.316L60.206,56.736L60.206,98.26L23.976,129.676L18.794,124.799L18.794,30.192L23.976,25.316ZM23.634,8.439L6.265,24.777L6.265,130.211L23.634,146.557L72.735,103.976L72.735,51.019L23.634,8.439Z" style="fill-opacity:0.1;"/>
        <path d="M23.634,8.439L72.735,51.019L72.735,103.976L23.634,146.557L6.265,130.211L6.265,24.777L23.634,8.439ZM23.463,0L19.345,3.875L1.971,20.213L0,22.071L0,132.916L1.971,134.774L19.341,151.117L23.463,155L27.735,151.288L76.841,108.707L79,106.832L79,48.163L76.841,46.289L27.735,3.708L23.463,0Z"/>
      </g>
        <path id="v" d="M79,25.739L44.908,25.739L38.299,20.01L79,20.01L79,25.739ZM79,134.66L38.299,134.66L44.903,128.931L79,128.931L79,134.66Z"/>
      </svg>
    </div>
    <div class="spell-header__slots-total stretch" v-if="level > 0">
      <span>{{ calculatedSlotsTotal }}</span>
      <svg viewBox="0 0 70 155" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path id="v" d="M0,134.825L0,129.096L70,129.096L70,134.825L0,134.825ZM0,25.904L0,20.175L70,20.175L70,25.904L0,25.904Z"/>
      </svg>
    </div>
    <div class="spell-header__slots-divider">
      <svg viewBox="0 0 57 155" xmlns="http://www.w3.org/2000/svg">
        <path id="v" d="M0,25.904L0,20.175L56.993,20.175L56.993,25.904L18.217,25.904L24.98,34.417L56.993,34.417L56.993,36.912L56.205,36.912C55.001,37.271 45.196,40.492 38.038,50.85L48.546,64.075L48.546,90.937L38.046,104.15C45.205,114.508 55.001,117.725 56.213,118.083L56.993,118.083L56.993,120.579L24.992,120.579L18.226,129.096L56.993,129.096L56.993,134.825L0,134.825L0,129.096L0.951,129.096L30.28,93.354C29.284,90.058 28.588,86.379 28.267,82.3C26.005,81.821 24.271,79.904 24.271,77.5C24.271,75.092 26.005,73.179 28.263,72.692C28.588,68.604 29.284,64.921 30.28,61.621L0.971,25.904L0,25.904ZM33.321,54.125L10.901,25.904L4.201,25.904L31.234,58.846C31.867,57.171 32.563,55.6 33.321,54.125ZM31.23,96.133L4.18,129.096L10.905,129.096L33.33,100.875C32.563,99.396 31.863,97.821 31.23,96.133ZM42.817,66.075L34.971,56.2C32.83,60.683 31.263,66.15 30.751,72.787C32.78,73.425 34.288,75.258 34.288,77.5C34.288,79.737 32.784,81.567 30.755,82.208C31.267,88.846 32.834,94.317 34.976,98.804L42.817,88.937L42.817,66.075ZM36.496,106.1L26.976,118.083L50.138,118.083C46.23,115.958 40.942,112.242 36.496,106.1ZM26.967,36.912L36.488,48.9C40.938,42.762 46.226,39.042 50.138,36.912L26.967,36.912Z"/>
      </svg>
    </div>
    <div class="spell-header__slots-used stretch">
      <input type="number" v-model="spells.slots.used[props.level-1]" v-if="level > 0" />
      <span v-else>{{ $t(`titles.cantrips`) }}</span>
      <svg viewBox="0 0 70 155" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path id="v" d="M0,134.65L0,128.921L70,128.921L70,134.65L0,134.65ZM0,120.404L0,117.908L70,117.908L70,120.404L0,120.404ZM0,36.737L0,34.242L70,34.242L70,36.737L0,36.737ZM0,25.729L0,20L70,20L70,25.729L0,25.729Z"/>
      </svg>
    </div>
    <div class="spell-header__slots-tip">
      <svg viewBox="0 0 70 155" xmlns="http://www.w3.org/2000/svg">
        <path id="v" d="M70,46.142L70,108.858L44.033,134.825L-0,134.825L-0,129.096L6.925,129.096C13.883,127.85 23.013,125.392 32.167,120.579L-0,120.579L-0,118.083L36.275,118.083L36.275,118.246C47.3,111.55 57.875,101.137 64.271,85L64.271,70.417C57.792,54.079 47.029,43.604 35.854,36.912L-0,36.912L-0,34.417L31.362,34.417C21.342,29.3 11.437,26.967 4.446,25.904L-0,25.904L-0,20.175L44.033,20.175L70,46.142ZM64.271,62.679L64.271,48.521L41.654,25.904L18.583,25.904C33.971,30.592 53.075,40.737 64.271,62.679ZM64.271,106.483L64.271,92.754C53.392,114.067 35.033,124.242 19.892,129.096L41.654,129.096L64.271,106.483Z"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { computed } from 'vue';

const props = defineProps<{
  level: number;
  slotsTotal: number;
  slotsUsed: number;
}>();

const spells = useSpellsStore();

const classes = props.level > 0 ? ['spell-header'] : ['spell-header', 'spell-header--cantrips'];

const calculatedSlotsTotal = computed(() => {
  const slots = spells.getSlots;
  return slots.all[props.level-1] ?? 0;
});
</script>

<style lang="scss" scoped>
$originalHeight: 155px;
$originalWidth: 79px;
$targetWidth: 30px;
$ratio: $targetWidth / $originalWidth;
.spell-header {
  display: grid;
  grid-template-columns: $targetWidth 1fr calc(57px * $ratio) 1fr calc(70px * $ratio);
  height: calc(155px * $ratio);
  > div {
    position: relative; 
  }
  input, span {
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    line-height: calc(155px * $ratio);
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    box-sizing: border-box;
    font-size: var(--size-font-large);
    outline: none;
  }
  svg {
    width: 100%;
    height: auto;
    fill: var(--color-box);
  }
  .stretch {
    svg {
      width: calc(100% + 2px);
      margin-left: -1px;
      height: calc(155px * $ratio);
    }
  }
  &--cantrips {
    grid-template-columns: $targetWidth calc(57px * $ratio) 1fr calc(70px * $ratio);
  }
}
</style>