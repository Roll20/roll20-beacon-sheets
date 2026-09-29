<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '620px' },
  doneLabel: { type: String, default: 'Done' },
})

const emit = defineEmits(['close'])

const panel = ref(null)
let returnFocus = null

const onKey = (event) => {
  if (event.key === 'Escape') {
    event.stopPropagation()
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      returnFocus = document.activeElement
      window.addEventListener('keydown', onKey)
      requestAnimationFrame(() => panel.value?.focus())
    } else {
      window.removeEventListener('keydown', onKey)
      if (returnFocus?.focus) returnFocus.focus()
      returnFocus = null
    }
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="emit('close')">
      <div
        ref="panel"
        class="modal"
        :style="{ maxWidth: width }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
      >
        <header class="bar">
          <h2>{{ title }}</h2>
          <div class="bar-actions">
            <slot name="actions" />
            <button type="button" class="close" aria-label="Close" @click="emit('close')">
              &times;
            </button>
          </div>
        </header>

        <div class="body">
          <slot />
        </div>

        <footer class="foot">
          <button type="button" class="done" @click="emit('close')">{{ doneLabel }}</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.backdrop { @include ps-scrim; }

.modal {
  @include ps-modal;

  &:focus { outline: none; }
}

.bar {
  @include ps-modal-bar;

  h2 { @include ps-heading(16px); margin: 0; }
}

.bar-actions { display: flex; align-items: center; gap: var(--ps-gap); }

.close {
  @include ps-icon-button(22px, var(--ps-red));
  color: var(--ps-heading);
}

.body { @include ps-modal-body; }

.foot { @include ps-modal-foot; }

.done { @include ps-button; }
</style>
