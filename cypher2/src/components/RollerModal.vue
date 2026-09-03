<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { easedSteps, effortCost, maxAffordableEffort, rawEffortCost } from '@/dice/rolls.js'
import { easesLine, noSpendLine } from '@/rollTemplates/guidedCard.js'
import { POOL_NAMES, poolLabel } from '@/components/pools.js'
import { clampInt } from '@/utility/clamp.js'

const sheet = useSheetStore()

// Transient per-open state — the App renders this component with v-if plus a
// per-open session key (ddd-669y), so every open is a fresh mount and these
// reset by construction (spec §2). skillId seeds from the per-skill entry's
// intent; rollSkill() already refused proficiencies and unknown ids, and this
// re-validates against the live rows anyway (truthiness — the audit r2 rule).
const skillId = ref(
  sheet.skills.some((r) => r._id === sheet.rollerSkillId && !r.isProficiency)
    ? sheet.rollerSkillId
    : null
)
const showAllSkills = ref(false)
const assets = ref(0)
const effortLevels = ref(0)
const difficultyRaw = ref('') // '' = no difficulty entered
const error = ref(null)
const busy = ref(false)

// Null-safe: the component can outlive rollerStat by a tick while the v-if
// tears it down — computeds must not explode on stat === null (audit F5).
// Since ddd-669y stat null is also a LIVE open state (a poolless skill's
// entry): the pool select below is how it becomes non-null, and Roll stays
// gated until it does.
const stat = computed(() => sheet.rollerStat)
const open = computed(() => sheet.rollerOpen)
const statLabel = computed(() => (stat.value ? stat.value.charAt(0).toUpperCase() + stat.value.slice(1) : ''))
const pool = computed(() => sheet.pools[stat.value] ?? { current: 0, max: 0, edge: 0 })
// Mirror the store's affordability domain (min(current, max)) so the preview
// can never promise Effort the store will refuse — phantom points above max
// don't fund rolls (3rd audit F2).
const available = computed(() => Math.min(pool.value.current, Math.max(pool.value.max, 0)))
// clampInt only floors at 0 — the spec's 0–10 range needs the upper clamp too.
const difficulty = computed(() => (difficultyRaw.value === '' ? null : Math.min(clampInt(difficultyRaw.value), 10)))

const skill = computed(() => sheet.skills.find((r) => r._id === skillId.value) ?? null)
// Proficiencies are excluded OUTRIGHT (owner ruling, ddd-5vb): they are not
// task-easing skills (MCG §3.6 — not trainable), so they never appear in the
// roller, under show-all included.
const rollableSkills = computed(() => sheet.skills.filter((r) => !r.isProficiency))
const skillOptions = computed(() => {
  const list = showAllSkills.value ? rollableSkills.value : rollableSkills.value.filter((r) => r.pool === stat.value)
  // A selected cross-pool skill stays visible when show-all is unchecked — a
  // blank select silently easing the roll is worse (3rd audit F7). NOT a
  // selected proficiency though (audit F4): the watcher below clears that
  // selection, and re-adding it here would ride the exclusion straight back in
  // for the tick before the clear lands.
  return skill.value && !skill.value.isProficiency && !list.includes(skill.value)
    ? [...list, skill.value]
    : list
})

// A hydrate can flip the SELECTED row to a proficiency while the modal is open
// (audit F4). Without this, the keep-visible fallback would hold it selectable
// and its rating would keep easing the roll — the exclusion has to clear the
// selection, not just the list. flush:'sync' so a doRoll commit on the same
// tick can never snapshot the stale skillId. TRUTHINESS, not === true (audit
// r2 F2): hydrate applies no validation, so isProficiency can arrive as the
// string "true" — rollableSkills excludes it by truthiness, and a stricter
// predicate here would leave the hidden row selected and still easing rolls.
watch(() => !!skill.value?.isProficiency, (isProf) => {
  if (isProf) skillId.value = null
}, { flush: 'sync' })

// Asset prefill (owner ruling, ddd-5vb): picking a skill sets the stepper to
// its stored asset — clamped to the roller's 0–2 domain so a stray value can't
// overshoot — and stays adjustable for situational assets; changing skills
// re-prefills, and clearing the skill resets to 0. Watches skillId, not
// `skill`: a mid-flight hydrate replacing the rows array would re-resolve the
// same selection to a new object and stomp a manual adjustment. flush:'sync'
// (audit r2 F1): the proficiency-clear above nulls skillId synchronously, and
// a pre-flush prefill would let a same-task doRoll snapshot the OLD skill's
// asset — posting an ease the cleared selection no longer justifies.
// immediate: a per-skill open (ddd-669y) seeds skillId at setup, so it never
// "changes" — the prefill must fire on mount too.
watch(skillId, () => {
  const a = skill.value?.asset
  assets.value = typeof a === 'number' ? Math.min(Math.max(a, 0), 2) : 0
}, { flush: 'sync', immediate: true })

const maxEffort = computed(() => maxAffordableEffort(sheet.effort, available.value, pool.value.edge))
// Busy-gated: rollGuided's own synchronous reservation drops the live pool
// mid-flight and would otherwise clamp the very Effort being rolled (3rd
// audit F6). doRoll reconciles after the store settles.
watch(maxEffort, (m) => { if (!busy.value && effortLevels.value > m) effortLevels.value = m })

const eased = computed(() => easedSteps({ skillRating: skill.value?.rating ?? null, assets: assets.value, effortLevels: effortLevels.value }))
const rawCost = computed(() => rawEffortCost(effortLevels.value))
const cost = computed(() => effortCost(effortLevels.value, pool.value.edge))
// Preview deducts from the ACTUAL current — the store's deduction base —
// not from the clamped affordability base (4th audit F1: a 7/5 pool with
// cost 3 resolves to 4/5, so the preview must say 4/5, not 2/5). While a
// roll is in flight the reservation is already out of the live pool, so
// show it as-is rather than deducting twice.
const poolAfter = computed(() => (busy.value ? pool.value.current : pool.value.current - cost.value))
const auto = computed(() => difficulty.value !== null && Math.max(0, difficulty.value - eased.value) === 0)

// Live eases WITH breakdown (spec §3) — easesLine is the same builder the
// chat card uses, so the preview can never drift from the posted card.
const breakdown = computed(() =>
  easesLine({ skill: skill.value, assets: assets.value, effortLevels: effortLevels.value, eased: eased.value })
)
const costSummary = computed(() => {
  if (cost.value === 0) return noSpendLine(rawCost.value)
  const detail = pool.value.edge > 0 ? ` (${rawCost.value} − ${pool.value.edge} Edge)` : ''
  return `Costs ${cost.value} ${statLabel.value}${detail}`
})

// Write the clamp back into the input so the player never SEES a difficulty
// the roll won't use (pass-2 F4): typing 99 must display 10, not just resolve as 10.
const normalizeDifficulty = () => {
  difficultyRaw.value = difficulty.value === null ? '' : String(difficulty.value)
}

// Any config change invalidates a stale failure message (ddd-5qi). flush:'sync'
// so doRoll's own re-clamp — which adjusts effortLevels BEFORE setting the new
// error — clears first and can't wipe the message it's about to show. `stat`
// is watched too (ddd-669y audit P2): the pool select is a config control now,
// and switching pools after an insufficient-pool failure must not leave the
// old alert standing over a corrected configuration.
watch([skillId, showAllSkills, assets, effortLevels, difficultyRaw, stat], () => {
  error.value = null
}, { flush: 'sync' })

// The dialog contract — aria-modal, Escape, Tab containment, initial focus on the
// panel (ruling R6), restore-to-opener on unmount — is ModalShell's (ddd-6hx). This
// component keeps only what is roller-specific: the busy guard that refuses a
// mid-flight dismiss, and the focus parking below while every control is disabled.
const shell = ref(null)

const close = () => {
  if (busy.value) return // no cancel mid-flight: blocks the roll→cancel→reopen→roll double-spend window (audit F2)
  sheet.rollerStat = null
  sheet.rollerSkillId = null
}
const doRoll = async () => {
  if (busy.value || !stat.value) return // no pool chosen yet (ddd-669y) — the Roll button is disabled, this is the belt
  busy.value = true
  error.value = null
  // Park focus on the panel while busy disables every control — otherwise the
  // browser drops focus from the disabled Roll button to body, outside the
  // dialog, where the Tab trap and Escape go dead (closeout audit P2).
  const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
  shell.value?.focusPanel()
  let res
  try {
    res = await sheet.rollGuided({
      stat: stat.value, skillId: skillId.value, assets: assets.value,
      effortLevels: effortLevels.value, difficulty: difficulty.value
    })
  } catch {
    // rollGuided resolves rather than throwing — this is defense in depth
    // so an unexpected rejection can never leave the modal stuck busy
    // with Cancel disabled (5th audit F3).
    res = { ok: false, reason: 'dispatch-failed' }
  } finally {
    busy.value = false
  }
  if (res.ok) return close()
  if (res.reason === 'insufficient-pool') {
    effortLevels.value = maxEffort.value
    error.value = 'Not enough points — Effort re-clamped.'
  } else {
    // The busy-gated watcher skipped mid-flight changes; reconcile now (a
    // refunded pool normally makes this a no-op).
    if (effortLevels.value > maxEffort.value) effortLevels.value = maxEffort.value
    error.value = 'Roll failed — no points spent.'
  }
  await nextTick() // controls re-enable on the post-busy DOM flush
  // Back to the control the player was using; if it is gone, the panel is the
  // dialog's resting place (R6), never body.
  if (prev?.isConnected && !prev.disabled) prev.focus()
  else shell.value?.focusPanel()
}
</script>

<template>
  <!-- `class="roller"` falls through to the shell's root, so scripts/capture.mjs's
       `.roller` gate and the App wiring test keep their selector. Escape and the ✕ both
       route through close(), which refuses mid-flight; close-disabled greys the ✕ so the
       refusal is visible, not silent. -->
  <ModalShell v-if="open" ref="shell" class="roller" :label="stat ? `${statLabel} Roll` : 'Roll'" :close-disabled="busy" compact @close="close">
    <div class="roller__form">
      <p v-if="stat" class="roller__pool">Pool {{ pool.current }}/{{ pool.max }} · Edge {{ pool.edge }}</p>

      <label class="roller__field">
        <span class="roller__label">Skill</span>
        <!-- Config controls freeze while busy: rollGuided snapshots inputs at
             commit, so a slow dispatch must not let the display drift from the
             committed roll (ddd-axi closeout audit P2). -->
        <select class="field" v-model="skillId" :disabled="busy">
          <option :value="null">No skill</option>
          <option v-for="s in skillOptions" :key="s._id" :value="s._id">
            {{ s.name }} ({{ s.rating }})
          </option>
        </select>
      </label>
      <label class="roller__show-all">
        <input type="checkbox" v-model="showAllSkills" :disabled="busy" />
        <span>Show all skills</span>
      </label>

      <!-- The pool is a live choice since ddd-669y (owner ruling: preselected
           from the skill but always changeable; a poolless skill starts on the
           sentinel and Roll stays disabled until one is picked). Writes
           rollerStat directly — the modal is session-keyed, not stat-keyed, so
           this cannot remount it. AFTER the skill select in the DOM: the
           suite addresses the skill select as the form's first <select>. -->
      <label class="roller__field">
        <span class="roller__label">Pool</span>
        <select
          class="roller__pool-select field"
          :value="stat ?? ''"
          :disabled="busy"
          @change="sheet.rollerStat = $event.target.value === '' ? null : $event.target.value"
        >
          <option value="" disabled>— choose pool</option>
          <option v-for="p in POOL_NAMES" :key="p" :value="p">{{ poolLabel(p) }}</option>
        </select>
      </label>

      <div class="roller__steppers">
        <div class="roller__field roller__assets">
          <span class="roller__label">Assets</span>
          <div class="roller__stepper">
            <button type="button" class="roller__step-down" aria-label="Decrease assets" :disabled="busy || assets <= 0" @click="assets--">−</button>
            <strong>{{ assets }}</strong>
            <button type="button" class="roller__step-up" aria-label="Increase assets" :disabled="busy || assets >= 2" @click="assets++">+</button>
          </div>
        </div>
        <div class="roller__field roller__effort">
          <span class="roller__label">Effort (max {{ maxEffort }})</span>
          <div class="roller__stepper">
            <button type="button" class="roller__step-down" aria-label="Decrease Effort" :disabled="busy || effortLevels <= 0" @click="effortLevels--">−</button>
            <strong>{{ effortLevels }}</strong>
            <button type="button" class="roller__step-up" aria-label="Increase Effort" :disabled="busy || effortLevels >= maxEffort" @click="effortLevels++">+</button>
          </div>
        </div>
        <label class="roller__field roller__difficulty">
          <span class="roller__label">Difficulty</span>
          <input class="field" type="number" min="0" max="10" placeholder="—" v-model="difficultyRaw" :disabled="busy" @change="normalizeDifficulty" />
        </label>
      </div>

      <div class="roller__summary">
        <div>{{ breakdown }}</div>
        <div>{{ costSummary }}</div>
        <!-- Gated like the header pool line (audit P3): without a chosen pool
             there is no pool, and "Pool after: 0/0" presents a nonexistent
             zero-sized one. -->
        <div v-if="stat">Pool after: {{ poolAfter }}/{{ pool.max }}</div>
        <div v-if="auto">Eased to difficulty 0 — automatic success</div>
      </div>

      <p v-if="error" class="roller__error" role="alert">{{ error }}</p>

      <footer class="roller__buttons">
        <button type="button" class="roller__cancel" :disabled="busy" @click="close">Cancel</button>
        <button type="button" class="roller__roll" :disabled="busy || !stat" @click="doRoll">
          {{ auto ? 'Take automatic success' : 'Roll d20' }}
        </button>
      </footer>
    </div>
  </ModalShell>
</template>
