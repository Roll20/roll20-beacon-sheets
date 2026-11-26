/**
 * PC Threat Budget.
 *
 * Rules source: Convergence Bestiary.md L68 and L89.
 *   "At level 0 a PC's Threat Budget is 3, at level 1 it becomes 5, when the PC
 *    gains a level their Threat Budget increases by 1. When a PC gets to a level
 *    that increases their PB their Threat Budget resets to 5."
 *   "For PCs increase their Threat Budget depending on their highest rarity Curio.
 *    Increasing it by 1 for every rarity above Common."
 *
 * The PB progression is NOT hardcoded here - it comes from
 * threatBalance.registry's proficiencyProgressionRegistry, which delegates to the
 * character maker's proficiencyBonus(). See docs/CRUCIBLE_AUDIT.md section 6.2 for why
 * the directive's worked example ("4 x level 7 = 32") disagrees with this.
 */

import type {
  CurioRarity,
  PartyMemberThreatInput,
  PartyTarget,
} from '@/crucible/schemas/crucibleCommon';
import { CURIO_RARITY_STEPS } from '@/crucible/schemas/crucibleCommon';
import type { PartyBudgetResult, ThreatMathLine } from '@/crucible/schemas/crucibleThreat.schema';
import {
  ENCOUNTER_MODIFIERS,
  THREAT_BUDGET,
  proficiencyBonusForLevel,
  proficiencyIncreasesAt,
  threatBudgetForLevel,
} from '@/crucible/data/registries/threatBalance.registry';

export { threatBudgetForLevel };

/** Extra budget from a PC's highest-rarity Curio: +1 per rarity above Common. */
export function curioBudgetBonus(rarity: CurioRarity | null | undefined): number {
  if (!rarity) return 0;
  return (CURIO_RARITY_STEPS[rarity] ?? 0) * ENCOUNTER_MODIFIERS.curioStepValue;
}

/** Human-readable account of how a single PC's budget was reached. */
export function budgetDerivation(level: number): string {
  if (level <= 0) return `Level 0 -> ${THREAT_BUDGET.level0}`;
  const steps: string[] = [`L1 = ${THREAT_BUDGET.level1}`];
  let budget = THREAT_BUDGET.level1;
  for (let l = 2; l <= level; l++) {
    if (proficiencyIncreasesAt(l)) {
      budget = THREAT_BUDGET.resetOnProficiencyIncrease;
      steps.push(`L${l} PB up -> reset ${budget}`);
    } else {
      budget += THREAT_BUDGET.perLevel;
      steps.push(`L${l} = ${budget}`);
    }
  }
  // Keep the trail short: first, any resets, and the last step.
  const resets = steps.filter((s) => s.includes('reset'));
  const tail = steps[steps.length - 1];
  const shown = [steps[0], ...resets];
  if (!shown.includes(tail)) shown.push(tail);
  return shown.join(', ');
}

/**
 * Total Threat Budget for a party. Accepts either explicit members or a
 * size + average level shorthand.
 */
export function calculateThreatBudget(party: PartyMemberThreatInput[]): PartyBudgetResult {
  const perMember = party.map((m, i) => {
    const level = Math.max(0, Math.round(m.level));
    const pb = m.proficiencyBonus ?? proficiencyBonusForLevel(level);
    const curioBonus = curioBudgetBonus(m.highestCurioRarity);
    const base = threatBudgetForLevel(level);
    const overridden = m.manualThreatBudgetOverride != null;
    const budget = overridden ? (m.manualThreatBudgetOverride as number) : base + curioBonus;
    return {
      name: m.name || `PC ${i + 1}`,
      level,
      proficiencyBonus: pb,
      budget,
      curioBonus,
      overridden,
      derivation: overridden
        ? 'Manual override'
        : `${budgetDerivation(level)}${curioBonus ? ` + Curio ${curioBonus}` : ''}`,
    };
  });

  const total = perMember.reduce((s, m) => s + m.budget, 0);
  const averageProficiencyBonus = perMember.length
    ? perMember.reduce((s, m) => s + m.proficiencyBonus, 0) / perMember.length
    : 1;

  const lines: ThreatMathLine[] = [
    {
      label: 'Party Threat Budget',
      value: total,
      rule: 'Bestiary: L0 = 3, L1 = 5, +1 per level, reset to 5 when Proficiency Bonus increases.',
      detail: perMember.map(
        (m) =>
          `${m.name} (level ${m.level}, PB +${m.proficiencyBonus}): ${m.budget} - ${m.derivation}`,
      ),
    },
  ];

  return {
    total,
    size: perMember.length,
    averageProficiencyBonus,
    perMember,
    lines,
  };
}

/** Expand a PartyTarget shorthand into explicit members. */
export function membersFromTarget(target: PartyTarget): PartyMemberThreatInput[] {
  if (target.members.length) return target.members;
  const size = Math.max(1, Math.round(target.size));
  return Array.from({ length: size }, (_, i) => ({
    name: `PC ${i + 1}`,
    level: Math.max(0, Math.round(target.averageLevel)),
  }));
}

/** Convenience: budget straight from a PartyTarget. */
export function budgetForTarget(target: PartyTarget): PartyBudgetResult {
  return calculateThreatBudget(membersFromTarget(target));
}
