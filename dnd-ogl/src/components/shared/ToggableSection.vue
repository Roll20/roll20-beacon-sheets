<template>
  <div
    v-show="isRendered"
    :class="{ 'toggable-section': true, 'toggable-section--active': isExpanded }"
    :style="{ '--toggable-speed': normalizedSpeed }"
    @transitionend="onTransitionEnd"
  >
    <div class="toggable-section__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  active: boolean;
  speed?: number | string;
}>(), {
  speed: 200,
});

const normalizedSpeed = computed(() => {
  if (typeof props.speed === 'number') {
    return `${props.speed}ms`;
  }

  const trimmed = props.speed.trim();
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}ms` : trimmed;
});

const isRendered = ref(props.active);
const isExpanded = ref(props.active);

watch(() => props.active, (nextActive) => {
  if (nextActive) {
    isRendered.value = true;
    requestAnimationFrame(() => {
      isExpanded.value = true;
    });
    return;
  }

  isExpanded.value = false;
});

const onTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName !== 'grid-template-rows') {
    return;
  }

  if (!isExpanded.value) {
    isRendered.value = false;
  }
};
</script>

<style lang="scss" scoped>
.toggable-section {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition:
    grid-template-rows var(--toggable-speed, 150ms) ease,
    opacity var(--toggable-speed, 150ms) ease,
    pointer-events var(--toggable-speed, 150ms) allow-discrete;

  &__content {
    min-height: 0;
    overflow: hidden;
  }

  &--active {
    grid-template-rows: 1fr;
    opacity: 1;
    pointer-events: auto;
  }
}
</style>