/**
 * Encounter difficulty: party budget vs total enemy threat, with every
 * Bestiary modifier applied and the whole derivation shown to the GM.
 *
 * Rules source: Convergence Bestiary.md L66-91.
 *   Total Rating = sum(enemy adjusted Threat Ratings)
 *                + Outnumbering
 *                + Environmental Hazards
 * - Friendly Monsters
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { PartyMemberThreatInput, ThreatModifier } from '@/crucible/schemas/crucibleCommon';
import type {
  EncounterThreatResult,
  EnemyThreatContribution,
  ThreatMathLine,
} from '@/crucible/schemas/crucibleThreat.schema';
import { calculateThreatBudget } from './calculateThreatBudget';
import { calculateThreatRating, zeroedCreatureThreat } from './calculateThreatRating';
import {
  DIFFICULTY_BANDS,
  bandFor,
  outnumberingModifier,
} from '@/crucible/data/registries/threatBalance.registry';

export interface EncounterSide {
  entity: CrucibleEntitySchema;
  count: number;
  threatOverride?: number | null;
}

export interface EncounterThreatInput {
  party: PartyMemberThreatInput[];
  enemies: EncounterSide[];
  alliedCreatures: EncounterSide[];
  hazards: EncounterSide[];
  environmentModifiers: ThreatModifier[];
}

function sideContributions(
  sides: EncounterSide[],
  averagePartyProficiencyBonus: number,
): EnemyThreatContribution[] {
  return sides.map((s) =>
    calculateThreatRating(s.entity, {
      count: s.count,
      averagePartyProficiencyBonus,
      threatOverride: s.threatOverride,
    }),
  );
}

export function calculateEncounterDifficulty(input: EncounterThreatInput): EncounterThreatResult {
  const partyBudget = calculateThreatBudget(input.party);
  const partySize = Math.max(1, partyBudget.size);
  const avgPb = partyBudget.averageProficiencyBonus;

  const enemies = sideContributions(input.enemies, avgPb);
  const allies = sideContributions(input.alliedCreatures, avgPb);
  const hazards = sideContributions(input.hazards, avgPb);

  const enemyCount = enemies.reduce((s, e) => s + e.count, 0);

  // Creatures floored to 0 by Greater Proficiency: every 10 count as +1.
  const zeroedCount = enemies.filter((e) => e.zeroed).reduce((s, e) => s + e.count, 0);
  const zeroedThreat = zeroedCreatureThreat(zeroedCount);

  const enemySum = enemies.reduce((s, e) => s + e.total, 0);
  const allySum = allies.reduce((s, e) => s + e.total, 0);
  const hazardSum = hazards.reduce((s, e) => s + e.total, 0);
  const outnumbering = outnumberingModifier(enemyCount, partySize);
  const environmentSum = input.environmentModifiers.reduce((s, m) => s + m.value, 0);

  const enemyThreatTotal =
    enemySum + zeroedThreat + outnumbering + hazardSum + environmentSum - allySum;

  const difficulty = bandFor(enemyThreatTotal, partyBudget.total, partySize);

  const lines: ThreatMathLine[] = [
    ...partyBudget.lines,
    {
      label: 'Enemy Threat',
      value: enemySum,
      rule: 'Sum of each enemy adjusted Threat Rating x count.',
      detail: enemies.map((e) => `${e.name} x${e.count}: ${e.derivation}`),
    },
  ];

  if (zeroedThreat) {
    lines.push({
      label: 'Zero-rated creatures',
      value: zeroedThreat,
      rule: 'Bestiary: every 10 creatures reduced to Threat Rating 0 count as +1.',
      detail: [`${zeroedCount} creatures at Threat Rating 0 -> +${zeroedThreat}`],
    });
  }

  if (outnumbering) {
    lines.push({
      label: 'Outnumbering',
      value: outnumbering,
      rule:
        outnumbering > 0
          ? 'Bestiary: +1 when enemies outnumber the PCs, and +1 more for every doubling.'
          : 'Bestiary: -1 when the PCs outnumber the enemies.',
      detail: [`${enemyCount} enemies vs ${partySize} PCs`],
    });
  }

  if (hazardSum) {
    lines.push({
      label: 'Environmental Hazards',
      value: hazardSum,
      rule: 'Bestiary: add hazard and trap Threat Ratings to the Total Rating.',
      detail: hazards.map((h) => `${h.name} x${h.count}: ${h.total}`),
    });
  }

  if (environmentSum) {
    lines.push({
      label: 'Environment',
      value: environmentSum,
      rule: 'Environment registry modifier for the chosen terrain.',
      detail: input.environmentModifiers.map(
        (m) => `${m.label}: ${m.value > 0 ? '+' : ''}${m.value}`,
      ),
    });
  }

  if (allySum) {
    lines.push({
      label: 'Friendly Monsters',
      value: -allySum,
      rule: "Bestiary: decrease the Total Rating by each allied creature's Threat Rating.",
      detail: allies.map((a) => `${a.name} x${a.count}: -${a.total}`),
    });
  }

  lines.push({
    label: 'Total Enemy Threat',
    value: enemyThreatTotal,
    rule: 'Enemies + zeroed + outnumbering + hazards + environment - allies.',
  });

  const band = DIFFICULTY_BANDS.find((b) => b.id === difficulty);
  const half = partyBudget.total / 2;
  const reason = buildReason(
    difficulty,
    enemyThreatTotal,
    partyBudget.total,
    partySize,
    half,
    outnumbering,
    band?.description ?? '',
  );

  const warnings: string[] = [];
  if (!input.party.length) warnings.push('No party defined - difficulty cannot be judged.');
  if (!input.enemies.length) warnings.push('No enemies in the encounter.');
  if (difficulty === 'deadly') {
    warnings.push(
      `Deadly for this party: enemy threat ${enemyThreatTotal} exceeds budget ${partyBudget.total} by more than the party size (${partySize}).`,
    );
  }
  if (enemyCount === 1 && enemies[0] && enemies[0].adjustedThreat > partyBudget.total) {
    warnings.push(
      'A single enemy carries the whole encounter - it will lose the action-economy fight unless it has Apex or Overture Actions.',
    );
  }
  if (enemyCount > partySize * 4) {
    warnings.push(`${enemyCount} enemy tokens will slow the turn order considerably.`);
  }

  return {
    partyBudget,
    enemies,
    allies,
    hazards,
    enemyCount,
    outnumberingModifier: outnumbering,
    zeroedThreat,
    environmentModifiers: input.environmentModifiers,
    enemyThreatTotal,
    difficulty,
    reason,
    lines,
    warnings,
  };
}

function buildReason(
  difficulty: string,
  total: number,
  budget: number,
  partySize: number,
  half: number,
  outnumbering: number,
  bandDescription: string,
): string {
  const bits: string[] = [];
  switch (difficulty) {
    case 'easy':
      bits.push(`Enemy threat ${total} is below half the party budget (${half.toFixed(1)}).`);
      bits.push('The party should clear this without spending meaningful resources.');
      break;
    case 'medium':
      bits.push(
        `Enemy threat ${total} is at or above half the budget (${half.toFixed(1)}) but under ${
          budget - partySize
        }.`,
      );
      bits.push('Expect resource spend but little real danger.');
      break;
    case 'hard':
      bits.push(
        `Enemy threat ${total} sits within one party-size (${partySize}) of the budget ${budget}.`,
      );
      bits.push('A genuine fight - expect someone to go down.');
      break;
    default:
      bits.push(`Enemy threat ${total} exceeds budget ${budget} by more than ${partySize}.`);
      bits.push('Deaths are likely without good tactics or an escape route.');
      break;
  }
  if (outnumbering > 0) bits.push(`Outnumbering adds +${outnumbering}.`);
  else if (outnumbering < 0) bits.push('The party outnumbers the enemy, easing it by 1.');
  else bits.push('No outnumbering modifier applies.');
  if (bandDescription) bits.push(bandDescription);
  return bits.join(' ');
}

/** Render the derivation as the plain-text block the directive's example shows. */
export function formatThreatReport(result: EncounterThreatResult): string {
  const out: string[] = [];
  out.push('Party:');
  out.push(
    `${result.partyBudget.size} players, levels ${[
      ...new Set(result.partyBudget.perMember.map((m) => m.level)),
    ].join('/')}`,
  );
  out.push(`Total Party Threat Budget: ${result.partyBudget.total}`);
  out.push('Enemies:');
  for (const e of result.enemies) {
    out.push(`${e.count} x ${e.name}, TR ${e.adjustedThreat}${e.count > 1 ? ' each' : ''}`);
  }
  for (const h of result.hazards)
    out.push(`Environmental Hazard: ${h.name}, TR ${h.adjustedThreat}`);
  for (const a of result.allies) out.push(`Ally: ${a.name}, TR -${a.adjustedThreat}`);
  if (result.outnumberingModifier)
    out.push(
      `Outnumbering: ${result.outnumberingModifier > 0 ? '+' : ''}${result.outnumberingModifier}`,
    );
  out.push(`Enemy Total: ${result.enemyThreatTotal}`);
  out.push(`Difficulty: ${result.difficulty.charAt(0).toUpperCase()}${result.difficulty.slice(1)}`);
  out.push('Reason:');
  out.push(result.reason);
  return out.join('\n');
}
