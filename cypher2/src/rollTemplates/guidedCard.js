// Pure presentation for the guided-roll chat card (spec ③ §4).
// Math lives in dice/rolls.js; this module only builds display strings.
import { skillEase } from '@/dice/rolls.js'

const signed = (n) => (n >= 0 ? `+${n}` : `−${-n}`)

export const easesLine = ({ skill, assets, effortLevels, eased }) => {
  const parts = []
  // skillEase, never SKILL_EASES[rating] — one source with easedSteps (ddd-c8f)
  // so the card can never describe a different number than the roll used.
  if (skill) parts.push(`${skill.name} (${skill.rating}) ${signed(skillEase(skill.rating))}`)
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

export const verdictLine = (interp) => {
  if (interp.die === null) return `Automatic success — difficulty ${interp.difficulty} eased to 0`
  if (interp.difficulty === null) {
    if (interp.eased === 0) return `Beats difficulty ${interp.beats}`
    // Difficulty domain caps at 10: a die-20 (beats 6) with 7 eases is "up
    // to 10", not a fictional 13 (3rd audit F4). A negative projection means
    // the roll beats NOTHING: die 1 + inability cannot even beat difficulty
    // 0, which the hindrance makes effective difficulty 1 — never render
    // that as "effectively 0" (5th audit F4).
    const capable = Math.min(10, interp.beats + interp.eased)
    if (interp.eased > 0) return `Beats difficulty ${interp.beats} (+${interp.eased} eased → up to ${capable})`
    return capable < 0
      ? `Beats difficulty ${interp.beats} (−${-interp.eased} hindered → beats nothing)`
      : `Beats difficulty ${interp.beats} (−${-interp.eased} hindered → effectively ${capable})`
  }
  return interp.success
    ? `Success vs difficulty ${interp.difficulty} → ${interp.effective}`
    : `Failure vs difficulty ${interp.difficulty} → ${interp.effective}`
}

export const guidedRollTemplateData = ({ statLabel, skill, assets, effortLevels, interp, cost, rawCost, edge, poolAfter, poolMax, refunded = false }) => ({
  stat: statLabel,
  die: interp.die,
  auto: interp.die === null,
  verdict: verdictLine(interp),
  tone: interp.difficulty === null ? null : interp.success ? 'success' : 'failure',
  eases: easesLine({ skill, assets, effortLevels, eased: interp.eased }),
  spend: spendLine({ cost, rawCost, edge, statLabel, poolAfter, poolMax, refunded }),
  // Specials are success-gated (5th audit F5): the book grants 17–20 bonus
  // damage/effects "in addition to the normal results" of a task that
  // succeeds — so a KNOWN failure suppresses them. GM Intrusion (natural 1)
  // is not success-dependent. No-difficulty rolls keep the quick-roll
  // behavior: outcome unknown at post time.
  special: interp.success === false && interp.special?.code !== 'gm-intrusion' ? null : interp.special ?? null
})
