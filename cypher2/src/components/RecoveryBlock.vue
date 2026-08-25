<script setup>
import { nextTick, ref } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'
import { RECOVERY_KIND_LABELS } from '@/components/enums.js'

// ddd-2g8 variant A: the recovery column of the vitals panel. The v2 track is an
// ordered slots array (contract §2.4); extra one-action recoveries and Push on
// Through arrive as extra or re-kinded slots. Edit mode (slot editors + the
// bonus input — setup acts) arrives via the `editing` prop from StatusRow's
// shared pencil.
defineProps({ editing: { type: Boolean, default: false } })

const sheet = useSheetStore()
const label = (slot) => RECOVERY_KIND_LABELS[slot.kind] ?? slot.kind
const KIND_OPTIONS = Object.entries(RECOVERY_KIND_LABELS).map(([value, text]) => ({ value, text }))

// Order is contract-significant (position = rest duration, beacon-mapping §3.3),
// and every book case for an extra slot is an extra ONE-ACTION recovery — so a
// new slot defaults to `action` and lands after the last slot of its kind rather
// than at the end of the track, where it would read as the longest rest.
const addSlot = () => {
  const slots = sheet.recovery.slots
  const at = slots.findLastIndex((s) => s.kind === 'action')
  slots.splice(at + 1, 0, { kind: 'action', used: false, note: '' })
}

// No length check here: the remove button's :disabled binding (contract
// minItems: 1) is the gate, and a disabled button cannot fire this handler. A
// second, unreachable guard is one no test can distinguish from its absence
// (ddd-pzx).
//
// The splice unmounts the remove button the keyboard user just pressed — the
// ItemList focus-parking class of bug (ddd-5qi lineage; ddd-2g8 audit). Park on
// the same-index remove button (clamped), or the add button when the survivor
// is :disabled — a disabled control cannot take focus.
const root = ref(null)
const removeSlot = (i) => {
  sheet.recovery.slots.splice(i, 1)
  nextTick(() => {
    const removes = root.value?.querySelectorAll('.recovery__slot-remove') ?? []
    const target = removes[Math.min(i, removes.length - 1)]
    if (target && !target.disabled) target.focus()
    else root.value?.querySelector('.recovery__slot-add')?.focus()
  })
}
</script>

<template>
  <div ref="root" class="recovery vitals__col vitals__col--rule">
    <div class="recovery__head">
      <h4 class="recovery__label vitals__col-head microlabel">Recovery · 1d6 + {{ sheet.recovery.bonus }}</h4>
      <!-- ddd-5v9: "d6" names the die, not the action — the tooltip says what it
           does (the pool cards' d20 treatment). Outside the h4: a heading must
           not swallow the button's text. -->
      <button
        class="recovery__roll"
        type="button"
        title="Roll"
        aria-label="Roll recovery"
        @click="sheet.rollRecovery()"
      >
        d6
      </button>
    </div>
    <div class="recovery__body">
      <span class="recovery__steps">
        <!-- A label may hold only ONE labelable control, so the container is a
             label only in play mode; edit mode adds a select/input/button per
             slot and the wrapper degrades to a span (each editor control carries
             its own aria-label). -->
        <component
          :is="editing ? 'span' : 'label'"
          v-for="(slot, i) in sheet.recovery.slots"
          :key="i"
          class="recovery__step"
        >
          <!-- In edit mode the span wrapper no longer names this checkbox, so it
               names itself; in play mode the wrapping label does (aria-label
               would override it). -->
          <input
            class="recovery__pip"
            type="checkbox"
            :aria-label="editing ? `Slot ${i + 1} used` : undefined"
            v-model="slot.used"
          />
          <span class="microlabel">{{ label(slot) }}</span>
          <!-- ddd-2g8: the note (why this box exists) is visible, not tooltip-only —
               a title attr never surfaces on touch. -->
          <span v-if="slot.note && !editing" class="recovery__note">{{ slot.note }}</span>
          <template v-if="editing">
            <select
              class="recovery__kind field"
              :value="slot.kind"
              :aria-label="`Slot ${i + 1} rest duration`"
              @change="slot.kind = $event.target.value"
            >
              <option v-for="o in KIND_OPTIONS" :key="o.value" :value="o.value">{{ o.text }}</option>
            </select>
            <input
              class="recovery__note-input field"
              type="text"
              :aria-label="`Slot ${i + 1} note`"
              placeholder="Note"
              v-model="slot.note"
            />
            <button
              class="recovery__slot-remove btn"
              type="button"
              :disabled="sheet.recovery.slots.length <= 1"
              :aria-label="`Remove slot ${i + 1}`"
              @click.prevent="removeSlot(i)"
            >
              ✕
            </button>
          </template>
        </component>
        <button v-if="editing" class="recovery__slot-add btn" type="button" @click="addSlot">
          + Add slot
        </button>
      </span>
      <label v-if="editing" class="recovery__bonus">
        <span class="microlabel">Bonus</span>
        <input
          class="field"
          type="number"
          min="0"
          :value="sheet.recovery.bonus"
          @change="sheet.recovery.bonus = syncClamped($event, clampInt($event.target.value))"
        />
      </label>
    </div>
    <!-- ddd-5v9: static healing explainer, verbatim from the owner. Always
         visible — it is reference copy, not a setup control. -->
    <!-- One line so the copy stays verbatim — a template reflow would put raw
         newlines into textContent. -->
    <p class="recovery__heal-note">Four ways to heal wounds: rally, treatment, rest, and exceptional healing abilities. +2 points if one-action recovery is taken as Last action.</p>
  </div>
</template>
