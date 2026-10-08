<script setup>
import { ref, watch } from 'vue'
import WoundsTrack from '@/components/WoundsTrack.vue'
import DamageTrack from '@/components/DamageTrack.vue'
import RecoveryBlock from '@/components/RecoveryBlock.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import { useSheetStore } from '@/stores/sheetStore.js'

// ddd-2g8 variant A (owner-picked from design-explorations/status-rail-variants
// .html): the rail is ONE "Damage & Recovery" panel — wounds / shield / recovery
// as rule-divided columns — and this pencil is the single edit switch for every
// setup control in the cluster (wound maxima, shield add/remove, slot editors,
// recovery bonus). Play view is labels + pips only. TRANSIENT view state, never
// persisted (the rollerStat rule).
const editing = ref(false)

const sheet = useSheetStore()

// ddd-xrug spec §8.1. Both rule toggles live in the panel head, in edit mode only, and
// each writes the flag together with the state that flag implies. Named handlers rather
// than inline template expressions so the two read the same way and a test can address
// them.
//
// Non-destructive in one direction only. That asymmetry is spec §3.1's convention enforced
// here, NOT a schema constraint: the v3 schema permits a live object beside a false flag,
// and exporter.test.js proves an export carries one. Nulling is what lets the export
// predicate fall back to version 2, so a current-edition character who tried the damage
// track once and switched it off does not export version 3 for the rest of their life.
// Wound and shield values are untouched either way and come back when the rule goes off.
const DAMAGE_TRACK_SEED = () => ({ step: 'hale', hurtAvailable: false, hurt: false })
// Phase 1 stores stress and renders no interface for it. The toggle still seeds and nulls
// the object, because the flag and the object travel together in the contract exactly as
// the damage track's pair does.
const STRESS_SEED = () => ({ points: 0, supernaturalLevels: 0 })

// Switching a rule off DESTROYS the play state that rule implies, and phase 1 renders no
// Stress interface at all, so a mis-click on Stress discards points and supernatural
// levels with nothing on screen changing and no way to type them back. Two-click
// arm-then-confirm, the same guard WoundsTrack puts on removeShield: native confirm() can
// be blocked in the sandboxed iframe. ONE ref for both toggles, so arming either disarms
// the other.
const arming = ref(null)
// An armed destructive confirm must not outlive the context that armed it. Leaving edit
// mode merely hides the checkboxes via v-if, so without this reset the next edit session
// would clear the step on its first click (the ddd-2g8 audit, WoundsTrack's own watch).
watch(editing, (on) => {
  if (!on) arming.value = null
})
// Nothing to destroy, nothing to confirm. A freshly seeded object holds no play state and
// neither does null, so unticking either of those performs at once rather than nagging.
//
// These two predicates guard the OFF direction only, and that is a deliberate gap rather
// than a claim that ticking is safe. The flag and the object are independent, so a document
// can arrive with rules.damageTrack false beside a live damageTrack object: healDamageTrack
// passes that through, and exporter.test.js blesses the disagreement as legal data the
// export must carry untouched. Ticking in that state falls to the else branch below and
// overwrites the step with DAMAGE_TRACK_SEED(), with nothing on screen to show it, because
// the column is hidden while the flag is false. The Stress twin is worse again: the points
// and supernatural levels go to zero and phase 1 renders no Stress interface at all.
// tma-enigmatic-occultist carries 7 points and 3 levels, so the amount at stake is real
// even though that fixture's own flag agrees with its object.
//
// The sheet's own toggles cannot produce the disagreeing state. Only an imported or relayed
// document can, and the symmetric guard is a behaviour change owed its own tests and
// review, so it is deferred to ddd-houn rather than smuggled into this one.
const damageTrackIsEmpty = () => {
  const t = sheet.damageTrack
  return !t || (t.step === 'hale' && !t.hurtAvailable && !t.hurt)
}
const stressIsEmpty = () => {
  const s = sheet.stress
  return !s || (s.points === 0 && s.supernaturalLevels === 0)
}
// A checkbox flips itself before the change event fires, so refusing the first click has
// to put the box back: the flag did not change, Vue therefore does not re-render, and the
// box would read unchecked while the sheet still says the rule is on. The same DOM resync
// syncClamped performs for a rejected number (ddd-9sf).
const syncChecked = (event, value) => {
  if (event?.target) event.target.checked = value
}
const setDamageTrackRule = (on, event) => {
  if (!on && !damageTrackIsEmpty() && arming.value !== 'damageTrack') {
    arming.value = 'damageTrack'
    syncChecked(event, sheet.rules.damageTrack)
    return
  }
  arming.value = null
  sheet.rules.damageTrack = on
  sheet.damageTrack = on ? DAMAGE_TRACK_SEED() : null
}
const setStressRule = (on, event) => {
  if (!on && !stressIsEmpty() && arming.value !== 'stress') {
    arming.value = 'stress'
    syncChecked(event, sheet.rules.stress)
    return
  }
  arming.value = null
  sheet.rules.stress = on
  sheet.stress = on ? STRESS_SEED() : null
}
</script>

<template>
  <section class="vitals panel">
    <div class="vitals__head">
      <h3 class="banner">Damage &amp; Recovery</h3>
      <!-- Setup, not play: the two rules that decide which injury model the table uses.
           They sit here rather than in the track column because the damageTrack checkbox
           is what makes that column appear, and a control cannot live inside the thing it
           creates. -->
      <div v-if="editing" class="vitals__rules">
        <!-- Armed state: the label says what the second click will destroy, the way the
             shield's remove button swaps to "Confirm ✕". -->
        <label class="vitals__rule" :class="{ 'vitals__rule--armed': arming === 'damageTrack' }">
          <input
            class="vitals__rule-damage-track"
            type="checkbox"
            :checked="sheet.rules.damageTrack"
            @change="setDamageTrackRule($event.target.checked, $event)"
          />
          <span>Damage track</span>
          <span v-if="arming === 'damageTrack'">Click again to clear the step</span>
        </label>
        <label class="vitals__rule" :class="{ 'vitals__rule--armed': arming === 'stress' }">
          <input
            class="vitals__rule-stress"
            type="checkbox"
            :checked="sheet.rules.stress"
            @change="setStressRule($event.target.checked, $event)"
          />
          <span>Stress</span>
          <span v-if="arming === 'stress'">Click again to clear the Stress points</span>
        </label>
      </div>
      <button
        class="vitals__edit btn"
        :class="{ 'vitals__edit--active': editing }"
        type="button"
        title="Edit"
        :aria-pressed="editing"
        aria-label="Edit damage and recovery"
        @click="editing = !editing"
      >
        <IconPencil />
      </button>
    </div>
    <div class="vitals__cols">
      <!-- One injury model or the other, never both, and the wounds and shield columns
           get no editing escape hatch: with the track on, zeroed wound maxima are the
           correct state rather than a mistake. -->
      <WoundsTrack v-if="!sheet.rules.damageTrack" :editing="editing" />
      <DamageTrack v-if="sheet.rules.damageTrack" :editing="editing" />
      <RecoveryBlock :editing="editing" />
    </div>
  </section>
</template>
