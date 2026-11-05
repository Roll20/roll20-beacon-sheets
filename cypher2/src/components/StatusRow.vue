<script setup>
import { ref, watch } from 'vue'
import WoundsTrack from '@/components/WoundsTrack.vue'
import DamageTrack from '@/components/DamageTrack.vue'
import StressTrack from '@/components/StressTrack.vue'
import RecoveryBlock from '@/components/RecoveryBlock.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import { damageTrackSeed, stressSeed, useSheetStore } from '@/stores/sheetStore.js'

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
// Asymmetric in what each direction writes: off nulls the rule's own object, on keeps the
// object that is already there and seeds one only when there is none (ddd-rn28, owner ruling
// 2026-10-30). That asymmetry is spec §3.1's convention enforced here, NOT a schema
// constraint: the v3 schema carries no cross-field conditional at all, so a live object beside
// a false flag is valid, and exporter.test.js proves an export carries one. Nulling is what
// lets the export predicate fall back to version 2, so a current-edition character who tried
// the damage track once and switched it off does not export version 3 for the rest of their
// life. Wound and shield values are untouched either way and come back when the rule goes off.
// Both starting shapes are imported, not written here. The first pip click in DamageTrack
// and the first plus click in StressTrack start an object from nothing too, so each shape
// has two writers and must have one source (ddd-iohk). The toggle nulls and seeds the
// stress object as well, because the flag and the object travel together in the contract
// exactly as the damage track's pair does.
// Only one direction destroys play state. Switching a rule OFF nulls the rule's object, and
// the column the loss would show is the one the click is taking away, so a mis-click on Stress
// discards points and supernatural levels with nothing left on screen to say so. Two-click
// arm-then-confirm, the same guard WoundsTrack puts on removeShield: native confirm() can be
// blocked in the Roll20 frame (ddd-2dx). NOT because the frame is sandboxed — it is not,
// probed and disproved in ddd-idha — and nothing here has established which mechanism does
// block it. ONE ref for both toggles, so arming either of them disarms the other.
const arming = ref(null)
// An armed destructive confirm must not outlive the context that armed it. Leaving edit
// mode merely hides the checkboxes via v-if, so without this reset the next edit session
// would clear the step on its first click (the ddd-2g8 audit, WoundsTrack's own watch).
watch(editing, (on) => {
  if (!on) arming.value = null
})
// Nothing to destroy, nothing to confirm. A freshly seeded object holds no play state and
// neither does null, so unticking over one of those performs at once rather than nagging.
//
// ddd-rn28: `on` IS part of the condition, because only the off direction destroys anything.
// The flag and the object are independent, so a document can arrive with rules.stress false
// beside live points — a hand-edited or third-party import, or a relay hydrate of a document
// another consumer wrote — and exporter.test.js blesses the disagreement as legal data the
// export must carry untouched. ddd-houn made that tick arm then confirm, which stopped the
// one-click wipe but still ended both clicks at the seed, so there was no way to turn the rule
// on and KEEP the imported numbers. The owner ruled on 2026-10-30 that the tick adopts them
// instead, so it destroys nothing and asks nothing. tma-enigmatic-occultist carries 7 points
// and 3 supernatural levels, so the amount at stake is real.
//
// Adopting is safe because hydrate heals: healDamageTrack and healStress null anything
// malformed (sheetStore.js), so the object adopted here is well formed.
const damageTrackIsEmpty = () => {
  const t = sheet.damageTrack
  return !t || (t.step === 'hale' && !t.hurtAvailable && !t.hurt)
}
const stressIsEmpty = () => {
  const s = sheet.stress
  return !s || (s.points === 0 && s.supernaturalLevels === 0)
}
// A checkbox flips itself before the change event fires, so refusing the first click has to
// put the box back: the flag did not change, Vue therefore does not re-render, and the box
// would read unchecked while the sheet still says the rule is on. The same DOM resync
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
  sheet.damageTrack = on ? (sheet.damageTrack ?? damageTrackSeed()) : null
}
const setStressRule = (on, event) => {
  if (!on && !stressIsEmpty() && arming.value !== 'stress') {
    arming.value = 'stress'
    syncChecked(event, sheet.rules.stress)
    return
  }
  arming.value = null
  sheet.rules.stress = on
  sheet.stress = on ? (sheet.stress ?? stressSeed()) : null
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
