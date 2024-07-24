<script setup>
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();
</script>

<template>
<div class="eclipse-container" :style="`--_phase:${sheet.eclipse_phase}`">
  <div class="eclipse-grid">
    <span class='eclipse-label'>{{ sheet.eclipse_phase }}</span>
    <input type="checkbox" :class="`moon moon-${num}`" v-for="num in [1,2,3,4,5,6,7,8]" v-model="sheet.eclipse" :true-value="num" :false-value="0" :key="`eclipse-${num}`">
  </div>
</div>
</template>

<style lang="scss">
.eclipse-container{
  container: eclipse-container / size;
  display: grid;
  grid-template-areas: 'content';
  place-items: center;
  isolation: isolate;
  > *{
    grid-area: content;
  }
  // test code for generating dynamic terminator line
  // &:before{
  //   content: '';
  //   z-index: -1;
  //   grid-area: content;
  //   width: 100%;
  //   height: 100%;
  //   background: {
  //     image: conic-gradient(from 180deg at 50% 50%, #e3b7d6 0%, #3656a6 25%, #000 50%, #05030300 50%);
  //   }
  // }
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
  width: var(--_size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: {
    size: contain;
    repeat: no-repeat;
    position: center;
    image: var(--_phaseRef);
  };
  transform: translate(
    calc(cos(var(--_degrees)) * var(--_offset)),
    calc(sin(var(--_degrees)) * var(--_offset))
  );

  &:not(:checked){
    filter:opacity(0.7);
  }
  $circleNum: 8;
  @for $num from 0 to $circleNum{
    &:nth-of-type(#{$num + 1}){
      --_degrees: calc((#{$num} * 360deg / #{$circleNum}) - 45deg);
      --_phaseRef: var(--moon#{$num + 1}Image);
    }
  }
}
</style>