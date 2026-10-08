<script setup>
import { ref } from 'vue'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import ShortRestModal from './ShortRestModal.vue'

const store = useTechniqueStore()

const resting = ref(false)

const finishShortRest = () => {
  resting.value = false
  store.shortRest()
}
</script>

<template>
  <div class="rests">
    <button type="button" class="rest" @click="resting = true">
      Short Rest
    </button>
    <button type="button" class="rest" @click="store.longRest()">
      Long Rest
    </button>

    <ShortRestModal :open="resting" @close="finishShortRest" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.rests {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.rest {
  @include ps-heading(14px);
  background: var(--ps-panel);
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  padding: 3px 14px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}
</style>
