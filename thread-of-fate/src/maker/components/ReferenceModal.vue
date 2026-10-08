<template>
  <transition name="tof-fade">
    <div v-if="open" class="refmodal" @click.self="$emit('close')">
      <div class="refmodal__panel tof-panel">
        <button class="refmodal__close" @click="$emit('close')" aria-label="Close">x</button>
        <h2 class="tof-h2" style="margin-top: 0">Rules Reference</h2>
        <div class="reftabs">
          <button
            v-for="s in REFERENCE_SECTIONS"
            :key="s.id"
            class="tof-btn tof-btn--ghost tof-small"
            :class="{ 'tof-btn--primary': active === s.id }"
            @click="active = s.id"
          >
            {{ s.title }}
          </button>
        </div>
        <div class="refbody">
          <div v-for="e in activeEntries" :key="e.name" class="refentry">
            <strong>{{ e.name }}</strong>
            <p class="tof-small tof-muted">{{ e.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { REFERENCE_SECTIONS } from '@/maker/data/reference';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const active = ref(REFERENCE_SECTIONS[0].id);
const activeEntries = computed(
  () => REFERENCE_SECTIONS.find((s) => s.id === active.value)?.entries ?? [],
);
</script>

<style scoped lang="scss">
.refmodal {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(8, 6, 14, 0.78);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.refmodal__panel {
  position: relative;
  width: min(760px, 96vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
}
.refmodal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--tof-accent-blue);
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}
.refmodal__close:hover {
  color: var(--tof-cream);
}
.reftabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin: 0.5rem 0 0.75rem;
}
.refbody {
  overflow-y: auto;
  padding-right: 0.5rem;
}
.refentry {
  padding: 0.35rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.refentry strong {
  color: var(--tof-gold);
}
</style>
