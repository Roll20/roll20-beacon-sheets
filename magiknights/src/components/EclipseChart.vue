<script setup>
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();

// Method to toggle between two image states for moons
const cycleMoonState = (index) => {
  const currentMoon = sheet.eclipse[index];
  sheet.eclipse[index] = (currentMoon + 1) % 2; // Toggle between 0 and 1
};

// Function to get the correct moon image based on its state
const getMoonImage = (index) => {
  const moonState = sheet.eclipse[index]; // Get the current state of the moon
  return moonState === 0
    ? `--moon${index + 1}Image` // Default moon image
    : `--xmoon${index + 1}Image`; // Clicked state moon image
};

// Method to toggle between three image states for blips
const cycleBlipState = (index) => {
  const currentBlip = sheet.eclipse_blips[index];
  sheet.eclipse_blips[index] = (currentBlip + 1) % 4;
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

</script>

<template>
<div class="eclipse-container" :style="`--_phase:${sheet.eclipse_phase}`">
  <div class="eclipse-grid">
    <span class="eclipse-label" v-html="sheet.eclipse_phase"></span>
    <!-- Moons: Toggle between two states -->
    <input
      type="checkbox"
      :class="`moon moon-${num}`"
      v-for="num in [1,2,3,4,5,6,7,8]"
      @click="cycleMoonState(num - 1)"
      :key="`eclipse-moon-${num}`"
      :checked="sheet.eclipse[num - 1] === 1"
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
}
</style>
