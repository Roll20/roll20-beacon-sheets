<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// closeDisabled: a host with an in-flight commit (RollerModal mid-roll) must not offer
// a dismiss it will refuse — the ✕ greys out alongside the host's own Cancel. Escape
// still emits; the host's close handler owns that guard, exactly as before.
// compact: a 22rem panel for single-purpose dialogs; the default 32rem suits forms.
defineProps({
  label: { type: String, required: true },
  closeDisabled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const panel = ref(null)
let opener = null

// Hosts that disable every control while busy need somewhere inside the dialog to
// park focus — otherwise the browser drops it to body, outside the trap (ddd-5qi,
// ddd-axi closeout P2). Exposed rather than re-implemented per host (ddd-6hx).
const focusPanel = () => panel.value?.focus()
defineExpose({ focusPanel })

// Disabled controls are filtered out: focusing one strands the user inside a trap
// that still reports as working. RollerModal learned this the hard way (ddd-5qi).
const focusables = () =>
  Array.from(
    panel.value?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) ?? []
  ).filter((el) => !el.disabled)

// Where focus LANDS on open and what the trap BOUNDS are are two different questions.
// The trap must span every focusable in DOM order — that is the sequence the browser's
// own Tab follows, and reordering it would leave the true last element unwrapped so
// focus escapes the dialog (jsdom cannot observe this; see ddd-5qi for the same class).
//
// Initial focus lands on the PANEL itself (tabindex="-1"), not on the first control in
// the body. Ruling R6: the first control in SettingsModal is the skin <select>, a LIVE
// control that one stray arrow key mutates and persists. Panel focus is standard dialog
// practice, is announced correctly by screen readers, and gives the backdrop re-park
// below somewhere to send focus. tabindex="-1" keeps the panel programmatically
// focusable while staying OUT of focusables() — that selector excludes it by design, so
// the trap's bounds are unchanged.
onMounted(() => {
  opener = document.activeElement
  panel.value?.focus()
})

onBeforeUnmount(() => {
  // isConnected: the opener may have been unmounted while the dialog was open.
  if (opener?.isConnected) opener.focus()
})

// The keydown handler is bound to `.modal`, which is not focusable. A mousedown on the
// dim backdrop therefore parks focus on document.body — outside the handler's subtree —
// and Escape stops working while Tab walks into the sheet behind an aria-modal dialog.
// Re-parking focus on the panel keeps every later key inside the handler's reach.
// `.self` so this never fires for clicks inside the panel. It deliberately does NOT
// close the dialog — dismiss-on-backdrop is a separate UX decision nobody has made.
const onBackdrop = () => panel.value?.focus()

const onKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key !== 'Tab') return
  const els = focusables()
  if (!els.length) {
    e.preventDefault() // hold focus rather than leak it behind the dialog
    return
  }
  const first = els[0]
  const last = els[els.length - 1]
  // The panel counts as a BACKWARD boundary. It is focusable (tabindex="-1") but
  // deliberately outside focusables(), so it matches neither branch below — and the
  // only preventDefault paths ARE those branches. Focus rests on the panel twice over
  // (R6 parks it there on open; onBackdrop re-parks it), and from there Shift+Tab fell
  // through to native backward navigation, which walks to whatever precedes the modal
  // in the document: out of an aria-modal dialog. Forward Tab needs no such branch —
  // native forward navigation from a container goes to the first focusable inside it,
  // which is where the trap wants focus anyway. (ddd-001 closeout audit; jsdom sees no
  // sequential focus navigation, so only the wrap is assertable — same as R3/ddd-5qi.)
  const atBackwardEdge = document.activeElement === first || document.activeElement === panel.value
  if (e.shiftKey && atBackwardEdge) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<!-- Presentation only — it owns the dialog contract and nothing about its contents.
     Placement note (spec §4.3): this sits inside .cypher-sheet, which carries
     container-type. That is safe — container-type applies style and size containment
     but NOT layout containment, so it does not become a containing block for
     position: fixed descendants. RollerModal already relies on this. -->
<template>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    :aria-label="label"
    @keydown="onKeydown"
    @mousedown.self="onBackdrop"
  >
    <div class="modal__panel" :class="{ 'modal__panel--compact': compact }" ref="panel" tabindex="-1">
      <header class="modal__head">
        <h3 class="banner">{{ label }}</h3>
        <button class="modal__close" type="button" aria-label="Close" :disabled="closeDisabled" @click="emit('close')">✕</button>
      </header>
      <div class="modal__body"><slot /></div>
    </div>
  </div>
</template>
