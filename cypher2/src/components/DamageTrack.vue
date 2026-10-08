<script setup>
import { reactive } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { DAMAGE_TRACK_STEPS, DAMAGE_TRACK_STEP_LABELS } from '@/components/enums.js'

// ddd-xrug spec §8. The damage track column of the vitals panel, in the slot the wounds
// column holds when rules.damageTrack is false. The two are mutually exclusive, and
// StatusRow owns that gate — this component renders whenever it is mounted.
//
// `editing` is taken and unused on purpose: the three columns share StatusRow's one
// pencil, and marking a step is a play action like a wound pip, so the pips are always
// live. Phase 3's Hurt control is the first thing here that will need the prop.
defineProps({ editing: { type: Boolean, default: false } })

const sheet = useSheetStore()

// Book copy, Old Gods of Appalachia core rulebook page 141, quoted in spec §8.3. Do not
// paraphrase, re-condense or re-word: every word and every mark of internal punctuation is
// the book's. Each note reads as a definition of the step label above it, which supplies
// the subject the book sentence assumes, so the only change from the spec's text is the
// leading letter capitalized where a note now starts a sentence.
const STEP_NOTES = {
  hale: 'The normal state for a character: all three stat Pools are at 1 or higher, and the PC has no penalties from harmful conditions. A character whose Pools are much lower than normal can still be hale.',
  impaired:
    'Effort costs 1 extra point per level applied: one level costs 4 instead of 3, two levels cost 7 instead of 5. An impaired character ignores minor and major effect results on their rolls, and in combat a roll of 17 or higher deals only 1 additional point of damage.',
  debilitated:
    "May not take any actions other than to move (probably crawl) no more than an immediate distance. If a debilitated character's Speed Pool is 0, they can't move at all.",
  dead: 'Dead is dead. Usually.'
}

// Page 142's three transitions, always visible below the steps. The sheet never applies
// them: it stores, shows and exports the step the player marks (spec §8.2, and ddd-4uhf,
// where the owner ruled the sheet never infers).
const MOVEMENT_NOTE =
  'A Pool reduced to 0 moves the character down one step; using points from a recovery roll to raise a Pool from 0 to 1 or higher moves them up one step; and a character with every Pool above 0 who was moved down by special damage can spend a whole recovery roll moving up one step instead of recovering points.'

// Order comes from the enum and nowhere else, so contract-enums.test.js locks the rendered
// column against the v3 schema. Reading the label map by an enum KEY needs no enumLabel
// guard: that guard exists for values read out of storage, and none of these is.
const STEPS = DAMAGE_TRACK_STEPS.map((key) => ({
  key,
  label: DAMAGE_TRACK_STEP_LABELS[key],
  note: STEP_NOTES[key]
}))

// Explanatory copy, not sheet data — local UI state, collapsed by default, never
// persisted. Same rule as WoundsTrack's tier notes (ddd-0xq).
const openNotes = reactive(Object.fromEntries(DAMAGE_TRACK_STEPS.map((key) => [key, false])))
const toggleNote = (step) => {
  openNotes[step] = !openNotes[step]
}

// damageTrack is nullable independently of rules.damageTrack, so the flag can be true with
// no track at all — a hand-edited or third-party file. Every read is optional-chained and
// the first click builds the whole object. `step` is required with no unselected state to
// return to, so clicking the current step is a no-op rather than a toggle. `dead` is not
// special-cased: no confirmation, no lockout.
const setStep = (step) => {
  if (!sheet.damageTrack) {
    sheet.damageTrack = { step, hurtAvailable: false, hurt: false }
    return
  }
  if (sheet.damageTrack.step === step) return
  sheet.damageTrack.step = step
}
</script>

<!-- The column reuses the wounds column's row, label, caret, note and pip classes
     wholesale, the way the shield column does: same shape, same wrap rules, same
     disclosure. Only the column itself and the movement line are its own. -->
<template>
  <div class="damage-track vitals__col vitals__col--flush">
    <h4 class="vitals__col-head microlabel">Damage Track</h4>
    <template v-for="s in STEPS" :key="s.key">
      <div class="wounds__tier">
        <button
          type="button"
          class="wounds__label wounds__label--toggle"
          :aria-expanded="openNotes[s.key]"
          :aria-controls="`track-note-${s.key}`"
          @click="toggleNote(s.key)"
        >
          {{ s.label
          }}<span class="wounds__caret" aria-hidden="true">{{
            openNotes[s.key] ? '▾' : '▸'
          }}</span>
        </button>
        <span class="wounds__pips">
          <!-- The pip has no text content and the step name belongs to the disclosure
               button beside it, so aria-label is the only thing that names this control;
               aria-pressed alone would announce a state with no subject. -->
          <button
            type="button"
            class="wound-pip damage-track__step"
            :class="{ 'wound-pip--filled': sheet.damageTrack?.step === s.key }"
            :aria-label="`Set damage track to ${s.label}`"
            :aria-pressed="sheet.damageTrack?.step === s.key"
            @click="setStep(s.key)"
          />
        </span>
      </div>
      <!-- v-show, not v-if: the aria-controls target must stay in the DOM while
           collapsed, or the button points at an id that does not exist. -->
      <p v-show="openNotes[s.key]" :id="`track-note-${s.key}`" class="wounds__note">
        {{ s.note }}
      </p>
    </template>
    <p class="damage-track__movement">{{ MOVEMENT_NOTE }}</p>
  </div>
</template>
