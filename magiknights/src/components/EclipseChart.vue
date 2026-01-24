<script setup>
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();

// Method to toggle between two image states for moons
// Toggling a moon also sets/clears the burnout state on the corresponding blip
const cycleMoonState = (index) => {
  const newMoonState = (sheet.eclipse[index] + 1) % 2;
  sheet.eclipse[index] = newMoonState;
  if (newMoonState === 1) {
    sheet.eclipse_blips[index] = 3; // Lock corresponding blip to burnout
  } else {
    sheet.eclipse_blips[index] = 0; // Unlock corresponding blip
  }
};

// Function to get the correct moon image based on its state
const getMoonImage = (index) => {
  const moonState = sheet.eclipse[index]; // Get the current state of the moon
  return moonState === 0
    ? `--moon${index + 1}Image` // Default moon image
    : `--xmoon${index + 1}Image`; // Clicked state moon image
};

// Method to cycle blip states: empty -> trauma -> corruption -> empty
// Blips in burnout state (3) are locked and cannot be changed
const cycleBlipState = (index) => {
  const currentBlip = sheet.eclipse_blips[index];
  if (currentBlip === 3) return; // Burnout is locked by moon state
  sheet.eclipse_blips[index] = (currentBlip + 1) % 3;
};

const getBlipImage = (index) => {
  const blipState = sheet.eclipse_blips[index]; // Access the current state of the blip
  switch (blipState) {
    case 0:
      return '--blipImage'; // Reference the blip image CSS variable
    case 1:
      return '--blipSelectedImage'; // Reference the blip image CSS variable
    case 2:
      return '--blipXImage'; // Reference the X image CSS variable
    case 3:
      return '--blipScratchedImage'; // Reference the scratched image CSS variable
    default:
      return '--blipImage'; // Default image (fallback)
  }
};

const getBlipTitle = (index) => {
  const blipState = sheet.eclipse_blips[index];
  const traumaTotal = sheet.trauma + sheet.corruptionCount + sheet.burnoutLines;
  switch (blipState) {
    case 1:
      return `Trauma: ${traumaTotal}/8`;
    case 2:
      return `Corruption: ${sheet.corruptionCount}/8`;
    case 3:
      return 'This Lunar Blip has been burned out.\nThe capacity for this Magi-Knight to endure trauma has been reduced.';
    default:
      return `Trauma: ${traumaTotal}/8\nCorruption: ${sheet.corruptionCount}/8\nBurnout Lines: ${sheet.burnoutLines}/8`;
  }
};

const getMoonTitle = () => {
  const marked = sheet.eclipse.filter(m => m === 1).length;
  return `Burnout Lines: ${marked}/8`;
};

</script>

<template>
<div class="eclipse-container" :style="`--_phase:${sheet.eclipse_phase}`">
  <div class="eclipse-grid">
    <span class="eclipse-label" v-html="sheet.eclipse_phase" :title="`Trauma: ${sheet.trauma + sheet.corruptionCount + sheet.burnoutLines}/8\nCorruption: ${sheet.corruptionCount}/8\nBurnout Lines: ${sheet.burnoutLines}/8`"></span>
    <!-- Moons: Toggle between two states -->
    <input
      type="checkbox"
      :class="`moon moon-${num}`"
      v-for="num in [1,2,3,4,5,6,7,8]"
      @click="cycleMoonState(num - 1)"
      :key="`eclipse-moon-${num}`"
      :checked="sheet.eclipse[num - 1] === 1"
      :title="getMoonTitle()"
      :style="{
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `var(${getMoonImage(num - 1)})`
    }"
    />
  </div>
  
  <div class="eclipse-grid">
    <input
      type="checkbox"
      :class="`blip blip-${num}`"
      v-for="num in [1,2,3,4,5,6,7,8]"
      @click="cycleBlipState(num - 1)"
      :key="`eclipse-blip-${num}`"
      :title="getBlipTitle(num - 1)"
      :style="{
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `var(${getBlipImage(num - 1)})`
      }"
    />
  </div>
</div>
</template>

<style lang="scss">
/* Styles remain the same */
.eclipse-container{
  container: eclipse-container / size;
  display: grid;
  grid-template-areas: 'content';
  place-items: center;
  isolation: isolate;
  > *{
    grid-area: content;
  }
}

.eclipse-grid{
  --_size: clamp(35px,15cqmin,60px);
  --_borderWidth: 5cqmin;
  --_offset: calc(50cqmin - var(--_size) / 2 - var(--_borderWidth));
  --_padding: calc(var(--_size) + var(--_borderWidth));
  display: grid;
  grid-template-areas: 'content';
  place-items: center;
  place-self: stretch;
  padding:var(--_padding);
  background: {
    image: var(--eclipseBorder);
    repeat: no-repeat;
    position:center;
    size: contain;
  };
  > *{
    grid-area: content;
  }
}

.moon{
  width: calc(var(--_size) * 1.4);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: {
    size: contain;
    repeat: no-repeat;
    position: center;
    image: var(--_phaseRef);
  };
  transform: translate(
    calc(cos(var(--_degrees)) * var(--_offset) * 0.85),
    calc(sin(var(--_degrees)) * var(--_offset) * 0.85)
  );

  &:not(:checked){
    filter:opacity(1);
  }
  
  $circleNum: 8;
  @for $num from 0 to $circleNum{
    &:nth-of-type(#{$num + 1}){
      --_degrees: calc((#{$num} * 360deg / #{$circleNum}) - 45deg);
    }
  }
}

.blip{
  width: calc(var(--_size) * 0.6);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border-color: black;
  background: {
    size: contain;
    repeat: no-repeat;
    position: center;
    image: var(--_phaseRef);
  };
  transform: translate(
    calc(cos(var(--_degrees)) * var(--_offset) * 1.275),
    calc(sin(var(--_degrees)) * var(--_offset) * 1.275)
  );

  &:not(:checked){
    filter:opacity(1);
  }

  $circleNum: 8;
  @for $num from 0 to $circleNum{
    &:nth-of-type(#{$num + 1}){
      --_degrees: calc((#{$num} * 360deg / #{$circleNum}) - 45deg);
    }
  }
}

.eclipse-label{
  text-align: center;
  position: relative;
  z-index: 1;
}
</style>
