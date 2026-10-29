<script setup>
import { computed, reactive } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'
import { stressLevels } from '@/dice/rolls.js'

// ddd-xrug phase 3, spec §3. The Magnus Archives Stress column of the vitals panel,
// mounted by StatusRow when rules.stress is true and sitting after whichever injury column
// the damage-track rule chose, before recovery. StatusRow owns that gate — this component
// renders whenever it is mounted.
//
// `editing` is taken and unused on purpose: the columns share StatusRow's one pencil, and
// every number here is play state a player changes at the table, so nothing in this column
// belongs behind it (spec §3.1).
defineProps({ editing: { type: Boolean, default: false } })

const sheet = useSheetStore()

// Book copy, The Magnus Archives core rulebook pages 127 to 131 (Stress) and page 135
// (Alleviating Stress), quoted in spec §1.1 and ordered by spec §3.3. Do not paraphrase,
// re-condense or re-order: every word and every mark of internal punctuation is the
// book's. The only thing this file adds is the glue — one space between quotations, and
// `Label: value.` for each row of the book's Alleviating Stress table, whose four labels
// are capitalised exactly as the book prints them.
//
// What is deliberately NOT here: "Attempts to heal oneself in this fashion are hindered"
// is a SERIOUS-INJURY rule. It sits in page 135's own serious-injury paragraph and
// qualifies the hour-long difficulty 6 task that moves a character UP the damage track, so
// it belongs to the track's movement line and nowhere near Stress healing. An earlier
// draft of the spec attributed it here and dropped the second sentence of the healing-task
// quotation below; both were wrong (spec §3.3).
const POINTS_NOTE = [
  'A character begins with 0 Stress, but a terrible shock, a ghastly experience, or a gruesome encounter may inflict 1, 2, or even 3 points of Stress on them.',
  'Every 3 points of accumulated Stress constitutes a Stress level.',
  'Each Stress level hinders all actions by one step until the Stress is reduced.',
  'If a character has 4 levels of Stress, each full level of Stress thereafter is also a serious injury.',
  'Eventually, Stress can kill.',
  'A character should never gain more than 3 points of Stress in a single round.',
  'Time in a relatively safe, relaxing space reduces Stress by 3 points per hour.',
  'Eating or drinking: 3 points immediately (requires at least one action; can only be used once a day).',
  'Interacting with a pet: +1 point each hour resting.',
  'Meditation: +1 point each hour resting.',
  'Interacting with trusted friends: +1 point each hour resting.',
  'A character that wishes to reduce the Stress of another (or themselves) can attempt a healing task with a difficulty equal to the amount of Stress they want to reduce.',
  'Subsequent healing tasks to deal with more Stress may only be attempted after the stressed character rests for at least an hour for every healing task attempted.'
].join(' ')

// Book copy, pages 27 and 130. The middle quotation is also the whole justification for
// this row's minus button staying live: in the book the counter only ever rises, "this
// total should remain recorded", and a sheet that enforced that would make a mis-click
// permanent. So the rule is stated here, where the player reads it, rather than built into
// a control that refuses (spec §3.2).
const SUPERNATURAL_NOTE = [
  'Players should keep note of how many of their Stress levels come from supernatural sources (through either witnessing them or suffering damage from them).',
  "Even after this Stress is removed through rest or other means, this total should remain recorded. If a character reaches a total of 10 such levels, they have been 'touched' by the Entities enough that they can take on a supernatural aspect to themselves.",
  'Characters who gain a supernatural aspect can take type abilities marked as supernatural as they advance. Further, they can also choose to become an Avatar and gain access to special focus abilities as well.'
].join(' ')

// Book copy, page 100, printed beside the toggle rather than disclosed: all three
// consequences land at once on a player who ticks it (spec §4.2). The extra damage-track
// step is Task 6's Hurt row, which reads the flag from the store.
const ARMOR_NOTE =
  'PCs in this game are not kitted out with military vests or police Kevlar. If they do get hold of such gear, treat those wearing it as though they had an extra step in their damage track, similar to the Tough ability (available to Protectors and with the Never Says Die focus). All of their Speed-based tasks, however, are hindered, and the armor does not apply in some situations that might otherwise cause serious injury, such as falling or fire.'

// The book's two thresholds: page 128 for the serious injury, page 27 for the supernatural
// aspect. Both are also printed inside the copy above, which is why they are named here —
// a number that appears twice drifts.
const SERIOUS_INJURY_LEVELS = 4
const SUPERNATURAL_ASPECT_LEVELS = 10
// Three points is one hour's rest (page 135) and also exactly one level (page 128).
const RELIEF_POINTS = 3
const RELIEVE_LABEL = `Relieve ${RELIEF_POINTS} Stress points: one hour of rest, and exactly one level`

// The two threshold lines, always visible, in the sheet's own words rather than the book's:
// they say what the stored numbers now mean. The sheet never MOVES the damage track — that
// is the player's to do (ddd-4uhf, and phase 1 spec §8.2).
const SERIOUS_INJURY_LINE =
  'Each further full Stress level is also a serious injury, and the character moves one step down the damage track. The sheet does not move it.'
const SUPERNATURAL_ASPECT_LINE =
  'Touched by the Entities: this character can take type abilities marked as supernatural, and can choose to become an Avatar with access to special focus abilities.'

// Explanatory copy, not sheet data — local UI state, collapsed by default, never persisted.
// Same rule as WoundsTrack's tier notes and DamageTrack's step notes (ddd-0xq).
// Owner, Magnus walkthrough item 15 follow-up (2026-10-26). The armor rule was the last
// block of always-visible reference copy in this panel once the damage track's movement
// line went behind a caret, and the owner extended that ruling to it. `armor` joins the two
// row disclosures rather than taking a flag of its own, because unlike the damage track's
// movement line this one IS a row's note — the row is just a checkbox rather than a label.
const openNotes = reactive({ points: false, supernatural: false, armor: false })
const toggleNote = (row) => {
  openNotes[row] = !openNotes[row]
}

// `stress` is nullable independently of `rules.stress`, so the flag can be true with no
// object at all — a hand-edited or third-party file. Every read is optional-chained.
//
// The STORED value is what the box shows, never a sanitized stand-in. healStress requires
// both members to be integers but applies no floor, so a negative integer is the one
// corrupt value that survives a load, and rolls.js:106 justifies stressLevels returning 0
// for it by promising that it "still degrades VISIBLY, because the Stress column prints the
// stored points beside this level". This is where that promise is kept.
const storedPoints = computed(() => sheet.stress?.points ?? 0)
const storedSupernatural = computed(() => sheet.stress?.supernaturalLevels ?? 0)
const levels = computed(() => stressLevels(storedPoints.value))
const levelLine = computed(() => {
  const n = levels.value
  if (n === 0) return 'Level 0'
  // Spec §3.2 specifies both forms, singular at exactly one level and plural above. The
  // singular is the book's own: "Each Stress level hinders all actions by one step."
  return `Level ${n} · all actions hindered ${n} step${n === 1 ? '' : 's'}`
})

// The single first-write helper. The object is built WHOLE: a partial one is refused by the
// export validator with an error naming the missing member, and healStress nulls the whole
// object on the way back in, so a column that wrote one member would have destroyed the
// other with nothing on screen to show it. DamageTrack.setStep is the pattern.
const writeStress = (patch) => {
  if (!sheet.stress) sheet.stress = { points: 0, supernaturalLevels: 0 }
  Object.assign(sheet.stress, patch)
}

// Both floors are 0 and there is no ceiling: the schema's maximum is unbounded and the
// book's "never more than 3 points in a single round" is a GM's limit on what to inflict,
// not a cap on the total. The steppers are :disabled at the floor rather than silently
// inert, and the arithmetic still clamps — so a persisted negative is repaired UP to 0 by
// the plus rather than stepped to −4, and the minus, which is disabled there, cannot take
// it lower.
const addPoints = (delta) => writeStress({ points: Math.max(0, storedPoints.value + delta) })
const relieve = () => writeStress({ points: Math.max(0, storedPoints.value - RELIEF_POINTS) })
const addSupernatural = (delta) =>
  writeStress({ supernaturalLevels: Math.max(0, storedSupernatural.value + delta) })
// Returns the clamped value so the template can resync the box through syncClamped — a
// rejected edit otherwise survives in the DOM while the store, the export and the roller
// all disagree with it (ddd-9sf).
const setPoints = (value) => {
  const points = clampInt(value)
  writeStress({ points })
  return points
}
const setSupernatural = (value) => {
  const supernaturalLevels = clampInt(value)
  writeStress({ supernaturalLevels })
  return supernaturalLevels
}

// A plain boolean at the document ROOT, outside `stress`, so it is writable with `stress`
// null and must not build a stress object to do it.
const setArmor = (on) => {
  sheet.wearingArmor = on === true
}
</script>

<!-- Like the damage track, this column reuses the wounds column's row, label, caret, note
     and control-wrapper classes wholesale: same shape, same wrap rules, same disclosure.
     .wounds__pips is the ddd-2bv wrap valve — it lets a run of controls reflow INSIDE the
     row at 280px instead of pushing the row past the viewport, which is exactly what four
     controls beside a label need. .stress__label widens the label to the whole row, because
     "Supernatural levels" does not fit the basis a one-word wound tier uses. -->
<template>
  <div class="stress vitals__col vitals__col--rule">
    <h4 class="vitals__col-head microlabel">Stress</h4>

    <div class="wounds__tier">
      <button
        type="button"
        class="wounds__label wounds__label--toggle stress__label"
        :aria-expanded="openNotes.points"
        aria-controls="stress-note-points"
        @click="toggleNote('points')"
      >
        Points<span class="wounds__caret" aria-hidden="true">{{
          openNotes.points ? '▾' : '▸'
        }}</span>
      </button>
      <span class="wounds__pips">
        <!-- The steppers carry no text a screen reader can place, so aria-label is the only
             thing naming them: the row's own name belongs to the disclosure button above. -->
        <button
          type="button"
          class="stress__step-down"
          aria-label="Remove 1 Stress point"
          :disabled="storedPoints <= 0"
          @click="addPoints(-1)"
        >
          −
        </button>
        <input
          class="stress__points field"
          type="number"
          min="0"
          :value="storedPoints"
          aria-label="Stress points"
          @change="syncClamped($event, setPoints($event.target.value))"
        />
        <button
          type="button"
          class="stress__step-up"
          aria-label="Add 1 Stress point"
          @click="addPoints(1)"
        >
          +
        </button>
        <!-- One hour's rest, and one whole level. title as well as aria-label: a hover
             tooltip is the only place a sighted player learns what −3 means. -->
        <button
          type="button"
          class="stress__relieve"
          :title="RELIEVE_LABEL"
          :aria-label="RELIEVE_LABEL"
          :disabled="storedPoints <= 0"
          @click="relieve()"
        >
          −3
        </button>
      </span>
    </div>
    <!-- v-show, not v-if: the aria-controls target must stay in the DOM while collapsed, or
         the button points at an id that does not exist. -->
    <p v-show="openNotes.points" id="stress-note-points" class="wounds__note">
      {{ POINTS_NOTE }}
    </p>

    <p class="stress__level">{{ levelLine }}</p>
    <p v-if="levels >= SERIOUS_INJURY_LEVELS" class="stress__line stress__serious-injury">
      {{ SERIOUS_INJURY_LINE }}
    </p>

    <div class="wounds__tier">
      <button
        type="button"
        class="wounds__label wounds__label--toggle stress__label"
        :aria-expanded="openNotes.supernatural"
        aria-controls="stress-note-supernatural"
        @click="toggleNote('supernatural')"
      >
        Supernatural levels<span class="wounds__caret" aria-hidden="true">{{
          openNotes.supernatural ? '▾' : '▸'
        }}</span>
      </button>
      <span class="wounds__pips">
        <button
          type="button"
          class="stress__step-down"
          aria-label="Remove 1 supernatural Stress level"
          :disabled="storedSupernatural <= 0"
          @click="addSupernatural(-1)"
        >
          −
        </button>
        <input
          class="stress__supernatural field"
          type="number"
          min="0"
          :value="storedSupernatural"
          aria-label="Supernatural Stress levels"
          @change="syncClamped($event, setSupernatural($event.target.value))"
        />
        <button
          type="button"
          class="stress__step-up"
          aria-label="Add 1 supernatural Stress level"
          @click="addSupernatural(1)"
        >
          +
        </button>
      </span>
    </div>
    <p v-show="openNotes.supernatural" id="stress-note-supernatural" class="wounds__note">
      {{ SUPERNATURAL_NOTE }}
    </p>
    <p v-if="storedSupernatural >= SUPERNATURAL_ASPECT_LEVELS" class="stress__line stress__aspect">
      {{ SUPERNATURAL_ASPECT_LINE }}
    </p>

    <!-- Play state, never behind the pencil, and gated by rules.stress alone — which is
         this column's own gate. It lives here rather than beside the Hurt step it grants
         because StatusRow mounts DamageTrack only when rules.damageTrack is true, and
         Stress-on with the track off is a legal state the roller still reads the flag in
         (spec §4.2). -->
    <div class="stress__armor-row">
      <!-- The label still wraps its own checkbox, so clicking the words toggles the armor
           and not the disclosure. The caret is a SIBLING button for that reason: the two
           rows above can use their label as the toggle because nothing else claims it. -->
      <label class="stress__armor-label">
        <input
          class="stress__armor"
          type="checkbox"
          :checked="sheet.wearingArmor"
          @change="setArmor($event.target.checked)"
        />
        <span>Worn armor</span>
      </label>
      <button
        type="button"
        class="stress__armor-toggle"
        :aria-expanded="openNotes.armor"
        aria-controls="stress-note-armor"
        aria-label="The worn armor rule"
        @click="toggleNote('armor')"
      >
        <span class="wounds__caret" aria-hidden="true">{{ openNotes.armor ? '▾' : '▸' }}</span>
      </button>
    </div>
    <!-- v-show, not v-if: the aria-controls target must stay in the DOM while collapsed. -->
    <p
      v-show="openNotes.armor"
      id="stress-note-armor"
      class="stress__line stress__armor-note"
    >
      {{ ARMOR_NOTE }}
    </p>
  </div>
</template>
