<script setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

// ddd-2g8 variant A: the wounds column and (when a shield exists or edit mode is
// on) the shield column of the vitals panel. Marking wounds/shield damage is a
// play action — pips are always live. Maxima and shield add/remove are setup
// acts, rendered only when `editing` (StatusRow's pencil).
const props = defineProps({ editing: { type: Boolean, default: false } })

const sheet = useSheetStore()
const TIERS = [
  {
    key: 'minor',
    label: 'Minor',
    note: 'No negative effects. Excess minor wounds become moderate.'
  },
  {
    key: 'moderate',
    label: 'Moderate',
    note: 'On your last moderate wound, all actions are hindered. Excess moderate wounds become major.'
  },
  {
    key: 'major',
    label: 'Major',
    note: 'Each major wound hinders all actions–on your last, you die.'
  }
]
// ddd-0xq: each wound-type label discloses that tier's book rule below its row.
// Explanatory copy, not sheet data — local UI state, collapsed by default. The
// shield column keeps plain labels: the notes describe body wounds only.
const openNotes = reactive({ minor: false, moderate: false, major: false })
const toggleNote = (tier) => {
  openNotes[tier] = !openNotes[tier]
}
// Wounds and the shield are the same three-tier current/max shape (contract
// $defs/wounds and $defs/shield both ref woundTier), so every tier behavior
// takes the track object rather than reading sheet.wounds directly.
// Returns the clamped max so the template can resync the box through
// syncClamped — a rejected edit otherwise survives in the DOM (ddd-9sf).
const setMax = (track, tier, value) => {
  const max = clampInt(value)
  track[tier].max = max
  track[tier].current = Math.min(track[tier].current, max)
  return max
}
const togglePip = (track, tier, index) => {
  const w = track[tier]
  w.current = w.current === index + 1 ? index : index + 1
}

// Both handlers below swap a v-if branch and unmount the control the user just
// activated — without a park, keyboard focus falls to <body>, outside the
// sheet. The recurring focus-parking defect class: ddd-5qi, ddd-001 R6, the
// ddd-001 closeout F1, ItemList's onRemove (ddd-2g8 audit).
const root = ref(null)
const parkFocus = (selector) =>
  nextTick(() => root.value?.querySelector(selector)?.focus())

// ddd-2g8: null = no shield carried (contract). Adding one seeds the book
// default 3/2/1 maxima.
const addShield = () => {
  sheet.shield = {
    minor: { current: 0, max: 3 },
    moderate: { current: 0, max: 2 },
    major: { current: 0, max: 1 }
  }
  confirmingRemove.value = false
  parkFocus('.shield__tier .wound-pip')
}

// Two-click remove, like ItemList's row delete: native confirm() can be blocked
// in the sandboxed iframe, and removing a shield destroys six values.
const confirmingRemove = ref(false)
// An armed destructive confirm must not outlive the context that armed it
// (ItemList's closeEditor owns the same reset for row deletes): leaving edit
// mode merely hides the armed button via v-if, so without this reset the next
// edit session would delete the shield on its first click (ddd-2g8 audit).
watch(
  () => props.editing,
  (on) => {
    if (!on) confirmingRemove.value = false
  }
)
const removeShield = () => {
  if (!confirmingRemove.value) {
    confirmingRemove.value = true
    return
  }
  sheet.shield = null
  confirmingRemove.value = false
  parkFocus('.shield__add')
}
</script>

<!-- display: contents — the two columns must be layout siblings of RecoveryBlock's
     column inside .vitals__cols, but the component needs ONE root for the focus-
     park ref. The wrapper is invisible to the flex layout. -->
<template>
  <div ref="root" class="wounds-track" style="display: contents">
    <div class="wounds vitals__col vitals__col--flush">
      <h4 class="vitals__col-head microlabel">Wounds</h4>
      <template v-for="t in TIERS" :key="t.key">
        <div class="wounds__tier" :class="{ 'wounds__tier--moderate': t.key === 'moderate' }">
          <button
            type="button"
            class="wounds__label wounds__label--toggle"
            :aria-expanded="openNotes[t.key]"
            :aria-controls="`wound-note-${t.key}`"
            @click="toggleNote(t.key)"
          >
            {{ t.label
            }}<span class="wounds__caret" aria-hidden="true">{{
              openNotes[t.key] ? '▾' : '▸'
            }}</span>
          </button>
          <!-- The pip run lives in its own wrapping container so a high wound max
               (Stone Body sets minor.max=8) can't force the row past the viewport
               at 280px — see ddd-2bv. Do not flatten these back into .wounds__tier. -->
          <span class="wounds__pips">
            <button
              v-for="i in sheet.wounds[t.key].max"
              :key="i"
              type="button"
              class="wound-pip"
              :class="{ 'wound-pip--filled': i <= sheet.wounds[t.key].current }"
              :aria-label="`${t.label} wound ${i}`"
              @click="togglePip(sheet.wounds, t.key, i - 1)"
            />
          </span>
          <input
            v-if="editing"
            class="wounds__max field"
            type="number"
            min="0"
            :value="sheet.wounds[t.key].max"
            :aria-label="`${t.label} wounds max`"
            @change="syncClamped($event, setMax(sheet.wounds, t.key, $event.target.value))"
          />
        </div>
        <!-- v-show, not v-if (audit): the element aria-controls names must stay
             in the DOM while collapsed — a control pointing at an id that does
             not exist is a broken reference (ItemList's body, same rule). -->
        <p v-show="openNotes[t.key]" :id="`wound-note-${t.key}`" class="wounds__note">
          {{ t.note }}
        </p>
      </template>
    </div>

    <!-- The shield column exists in play view only when a shield is carried;
         edit mode always shows it so + Shield has somewhere to live. -->
    <div v-if="sheet.shield || editing" class="shield vitals__col vitals__col--rule">
      <div class="shield__head">
        <h4 class="vitals__col-head microlabel">Shield</h4>
        <button
          v-if="editing && sheet.shield"
          class="shield__remove btn"
          :class="{ 'shield__remove--armed': confirmingRemove }"
          type="button"
          :aria-label="confirmingRemove ? 'Confirm remove shield' : 'Remove shield'"
          @click="removeShield"
        >
          {{ confirmingRemove ? 'Confirm ✕' : '✕' }}
        </button>
      </div>
      <button v-if="editing && !sheet.shield" class="shield__add btn" type="button" @click="addShield">
        + Shield
      </button>
      <template v-if="sheet.shield">
        <div
          v-for="t in TIERS"
          :key="`shield-${t.key}`"
          class="wounds__tier shield__tier"
          :class="{ 'wounds__tier--moderate': t.key === 'moderate' }"
        >
          <span class="wounds__label">{{ t.label }}</span>
          <span class="wounds__pips">
            <button
              v-for="i in sheet.shield[t.key].max"
              :key="i"
              type="button"
              class="wound-pip"
              :class="{ 'wound-pip--filled': i <= sheet.shield[t.key].current }"
              :aria-label="`Shield ${t.label.toLowerCase()} wound ${i}`"
              @click="togglePip(sheet.shield, t.key, i - 1)"
            />
          </span>
          <input
            v-if="editing"
            class="wounds__max field"
            type="number"
            min="0"
            :value="sheet.shield[t.key].max"
            :aria-label="`Shield ${t.label.toLowerCase()} wounds max`"
            @change="syncClamped($event, setMax(sheet.shield, t.key, $event.target.value))"
          />
        </div>
      </template>
    </div>
  </div>
</template>
