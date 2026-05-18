<template>
  <div :class="`card-decoration card-decoration--${theme}`">
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  theme: string
}>()
</script>

<style lang="scss" scoped>
.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mask-image: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/decorations/hero.png');
  mask-size: cover;
  mask-repeat: no-repeat;
  mask-position: center;
  pointer-events: none;
  background-color: rgb(var(--color-palette-dark));
  mask-mode: luminance;
  z-index: 1;
  &--self, &--mythos, &--noise {
    mask-mode: alpha; 
    width: 130%;
    height: 130%;
    top: -15%;
    left: -15%;
  }
  &--self {
    mask-image: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/decorations/self.svg');
    opacity: 0.75;
  }
  &--mythos {
    mask-image: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/decorations/mythos.svg');
    opacity: 0.20;
  }
  &--noise {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    mask-image: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/decorations/noise.svg');
    opacity: 0.25;
  }
}
</style>