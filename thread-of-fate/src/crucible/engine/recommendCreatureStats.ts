/**
 * The Threat Recommendation Engine - answers "what should this monster be?"
 *
 * Works backwards from the encounter the GM described: target a Threat total for
 * the requested difficulty, strip out the encounter modifiers (outnumbering,
 * hazards, allies), divide by how many creatures are being fielded, then look the
 * resulting Threat Rating up in the benchmark table and scale it by creature kind.
 *
 * Every number it returns is accompanied by the reasoning, because a recommendation
 * a GM cannot audit is a recommendation a GM cannot overrule.
 */

import type {
  ThreatMathLine,
  ThreatRecommendation,
  ThreatRecommendationInput,
} from '@/crucible/schemas/crucibleThreat.schema';
import type { EncounterDifficulty } from '@/crucible/schemas/crucibleCommon';
import { calculateThreatBudget, curioBudgetBonus } from './calculateThreatBudget';
import {
  EXPECTED_ROUNDS_DEFAULT,
  KIND_SCALING,
  benchmarkFor,
  outnumberingModifier,
  proficiencyBonusForLevel,
} from '@/crucible/data/registries/threatBalance.registry';
import { roleById } from '@/crucible/data/registries/creatureRoles.registry';

/** Where inside its band each difficulty aims. */
const BAND_TARGET: Record<EncounterDifficulty, (budget: number, size: number) => number> = {
  easy: (budget) => budget * 0.35,
  medium: (budget, size) => (budget / 2 + (budget - size)) / 2,
  hard: (budget) => budget,
  deadly: (budget, size) => budget + size * 1.5,
};

/** Lowest level that yields a given Proficiency Bonus. */
export function levelForProficiencyBonus(pb: number): number {
  for (let level = 1; level <= 60; level++) {
    if (proficiencyBonusForLevel(level) >= pb) return level;
  }
  return 60;
}

export function recommendCreatureStats(input: ThreatRecommendationInput): ThreatRecommendation {
  const partySize = Math.max(1, Math.round(input.partySize));
  const levels =
    input.partyLevels.length === partySize
      ? input.partyLevels
      : Array.from(
          { length: partySize },
          (_, i) => input.partyLevels[i] ?? input.partyLevels[0] ?? 1,
        );

  const budget = calculateThreatBudget(
    levels.map((level, i) => ({
      name: `PC ${i + 1}`,
      level,
      highestCurioRarity: input.partyCurioRarity ?? undefined,
    })),
  );

  const enemyCount = Math.max(1, Math.round(input.enemyCount));
  const scaling = KIND_SCALING[input.kind] ?? KIND_SCALING.standard;
  const lines: ThreatMathLine[] = [...budget.lines];
  const warnings: string[] = [];

  // --- Work backwards to a per-creature Threat Rating ------------------------
  const targetTotal = BAND_TARGET[input.desiredDifficulty](budget.total, partySize);
  lines.push({
    label: `Target total for ${input.desiredDifficulty}`,
    value: Math.round(targetTotal),
    rule: `Aim for the middle of the ${input.desiredDifficulty} band against a budget of ${budget.total} for ${partySize} PCs.`,
  });

  const outnumbering = outnumberingModifier(enemyCount, partySize);
  const hazardThreat = input.hazardThreat ?? 0;
  const alliedThreat = input.alliedThreat ?? 0;
  const availableForCreatures = targetTotal - outnumbering - hazardThreat + alliedThreat;

  if (outnumbering || hazardThreat || alliedThreat) {
    lines.push({
      label: 'Threat available to the creatures',
      value: Math.round(availableForCreatures),
      rule: 'Target total, less outnumbering and hazards, plus any allied creatures.',
      detail: [
        outnumbering ? `Outnumbering ${outnumbering > 0 ? '+' : ''}${outnumbering}` : '',
        hazardThreat ? `Hazards -${hazardThreat}` : '',
        alliedThreat ? `Allies +${alliedThreat}` : '',
      ].filter(Boolean),
    });
  }

  const perCreature = Math.max(0, availableForCreatures / enemyCount);
  const threatRatingLow = Math.max(0, Math.round(perCreature * 0.85));
  const threatRatingHigh = Math.max(threatRatingLow, Math.round(perCreature * 1.15));
  const midThreat = Math.max(0, Math.round(perCreature));

  lines.push({
    label: 'Threat Rating per creature',
    value: midThreat,
    rule: `${Math.round(
      availableForCreatures,
    )} available threat divided across ${enemyCount} creature${enemyCount === 1 ? '' : 's'}.`,
    detail: [`Recommended range ${threatRatingLow}-${threatRatingHigh}`],
  });

  // --- Proficiency Bonus and level ------------------------------------------
  // Matching the party's average PB keeps the Greater Proficiency rule neutral,
  // so the printed Threat Rating is the rating that actually applies at the table.
  const pb = Math.max(1, Math.round(budget.averageProficiencyBonus));
  const level = levelForProficiencyBonus(pb);
  lines.push({
    label: 'Proficiency Bonus',
    value: pb,
    rule: "Match the party's average PB so the Greater Proficiency modifier is zero.",
    detail: [`Lowest level with PB +${pb} is level ${level}`],
  });

  // --- Benchmarked stats ----------------------------------------------------
  const bench = benchmarkFor(midThreat);
  const rounds = input.expectedRounds ?? EXPECTED_ROUNDS_DEFAULT;
  const roundFactor = rounds / EXPECTED_ROUNDS_DEFAULT;

  const hitPointsLow = Math.max(
    1,
    Math.round(bench.hitPointsLow * scaling.hitPointMultiplier * roundFactor),
  );
  const hitPointsHigh = Math.max(
    hitPointsLow,
    Math.round(bench.hitPointsHigh * scaling.hitPointMultiplier * roundFactor),
  );
  const damagePerRoundLow = Math.max(
    1,
    Math.round(bench.damagePerRoundLow * scaling.damageMultiplier),
  );
  const damagePerRoundHigh = Math.max(
    damagePerRoundLow,
    Math.round(bench.damagePerRoundHigh * scaling.damageMultiplier),
  );

  // --- Role adjustments -----------------------------------------------------
  const roles = input.roleIds.map((id) => roleById[id]).filter(Boolean);
  let acLow = bench.armorClassLow;
  let acHigh = bench.armorClassHigh;
  const recommendedResistances: string[] = [];
  const recommendedTraitIds: string[] = [];

  for (const role of roles) {
    switch (role.id) {
      case 'tank':
        acLow += 1;
        acHigh += 2;
        recommendedResistances.push('Bludgeoning, Piercing, and Slashing from nonmagical attacks');
        break;
      case 'caster':
        acLow -= 2;
        acHigh -= 1;
        break;
      case 'scout':
        acLow += 1;
        acHigh += 1;
        break;
      case 'minion':
        acLow -= 1;
        acHigh -= 1;
        break;
    }
    recommendedTraitIds.push(...(role.id === 'minion' ? [] : []));
  }

  const suggestedCore = roles.length ? Math.max(...roles.map((r) => r.suggestedCoreActions)) : 2;
  const suggestedQuick = roles.length ? Math.max(...roles.map((r) => r.suggestedQuickActions)) : 1;
  const suggestedReactions = roles.length ? Math.max(...roles.map((r) => r.suggestedReactions)) : 1;

  const recommendedActionCount = suggestedCore + suggestedQuick + suggestedReactions;
  const recommendedTraitCount = Math.max(2, Math.min(6, Math.ceil(midThreat / 3) + 1));

  // --- Warnings -------------------------------------------------------------
  if (enemyCount === 1 && !scaling.allowApex && input.desiredDifficulty !== 'easy') {
    warnings.push(
      'A single standard creature will lose the action-economy fight against a full party. Mark it Elite or Boss, or add support.',
    );
  }
  if (input.kind === 'minion' && enemyCount < partySize) {
    warnings.push('Minions only pay off in numbers - field at least as many as there are PCs.');
  }
  if (midThreat === 0) {
    warnings.push(
      'The requested difficulty leaves no threat budget for this many creatures. Reduce the count, or accept Threat Rating 0 (ten such creatures count as +1).',
    );
  }
  if (scaling.allowPhases && enemyCount > 1) {
    warnings.push(`Running ${enemyCount} phase-based creatures at once will be hard to track.`);
  }
  if (input.desiredDifficulty === 'deadly') {
    warnings.push('Deadly encounters should have an escape route or a surrender condition.');
  }

  const reason = buildReason(
    partySize,
    levels,
    input.desiredDifficulty,
    enemyCount,
    midThreat,
    scaling.label,
    scaling.note,
    rounds,
  );

  return {
    threatRatingLow,
    threatRatingHigh,
    proficiencyBonus: pb,
    level,
    hitPointsLow,
    hitPointsHigh,
    armorClassLow: acLow,
    armorClassHigh: acHigh,
    damagePerRoundLow,
    damagePerRoundHigh,
    saveDcLow: bench.saveDcLow,
    saveDcHigh: bench.saveDcHigh,
    actionPoints: scaling.actionPoints,
    recommendedActionCount,
    recommendedTraitCount,
    recommendedTraitIds,
    recommendedResistances,
    allowApex: scaling.allowApex,
    allowOverture: scaling.allowOverture,
    reason,
    warnings,
    lines,
  };
}

function buildReason(
  partySize: number,
  levels: number[],
  difficulty: string,
  enemyCount: number,
  threat: number,
  kindLabel: string,
  kindNote: string,
  rounds: number,
): string {
  const levelText =
    new Set(levels).size === 1
      ? `level ${levels[0]}`
      : `levels ${Math.min(...levels)}-${Math.max(...levels)}`;
  return [
    `For ${partySize} ${levelText} PCs wanting a ${difficulty} fight against ${enemyCount} creature${
      enemyCount === 1 ? '' : 's'
    },`,
    `each needs roughly Threat Rating ${threat}.`,
    `As a ${kindLabel}, it should survive about ${rounds} rounds of focused fire while still threatening the party.`,
    kindNote,
  ].join(' ');
}

/** Curio bonus re-export so the UI can explain party budget adjustments. */
export { curioBudgetBonus };
