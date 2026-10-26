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

// The three Magnus inputs (spec §6.2) default to no-ops, so every current-edition
// card is byte-identical. easedSteps is the ONLY place they are summed: this line
// prints its own term for each from the same inputs and takes the total from the
// caller, exactly as `assets` and `effortLevels` already do.
export const easesLine = ({
  skill, attack = null, assets, effortLevels, eased,
  stressHindrance = 0, armorHindered = false, burnedStress = false
}) => {
  const parts = []
  // skillEase, never SKILL_EASES[rating] — one source with easedSteps (ddd-c8f)
  // so the card can never describe a different number than the roll used.
  if (attack) parts.push(...attackEaseParts(attack))
  else if (skill) parts.push(`${skill.name} (${skill.rating}) ${signed(skillEase(skill.rating))}`)
  const a = Math.min(Math.max(assets, 0), 2)
  if (a > 0) parts.push(a === 1 ? 'asset +1' : `assets +${a}`)
  if (effortLevels > 0) parts.push(`Effort ${effortLevels}`)
  // Clamped the way easedSteps clamps it: a negative hindrance adds no step, so it
  // must add no term either — `Stress +3` would describe an ease the math never gave.
  // `signed` for all three, so the minus sign is the card's U+2212 and not a hyphen.
  const stress = Math.max(stressHindrance, 0)
  if (stress > 0) parts.push(`Stress ${signed(-stress)}`)
  if (armorHindered) parts.push(`worn armor ${signed(-1)}`)
  if (burnedStress) parts.push(`burned Stress level ${signed(1)}`)
  if (parts.length === 0) return 'No eases'
  const label = eased >= 0 ? `Eased ${eased}` : `Hindered ${-eased}`
  return `${label}: ${parts.join(' · ')}`
}

// The pre-Edge figure, decomposed when the impaired damage-track surcharge is part
// of it (ddd-khaj). Task 2 folded the surcharge into rawCost, which makes the
// existing parenthetical arithmetically true for free — but naming it is not free:
// with no Edge there is no parenthetical at all, so `Spent 4 Might` for one level
// reads as a bug to a player who knows the book price is 3.
//
// The input is the TOTAL surcharge, never the per-level rate: two levels at one
// point per level must read `5 + 2 impaired`, and a builder holding only the rate
// can produce neither figure. The base is therefore rawCost - surchargeTotal.
// Exported for the modal's live cost preview (ddd-khaj, Task 8), which prints the same
// decomposition one tense earlier: "Costs 6 Might (5 + 2 impaired − 1 Edge)" against the
// card's "Spent". A second `+ n impaired` string spelled in RollerModal.vue is the one
// place the preview could drift from the posted card on exactly this wording, which is
// the drift this design exists to prevent — so there is one builder and both read it.
export const rawCostTerms = (rawCost, surchargeTotal) =>
  surchargeTotal > 0 ? `${rawCost - surchargeTotal} + ${surchargeTotal} impaired` : `${rawCost}`

// Zero-cost wording shared by the chat card and the modal's live preview —
// one source so the preview can never drift from the posted card.
export const noSpendLine = (rawCost, surchargeTotal = 0) =>
  rawCost > 0
    ? `No points spent (Edge covered ${rawCostTerms(rawCost, surchargeTotal)})`
    : 'No points spent'

// The three Luck inputs (ddd-xrug.1, spec §4) default to the no-Luck answer, so every
// existing caller and every current-edition card is byte-identical: `poolCost` defaults
// to the whole cost, and a `luckCharged` of 0 selects the wording this line has always
// had. They exist because labelling the whole `cost` as the stat Pool's spend is a FALSE
// figure once Luck can pay part of it — a cost of 3 with 2 from Luck said `Spent 3 Might`
// while the Pool lost 1, and `Natural 20 — 3 Might refunded` while 1 point went back.
// Adding a Luck line beside those would not have fixed them; they were wrong themselves.
//
// `poolCost + luckCharged === cost` is the store's invariant, and this line prints all
// three figures from the caller rather than deriving any of them, so a card that ever
// disagreed with the reservation would say so visibly instead of being quietly corrected
// — the same rule the Eased/Hindered label follows. The DEFAULTS are the one exception and
// they keep the invariant too: `luckCharged` is declared before `poolCost` so an omitted
// `poolCost` is the remainder rather than the whole cost. Declared the other way round, a
// caller passing only `luckCharged` would print two shares adding up to more than the cost
// on the same line.
//
// The Luck Pool's resulting STATE is not here: it belongs to luckLine, because this
// line's refund wording would imply the Luck came back on the same terms as the Pool.
export const spendLine = ({ cost, rawCost, edge, statLabel, poolAfter, poolMax, refunded = false, surchargeTotal = 0, luckCharged = 0, poolCost = cost - luckCharged, luckLabel = 'Luck' }) => {
  if (cost === 0) return noSpendLine(rawCost, surchargeTotal)
  // The stat Pool's own figures, on every form of this line.
  const poolTail = ` · pool ${poolAfter}/${poolMax}`
  // Natural 20 (book rule): the cost drops to 0 and the points come back. No cost
  // breakdown here — the points are back, so there is nothing to break down. Where Luck
  // paid part of it, WHERE the points went back is the whole point of the line: the two
  // objects are refunded their own shares, never the cost each.
  if (refunded) {
    return luckCharged > 0
      ? `Natural 20 — ${cost} refunded, ${poolCost} to ${statLabel} and ${luckCharged} to ${luckLabel}${poolTail}`
      : `Natural 20 — ${cost} ${statLabel} refunded${poolTail}`
  }
  const terms = rawCostTerms(rawCost, surchargeTotal)
  // A surcharge earns the parenthetical on its own, Edge or no Edge. BOTH arms survive
  // into the split: an impaired character with no Edge is a reachable Old Gods pair, and
  // `Spent 4 — 2 Might, 2 Luck` with no `(3 + 1 impaired)` leaves the fourth point
  // unexplained to a player who knows the book price is 3.
  const detail = edge > 0 ? ` (${terms} − ${edge} Edge)` : surchargeTotal > 0 ? ` (${terms})` : ''
  // The total keeps the head of the line, because the total is what the action cost; the
  // two shares follow it. The stat label moves off the total in the split form for the
  // same reason the figures changed — `Spent 3 Might` is not true of a cost Luck helped pay.
  return luckCharged > 0
    ? `Spent ${cost}${detail} — ${poolCost} ${statLabel}, ${luckCharged} ${luckLabel}${poolTail}`
    : `Spent ${cost} ${statLabel}${detail}${poolTail}`
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

// Old Gods of Appalachia moves a character one step down the damage track every time
// a Pool is reduced to 0 (spec §9). The sheet never moves the track itself (owner
// ruling, ddd-4uhf), so the card tells the player to. Fixed copy rather than the
// resulting step, so it stays correct whatever position the sheet believes.
export const NUDGE_LINE = 'Pool emptied. Move one step down the damage track.'

// The burn's own line (spec §6.4), kept OUT of spendLine: a natural 20 refunds the
// Effort points and gives the burned level no equivalent, so the refund wording
// there would imply the Stress came back too.
//
// THREE states, and the third is reachable. `stressAfter` is the post-deduction
// snapshot, `{ points, levels }` — or null, because a burn can complete with no
// live Stress object left to report: timeout, a hydrate that nulls `stress`, then a
// late die. redeductStress correctly does nothing, so the fresh snapshot is null
// beside a burn that really happened. Printing the level alone is the honest line;
// dereferencing the null instead throws inside the late continuation, whose own
// `.catch(() => {})` swallows it, and the player loses the whole card.
export const stressLine = ({ burnedStress, stressAfter }) => {
  if (!burnedStress) return null
  const burned = 'Burned 1 Stress level'
  if (!stressAfter) return burned
  return `${burned} · Stress ${stressAfter.points} points, level ${stressAfter.levels}`
}

// Luck's own line (ddd-xrug.1, spec §4), kept OUT of spendLine for the reason the burn is:
// spendLine owns the stat Pool's figures, and its refund wording would read as a claim
// about Luck's state too. What this line carries is the Luck Pool's resulting STATE, the
// way `· pool 10/13` carries the stat Pool's — and only that.
//
// No charge phrase here, because spendLine already names Luck's share in BOTH of its split
// forms: `Spent 3 (5 − 2 Edge) — 1 Might, 2 Luck` and
// `Natural 20 — 3 refunded, 1 to Might and 2 to Luck`. Repeating it two lines later would
// say the same thing twice, and any past-tense spelling of it (`Spent 2 Luck`) is outright
// FALSE on the refund form. `Luck 1/3` is true on every branch, which is the point.
//
// `luckCharged`, never the allocation: a roll that allocated 3 against a cost of 1 charged
// 1, and the branch below that does print a figure would name points Luck never paid.
//
// THREE states, and the third is the one stressLine's shape is for. `luckAfter` is the
// post-deduction pair, `{ current, max }` — or null, because a charge can complete with no
// live Luck object left to report: timeout, a hydrate that nulls `luck`, then a late die.
// redeductLuck correctly does nothing, so the fresh pair is null beside a charge that
// really happened. With no state to carry, the charge alone is the honest line;
// dereferencing the null instead throws inside the late continuation, whose own
// `.catch(() => {})` swallows it, and the player loses the whole card rather than one line.
export const luckLine = ({ luckCharged = 0, luckAfter = null, luckLabel = 'Luck' }) => {
  if (luckCharged <= 0) return null
  if (!luckAfter) return `${luckCharged} ${luckLabel} toward this roll`
  return `${luckLabel} ${luckAfter.current}/${luckAfter.max}`
}

// `emptied` is the CALLER's answer, never re-derived from poolAfter. The card shows a
// live pool figure on the dispatch-timeout path, where a 0 can mean a concurrent
// hydrate emptied the pool and this roll took nothing — a case that earns no line.
// `damageTrack` is likewise the caller's reservation-time snapshot of the rule, so a
// table toggling it mid-roll cannot rewrite a card for a spend already made.
// `stressRule` is the caller's reservation-time snapshot too, for the same reason.
// The Magnus keys all default to no-ops, so a current-edition card is unchanged.
// The four Luck keys (ddd-xrug.1) default the same way: `luckCharged` to 0 and `poolCost`
// to whatever is left of the cost after it, which on those defaults is the whole cost and
// the no-Luck card byte for byte. `luckCharged` is declared FIRST so the subtraction can
// see it, and so a caller passing only `luckCharged` cannot get two shares adding up to
// more than the cost they sit beside. Every real caller passes both, so the order changes
// no card. `luckAfter` is the caller's pair, built from ONE read like `stressAfter`, so the
// two figures can never come from different snapshots. `luckLabel` is the Pool's stored name, because a player who renamed
// it must not read "Luck" in chat.
export const guidedRollTemplateData = ({ statLabel, skill, attack = null, assets, effortLevels, damageEffortLevels = 0, interp, cost, rawCost, edge, poolAfter, poolMax, refunded = false, damageTrack = false, emptied = false, surchargeTotal = 0, stressRule = false, stressHindrance = 0, armorHindered = false, burnedStress = false, stressAfter = null, luckCharged = 0, poolCost = cost - luckCharged, luckAfter = null, luckLabel = 'Luck' }) => {
  const damage = attack
    ? attackDamage({ weaponDamage: attack.damage, damageEffortLevels, die: interp.die })
    : null
  return {
    stat: attack ? `${attackLabel(attack)} · ${statLabel}` : statLabel,
    die: interp.die,
    auto: interp.die === null,
    verdict: verdictLine(interp, { attack: !!attack }),
    tone: interp.difficulty === null ? null : interp.success ? 'success' : 'failure',
    eases: easesLine({ skill, attack, assets, effortLevels, eased: interp.eased, stressHindrance, armorHindered, burnedStress }),
    spend: spendLine({ cost, rawCost, edge, statLabel, poolAfter, poolMax, refunded, surchargeTotal, poolCost, luckCharged, luckLabel }),
    // null unless a level was burned, so the template's {{#if}} leaves every
    // other card unchanged.
    stress: stressLine({ burnedStress, stressAfter }),
    // null unless Luck really paid, for the same reason: every current-edition card goes
    // through here, so the element must not appear on any of them.
    luck: luckLine({ luckCharged, luckAfter, luckLabel }),
    // null for a skill roll, so the template's {{#if}} leaves that card unchanged.
    damage: damage
      ? damageLine({ damage, levels: damageEffortLevels, die: interp.die, success: interp.success })
      : null,
    special: specialFor(interp, damage),
    // A refund puts the points back, so a natural 20 and a dispatch-timeout refund
    // carry no line even when the reservation had emptied the pool. Magnus still HAS a
    // damage track and DamageTrack renders all five of its steps. What Magnus has no
    // rule for is a Pool reaching zero moving the character one step down that track
    // (spec §6.6), so an emptied Pool under the Stress rule earns no instruction either.
    nudge: damageTrack && !stressRule && emptied && !refunded ? NUDGE_LINE : null
  }
}
