<template>
  <nav class="tof-panel steptabs">
    <button
      v-for="step in steps"
      :key="step"
      class="steptab"
      :class="{
        'steptab--active': step === store.currentStep,
        'steptab--done': store.stepComplete(step) && step !== store.currentStep,
        'steptab--error': visited(step) && store.stepHasError(step) && step !== store.currentStep,
      }"
      @click="store.visit(step)"
    >
      <span class="steptab__node" />
      <span class="steptab__label">{{ STEP_LABELS[step] }}</span>
      <span v-if="store.stepComplete(step) && step !== store.currentStep" class="steptab__mark"
        >✦</span
      >
      <span v-else-if="visited(step) && store.stepHasError(step)" class="steptab__mark tof-warn"
        >!</span
      >
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useDraftStore } from '@/maker/store/draftStore';
import { STEP_ORDER, STEP_LABELS } from '@/maker/draftModel';
import type { CharacterMakerStep } from '@/maker/types';

const store = useDraftStore();
const steps = STEP_ORDER;
const visited = (step: CharacterMakerStep) => store.draft.visitedSteps.includes(step);
</script>

<style scoped lang="scss">
.steptabs {
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.steptab {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: transparent;
  border: none;
  color: var(--tof-cream);
  font-family: var(--tof-font-subheading);
  font-size: 0.95rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, box-shadow 0.2s ease;
}
.steptab:hover {
  background: rgba(235, 167, 46, 0.12);
  box-shadow: 0 0 10px rgba(235, 167, 46, 0.2);
}
.steptab__node {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}
.steptab__label {
  flex: 1;
}
.steptab__mark {
  font-size: 0.85rem;
  color: var(--tof-gold);
}
.steptab--active {
  background: rgba(235, 167, 46, 0.18);
}
.steptab--active .steptab__node {
  background: var(--tof-gold);
  box-shadow: 0 0 12px var(--tof-gold);
}
.steptab--done .steptab__node {
  background: #9fe0a6;
  box-shadow: 0 0 10px #9fe0a6;
}
.steptab--error .steptab__node {
  background: var(--tof-accent-red-bright);
  box-shadow: 0 0 10px var(--tof-accent-red-bright);
}
</style>
