<template>
  <svg class="lily" :width="size" :height="size * 1.6" viewBox="0 0 120 200" aria-hidden="true">
    <!-- stem -->
    <path
      :d="stem"
      stroke="url(#stemgrad)"
      :stroke-width="2.4"
      fill="none"
      stroke-linecap="round"
    />
    <defs>
      <linearGradient id="stemgrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#2f5226" />
        <stop offset="1" stop-color="#5b8f43" />
      </linearGradient>
    </defs>
    <g :transform="`translate(60 70)`">
      <!-- long curling stamens (behind petals) -->
      <g v-for="(s, i) in stamens" :key="'s' + i">
        <path
          :d="s.d"
          :stroke="petalDark"
          stroke-width="1"
          fill="none"
          stroke-linecap="round"
          opacity="0.95"
        />
        <circle :cx="s.tip[0]" :cy="s.tip[1]" r="1.7" :fill="anther" />
      </g>
      <!-- recurved petals -->
      <path
        v-for="(p, i) in petals"
        :key="'p' + i"
        :d="p"
        :stroke="petal"
        stroke-width="2.4"
        fill="none"
        stroke-linecap="round"
      />
      <!-- bright core -->
      <circle cx="0" cy="0" r="3.2" :fill="anther" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ size?: number; hue?: number }>(), { size: 46, hue: 354 });

const petal = computed(() => `hsl(${props.hue} 85% 52%)`);
const petalDark = computed(() => `hsl(${props.hue} 80% 42%)`);
const anther = computed(() => `hsl(${(props.hue + 6) % 360} 90% 75%)`);

const stem = 'M60,200 C 58,150 62,120 60,72';

// Build recurved petals + long arcing stamens radiating from the bloom origin (0,0).
function curl(angleDeg: number, len: number, recurve: number) {
  const a = (angleDeg * Math.PI) / 180; // 0 = straight up
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  // belly of the petal pushes outward, the tip recurves back & up
  const c1x = dx * len * 0.25;
  const c1y = dy * len * 0.3;
  const c2x = dx * len * 1.05;
  const c2y = dy * len * 0.55;
  const tipx = dx * len * (0.82 - recurve);
  const tipy = dy * len * (1.02 + recurve);
  return {
    d: `M0,0 C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(
      1,
    )} ${tipx.toFixed(1)},${tipy.toFixed(1)}`,
    tip: [tipx, tipy] as [number, number],
  };
}

const PETAL_ANGLES = [-78, -52, -26, 0, 26, 52, 78];
const petals = computed(() => PETAL_ANGLES.map((deg) => curl(deg, 40, 0.18).d));
const stamens = computed(() => [-66, -40, -14, 14, 40, 66].map((deg) => curl(deg, 62, -0.05)));
</script>

<style scoped>
.lily {
  display: block;
  overflow: visible;
}
</style>
