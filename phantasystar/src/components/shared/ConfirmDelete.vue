<script setup>
import { ref, onBeforeUnmount } from 'vue'

const emit = defineEmits(['confirm'])

const ARMED_FOR_MS = 3000

const root = ref(null)
const armed = ref(false)
let timer = null

const onPointerDown = (e) => {
  if (!root.value?.contains(e.target)) disarm()
}
const onKey = (e) => {
  if (e.key === 'Escape') disarm()
}

const disarm = () => {
  armed.value = false
  clearTimeout(timer)
  document.removeEventListener('pointerdown', onPointerDown, true)
  document.removeEventListener('keydown', onKey)
}

const arm = () => {
  armed.value = true
  timer = setTimeout(disarm, ARMED_FOR_MS)
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKey)
}

const onClick = () => {
  if (!armed.value) return arm()
  disarm()
  emit('confirm')
}

onBeforeUnmount(disarm)
</script>

<template>
  <button
    ref="root"
    type="button"
    class="confirm-del"
    :class="{ 'is-armed': armed }"
    @click="onClick"
  >
    &times;<span v-if="armed" class="confirm-del__ask">Delete?</span>
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.confirm-del { position: relative; }

.confirm-del__ask {
  @include ps-caption;
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 3;
  transform: translateY(-50%);
  padding: 3px 7px;
  border-radius: var(--ps-radius-sm);
  background: var(--ps-red);
  color: var(--ps-on-fill);
  font-size: 9px;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(var(--ps-shadow-rgb), 0.25);
}
</style>
