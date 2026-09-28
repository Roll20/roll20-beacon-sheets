// Pure presentation for the guided-roll chat card (spec ③ §4).
// Math lives in dice/rolls.js; this module only builds display strings.
import { skillEase, weaponClassEase, modifierEase, attackDamage, WEAPON_CLASS_EASES } from '@/dice/rolls.js'

const signed = (n) => (n >= 0 ? `+${n}` : `−${-n}`)

// The editor lets a player clear an attack's name, and hydrate never validates one,
// so `name` reaches these strings blank or whitespace-only (closeout audit). Without
// a fallback the chat heading reads " · Might", the ease term reads " (trained)" and
// the roller titles itself "Attack: ". ONE helper for every place this bead renders
// the name — the modal imports it too — spelled like the sheet's other fallbacks
// (ItemList's "unnamed <list> row N", NpcCard's "unnamed combat action").
export const attackLabel = (attack) =>
  (typeof attack?.name === 'string' && attack.name.trim()) || 'unnamed attack'

// An attack's ease sources, each its OWN labelled term (ddd-keb3). The point of
// separate terms is the double count: a player who also hand-recorded the
// light-weapon ease in `modifier` sees "light weapon +1 · modifier +1" instead of
// wondering where the extra step came from.
const attackEaseParts = (attack) => {
  const parts = [`${attackLabel(attack)} (${attack.skillRating}) ${signed(skillEase(attack.skillRating))}`]
  const cls = attack.weaponClass
  // A class that eases nothing earns no term — except a STRAY one, which shows
  // itself at +0 the way skillEase shows a corrupt rating, so a value the enum
  // does not contain degrades visibly rather than disappearing.
  if (cls && (weaponClassEase(cls) !== 0 || !Object.hasOwn(WEAPON_CLASS_EASES, cls))) {
    parts.push(`${cls} weapon ${signed(weaponClassEase(cls))}`)
  }
  // Any truthy modifier gets a term, malformed ones included, at the +0 the math
  // gave it. Falsy (null, or an empty-string readback) means "unmodified".
  if (attack.modifier) parts.push(`modifier ${signed(modifierEase(attack.modifier))}`)
  return parts
}

export const easesLine = ({ skill, attack = null, assets, effortLevels, eased }) => {
  const parts = []
  // skillEase, never SKILL_EASES[rating] — one source with easedSteps (ddd-c8f)
  // so the card can never describe a different number than the roll used.
  if (attack) parts.push(...attackEaseParts(attack))
  else if (skill) parts.push(`${skill.name} (${skill.rating}) ${signed(skillEase(skill.rating))}`)
  const a = Math.min(Math.max(assets, 0), 2)
  if (a > 0) parts.push(a === 1 ? 'asset +1' : `assets +${a}`)
  if (effortLevels > 0) parts.push(`Effort ${effortLevels}`)
  if (parts.length === 0) return 'No eases'
  const label = eased >= 0 ? `Eased ${eased}` : `Hindered ${-eased}`
  return `${label}: ${parts.join(' · ')}`
}

// Zero-cost wording shared by the chat card and the modal's live preview —
// one source so the preview can never drift from the posted card.
export const noSpendLine = (rawCost) =>
  rawCost > 0 ? `No points spent (Edge covered ${rawCost})` : 'No points spent'

export const spendLine = ({ cost, rawCost, edge, statLabel, poolAfter, poolMax, refunded = false }) => {
  if (cost === 0) return noSpendLine(rawCost)
  // Natural 20 (book rule): the cost drops to 0 and the points come back.
  if (refunded) return `Natural 20 — ${cost} ${statLabel} refunded · pool ${poolAfter}/${poolMax}`
  const detail = edge > 0 ? ` (${rawCost} − ${edge} Edge)` : ''
  return `Spent ${cost} ${statLabel}${detail} · pool ${poolAfter}/${poolMax}`
}

// `attack` swaps the book's attack vocabulary in (D2): a creature's level in place
// of a difficulty, hit and miss in place of success and failure. The projection
// arithmetic is shared — one set of rules, two vocabularies.
export const verdictLine = (interp, { attack = false } = {}) => {
  const level = attack ? 'level' : 'difficulty'
  if (interp.die === null) {
    return attack
      ? `Automatic hit — level ${interp.difficulty} eased to 0`
      : `Automatic success — difficulty ${interp.difficulty} eased to 0`
  }
  if (interp.difficulty === null) {
    if (interp.eased === 0) return `Beats ${level} ${interp.beats}`
    // Difficulty domain caps at 10: a die-20 (beats 6) with 7 eases is "up
    // to 10", not a fictional 13 (3rd audit F4). A negative projection means
    // the roll beats NOTHING: die 1 + inability cannot even beat difficulty
    // 0, which the hindrance makes effective difficulty 1 — never render
    // that as "effectively 0" (5th audit F4).
    const capable = Math.min(10, interp.beats + interp.eased)
    if (interp.eased > 0) return `Beats ${level} ${interp.beats} (+${interp.eased} eased → up to ${capable})`
    return capable < 0
      ? `Beats ${level} ${interp.beats} (−${-interp.eased} hindered → beats nothing)`
      : `Beats ${level} ${interp.beats} (−${-interp.eased} hindered → effectively ${capable})`
  }
  if (attack) {
    return interp.success
      ? `Hit vs level ${interp.difficulty} → ${interp.effective}`
      : `Miss vs level ${interp.difficulty} → ${interp.effective}`
  }
  return interp.success
    ? `Success vs difficulty ${interp.difficulty} → ${interp.effective}`
    : `Failure vs difficulty ${interp.difficulty} → ${interp.effective}`
}

// Damage for an attack (ddd-keb3). `damage` is attackDamage's result, so the card
// and the modal's live preview share one builder and cannot drift. Owner ruling 4:
// a miss posts no figure at all — the Effort is still spent, and the spend line
// says so. With no creature level entered the outcome is unknown, so the figure is
// explicitly conditional. The breakdown appears only when something beyond the
// weapon contributed, or when the stored damage was off-schema and the 0 needs
// explaining beside what the attack list is showing.
export const damageLine = ({ damage, levels, die, success }) => {
  if (success === false) return 'No damage dealt'
  const parts = []
  if (damage.weaponInvalid) {
    parts.push(damage.rawWeapon === null || damage.rawWeapon === undefined
      ? 'weapon 0 (nothing stored)'
      : `weapon 0 (stored "${damage.rawWeapon}")`)
  } else if (damage.effort > 0 || damage.roll > 0) {
    parts.push(`weapon ${damage.weapon}`)
  }
  if (damage.effort > 0) parts.push(`Effort ${levels} +${damage.effort}`)
  if (damage.roll > 0) parts.push(`natural ${die} +${damage.roll}`)
  const head = `${damage.total} damage${success === null ? ' on a hit' : ''}`
  return parts.length ? `${head}: ${parts.join(' · ')}` : head
}

// Specials are success-gated (5th audit F5): the book grants 17–20 bonus
// damage/effects "in addition to the normal results" of a task that
// succeeds — so a KNOWN failure suppresses them. GM Intrusion (natural 1)
// is not success-dependent. No-difficulty rolls keep the quick-roll
// behavior: outcome unknown at post time.
//
// On an attack (ddd-keb3) two more rules apply. 17 and 18 are already inside the
// damage total, so repeating them as a special would read as a second bonus. 19 and
// 20 grant their damage only if the player gives up the minor or major effect, so
// the card offers both and the total claims neither (D1) — carrying the damage
// line's own "on a hit" when the outcome is unknown, or the offer would read as
// certain beside a conditional total.
const specialFor = (interp, damage) => {
  const special = interp.special ?? null
  if (!special) return null
  if (interp.success === false && special.code !== 'gm-intrusion') return null
  if (!damage) return special
  if (damage.roll > 0) return null
  if (damage.optional > 0) {
    const qualifier = interp.success === null ? ' on a hit' : ''
    return { ...special, label: `${special.label}, or +${damage.optional} damage${qualifier}` }
  }
  return special
}

export const guidedRollTemplateData = ({ statLabel, skill, attack = null, assets, effortLevels, damageEffortLevels = 0, interp, cost, rawCost, edge, poolAfter, poolMax, refunded = false }) => {
  const damage = attack
    ? attackDamage({ weaponDamage: attack.damage, damageEffortLevels, die: interp.die })
    : null
  return {
    stat: attack ? `${attackLabel(attack)} · ${statLabel}` : statLabel,
    die: interp.die,
    auto: interp.die === null,
    verdict: verdictLine(interp, { attack: !!attack }),
    tone: interp.difficulty === null ? null : interp.success ? 'success' : 'failure',
    eases: easesLine({ skill, attack, assets, effortLevels, eased: interp.eased }),
    spend: spendLine({ cost, rawCost, edge, statLabel, poolAfter, poolMax, refunded }),
    // null for a skill roll, so the template's {{#if}} leaves that card unchanged.
    damage: damage
      ? damageLine({ damage, levels: damageEffortLevels, die: interp.die, success: interp.success })
      : null,
    special: specialFor(interp, damage)
  }
}
