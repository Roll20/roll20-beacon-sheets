<script setup>
import { computed, nextTick, ref, useSlots, watch } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import IconChat from '@/components/icons/IconChat.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import { useSheetStore } from '@/stores/sheetStore.js'

const props = defineProps({
  storeKey: { type: String, required: true },
  title: { type: String, required: true },
  addLabel: { type: String, required: true },
  warn: { type: Boolean, default: false },
  // The per-list contents descriptor (item-contents spec §3): row -> {title, fields,
  // source, prose}. Supplied by every segment; a list without one gets no disclosure
  // and no chat button, because there is nothing to disclose or post FROM.
  contents: { type: Function, default: null },
  // Per-row roll entry (ddd-669y): row -> void, rendered as a d20 chip beside
  // the chat chip. canRoll gates it per row (Skills hides it on proficiencies —
  // MCG §3.6). Only Skills supplies these today; the default hides the chip.
  roll: { type: Function, default: null },
  canRoll: { type: Function, default: () => true }
})
const sheet = useSheetStore()
const slots = useSlots()

// spec ⑦ §10: a list that supplies no #summary keeps the inline editor. The row
// treatment is the largest behavioural change on the sheet, so the retreat is per-list
// rather than a revert. Do NOT collapse this to a constant.
const hasSummary = computed(() => !!slots.summary)

const rows = computed(() => sheet[props.storeKey])
const editingId = ref(null)
const confirming = ref(null)
const addButton = ref(null)

// Resolve the edited row by _id on EVERY read rather than capturing the object.
// hydrate() replaces the arrays wholesale with fresh row objects (sheetStore.hydrate)
// and the relay can fire while the editor is open: a captured object would silently
// become a detached row the sheet no longer shows. _id survives the swap, so this
// either re-binds to the replacement or — if the row is gone — goes null and the
// modal's v-if unmounts it.
const editingIndex = computed(() => rows.value.findIndex((r) => r._id === editingId.value))
const editingRow = computed(() => (editingIndex.value >= 0 ? rows.value[editingIndex.value] : null))

// A freshly-added row has no name yet, so `Remove ${row.name}` announced as a bare
// "Remove" — indistinguishable from every other unnamed row's button (ddd-im9). The
// armed state matters too: the visible label flips but a screen reader hears nothing
// unless the accessible name changes with it. Both the edit and the delete control
// read through this one helper so they cannot drift apart.
// QUALIFIED BY LIST, not just by index (Codex audit F2). Two ItemLists render in one
// panel (Gear: Equipment + Currencies; Advancement: Power shifts + Arcs) and narrow
// mode stacks every list at once, so "unnamed row 1" collided across lists — a screen
// reader's button list could not tell which list a control belonged to. The title's
// parenthetical is stripped because Cyphers' title carries a live count ("Cyphers
// (2/1)"), which does not belong in an accessible name.
const listWhat = computed(() => props.title.replace(/\s*\(.*\)\s*$/, ''))
// The accessible name is the descriptor's title — the same string the summary
// renders — falling back to row.name for lists without contents. The two must
// not drift: cyphers title with displayName (contract §3.10), and a control
// announced under the canonical name while the row shows the alias appears to
// target a different item (ddd-2g8 closeout audit). Every other list's title
// IS row.name, so this changes nothing for them.
const rowWhat = (row, index) =>
  descriptors.value[index]?.title?.trim() ||
  row.name?.trim() ||
  `unnamed ${listWhat.value} row ${index + 1}`
const editLabel = (row, index) => `Edit ${rowWhat(row, index)}`
const removeLabel = (row, index) =>
  confirming.value === row._id
    ? `Confirm remove ${rowWhat(row, index)}`
    : `Remove ${rowWhat(row, index)}`

// Expanded rows, by _id. TRANSIENT: never in dehydrate(), same rule rollerStat
// follows (sheetStore.js) — a view state must not persist or export. _id survives
// hydrate()'s wholesale array replacement, so an open expansion survives a relay tick
// rather than snapping shut under the player.
const expanded = ref(new Set())
const contentsOf = (row) => (props.contents ? props.contents(row) : {})
// ONE descriptor per row per change, not one per template read (ddd-0k1): the toggle's
// v-if, the body's v-if, the source line and the prose line all read the same entry.
// A COMPUTED, never an _id-keyed cache: the descriptor reads the row's own reactive
// fields, so Vue tracks them here and an edit invalidates the entry in the same tick —
// a hand-rolled memo would leave an open expansion showing yesterday's prose, or
// `isExpandable` disagreeing with what renders.
const descriptors = computed(() => rows.value.map((row) => contentsOf(row)))
// Expandable ONLY when there is prose. No prose, no caret, and the summary stays a
// plain <div> — the same collapse discipline spec ⑦ §4.2 applies to empty cells: an
// affordance that would do nothing never appears. This is what makes `currencies`
// non-expandable structurally rather than by a list-level exception.
const expandable = computed(() => descriptors.value.map((d) => !!d.prose?.trim()))
const bodyId = (row) => `item-body-${row._id}`
const isExpanded = (row) => expanded.value.has(row._id)
const toggleRow = (id) => {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}
const expandLabel = (row, index) =>
  `${isExpanded(row) ? 'Collapse' : 'Expand'} ${rowWhat(row, index)}`
const chatLabel = (row, index) => `Post ${rowWhat(row, index)} to chat`

// No state to roll back if the post fails — unlike a roll, nothing was spent. Swallow
// rather than leave an unhandled rejection in the host frame.
const onPost = async (row) => {
  try {
    await sheet.postItem(props.storeKey, contentsOf(row))
  } catch {
    // Chat post failed; the sheet is unchanged.
  }
}

// EVERY id-holder is pruned against the live rows, not just on local delete (Codex
// audit F1). removeRow is not the only way a row disappears: a Beacon pulse replaces
// the arrays wholesale through hydrate(), and an id left behind is not merely stale —
// _ids recur when an older snapshot is re-imported or an undo restores a row, at which
// point the row comes back already expanded, already armed for delete, or with its
// editor reopening on its own. `confirming` and `editingId` are the same class of bug
// as `expanded` and are pruned here for the same reason.
//
// Watching a derived id list rather than `rows`: removeRow splices in place, so a
// shallow watch on the computed array would not fire.
const liveIds = computed(() => rows.value.map((r) => r._id))
watch(liveIds, (ids) => {
  const live = new Set(ids)
  for (const id of expanded.value) if (!live.has(id)) expanded.value.delete(id)
  if (editingId.value !== null && !live.has(editingId.value)) editingId.value = null
  if (confirming.value !== null && !live.has(confirming.value)) confirming.value = null
})

const openEditor = (row) => {
  editingId.value = row._id
}
// closeEditor OWNS the armed-delete reset, and is the only place that does. Every route
// out of an open editor lands here (Done, Escape) or clears `confirming` itself (a
// confirmed delete), so an arm cannot survive into another row's editor — one click
// there would destroy a row the user never armed. A second reset in openEditor was
// tried and removed: it is unreachable, and an unreachable guard is one no test can
// distinguish from its absence (ddd-pzx).
const closeEditor = () => {
  editingId.value = null
  confirming.value = null
}

// Two-click delete: native confirm() can be blocked in the sandboxed iframe.
const onRemove = (id) => {
  if (confirming.value !== id) {
    confirming.value = id
    return
  }
  const wasEditing = editingId.value === id
  sheet.removeRow(props.storeKey, id)
  confirming.value = null
  if (wasEditing) {
    editingId.value = null
    // ModalShell restores focus to its opener — but the opener was this row's (i), and
    // the delete just destroyed it, so `opener.isConnected` is false and the restore is
    // skipped. Focus would land on <body>, outside the sheet. Park it on the list's own
    // add button. (Focus parking is this component family's recurring defect: ddd-5qi,
    // the ddd-001 R6 park, the ddd-001 closeout F1.)
    nextTick(() => addButton.value?.focus())
  }
}
</script>

<template>
  <section class="item-list panel" :class="{ 'item-list--warn': warn }" :data-list="storeKey">
    <header class="item-list__head">
      <h3 class="banner" :class="{ 'banner--warn': warn }">{{ title }}</h3>
      <button
        ref="addButton"
        class="item-list__add"
        type="button"
        title="Add"
        :aria-label="addLabel"
        @click="sheet.addRow(storeKey)"
      >
        +
      </button>
    </header>

    <button
      v-if="!rows.length"
      class="item-list__empty-add"
      type="button"
      @click="sheet.addRow(storeKey)"
    >
      {{ addLabel }}
    </button>

    <ul v-else class="item-list__rows">
      <li
        v-for="(row, index) in rows"
        :key="row._id"
        class="item-list__row"
        :class="{ 'item-list__row--read': hasSummary }"
      >
        <!-- READ-OPTIMIZED (spec ⑦ §4.2): a compact summary. The summary LINE is the
             disclosure toggle (item-contents spec §6 D3) rather than a separate caret
             control — at 280px a fourth control's worth of chrome starts truncating
             names. Its slot content is spans only; putting an interactive element in a
             #summary template would nest buttons and is not permitted. -->
        <template v-if="hasSummary">
          <button
            v-if="expandable[index]"
            class="item-list__summary item-list__summary--toggle"
            type="button"
            :aria-expanded="isExpanded(row)"
            :aria-controls="bodyId(row)"
            :aria-label="expandLabel(row, index)"
            @click="toggleRow(row._id)"
          >
            <span class="item-list__caret" aria-hidden="true">{{ isExpanded(row) ? '▾' : '▸' }}</span>
            <slot name="summary" :row="row" />
          </button>
          <div v-else class="item-list__summary"><slot name="summary" :row="row" /></div>
        </template>
        <!-- FALLBACK (spec ⑦ §10): the pre-bead-2 inline form, unchanged. -->
        <div v-else class="item-list__fields"><slot name="row" :row="row" /></div>

        <!-- Icon-only chips carry a hover tooltip; the aria-label stays the
             per-row accessible name (it wins over title for the reader). -->
        <!-- "d20" names the die, not the action — the pool cards' treatment. -->
        <button
          v-if="roll && canRoll(row)"
          class="item-list__roll"
          type="button"
          title="Roll"
          :aria-label="`Roll ${rowWhat(row, index)}`"
          @click="roll(row)"
        >
          d20
        </button>
        <button
          v-if="contents"
          class="item-list__chat"
          type="button"
          title="Send to chat"
          :aria-label="chatLabel(row, index)"
          @click="onPost(row)"
        >
          <IconChat />
        </button>

        <button
          v-if="hasSummary"
          class="item-list__edit"
          type="button"
          title="Edit"
          :aria-label="editLabel(row, index)"
          @click="openEditor(row)"
        >
          <IconPencil />
        </button>
        <button
          v-else
          class="item-list__remove"
          type="button"
          :aria-label="removeLabel(row, index)"
          @click="onRemove(row._id)"
        >
          {{ confirming === row._id ? 'Confirm ✕' : '✕' }}
        </button>

        <!-- The expansion (item-contents spec §6). v-show, not v-if, so the element
             aria-controls names is always in the DOM while the row is expandable —
             a control pointing at an id that does not exist is a broken reference. -->
        <div
          v-if="expandable[index]"
          v-show="isExpanded(row)"
          :id="bodyId(row)"
          class="item-list__body"
        >
          <p v-if="descriptors[index].source" class="item-list__body-source">
            {{ descriptors[index].source }}
          </p>
          <p class="item-list__body-prose">{{ descriptors[index].prose }}</p>
        </div>
      </li>
    </ul>

    <!-- The editor renders the SAME #row template the fallback does, so a list has one
         editor definition, not two. v-if on editingRow (not on editingId) is what makes
         a vanished row close the dialog rather than edit a ghost. -->
    <ModalShell
      v-if="editingRow"
      :label="editLabel(editingRow, editingIndex)"
      @close="closeEditor"
    >
      <div class="item-list__fields"><slot name="row" :row="editingRow" /></div>
      <footer class="item-list__editor-foot">
        <button
          class="item-list__delete btn"
          :class="{ 'item-list__delete--armed': confirming === editingRow._id }"
          type="button"
          :aria-label="removeLabel(editingRow, editingIndex)"
          @click="onRemove(editingRow._id)"
        >
          {{ confirming === editingRow._id ? 'Confirm remove' : 'Remove' }}
        </button>
        <button class="item-list__editor-done btn" type="button" @click="closeEditor">Done</button>
      </footer>
    </ModalShell>
  </section>
</template>
