// Pure Cypher quick-roll logic. No Beacon/Vue dependencies — fully unit-testable.
// Task roll: 1d20 vs difficulty × 3. Quick roll reports the highest difficulty
// beaten; it never deducts pool points (spec ① decision — the guided roller owns costs).

export const SPECIALS = {
  1: { code: 'gm-intrusion', label: 'GM Intrusion' },
  17: { code: 'damage-1', label: '+1 damage' },
  18: { code: 'damage-2', label: '+2 damage' },
  19: { code: 'minor-effect', label: 'Minor effect' },
  20: { code: 'major-effect', label: 'Major effect' }
}

export const beatsDifficulty = (die) => Math.floor(die / 3)

export const interpretStatRoll = (die) => ({
  die,
  beats: beatsDifficulty(die),
  special: SPECIALS[die] ?? null
})

// ---- Guided roller math (spec ③). Pure; the roller owns pool costs. ----

// Skill ease ladder; the book caps the skill portion at 3 steps.
export const SKILL_EASES = { inability: -1, practiced: 0, trained: 1, specialized: 2, expert: 3 }

// EVERY read of a STORED rating goes through here — never SKILL_EASES[rating]
// directly (ddd-c8f) — and the book's 3-step cap lives here too, so the chat
// card and the math can never cap differently. hydrate() applies no enum
// validation, and `?? 0` does not guard a prototype key: SKILL_EASES.constructor
// is a truthy Function, so the coalesce never fires and Math.min(Function, 3) is
// NaN. That NaN reaches interpretGuidedRoll's `base.beats >= effective`, where
// every comparison is false — reporting EVERY roll as a failure, natural 20
// included, after the Effort has already left the pool. Object.hasOwn, same
// shape as poolLabel (ddd-9ir). Fallback 0 (= practiced, no ease): an unknown
// rating says nothing about the character's training, so the math must add and
// subtract nothing — -1 would silently hinder a roll the data never called an
// inability. The bad value still degrades VISIBLY: the card's eases line prints
// the raw rating verbatim beside this +0.
export const skillEase = (rating) =>
  Object.hasOwn(SKILL_EASES, rating) ? Math.min(SKILL_EASES[rating], 3) : 0

// Effort ladder before Edge: 3 for the first level, +2 per additional (book).
export const rawEffortCost = (levels) => (levels <= 0 ? 0 : 3 + 2 * (levels - 1))

export const effortCost = (levels, edge = 0) => Math.max(0, rawEffortCost(levels) - edge)

// Closed form, not a loop: schemaVersion 2 dropped the effort maximum, so
// effortStat is arbitrary valid input and a 1..effortStat scan can freeze the
// sheet (ddd-aqm audit). Affordable ⇔ effortCost(L, edge) ≤ poolCurrent, and
// with rawEffortCost affine (2L + 1) that is L ≤ (poolCurrent + edge − 1) / 2 —
// the max(0, …) branch folds in because poolCurrent is never negative here.
export const maxAffordableEffort = (effortStat, poolCurrent, edge = 0) =>
  Math.max(0, Math.min(effortStat, Math.floor((poolCurrent + edge - 1) / 2)))

export const easedSteps = ({ skillRating = null, assets = 0, effortLevels = 0 }) =>
  skillEase(skillRating) + Math.min(Math.max(assets, 0), 2) + Math.max(effortLevels, 0)

export const interpretGuidedRoll = ({ die, eased, difficulty = null }) => {
  const base = interpretStatRoll(die)
  if (difficulty === null) {
    return { ...base, eased, difficulty: null, effective: null, success: null, autoSuccess: false }
  }
  const effective = Math.max(0, difficulty - eased)
  return { ...base, eased, difficulty, effective, success: base.beats >= effective, autoSuccess: effective === 0 }
}
