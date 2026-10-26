<script setup>
import { computed, reactive, ref } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { DAMAGE_TRACK_STEPS, DAMAGE_TRACK_STEP_LABELS } from '@/components/enums.js'

// ddd-xrug spec §8. The damage track column of the vitals panel, in the slot the wounds
// column holds when rules.damageTrack is false. The two are mutually exclusive, and
// StatusRow owns that gate — this component renders whenever it is mounted.
//
// `editing` gates one control and one only: the hurtAvailable checkbox (spec §4.2), which
// is character setup rather than play state. Marking a step is a play action like a wound
// pip, so every pip stays live in both modes.
defineProps({ editing: { type: Boolean, default: false } })

const sheet = useSheetStore()

// Book copy, Old Gods of Appalachia core rulebook page 141, quoted in spec §8.3. Do not
// paraphrase, re-condense or re-word: every word and every mark of internal punctuation is
// the book's. Each note reads as a definition of the step label above it, which supplies
// the subject the book sentence assumes, so the only change from the spec's text is the
// leading letter capitalized where a note now starts a sentence.
//
// `hurt` is the one entry that is not Old Gods copy. It is The Magnus Archives core
// rulebook page 132, quoted in spec §1.1, and it belongs to BOTH copy sets: the step is
// Magnus's, no other book this sheet supports defines one, and the Old Gods core rulebook
// was not checked for it. A document that sets hurtAvailable under the other copy set gets
// the row and this note rather than silence. Named once and shared by both maps, because
// two literals of the same quotation are two chances to drift.
const HURT_NOTE =
  'A special step available that particularly tough characters reach before they are impaired. It imposes no penalties. Most characters skip this step and go right to impaired.'
const STEP_NOTES = {
  hale: 'The normal state for a character: all three stat Pools are at 1 or higher, and the PC has no penalties from harmful conditions. A character whose Pools are much lower than normal can still be hale.',
  hurt: HURT_NOTE,
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

// Book copy, The Magnus Archives core rulebook page 132, quoted in spec §1.1. The second
// copy set, selected below on rules.stress (spec §7). It exists because two entries of the
// set above state rules this book does not have: hale's "all three stat Pools are at 1 or
// higher" and the whole of MOVEMENT_NOTE. A Magnus character has no pool-at-zero rule at
// all — spec §1.1 records that the extracted book text contains no rule of that shape under
// any phrasing, and page 132's serious injury is the only stated way down the track.
//
// Same transcription convention as the set above: the step label supplies the subject the
// book sentence assumes ("Hale is the normal state..."), so the note drops it and
// capitalizes what is left. `dead` keeps its subject because the whole quotation is "Dead
// is dead." and nothing is left without it.
const MAGNUS_STEP_NOTES = {
  hale: 'The normal state for a character: the PC has no penalties from harmful conditions.',
  hurt: HURT_NOTE,
  impaired:
    "A wounded or injured state. When an impaired character applies Effort, it costs 1 extra point per level applied. For example, applying one level of Effort costs 4 points instead of 3, and applying two levels of Effort costs 7 points instead of 5. An impaired character ignores minor and major effect results on their rolls and doesn't deal extra damage in combat with a special roll.",
  debilitated:
    'A critically injured state. A debilitated character may not take any actions other than to move (probably crawl).',
  dead: 'Dead is dead.'
}

// The Magnus movement line: page 132's serious injury, which is the only way DOWN the
// track, then page 135's healing task and page 136's Restoring the Damage Track sidebar,
// which are the two ways back up. Quoted in spec §1.1 and assembled in the order spec §7
// gives. One space between quotations is the only thing this file adds; the one elision,
// marked "..." in the spec, drops the book's parenthetical list of example injuries ("like
// a stab wound, a gunshot wound, a fall from a rooftop, or the body-morphing touch of The
// Boneturner,") and keeps the book's own comma, so no character here is not the book's.
//
// "Attempts to heal oneself in this fashion are hindered" belongs HERE and nowhere else. It
// is page 135's serious-injury rule qualifying the hour-long task that moves a character UP
// this track, not a Stress-healing rule: an earlier draft of the spec attributed it to
// StressTrack's disclosure, which is now tested not to carry it (spec §3.3).
//
// As with the set above, the sheet never APPLIES any of this: it stores, shows and exports
// the step the player marks (ddd-4uhf).
const MAGNUS_MOVEMENT_NOTE = [
  'When a physical wound or injury is greater than those that inflict 3 points of Stress, it is referred to as a serious injury.',
  'When a character suffers a serious injury, the character moves one step down the damage track.',
  'To move a seriously injured character up the damage track from impaired (or hurt) to hale is a task that requires an hour and has a difficulty of 6. A character more injured than that probably requires a hospital setting and lots of rest. Attempts to heal oneself in this fashion are hindered.',
  "If a character's Pools are all full, a ten-hour recovery roll can be used to move a character from impaired to hale (or from hurt to hale). A debilitated character typically needs two full days of inactivity to move to impaired. Treatment by someone skilled in medicine (like a doctor) can reduce this to just one day. Then at least one more full night's rest is required to get to hale."
].join(' ')

// Order comes from the enum and nowhere else, so contract-enums.test.js locks the rendered
// column against the v3 schema. Reading the label map by an enum KEY needs no enumLabel
// guard: that guard exists for values read out of storage, and none of these is.
//
// The Hurt row is NOT in that list and must not be: Hurt is a fifth position the schema's
// four-value `step` enum does not contain, stored as a separate boolean. Its pip carries
// .damage-track__hurt rather than .damage-track__step for the same reason — the enum lock
// counts that class against the schema, and five controls for a four-value enum would
// leave it unable to say what it is pinning (spec §4.1).
//
// HURT is named rather than written as a literal precisely because it is the one row key
// that is NOT an enum member: it keys the notes map, the disclosure state and two
// branches, and a typo in any of them would silently grow a sixth row. The four step keys
// need no such constant — they come off the enum.
//
// The row descriptors carry no `note`. They are built once at import time, and the rows
// computed below is a computed over ORDERING alone — it never re-reads them — so a note
// baked in here would be the copy set chosen once per process and never again, which is
// exactly what the rule selection cannot be. The note is read by key off a computed map
// instead (spec §7).
const HURT = 'hurt'
const STEPS = DAMAGE_TRACK_STEPS.map((key) => ({
  key,
  label: DAMAGE_TRACK_STEP_LABELS[key],
  pipClass: 'damage-track__step'
}))
const HURT_ROW = {
  key: HURT,
  label: 'Hurt',
  pipClass: 'damage-track__hurt'
}

// Explanatory copy, not sheet data — local UI state, collapsed by default, never
// persisted. Same rule as WoundsTrack's tier notes (ddd-0xq).
// Owner, Magnus walkthrough item 9 (2026-10-26). The two things that grant the step used
// to BE the checkbox's label, which made it a wrapped sentence beside three condensed
// uppercase microlabels and read as two designs rather than one. The label is now short
// enough to take the same treatment and the detail moved here, one click away in the Hurt
// row's disclosure.
//
// Its OWN paragraph rather than appended to HURT_NOTE, because that note is publisher copy
// pinned byte for byte by DamageTrack.test.js, and welding a sheet sentence onto a book
// quotation is how a transcription stops being one. These are the sheet's words.
//
// Worn armor is the third grant and is deliberately absent: it is play state owned by the
// Stress column, which carries the book's armor rule beside its own checkbox (spec §4.2),
// and this line sits in a disclosure a Magnus player may never open.
const HURT_GRANTS_LINE =
  'The Tough ability and the Never Says Die focus each grant this step.'

// Owner, Magnus walkthrough item 15 (2026-10-26). The movement copy was always visible and
// uncollapsible: 902 characters under the Stress rule, nine sentences, in a column that is
// 243px wide at the 280px floor. Every other reference paragraph on this sheet is behind a
// caret, and this one is now too. Its own flag rather than a key in openNotes, which is
// keyed by damage-track step and would then carry a member that is not one.
const movementOpen = ref(false)

const openNotes = reactive(
  Object.fromEntries([...DAMAGE_TRACK_STEPS, HURT].map((key) => [key, false]))
)
const toggleNote = (step) => {
  openNotes[step] = !openNotes[step]
}

// Spec §4.1. Two independent grants, gated differently on purpose. `hurtAvailable` is the
// decision the book itself makes — the Tough ability or the Never Says Die focus — so it
// stands alone, the same reasoning that keyed phase 1's column exclusion on the flag.
// `wearingArmor` needs the rule gate: worn armor granting a track step is a Magnus rule,
// the flag is a plain root boolean that SURVIVES rules.stress being switched off (as it
// must — the export carries it unchanged and setStressRule clears only `stress`), and its
// toggle renders only under the rule, over in the Stress column. Ungated, an Old Gods or
// current-edition character would show a Magnus-only fifth step with no control anywhere
// to clear it. This column reads the flag and never writes it (spec §4.2).
const hurtAvailable = computed(() => sheet.damageTrack?.hurtAvailable === true)
const stressRule = computed(() => sheet.rules.stress === true)
const showHurt = computed(
  () => hurtAvailable.value || (stressRule.value && sheet.wearingArmor === true)
)
// Spec §7. Which book's copy this column states, by the one flag that says which book is
// in play. Computed and not baked into the rows, so a table that turns the rule on
// mid-session gets the other book's copy without a reload; both are read by step key, so a
// map missing an entry renders an empty note rather than the wrong book's.
const stepNotes = computed(() => (stressRule.value ? MAGNUS_STEP_NOTES : STEP_NOTES))
const movementNote = computed(() => (stressRule.value ? MAGNUS_MOVEMENT_NOTE : MOVEMENT_NOTE))
// The rendered rows, with Hurt spliced in after hale and before impaired — the position
// the book inserts it at. Built from STEPS rather than written out, so the enum stays the
// only source of the four steps' order.
const rows = computed(() =>
  STEPS.flatMap((s) => (s.key === 'hale' && showHurt.value ? [s, HURT_ROW] : [s]))
)

// damageTrack is nullable independently of rules.damageTrack, so the flag can be true with
// no track at all — a hand-edited or third-party file. Every read is optional-chained and
// the first write builds the whole object. WHOLE: a partial one is refused by the export
// validator with an error naming the missing member, and healDamageTrack nulls the lot on
// the way back in, so a column that wrote one member would destroy the others.
const writeTrack = (patch) => {
  if (!sheet.damageTrack) sheet.damageTrack = { step: 'hale', hurtAvailable: false, hurt: false }
  Object.assign(sheet.damageTrack, patch)
}

// `step` is required with no unselected state to return to, so clicking the step already
// shown is a no-op rather than a toggle. `dead` is not special-cased: no confirmation, no
// lockout.
//
// Every step pip clears `hurt`, hale's included. That is the whole mechanism behind the
// book's sidebar rule that a character who is impaired and moves up the track always goes
// to hale and never Hurt, even with the step: `hurt` was cleared on the way down, so the
// climb back up lands on hale with nothing special-casing it. It also means hale is not a
// no-op while `hurt` is set — it is the way back off the Hurt pip.
const setStep = (step) => {
  if (sheet.damageTrack?.step === step && sheet.damageTrack?.hurt !== true) return
  writeTrack({ step, hurt: false })
}
// Hurt is stored as hale plus the boolean, because the hand-off is explicit that `hurt` is
// only meaningful at hale.
const setHurt = () => writeTrack({ step: 'hale', hurt: true })
const select = (key) => (key === HURT ? setHurt() : setStep(key))

// Nothing here normalizes on load (spec §4.3). A document can arrive with step 'impaired'
// and `hurt` true; it renders as impaired with the Hurt pip empty and exports byte-for-byte
// unchanged. The invariant above is enforced on CLICK and never on load, because healing
// the pair would break the round-trip law for a disagreement the schema permits.
const filled = (key) => {
  const track = sheet.damageTrack
  if (key === HURT) return track?.step === 'hale' && track?.hurt === true
  // Only hale is qualified by `hurt`: the pair above must render as impaired, not as
  // nothing, and `hurt` is meaningless at the three lower steps.
  if (key === 'hale') return track?.step === 'hale' && track?.hurt !== true
  return track?.step === key
}

// Character setup, not play state: it answers whether this character has the Tough ability
// or the Never Says Die focus, which changes only on advancement. Unticking it does NOT
// touch `hurt` — the row simply goes, and the stored disagreement is the player's to fix,
// because the export carries both unchanged.
const setHurtAvailable = (on) => writeTrack({ hurtAvailable: on === true })
// Short enough for the condensed uppercase microlabel its three neighbours use — the
// DAMAGE TRACK and STRESS rule checkboxes and WORN ARMOR. What it dropped is in
// HURT_GRANTS_LINE above.
const HURT_AVAILABLE_LABEL = 'Hurt step'
</script>

<!-- The column reuses the wounds column's row, label, caret, note and pip classes
     wholesale, the way the shield column does: same shape, same wrap rules, same
     disclosure. Only the column itself and the movement line are its own. -->
<template>
  <div class="damage-track vitals__col vitals__col--flush">
    <h4 class="vitals__col-head microlabel">Damage Track</h4>
    <!-- The Hurt row is one of these rows, not a special case beside them: same tier
         markup, same disclosure, same pip. Only its pip class and its fill rule differ,
         and both travel on the row descriptor. -->
    <template v-for="s in rows" :key="s.key">
      <div class="wounds__tier">
        <button
          type="button"
          class="wounds__label wounds__label--toggle"
          :aria-expanded="openNotes[s.key]"
          :aria-controls="s.key === 'hurt' ? 'track-note-hurt track-note-hurt-grants' : `track-note-${s.key}`"
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
            class="wound-pip"
            :class="[s.pipClass, { 'wound-pip--filled': filled(s.key) }]"
            :aria-label="`Set damage track to ${s.label}`"
            :aria-pressed="filled(s.key)"
            @click="select(s.key)"
          />
        </span>
      </div>
      <!-- v-show, not v-if: the aria-controls target must stay in the DOM while
           collapsed, or the button points at an id that does not exist. The ROW itself is
           v-if'd for Hurt, which is sound — the button goes with its target. -->
      <p v-show="openNotes[s.key]" :id="`track-note-${s.key}`" class="wounds__note">
        {{ stepNotes[s.key] }}
      </p>
      <!-- The sheet's own sentence, kept out of the book note beside it. Its id is the
           second target of the Hurt row's aria-controls, so the disclosure announces both
           paragraphs rather than half of what it opens. -->
      <p
        v-if="s.key === 'hurt'"
        v-show="openNotes.hurt"
        id="track-note-hurt-grants"
        class="damage-track__hurt-grants"
      >
        {{ HURT_GRANTS_LINE }}
      </p>
    </template>
    <!-- Behind a caret since the owner's walkthrough (item 15): the Magnus copy is 902
         characters and the column is 243px wide at the 280px floor. Same disclosure shape
         as every row above, so there is one thing to learn rather than two. -->
    <button
      type="button"
      class="damage-track__movement-toggle"
      :aria-expanded="movementOpen"
      aria-controls="track-note-movement"
      @click="movementOpen = !movementOpen"
    >
      Moving on the track<span class="wounds__caret" aria-hidden="true">{{
        movementOpen ? '▾' : '▸'
      }}</span>
    </button>
    <p v-show="movementOpen" id="track-note-movement" class="damage-track__movement">
      {{ movementNote }}
    </p>
    <!-- Behind StatusRow's pencil, unlike everything above it: whether a character HAS
         the Hurt step changes on advancement, not at the table. The worn-armor toggle,
         which is the other way to get the row, is play state and lives in the Stress
         column instead (spec §4.2) — this column only reads that flag. -->
    <label v-if="editing" class="damage-track__available-row">
      <input
        class="damage-track__available"
        type="checkbox"
        :checked="hurtAvailable"
        @change="setHurtAvailable($event.target.checked)"
      />
      <span>{{ HURT_AVAILABLE_LABEL }}</span>
    </label>
  </div>
</template>
