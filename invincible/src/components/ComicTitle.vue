<template>
  <svg
    ref="svgRef"
    xmlns="http://www.w3.org/2000/svg"
    class="comic-title"
    :style="{ height: `calc(${heightRatio} * 1em)` }"
    preserveAspectRatio="xMinYMid meet"
  >
    <g
      ref="groupRef"
      class="text-group"
    >
      
      <text class="bevel">{{ text }}</text>

      
      <text class="face" aria-hidden="true">{{ text }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

interface Props {
  text: string;
}

const props = defineProps<Props>();

const svgRef = ref<SVGSVGElement | null>(null);
const groupRef = ref<SVGGElement | null>(null);

const fontSize = 100;
const fontSizePx = `${fontSize}px`;
const extrusionStroke = 0.25;
const extrusionTranslateX = 0;
const extrusionTranslateY = 0.04;
const bevelTranslateY = -0.015;

const heightRatio = ref(1.2);

async function updateViewBox() {
  await nextTick();

  if (!svgRef.value || !groupRef.value) return;

  const box = typeof groupRef.value.getBBox === 'function'
    ? groupRef.value.getBBox()
    : { x: 0, y: 0, width: 100, height: 50 };

  
  const paddingLeft   = (extrusionTranslateX + extrusionStroke / 2) * fontSize;
  const paddingRight  = paddingLeft; 
  const paddingTop    = Math.max(0, -extrusionTranslateY + extrusionStroke / 2, -bevelTranslateY) * fontSize;
  const paddingBottom = Math.max(0, extrusionTranslateY + extrusionStroke / 2, bevelTranslateY) * fontSize;

  
  const safety = 2;
  const pL = paddingLeft + safety;
  const pR = paddingRight + safety;
  const pT = paddingTop + safety;
  const pB = paddingBottom + safety;

  const totalHeight = box.height + pT + pB;
  if (box.height > 0) {
    heightRatio.value = totalHeight / box.height;
  }

  svgRef.value.setAttribute(
    "viewBox",
    [
      box.x - pL,
      box.y - pT,
      box.width + pL + pR,
      totalHeight,
    ].join(" ")
  );
}

watch(() => props.text, updateViewBox);

onMounted(() => {
  updateViewBox();
  if (document.fonts) {
    document.fonts.ready.then(updateViewBox);
  }
});
</script>

<style scoped>
.comic-title {
  font-size: 56px;
  height: 1.2em;
  width: auto;
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
}

.text-group {
  
}

text {
  font-family: var(--font-anton);
  font-weight: 900;
  font-size: v-bind(fontSizePx);
  dominant-baseline: middle;
  text-anchor: start;

  letter-spacing: 0.02em;

  paint-order: stroke fill;
}

.bevel {
  transform: translate(0, 0.04em);
  fill: black;
  stroke: black;
  stroke-width: 0.25em;
}

.face {
  transform: translateY(-0.015em);
  fill: var(--color-primary);
  user-select: none;
  pointer-events: none;
}

svg text::selection {
  background: var(--color-primary-container);
}
</style>