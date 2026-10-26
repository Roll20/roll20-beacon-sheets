<script setup>
import { ref, watch } from 'vue'
import WoundsTrack from '@/components/WoundsTrack.vue'
import DamageTrack from '@/components/DamageTrack.vue'
import StressTrack from '@/components/StressTrack.vue'
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

// ddd-xrug spec §8.1. Both rule toggles live in the panel head, in edit mode only, and each
// writes the flag together with the state that flag implies. Named handlers rather than
// inline template expressions so the two read the same way and a test can address them.
//
// The Luck Pool toggle was the third one here until the owner's walkthrough on 2026-10-26.
// These two decide which injury model the table uses, and Luck is not an injury model, so
// the panel's heading was off-label for it. It now lives in SettingsModal, which carries
// the seed, the emptiness test and its own arming flag.
//
// Asymmetric in WHICH write each direction makes, not in whether a write can destroy: off
// nulls the rule's own object, on seeds it, and ddd-houn guards both. That asymmetry is
// spec §3.1's convention enforced here, NOT a schema constraint: the v3 schema permits a
// live object beside a false flag, and exporter.test.js proves an export carries one.
// Nulling is what lets the export predicate fall back to version 2, so a current-edition
// character who tried the damage track once and switched it off does not export version 3
// for the rest of their life. Wound and shield values are untouched either way and come
// back when the rule goes off.
const DAMAGE_TRACK_SEED = () => ({ step: 'hale', hurtAvailable: false, hurt: false })
// The toggle seeds and nulls the object, because the flag and the object travel together
// in the contract exactly as the damage track's pair does.
const STRESS_SEED = () => ({ points: 0, supernaturalLevels: 0 })
// Moving a rule either way DESTROYS the play state that rule implies: off nulls the
// object, on overwrites it with the seed. So a mis-click on Stress discards points and
// supernatural levels, and the column the loss would show is the one the click is turning
// on or off. Two-click arm-then-confirm, the same guard WoundsTrack puts on removeShield:
// native confirm() can be blocked in the sandboxed iframe. ONE ref for both toggles, so
// arming either of them disarms the other.
const arming = ref(null)
// An armed destructive confirm must not outlive the context that armed it. Leaving edit
// mode merely hides the checkboxes via v-if, so without this reset the next edit session
// would clear the step on its first click (the ddd-2g8 audit, WoundsTrack's own watch).
watch(editing, (on) => {
  if (!on) arming.value = null
})
// Nothing to destroy, nothing to confirm. A freshly seeded object holds no play state and
// neither does null, so moving a rule in either direction over one of those performs at
// once rather than nagging.
//
// ddd-houn: emptiness is the WHOLE condition, with no `on` in it, because either direction
// writes over the object. The flag and the object are independent, so a document can arrive
// with rules.damageTrack false beside a live damageTrack object: healDamageTrack passes
// that through, and exporter.test.js blesses the disagreement as legal data the export must
// carry untouched. Ticking in that state used to fall straight to the write below and
// overwrite the step with DAMAGE_TRACK_SEED(). The Stress twin was worse: points and
// supernatural levels to zero on one click. tma-enigmatic-occultist carries 7 points and 3
// levels, so the amount at stake is real even though that fixture's own flag agrees with
// its object.
//
// The sheet's own toggles cannot produce the disagreeing state. Only an imported or relayed
// document can, which is why the gap survived ddd-xrug's own tests: every path those tests
// could reach through the UI had an empty object under it.
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
  if (!damageTrackIsEmpty() && arming.value !== 'damageTrack') {
    arming.value = 'damageTrack'
    syncChecked(event, sheet.rules.damageTrack)
    return
  }
  arming.value = null
  sheet.rules.damageTrack = on
  sheet.damageTrack = on ? DAMAGE_TRACK_SEED() : null
}
const setStressRule = (on, event) => {
  if (!stressIsEmpty() && arming.value !== 'stress') {
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
           They sit here rather than in the columns they key because the damageTrack
           checkbox is what makes that column appear, and a control cannot live inside the
           thing it creates. The Luck Pool toggle used to sit beside them and is now in
           Settings, because Luck is not an injury model (owner, 2026-10-26). -->
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
      <!-- ddd-xrug spec §3.1. Stress is a THIRD injury model that runs alongside whichever
           of the two above the damage-track rule chose, not instead of one: Magnus shows
           Stress + track + recovery, and Stress on with the track off shows wounds +
           shield + Stress + recovery, which is schema-legal and reachable. It goes AFTER
           the injury columns so DamageTrack keeps vitals__col--flush unconditionally
           rather than taking a padding class that depends on another rule's flag. -->
      <StressTrack v-if="sheet.rules.stress" :editing="editing" />
      <RecoveryBlock :editing="editing" />
    </div>
  </section>
</template>
