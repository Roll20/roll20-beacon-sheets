<template>
  <div class="doll">
    <!-- Silhouette: each region lights gold when an item is equipped there -->
    <svg
      class="doll__fig"
      viewBox="0 0 200 470"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g class="fig">
        <circle class="part" :class="{ lit: lit('head') }" cx="100" cy="44" r="27" />
        <path class="part" :class="{ lit: lit('torso') }" d="M88 68 h24 v14 h-24 z" />
        <path
          class="part"
          :class="{ lit: lit('torso') }"
          d="M70 82 q30 -8 60 0 l8 96 q-38 16 -76 0 z"
        />
        <path
          class="part"
          :class="{ lit: lit('arms', 'mainhand') }"
          d="M70 86 l-22 92 8 4 26 -86 z"
        />
        <path
          class="part"
          :class="{ lit: lit('arms', 'offhand') }"
          d="M130 86 l22 92 -8 4 -26 -86 z"
        />
        <circle class="part" :class="{ lit: lit('hands', 'mainhand') }" cx="50" cy="186" r="9" />
        <circle class="part" :class="{ lit: lit('hands', 'offhand') }" cx="150" cy="186" r="9" />
        <path
          class="part"
          :class="{ lit: lit('hips') }"
          d="M64 178 q36 16 72 0 l-6 26 q-30 10 -60 0 z"
        />
        <path class="part" :class="{ lit: lit('legs') }" d="M70 204 l-6 150 16 0 12 -140 z" />
        <path class="part" :class="{ lit: lit('legs') }" d="M130 204 l6 150 -16 0 -12 -140 z" />
        <path class="part" :class="{ lit: lit('feet') }" d="M62 354 h20 v12 h-26 z" />
        <path class="part" :class="{ lit: lit('feet') }" d="M138 354 h-20 v12 h26 z" />
      </g>
    </svg>

    <button
      v-for="s in SLOTS"
      :key="s.name"
      class="slot"
      :class="{ 'slot--on': equipped[s.name], 'slot--r': s.side === 'r' }"
      :style="{ left: s.x + '%', top: s.y + '%' }"
      :title="equipped[s.name] ? `${equipped[s.name]} - click to unequip` : `${s.name} (empty)`"
      @click="equipped[s.name] && $emit('unequip', s.name)"
    >
      <span class="slot__icon">{{ s.icon }}</span>
      <span class="slot__body">
        <span class="slot__name">{{ s.name }}</span>
        <span class="slot__item">{{ equipped[s.name] || '-' }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EQUIP_SLOTS } from '@/maker/data/equipSlots';

const props = defineProps<{ equipped: Record<string, string> }>();
defineEmits<{ unequip: [slot: string] }>();

const SLOTS = EQUIP_SLOTS;

const litParts = computed(() => {
  const set = new Set<string>();
  for (const s of EQUIP_SLOTS) if (props.equipped[s.name]) set.add(s.part);
  return set;
});
const lit = (...parts: string[]) => parts.some((p) => litParts.value.has(p));
</script>

<style scoped lang="scss">
.doll {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  aspect-ratio: 3 / 4;
}
.doll__fig {
  position: absolute;
  left: 50%;
  top: 1%;
  transform: translateX(-50%);
  height: 92%;
  opacity: 0.9;
}
.part {
  fill: rgba(235, 167, 46, 0.06);
  stroke: rgba(235, 167, 46, 0.5);
  stroke-width: 1.5;
  transition: fill 0.25s, stroke 0.25s, filter 0.25s;
}
.part.lit {
  fill: rgba(235, 167, 46, 0.34);
  stroke: var(--tof-gold);
  filter: drop-shadow(0 0 5px rgba(235, 167, 46, 0.6));
}

.slot {
  position: absolute;
  width: 38%;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-align: left;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  cursor: default;
  color: var(--tof-cream);
}
.slot--r {
  flex-direction: row-reverse;
  text-align: right;
}
.slot--on {
  border-color: var(--tof-gold);
  background: rgba(235, 167, 46, 0.14);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(235, 167, 46, 0.25);
}
.slot__icon {
  font-size: 1.1rem;
  flex: 0 0 auto;
}
.slot__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.slot__name {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--tof-accent-blue);
}
.slot__item {
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.slot--on .slot__item {
  color: var(--tof-gold);
}
</style>
