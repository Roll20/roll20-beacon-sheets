<template>
  <div class="tof-flowers" aria-hidden="true">
    <div
      v-for="(f, i) in flowers"
      :key="i"
      class="tof-flower"
      :style="{
        left: f.x + '%',
        bottom: f.bottom + 'px',
        zIndex: f.z,
        '--d': f.d + 's',
        '--sway': f.sway + 's',
        opacity: f.o,
      }"
    >
      <SpiderLily :size="f.size" :hue="f.hue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SpiderLily from './SpiderLily.vue';

/** A dense field of red spider lilies covering the whole bottom of the view. */
const COUNT = 80;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Three depth bands so the field reads as a thick, layered carpet of lilies.
const flowers = Array.from({ length: COUNT }, (_, i) => {
  // even horizontal spread with jitter so there are no gaps
  const x = (i / COUNT) * 108 - 4 + rand(-3, 3);
  const band = i % 3; // 0 = far/back, 1 = mid, 2 = near/front
  const back = band === 0;
  const front = band === 2;
  return {
    x,
    bottom: back ? rand(18, 42) : front ? rand(-34, -8) : rand(-6, 18),
    size: back ? rand(30, 42) : front ? rand(56, 84) : rand(42, 58),
    hue: rand(347, 359),
    d: rand(0, 5),
    sway: rand(4.5, 8),
    z: band,
    o: back ? 0.75 : 1,
  };
});
</script>

<style scoped lang="scss">
.tof-flower :deep(.lily) {
  filter: drop-shadow(0 0 5px rgba(228, 32, 46, 0.45));
}
</style>
