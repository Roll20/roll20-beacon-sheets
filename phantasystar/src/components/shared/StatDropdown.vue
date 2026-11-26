<script setup>
import { ref, onBeforeUnmount } from 'vue'

defineProps({
  value: { type: [Number, String], default: '' },
  label: { type: String, default: '' },
})

const root = ref(null)
const open = ref(false)

const onPointerDown = (e) => {
  if (!root.value?.contains(e.target)) close()
}
const onKey = (e) => {
  if (e.key === 'Escape') close()
}

const close = () => {
  open.value = false
  document.removeEventListener('pointerdown', onPointerDown, true)
  document.removeEventListener('keydown', onKey)
}

const toggle = () => {
  if (open.value) return close()
  open.value = true
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKey)
}

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="stat-dropdown">
    <button
      type="button"
      class="stat-dropdown__box"
      :class="{ 'is-open': open }"
      :aria-label="`${label} ${value}`"
      :aria-expanded="open"
      @click="toggle"
    >
      {{ value }}
      <span class="stat-dropdown__caret" aria-hidden="true">&#9662;</span>
    </button>
    <div v-if="open" class="stat-dropdown__panel">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.stat-dropdown {
  position: relative;

  &__box {
    @include ps-well;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 40px;
    font-size: var(--ps-fs-big);
    font-weight: 700;
    color: var(--ps-derived, var(--ps-heading));
    background: var(--ps-panel-alt);
    cursor: pointer;

    &:hover, &.is-open { outline: 2px solid var(--ps-gold); outline-offset: -1px; }
  }

  &__caret {
    position: absolute;
    right: 2px;
    bottom: 0;
    font-size: 8px;
    line-height: 1;
    color: var(--ps-gold-dark);
  }

  &__panel {
    @include ps-panel;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 150px;
    padding: 6px 8px;
    box-shadow: 0 4px 12px rgba(var(--ps-shadow-rgb), 0.18);
  }
}
</style>
