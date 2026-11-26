<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'

const sheet = useSheetStore()

// §6.1: writing the same text twice changes nothing in the DOM, and a screen reader
// announces nothing. Every announcement renders the region empty first, then the text.
// The text waits on a timer, not nextTick. A write one microtask later lands before the
// browser paints, so a screen reader never sees the empty region between the two.
// Watching seq, not text, is what makes an identical announcement count at all.
const ANNOUNCE_DELAY_MS = 100
const statusText = ref('')
let pendingWrite = null
watch(
  () => sheet.dropAnnouncement.seq,
  () => {
    const { text } = sheet.dropAnnouncement
    // A newer announcement cancels the older write, so only the latest drop's text is
    // ever read out (decision 16).
    clearTimeout(pendingWrite)
    statusText.value = ''
    pendingWrite = setTimeout(() => {
      pendingWrite = null
      statusText.value = text
    }, ANNOUNCE_DELAY_MS)
  }
)
// A refusal comes from a drop newer than any success still waiting to be read, so it
// cancels that write and clears the region (decision 16). Otherwise drop A's "Added …"
// would be read out after drop B's refusal. A dismissal clears the notice to null,
// which is how every success ends, so only a new notice counts.
watch(
  () => sheet.dropNotice?.seq,
  (seq) => {
    if (seq === undefined) return
    clearTimeout(pendingWrite)
    pendingWrite = null
    statusText.value = ''
  }
)
onBeforeUnmount(() => clearTimeout(pendingWrite))
</script>

<!-- Compendium drop feedback (spec ⑥ §6, decisions 9 and 17). The refusal reuses the
     import panels' alert treatment. The status region is visually hidden and always in
     the DOM, because a live region added at the moment its text changes is not read. -->
<template>
  <div class="drop-layer">
    <div
      v-if="sheet.dropNotice"
      :key="sheet.dropNotice.seq"
      class="drop-layer__notice import__alert"
      role="alert"
    >
      <p class="drop-layer__message">{{ sheet.dropNotice.message }}</p>
      <button
        class="drop-layer__dismiss btn"
        type="button"
        aria-label="Dismiss notice"
        @click="sheet.dismissDropNotice()"
      >
        ✕
      </button>
    </div>
    <p class="drop-layer__status" role="status">{{ statusText }}</p>
  </div>
</template>
