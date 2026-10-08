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

// ---- Attack rolls (ddd-keb3) ----

// Weapon class eases (book): a light weapon eases the attack one step; medium and
// heavy do not. Object.hasOwn, never `??` — the fourth instance of the prototype-key
// false guard after poolLabel (ddd-9ir), skillEase (ddd-c8f) and the roller's pool
// (ddd-wc3). WEAPON_CLASS_EASES.constructor is a truthy Function, so a coalesce
// never fires, and the NaN it returns reaches interpretGuidedRoll's
// `base.beats >= effective`, where every comparison is false — reporting EVERY
// attack as a miss, natural 20 included, after the Effort has left the pool.
// A stray class contributes 0 and the card prints it verbatim beside that +0, so
// the bad value degrades visibly rather than silently.
export const WEAPON_CLASS_EASES = { light: 1, medium: 0, heavy: 0 }
export const weaponClassEase = (weaponClass) =>
  Object.hasOwn(WEAPON_CLASS_EASES, weaponClass) ? WEAPON_CLASS_EASES[weaponClass] : 0

// An attack row's standing ease/hinder ({steps, direction}), folded in signed.
// hydrate() validates nothing, so every off-schema shape — a bare string, a number,
// fractional or string steps, steps below the schema's minimum of 1, an unknown or
// prototype-key direction — contributes 0 rather than NaN or a flipped sign. The
// card still prints the term at +0 next to the other eases, which is what makes a
// hand-recorded duplicate of the light-weapon ease visible instead of mysterious.
export const modifierEase = (modifier) => {
  if (!modifier || typeof modifier !== 'object') return 0
  const { steps, direction } = modifier
  if (!Number.isInteger(steps) || steps < 1) return 0
  if (direction === 'eased') return steps
  if (direction === 'hindered') return -steps
  return 0
}

// weaponClass/modifier default to null, so the skill-roll callers that pass neither
// are unchanged — one ease function for both roll kinds means the modal preview,
// the store and the chat card can never describe different numbers.
export const easedSteps = ({ skillRating = null, weaponClass = null, modifier = null, assets = 0, effortLevels = 0 }) =>
  skillEase(skillRating) + weaponClassEase(weaponClass) + modifierEase(modifier) +
  Math.min(Math.max(assets, 0), 2) + Math.max(effortLevels, 0)

// Effort applied to damage adds 3 damage per level (book). Area and explosive
// attacks add only 2, but the contract carries no field marking an attack as
// either, so the sheet does not model that case.
export const DAMAGE_PER_EFFORT_LEVEL = 3

// The book's attack-roll damage bonuses, which land only on a HIT: +1 on a 17 and
// +2 on an 18, unconditionally; +3 on a 19 and +4 on a 20 only if the player gives
// up the minor or major effect. That choice happens at the table and the sheet
// cannot see it, so 19/20 stay OUT of the total and are reported as optional (D1) —
// the posted number can then understate damage but never overstates it.
export const ROLL_DAMAGE_BONUSES = { 17: 1, 18: 2 }
export const OPTIONAL_ROLL_DAMAGE = { 19: 3, 20: 4 }

// weaponDamage is a STORED value hydrate never validates. Anything that is not a
// non-negative integer counts as 0 AND rides along raw, because the attack list
// renders row.damage unvalidated: coercing silently would leave a row reading
// "4 damage" in the list and rolling as 0 on the card with nothing to explain the
// gap (round-1 plan audit). The card prints the stored value beside the 0.
export const attackDamage = ({ weaponDamage, damageEffortLevels = 0, die = null }) => {
  const weaponInvalid = !(Number.isInteger(weaponDamage) && weaponDamage >= 0)
  const weapon = weaponInvalid ? 0 : weaponDamage
  const effort = DAMAGE_PER_EFFORT_LEVEL * Math.max(damageEffortLevels, 0)
  const roll = Object.hasOwn(ROLL_DAMAGE_BONUSES, die) ? ROLL_DAMAGE_BONUSES[die] : 0
  const optional = Object.hasOwn(OPTIONAL_ROLL_DAMAGE, die) ? OPTIONAL_ROLL_DAMAGE[die] : 0
  return {
    weapon, rawWeapon: weaponDamage, weaponInvalid, effort, roll, optional,
    total: weapon + effort + roll
  }
}

export const interpretGuidedRoll = ({ die, eased, difficulty = null }) => {
  const base = interpretStatRoll(die)
  if (difficulty === null) {
    return { ...base, eased, difficulty: null, effective: null, success: null, autoSuccess: false }
  }
  const effective = Math.max(0, difficulty - eased)
  return { ...base, eased, difficulty, effective, success: base.beats >= effective, autoSuccess: effective === 0 }
}
