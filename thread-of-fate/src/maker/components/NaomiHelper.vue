<template>
  <div class="naomi">
    <transition name="naomi-bubble">
      <div class="naomi__bubble" v-if="open && line" :key="line">
        <button class="naomi__close" @click="collapse" aria-label="Dismiss">x</button>
        <div class="naomi__name">{{ PRODUCT.narrator }}</div>
        <p class="naomi__line">{{ line }}</p>
        <span class="naomi__tail" />
      </div>
    </transition>
    <button class="naomi__avatar-btn" @click="toggle" :title="PRODUCT.narrator">
      <img class="naomi__avatar" :src="ART.naomi" :alt="PRODUCT.narrator" />
      <span class="naomi__pulse" v-if="!open" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { ART } from '@/maker/data/art';
import { PRODUCT } from '@/maker/data/constants';

const props = defineProps<{ line: string }>();
const open = ref(true);
let timer: ReturnType<typeof setTimeout> | undefined;

const AUTO_HIDE_MS = 11000;

function armAutoHide() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => (open.value = false), AUTO_HIDE_MS);
}
function collapse() {
  open.value = false;
  if (timer) clearTimeout(timer);
}
function toggle() {
  open.value = !open.value;
  if (open.value) armAutoHide();
  else if (timer) clearTimeout(timer);
}

// Pop up Naomi briefly each time the step (line) changes, then tuck away.
watch(
  () => props.line,
  () => {
    open.value = true;
    armAutoHide();
  },
  { immediate: true },
);
onBeforeUnmount(() => timer && clearTimeout(timer));
</script>

<style scoped lang="scss">
.naomi {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 120;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.55rem;
  max-width: min(330px, 86vw);
  pointer-events: none;
}
.naomi > * {
  pointer-events: auto;
}

.naomi__avatar-btn {
  position: relative;
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.naomi__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--tof-panel-border-strong);
  box-shadow: 0 0 22px rgba(235, 167, 46, 0.45);
  animation: tof-float 5s ease-in-out infinite;
}
.naomi__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(235, 167, 46, 0.55);
  animation: naomi-pulse 2.4s ease-out infinite;
  pointer-events: none;
}
@keyframes naomi-pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}
.naomi__bubble {
  position: relative;
  align-self: flex-end;
  background: linear-gradient(180deg, rgba(36, 30, 54, 0.97), rgba(26, 22, 40, 0.97));
  border: 1px solid var(--tof-panel-border);
  border-radius: 14px;
  padding: 0.6rem 1.5rem 0.65rem 0.9rem;
  backdrop-filter: blur(8px);
  box-shadow: var(--tof-shadow);
}
.naomi__tail {
  position: absolute;
  bottom: -7px;
  right: 24px;
  width: 14px;
  height: 14px;
  background: rgba(26, 22, 40, 0.97);
  border-right: 1px solid var(--tof-panel-border);
  border-bottom: 1px solid var(--tof-panel-border);
  transform: rotate(45deg);
}
.naomi__close {
  position: absolute;
  top: 3px;
  right: 7px;
  background: none;
  border: none;
  color: var(--tof-accent-blue);
  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;
}
.naomi__close:hover {
  color: var(--tof-cream);
}
.naomi__name {
  font-family: var(--tof-font-heading);
  color: var(--tof-gold);
  font-size: 0.85rem;
}
.naomi__line {
  margin: 0.15rem 0 0;
  font-style: italic;
  color: var(--tof-cream);
  font-size: 0.88rem;
  line-height: 1.35;
}

.naomi-bubble-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1.4, 0.4, 1), opacity 0.3s ease;
}
.naomi-bubble-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.naomi-bubble-enter-from {
  transform: translateY(14px) scale(0.85);
  opacity: 0;
}
.naomi-bubble-leave-to {
  transform: translateY(10px) scale(0.92);
  opacity: 0;
}

@media (max-width: 760px) {
  .naomi {
    max-width: 76vw;
  }
  .naomi__avatar {
    width: 54px;
    height: 54px;
  }
}
</style>
