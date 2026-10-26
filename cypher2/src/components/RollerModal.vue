<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { attackDamage, easedSteps, effortCost, maxAffordableEffort, rawEffortCost, stressLevels } from '@/dice/rolls.js'
import { attackLabel, damageLine, easesLine, noSpendLine, rawCostTerms } from '@/rollTemplates/guidedCard.js'
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
// Attack mode (ddd-keb3). The id is captured once: App keys this modal by
// rollerSession, so a mount belongs to exactly one open and the mode cannot change
// underneath it. The ROW is re-resolved on every read instead of captured — a
// hydrate replaces the arrays wholesale and a held object would silently detach
// from the sheet (the ItemList rule).
const attackId = sheet.rollerAttackId
const attackMode = attackId !== null
const attack = computed(() =>
  attackMode ? (sheet.attacks.find((r) => r._id === attackId) ?? null) : null
)

const showAllSkills = ref(false)
const assets = ref(0)
const effortLevels = ref(0)
// The second application (ddd-keb3): levels spent on damage rather than on hitting.
// Stays 0 outside attack mode, which keeps every skill-roll cost identical.
const damageEffortLevels = ref(0)
const difficultyRaw = ref('') // '' = no difficulty entered
const error = ref(null)
const busy = ref(false)

// ---- The Magnus Archives: Stress (ddd-xrug, spec §6.3) ----
//
// Three REFS holding the player's INTENT, each resolved below by a computed that folds in
// the live eligibility. Nothing but those computeds may read these: `v-if` hides a
// control without resetting its ref, so a box the rule, the armor or the pool choice has
// since retired is still `true`. The store gates all three, so nothing wrong is ever
// deducted — but a raw ref fed to the preview goes on printing a term the roll will not
// use, which is the preview-and-card drift this whole design exists to prevent. The
// resolved computeds make the store's gate defence in depth instead of the only gate.
const stressHindrance = ref(0) // seeded from the live ceiling by the watcher below
const armorHindered = ref(true) // defaults to CHECKED (spec §6.3): the book hinders by default
const burnStress = ref(false)
// Owner, 2026-10-26, walkthrough item 12: the book copy beside the burn box goes behind a
// caret, the ruling items 9 and 15 made for the panel's reference text, extended here. NOT
// one of the three intent refs above — it feeds no computed and reaches neither the
// preview nor the roll. App keys this modal by rollerSession, so it starts shut per open.
const burnNoteOpen = ref(false)

// What burning costs, mirroring the store's own STRESS_BURN_COST (sheetStore.js:52):
// three points is exactly one derived level (Magnus, page 128).
const STRESS_BURN_COST = 3

// Book copy, The Magnus Archives pages 129 and 130, quoted the way StressTrack quotes the
// rest of the Stress rules. The first sentence is the two restrictions the sheet cannot
// see — it knows nothing about how tense the situation is or whether the action is
// defensive — and the second is the intrusion the GM owes the moment a level burns. Do
// not paraphrase or re-order.
const BURN_NOTE = [
  'Stress cannot be used in this way by a character who is not already in a tense situation, and it can never be used on a defensive action.',
  "While this means a reduction in the character's Stress level, the GM immediately uses an intrusion that increases the overall tension and danger of the situation."
].join(' ')

// ---- Old Gods of Appalachia: the Luck Pool (ddd-xrug.1, spec §4) ----
//
// "When spending points from any other Pool, you can take one, some, or all of the points
// from your Luck Pool first" (the Lucky descriptor). THE ALLOCATION COMES FIRST AND THE
// COST FOLLOWS IT: the player says how many Luck points to put toward this action, and
// that raises what the action can cost. The reverse — deriving a required Luck spend from
// a cost the Pool cannot cover — spends Luck the player never selected, makes the
// control's bounds depend on the very cost those bounds determine, and deadlocks, because
// with nothing allocated the Effort ceiling is 0, so the cost is 0, so a control gated on
// a non-zero cost could never be used to raise it. The book's wording is the order of
// operations: take points from Luck *first*, then spend.
//
// A FOURTH ref holding the player's intent, read by nothing mechanical — the ceiling, the
// preview and the payload all read resolvedLuckSpend below, exactly as the three Magnus
// controls do. Its only readers are the stepper that displays it, the clamp that brings it
// down, and the error-clearing watcher further down, which must watch the player's ACTION
// rather than its resolved effect: taking points from Luck is how an insufficient-pool
// refusal gets corrected, and a stale alert must not outlive the correction even on a
// change the resolved value swallows.
// `v-if` hides a control without resetting its ref, so a hydrate that dropped
// Luck from 3 to 1 while 3 was allocated would otherwise leave `spendable` counting 3: the
// modal going on offering Effort the store will clamp away, with maxTotal unmoved so
// clampEffort never fires.
const luckSpend = ref(0)

// Null-safe: the component can outlive rollerStat by a tick while the v-if
// tears it down — computeds must not explode on stat === null (audit F5).
// Since ddd-669y stat null is also a LIVE open state (a poolless skill's
// entry): the pool select below is how it becomes non-null, and Roll stays
// gated until it does.
const stat = computed(() => sheet.rollerStat)
const open = computed(() => sheet.rollerOpen)
const statLabel = computed(() => (stat.value ? stat.value.charAt(0).toUpperCase() + stat.value.slice(1) : ''))
// The dialog's accessible name. An attack names itself, since the pool is a choice
// inside the modal and the attack is what the player clicked.
const dialogLabel = computed(() => {
  // attackLabel, not attack.name: a cleared name would title the dialog "Attack: "
  // (closeout audit). Same helper the chat card uses, so they can never differ.
  if (attackMode) return attack.value ? `Attack: ${attackLabel(attack.value)}` : 'Attack'
  return stat.value ? `${statLabel.value} Roll` : 'Roll'
})
// ddd-wc3, third instance of the prototype-key false guard after ddd-9ir
// (poolLabel) and ddd-c8f (skillEase): `??` fires only on null/undefined, so a
// stat of 'constructor' finds the inherited Function, skips the fallback, and
// pool.current is undefined — NaN Effort math in a roller that already charged
// the pool. Object.hasOwn, never `??`, on any map keyed by a value a document
// can influence. Reads null as absent, which is the live poolless-skill state
// and keeps its zero fallback.
// ONE predicate, read twice (ddd-xrug.1 Task 5): the pool fallback below and
// luckAvailable's gate. The safety property that Luck never funds Effort against a pool
// that does not exist holds only while the two agree, and two copies of
// `Object.hasOwn(sheet.pools, stat.value)` four lines apart can be changed one at a time.
const hasPool = computed(() => Object.hasOwn(sheet.pools, stat.value))
const pool = computed(() =>
  hasPool.value ? sheet.pools[stat.value] : { current: 0, max: 0, edge: 0 }
)
// Mirror the store's affordability domain (min(current, max)) so the preview
// can never promise Effort the store will refuse — phantom points above max
// don't fund rolls (3rd audit F2).
const available = computed(() => Math.min(pool.value.current, Math.max(pool.value.max, 0)))
// The live Luck this action can actually draw on. Same affordability domain the stat Pool
// uses, min(current, max), plus the floor the stat Pool does not need: `luck` is a stored
// object hydrate never validates, so 9 of 3 must read 3, and -4 of 3 must read 0 — without
// the Math.max a corrupt stored value would SUBTRACT from `spendable` through
// resolvedLuckSpend and quietly take Effort away from a character who has Luck.
//
// Gated on the stat naming a REAL pool, which is the brief's "stat is null" gate plus the
// one case that reaches the same place: a stray or prototype key (ddd-wc3) also falls back
// to the { current: 0, max: 0, edge: 0 } substitute, and the store THROWS
// `rollGuided: unknown pool` above every deduction (sheetStore.js:391) rather than
// refusing. There is no refusal to fall back on, so the modal keeping the ceiling at 0 IS
// the guard — Luck must not fund Effort against a pool that does not exist.
//
// luck.edge enters nothing, here or anywhere: Edge is subtracted once, from the STAT
// Pool's own edge, before the split (spec §3.3).
const luckAvailable = computed(() => {
  if (sheet.luck === null || !hasPool.value) return 0
  return Math.max(0, Math.min(sheet.luck.current, Math.max(sheet.luck.max, 0)))
})
// The allocation BOUNDED by what is live — the only thing any calculation may read. While
// idle the clamp below erases the difference inside the same flush; while the clamp is
// busy-gated this computed is the only thing keeping the ceiling and the preview honest.
const resolvedLuckSpend = computed(() => Math.min(luckSpend.value, luckAvailable.value))
// What this action can be PAID WITH: the stat Pool's affordable points plus the Luck the
// player put toward it. Task 5 re-derives this same sum at the store's resolution boundary
// and must not restate it differently. maxAffordableEffort keeps its signature — it
// already answers "how many levels can this many points pay for" — so the split needs no
// Luck-aware variant of the ladder, which is the whole reason the change stays small.
const spendable = computed(() => available.value + resolvedLuckSpend.value)
// clampInt only floors at 0 — the spec's 0–10 range needs the upper clamp too.
const difficulty = computed(() => (difficultyRaw.value === '' ? null : Math.min(clampInt(difficultyRaw.value), 10)))

// The rule gate, read TRUTHILY like the store's own reservation-time snapshot
// (sheetStore.js:405). The two must agree: a stricter gate here would show controls the
// store refuses, a looser one would hide controls it honours.
const stressRule = computed(() => !!sheet.rules.stress)
// `stress` is nullable independently of the rule, and `points` is a stored value hydrate
// never validates — Number.isInteger mirrors the store's burn guard exactly
// (sheetStore.js:443), so the checkbox renders exactly when the burn can be honoured.
const canBurn = computed(() =>
  stressRule.value && Number.isInteger(sheet.stress?.points) && sheet.stress.points >= STRESS_BURN_COST
)
const resolvedBurn = computed(() => burnStress.value === true && canBurn.value)
// Worn armor hinders Speed-based tasks (Magnus, page 100), and the roller's own `stat` is
// exactly what the book means by one. Three clauses, each proven to suppress on its own —
// a predicate with an omitted clause passes every test that varies two things at once.
const canArmor = computed(() =>
  stressRule.value && sheet.wearingArmor === true && stat.value === 'speed'
)
const resolvedArmor = computed(() => armorHindered.value === true && canArmor.value)
// The live POST-BURN level, the store's own expression (sheetStore.js:457). stressLevels,
// never an inline Math.floor: `points` is unvalidated, and Math.floor('x' / 3) reaches
// easedSteps as NaN — where interpretGuidedRoll's comparisons are all false and the card
// calls every roll a failure, natural 20 included, after the Effort has left the pool.
// The burn is subtracted from the LEVEL rather than its 3 points from the points, so that
// guard still sees the raw stored value.
const hindranceCeiling = computed(() =>
  stressRule.value ? Math.max(0, stressLevels(sheet.stress?.points) - (resolvedBurn.value ? 1 : 0)) : 0
)
// Clamped like the store's (sheetStore.js:462) rather than trusting the stepper's own
// bounds, so the preview cannot print a hindrance the roll will not apply — not even for
// the tick before the watcher below brings the stepper down.
const resolvedHindrance = computed(() =>
  Math.min(Math.max(stressHindrance.value, 0), hindranceCeiling.value)
)

// ddd-khaj: the impaired damage-track surcharge, one extra point PER LEVEL of Effort.
// Derived EXACTLY as the store derives it (sheetStore.js:484), the damage-track gate
// included — a different gate here and the preview and the charge disagree on a
// track-off character. A direct comparison, never a map lookup: all three cost functions
// propagate NaN, maxAffordableEffort included because Math.min and Math.max both do, and
// there is no benign fallback — a NaN ceiling makes every clamp comparison false and a
// NaN cost is deducted from the pool.
const surcharge = computed(() =>
  sheet.rules.damageTrack && sheet.damageTrack?.step === 'impaired' ? 1 : 0
)

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

// Attack Effort and damage Effort are ONE ladder charged once for the action
// (owner ruling, book), so the affordability cap bounds their SUM and each
// stepper's own ceiling is whatever the other leaves. maxAffordableEffort needs no
// re-derivation — it already answers "how many levels can this pool pay for".
// The surcharge goes in HERE as well as into the two cost figures (ddd-khaj): it steepens
// the ladder, so an impaired character affords fewer levels. Omit it and the modal offers
// a selection the store refuses, doRoll re-clamps to the same unaffordable number, and
// the error repeats with a stepper that never comes down.
// `spendable`, not `available` (ddd-xrug.1): the allocated Luck is part of what the action
// can be paid with, so it is part of how many levels the action can afford.
const maxTotal = computed(() => maxAffordableEffort(sheet.effort, spendable.value, pool.value.edge, surcharge.value))
const maxEffort = computed(() => Math.max(0, maxTotal.value - damageEffortLevels.value))
const maxDamageEffort = computed(() => Math.max(0, maxTotal.value - effortLevels.value))
const totalEffort = computed(() => effortLevels.value + damageEffortLevels.value)
// Damage Effort gives way first: a shrinking pool should cost the player extra
// damage before it costs them the chance to hit at all. Also the reconcile path
// after a refusal, so the two can never be reduced by different rules.
const clampEffort = (m) => {
  if (effortLevels.value > m) effortLevels.value = m
  const left = Math.max(0, m - effortLevels.value)
  if (damageEffortLevels.value > left) damageEffortLevels.value = left
}
// Busy-gated: rollGuided's own synchronous reservation drops the live pool
// mid-flight and would otherwise clamp the very Effort being rolled (3rd
// audit F6). doRoll reconciles after the store settles.
// resolvedLuckSpend is a second watch source (ddd-xrug.1) rather than left to reach this
// through maxTotal alone. It changes no value today, and that is said here rather than
// left for a reader to discover: wherever maxTotal is unchanged, effortLevels is already at
// or below it, so this callback's clampEffort(maxTotal) cannot move either stepper. A
// lowered allocation that does reduce the ceiling arrives through maxTotal on its own.
// Kept as belt anyway. The property it stands for — the Effort an allocation bought never
// outliving the allocation — is one a later change to the ladder could break without
// touching this line, and re-running an idempotent clamp costs nothing.
watch([maxTotal, resolvedLuckSpend], () => { if (!busy.value) clampEffort(maxTotal.value) })

// The Stress hindrance clamps DOWN only, mirroring clampEffort: a hydrate that reduced
// Stress must not leave a hindrance the character no longer has, and a background change
// must not stomp a manual adjustment upward. Busy-gated for the same reason as maxTotal —
// the burn's own deduction drops the live level inside the reservation, and clamping on
// it would destroy a selection the refund path may yet restore.
// And reconciled in doRoll beside clampEffort, for the same reason that one is: `busy` is
// not a dependency of this watcher, so a callback skipped while a roll is in flight is
// swallowed permanently rather than deferred, and nothing re-checks when busy clears.
// Every ROLL-caused fall is either refunded or lands after busy clears, so it would need
// no reconcile — but a concurrent relay hydrate is neither, and nothing refunds a hydrate.
// A hydrate that zeroed Stress mid-roll would otherwise leave the stepper reading 3 beside
// its own "(max 0)" on an open modal, which is exactly the event the clamp exists for.
const clampHindrance = (c) => { if (stressHindrance.value > c) stressHindrance.value = c }
watch(hindranceCeiling, (c) => { if (!busy.value) clampHindrance(c) })

// The Luck allocation clamps DOWN only, for both of the reasons above: a hydrate that
// reduced the Pool must not leave a stepper displaying more points than the Pool holds,
// and a background refresh must not stomp a manual adjustment upward. resolvedLuckSpend
// already keeps every CALCULATION honest without this; what this fixes is the DISPLAY,
// which would otherwise read 3 beside its own "(max 1)" — the same pathology the
// hindrance clamp exists for. Busy-gated like both, and reconciled in doRoll beside them:
// `busy` is not a dependency of this watcher, so a callback skipped while a roll is in
// flight is swallowed permanently rather than deferred. No roll-caused fall exists to
// refund here — nothing deducts Luck until Task 5 — but a concurrent relay hydrate is
// neither refunded nor re-delivered, and that is the event this closes.
//
// Clamping the ref can never move resolvedLuckSpend — it was already pinned to
// luckAvailable by the Math.min — so reconciling it in doRoll beside clampEffort cannot
// drop maxTotal a second time and re-trigger a deferred clamp, whose own error-clearing
// watcher would then wipe the message doRoll is about to set. A `spendable` that read the
// raw ref loses exactly that property, and the refusal test below catches it by finding no
// error at all on an open modal.
const clampLuck = (a) => { if (luckSpend.value > a) luckSpend.value = a }
watch(luckAvailable, (a) => { if (!busy.value) clampLuck(a) })

// The ONE exception to clamp-down-only: toggling the burn re-seeds the stepper to the new
// ceiling in BOTH directions, because the burn is a deliberate mechanical change to the
// level rather than a background event — a player who turns it back off should see the
// book's hindrance again rather than a stale lower number. The RAW ref is the watch
// target on purpose: watching the resolved burn would re-seed on an eligibility change
// too, letting Stress climbing back over 3 points raise a selection the player set.
// immediate seeds the mount value from the same expression (spec §6.3), the way the asset
// prefill above seeds itself.
watch(burnStress, () => { stressHindrance.value = hindranceCeiling.value }, { flush: 'sync', immediate: true })

// In attack mode the row's own rating is the training term, and its weapon class
// and stored modifier ease the roll automatically (ddd-keb3).
const eased = computed(() => easedSteps({
  skillRating: attack.value ? attack.value.skillRating : (skill.value?.rating ?? null),
  weaponClass: attack.value?.weaponClass ?? null,
  modifier: attack.value?.modifier ?? null,
  assets: assets.value,
  effortLevels: effortLevels.value,
  // The RESOLVED values, never the refs (spec §6.3).
  stressHindrance: resolvedHindrance.value,
  armorHindered: resolvedArmor.value,
  burnedStress: resolvedBurn.value
}))
const rawCost = computed(() => rawEffortCost(totalEffort.value, surcharge.value))
const cost = computed(() => effortCost(totalEffort.value, pool.value.edge, surcharge.value))
// The TOTAL surcharge, never the per-level rate: two levels at one point per level read
// `5 + 2 impaired`, and a builder holding only the rate can produce neither figure. Taken
// by DIFFERENCE from the one function that owns the ladder, the store's own derivation
// (sheetStore.js:491), so the printed decomposition cannot disagree with what the pool
// will pay — including rawEffortCost's `levels <= 0` branch, where both figures are 0.
const surchargeTotal = computed(() => rawCost.value - rawEffortCost(totalEffort.value))
// Preview deducts from the ACTUAL current — the store's deduction base —
// not from the clamped affordability base (4th audit F1: a 7/5 pool with
// cost 3 resolves to 4/5, so the preview must say 4/5, not 2/5). While a
// roll is in flight the reservation is already out of the live pool, so
// show it as-is rather than deducting twice.
// The split, ONE expression and its complement (ddd-xrug.1): the Luck put toward this
// action covers the cost first, in the book's own order, and the Pool covers what is left.
// Math.min, because the allocation is a CEILING on what Luck may contribute and not a
// promise to spend it — a cost of 1 with 3 allocated takes 1.
//
// Derived as a pair rather than written twice, because the invariant the preview promises
// is `poolShare + luckShare === cost`, and the store reproduces the same invariant at its
// resolution boundary as poolCost + luckCharged (sheetStore.js). Two copies of the
// Math.min four lines apart can be changed one at a time, and the sum would then be a
// number the roll never charges.
const luckShare = computed(() => Math.min(resolvedLuckSpend.value, cost.value))
// Might 2 with a cost of 3 and 2 allocated reads 1, never −1.
const poolShare = computed(() => cost.value - luckShare.value)
const poolAfter = computed(() => (busy.value ? pool.value.current : pool.value.current - poolShare.value))
// The other half of the same split, on the same busy rule, so the two figures can never
// disagree about whether a reservation is already out.
const luckAfter = computed(() => {
  if (sheet.luck === null) return null
  return busy.value ? sheet.luck.current : sheet.luck.current - luckShare.value
})
const auto = computed(() => difficulty.value !== null && Math.max(0, difficulty.value - eased.value) === 0)

// Live eases WITH breakdown (spec §3) — easesLine is the same builder the
// chat card uses, so the preview can never drift from the posted card.
const breakdown = computed(() =>
  easesLine({
    skill: skill.value, attack: attack.value, assets: assets.value,
    effortLevels: effortLevels.value, eased: eased.value,
    stressHindrance: resolvedHindrance.value,
    armorHindered: resolvedArmor.value,
    burnedStress: resolvedBurn.value
  })
)
// Damage preview, from the chat card's own builder so the two cannot drift. The
// outcome is unknown until the dice land, so it reads "on a hit" — and there is no
// die yet, so no 17/18 bonus is promised.
const damagePreview = computed(() => {
  if (!attack.value) return null
  return damageLine({
    damage: attackDamage({
      weaponDamage: attack.value.damage,
      damageEffortLevels: damageEffortLevels.value,
      die: null
    }),
    levels: damageEffortLevels.value,
    die: null,
    // An automatic hit HAS hit — no dice are thrown — so the preview must not hedge
    // with "on a hit" beside a button that says "Take automatic hit" while the card
    // it posts states the damage flatly (closeout audit). Every other configuration
    // is genuinely unresolved until the die lands.
    success: auto.value ? true : null
  })
})
// The cost preview, one tense earlier than the card's spend line and built from the SAME
// decomposition: rawCostTerms is guidedCard's own builder (ddd-khaj), so the impaired
// surcharge can never be worded one way here and another way in chat. The parenthetical
// follows spendLine's rule exactly — a surcharge earns it on its own, Edge or no Edge,
// because `Costs 4 Might` for one level reads as a bug to a player who knows the book
// price is 3.
//
// What this line mirrors is spendLine's NO-LUCK form only, and since ddd-xrug.1 that is
// the narrower claim it used to be: spendLine now decomposes a split cost into the stat
// Pool's share and Luck's (`Spent 3 — 1 Might, 2 Luck`), while this summary still
// attributes the whole cost to the stat Pool (`Costs 3 Might`) however much Luck the
// player has moved onto the roll. The parenthetical and the cost figure agree with the
// card; the ATTRIBUTION does not. Giving this line the same split is an open owner
// decision, recorded in the project queue — player-facing copy, so it is a choice rather
// than a defect to fix in passing.
const costSummary = computed(() => {
  if (cost.value === 0) return noSpendLine(rawCost.value, surchargeTotal.value)
  const terms = rawCostTerms(rawCost.value, surchargeTotal.value)
  const detail = pool.value.edge > 0
    ? ` (${terms} − ${pool.value.edge} Edge)`
    : surchargeTotal.value > 0 ? ` (${terms})` : ''
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
// The three Magnus refs join the list as the player's own intent (spec §6.3): each is a
// config control, and correcting one after a failure must not leave the old alert
// standing over a corrected configuration.
// luckSpend joins them for the same reason (ddd-xrug.1), and it is the control a player is
// MOST likely to reach for after an insufficient-pool refusal: taking points from Luck is
// how that refusal gets corrected.
watch([skillId, showAllSkills, assets, effortLevels, damageEffortLevels, difficultyRaw, stat,
  stressHindrance, armorHindered, burnStress, luckSpend], () => {
  error.value = null
}, { flush: 'sync' })

// The dialog contract — aria-modal, Escape, Tab containment, initial focus on the
// panel (ruling R6), restore-to-opener on unmount — is ModalShell's (ddd-6hx). This
// component keeps only what is roller-specific: the busy guard that refuses a
// mid-flight dismiss, and the focus parking below while every control is disabled.
const shell = ref(null)

// The session this modal was opened for. App keys the modal by rollerSession, which the
// store bumps once per open, so setup runs once per session.
const session = sheet.rollerSession

const close = () => {
  if (busy.value) return // no cancel mid-flight: blocks the roll→cancel→reopen→roll double-spend window (audit F2)
  // ddd-zm47.2: a switch to NPC closes the roller from outside, mid-roll included. A roll
  // that settles after that must not close a roller the sheet has opened since.
  if (sheet.rollerSession !== session) return
  sheet.rollerStat = null
  sheet.rollerSkillId = null
  sheet.rollerAttackId = null
}
const doRoll = async () => {
  if (busy.value || !stat.value) return // no pool chosen yet (ddd-669y) — the Roll button is disabled, this is the belt
  if (attackMode && !attack.value) return // the row was deleted mid-open; the store refuses too
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
      stat: stat.value, skillId: skillId.value, attackId, assets: assets.value,
      effortLevels: effortLevels.value, damageEffortLevels: damageEffortLevels.value,
      difficulty: difficulty.value,
      // The RESOLVED values, so the roll is charged for exactly what the preview showed.
      // The store gates all three again at its own resolution boundary (ddd-xrug).
      stressHindrance: resolvedHindrance.value,
      armorHindered: resolvedArmor.value,
      burnStress: resolvedBurn.value,
      // The resolved ALLOCATION (ddd-xrug.1), never the raw ref and never luckShare: the
      // store owns the split and re-derives it against its own cost, and its refusal adds
      // this to what the Pool can afford. A pre-split figure would cap the refusal at the
      // modal's cost, and the store's own refund could then not tell an over-allocation
      // from a charge. The store clamps it again at its boundary, which keeps that clamp
      // defence in depth rather than the only gate.
      luckSpend: resolvedLuckSpend.value
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
    clampEffort(maxTotal.value)
    clampHindrance(hindranceCeiling.value)
    clampLuck(luckAvailable.value)
    error.value = 'Not enough points — Effort re-clamped.'
  } else if (res.reason === 'attack-missing') {
    // The row went away between opening and committing. Say which thing failed:
    // "Roll failed" would send the player looking for a dice problem.
    error.value = 'This attack no longer exists.'
  } else {
    // The busy-gated watchers skipped mid-flight changes; reconcile now (a
    // refunded pool normally makes the first a no-op, and a roll-caused Stress
    // fall the second — a concurrent hydrate is what neither of them undoes).
    // The third has no roll-caused fall at all: a hydrate is the only thing that can
    // retire allocated Luck, and nothing refunds a hydrate.
    clampEffort(maxTotal.value)
    clampHindrance(hindranceCeiling.value)
    clampLuck(luckAvailable.value)
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
  <ModalShell v-if="open" ref="shell" class="roller" :label="dialogLabel" :close-disabled="busy" compact @close="close">
    <div class="roller__form">
      <p v-if="stat" class="roller__pool">Pool {{ pool.current }}/{{ pool.max }} · Edge {{ pool.edge }}</p>

      <!-- Attack mode has no skill picker (ddd-keb3): the attack row's own
           skillRating is its training term, so a second source would double-count. -->
      <label v-if="!attackMode" class="roller__field">
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
      <label v-if="!attackMode" class="roller__show-all">
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

      <!-- ddd-644 made visible: attack.pool has no null branch in the schema, so a
           blank or stray one is bad data, not a legal absence. The refusal says
           which thing is wrong instead of leaving a dead Roll button. -->
      <p v-if="attackMode && !attack" class="roller__note" role="status">This attack no longer exists.</p>
      <p v-else-if="attackMode && !stat" class="roller__note" role="status">This attack has no usable pool. Choose one to roll.</p>

      <!-- The Luck allocation (ddd-xrug.1, spec §4), ABOVE the Effort steppers because it
           is an input to their ceiling: the player takes points from Luck first and the
           action's cost follows. Its own `.roller__field` block rather than a cell inside
           .roller__steppers, so it is unambiguously above them rather than beside them in
           a wrapping row — and it reuses .roller__field / .roller__stepper /
           .roller__step-* wholesale, like the Stress stepper, so it is skinned and spaced
           exactly like Assets and Effort with no new CSS.
           ITS VISIBILITY IS `luckAvailable > 0` AND NOTHING TO DO WITH THE COST. With
           nothing allocated the Effort ceiling can be 0, which makes the cost 0; a control
           hidden at cost 0 could never be used to raise the ceiling, and Luck would be
           unreachable for exactly the character who needs it. The Pool's own name, never a
           hardcoded "Luck" — the contract lets it be any string (spec §3.2) — and the
           maximum is printed like the Effort and Stress steppers' so the player can see
           why the + is dead. The stepper, its clamp and the error-clearing watcher are the
           only readers of the raw ref; everything mechanical reads resolvedLuckSpend. -->
      <div v-if="luckAvailable > 0" class="roller__field roller__luck">
        <span class="roller__label">{{ sheet.luck.name }} toward this roll (max {{ luckAvailable }})</span>
        <div class="roller__stepper">
          <button type="button" class="roller__step-down" :aria-label="`Decrease ${sheet.luck.name} toward this roll`" :disabled="busy || luckSpend <= 0" @click="luckSpend--">−</button>
          <strong>{{ luckSpend }}</strong>
          <button type="button" class="roller__step-up" :aria-label="`Increase ${sheet.luck.name} toward this roll`" :disabled="busy || luckSpend >= luckAvailable" @click="luckSpend++">+</button>
        </div>
      </div>

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
          <span class="roller__label">{{ attackMode ? 'Effort to hit' : 'Effort' }} (max {{ maxEffort }})</span>
          <div class="roller__stepper">
            <button type="button" class="roller__step-down" :aria-label="attackMode ? 'Decrease Effort to hit' : 'Decrease Effort'" :disabled="busy || effortLevels <= 0" @click="effortLevels--">−</button>
            <strong>{{ effortLevels }}</strong>
            <button type="button" class="roller__step-up" :aria-label="attackMode ? 'Increase Effort to hit' : 'Increase Effort'" :disabled="busy || effortLevels >= maxEffort" @click="effortLevels++">+</button>
          </div>
        </div>
        <!-- The second application (ddd-keb3). Its ceiling is what the attack
             Effort leaves, because the pair is charged as one ladder. -->
        <div v-if="attackMode" class="roller__field roller__damage-effort">
          <span class="roller__label">Effort for damage (max {{ maxDamageEffort }})</span>
          <div class="roller__stepper">
            <button type="button" class="roller__step-down" aria-label="Decrease Effort for damage" :disabled="busy || damageEffortLevels <= 0" @click="damageEffortLevels--">−</button>
            <strong>{{ damageEffortLevels }}</strong>
            <button type="button" class="roller__step-up" aria-label="Increase Effort for damage" :disabled="busy || damageEffortLevels >= maxDamageEffort" @click="damageEffortLevels++">+</button>
          </div>
        </div>
        <label class="roller__field roller__difficulty">
          <!-- Same 0–10 control; on an attack the number IS the creature's level. -->
          <span class="roller__label">{{ attackMode ? 'Creature level' : 'Difficulty' }}</span>
          <input class="field" type="number" min="0" max="10" placeholder="—" v-model="difficultyRaw" :disabled="busy" @change="normalizeDifficulty" />
        </label>
      </div>

      <!-- The Magnus Hindrances group (ddd-xrug, spec §6.3): below the steppers, above
           the summary it changes. The Stress stepper's gate is the rule itself; each
           checkbox carries its own further conditions, and every value reaches the
           preview and the roll through a resolved computed, never its ref. -->
      <div v-if="stressRule" class="roller__hindrances">
        <span class="roller__label">Hindrances</span>
        <div class="roller__field roller__stress">
          <!-- The ceiling is the live post-burn level, printed like the Effort stepper's
               so the player can see why the + is dead. -->
          <span class="roller__label">Stress hindrance (max {{ hindranceCeiling }})</span>
          <div class="roller__stepper">
            <button type="button" class="roller__step-down" aria-label="Decrease Stress hindrance" :disabled="busy || stressHindrance <= 0" @click="stressHindrance--">−</button>
            <strong>{{ stressHindrance }}</strong>
            <button type="button" class="roller__step-up" aria-label="Increase Stress hindrance" :disabled="busy || stressHindrance >= hindranceCeiling" @click="stressHindrance++">+</button>
          </div>
        </div>
        <label v-if="canArmor" class="roller__check roller__armor">
          <input type="checkbox" v-model="armorHindered" :disabled="busy" />
          <span>Worn armor hinders this Speed task</span>
        </label>
        <template v-if="canBurn">
          <!-- The label wraps its own checkbox, so clicking the words has to toggle the
               burn. The caret is a SIBLING button for that reason, which is also why this
               row is a div — the same shape the Stress column's worn-armor row takes. -->
          <div class="roller__burn-row">
            <label class="roller__check roller__burn">
              <input type="checkbox" v-model="burnStress" :disabled="busy" />
              <span>Burn a Stress level</span>
            </label>
            <button
              type="button"
              class="roller__burn-toggle"
              :aria-expanded="burnNoteOpen"
              aria-controls="roller-burn-note"
              aria-label="The restrictions on burning a Stress level"
              :disabled="busy"
              @click="burnNoteOpen = !burnNoteOpen"
            >
              <span class="wounds__caret" aria-hidden="true">{{ burnNoteOpen ? '▾' : '▸' }}</span>
            </button>
          </div>
          <!-- v-show, not v-if: the aria-controls target has to stay in the DOM while it
               is collapsed (ddd-0xq). -->
          <p v-show="burnNoteOpen" id="roller-burn-note" class="roller__note roller__burn-note">{{ BURN_NOTE }}</p>
        </template>
      </div>

      <div class="roller__summary">
        <!-- Classed so the agreement tests can compare these two lines to the posted
             card's own, string for string, rather than to the whole summary's text. -->
        <div class="roller__eases">{{ breakdown }}</div>
        <div class="roller__cost">{{ costSummary }}</div>
        <!-- Gated like the header pool line (audit P3): without a chosen pool
             there is no pool, and "Pool after: 0/0" presents a nonexistent
             zero-sized one. -->
        <div v-if="damagePreview">{{ damagePreview }}</div>
        <div v-if="stat">Pool after: {{ poolAfter }}/{{ pool.max }}</div>
        <!-- The Luck half of the same split (ddd-xrug.1). Gated on HAVING the Pool rather
             than on having points in it: "Luck after: 0/3" is exactly what tells a player
             why there is no stepper above. Classed so a test can read this figure alone,
             and named from the document like the panel's own heading. -->
        <div v-if="stat && sheet.luck" class="roller__luck-after">{{ sheet.luck.name }} after: {{ luckAfter }}/{{ sheet.luck.max }}</div>
        <div v-if="auto">{{ attackMode ? 'Eased to level 0 — automatic hit' : 'Eased to difficulty 0 — automatic success' }}</div>
      </div>

      <p v-if="error" class="roller__error" role="alert">{{ error }}</p>

      <footer class="roller__buttons">
        <button type="button" class="roller__cancel" :disabled="busy" @click="close">Cancel</button>
        <button type="button" class="roller__roll" :disabled="busy || !stat || (attackMode && !attack)" @click="doRoll">
          {{ auto ? (attackMode ? 'Take automatic hit' : 'Take automatic success') : 'Roll d20' }}
        </button>
      </footer>
    </div>
  </ModalShell>
</template>
