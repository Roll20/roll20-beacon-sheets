/**
 * Validation: errors block deployment, warnings flag design problems, info
 * describes what the creature has become. Every issue carries a suggestion the
 * UI can offer as a one-click fix where one exists.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { allActions } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleValidationIssue } from '@/crucible/schemas/crucibleCommon';
import { sizeById } from '@/crucible/data/registries/creatureSizes.registry';
import { roleById, roleConflicts } from '@/crucible/data/registries/creatureRoles.registry';
import { benchmarkFor } from '@/crucible/data/registries/threatBalance.registry';
import { budgetForTarget } from './calculateThreatBudget';
import { bandFor } from '@/crucible/data/registries/threatBalance.registry';

const TOKEN_BAR_COMPUTED = new Set([
  'crucible_hp',
  'crucible_stamina',
  'crucible_aether',
  'crucible_ap',
  'crucible_ac',
  'none',
]);

let counter = 0;
const nextId = (code: string) => `${code}-${++counter}`;

function issue(
  level: CrucibleValidationIssue['level'],
  code: string,
  message: string,
  fieldPath?: string,
  suggestion?: string,
): CrucibleValidationIssue {
  return { id: nextId(code), level, code, message, fieldPath, suggestion };
}

export function validateCrucibleEntity(entity: CrucibleEntitySchema): CrucibleValidationIssue[] {
  const out: CrucibleValidationIssue[] = [];
  const d = entity.derived;
  const every = allActions(entity);
  const isCombatant = entity.kind !== 'npc' || every.length > 0;

  // ---------------------------------------------------------------- errors --
  if (!entity.identity.name.trim()) {
    out.push(
      issue(
        'error',
        'missing-name',
        'The entity has no name.',
        'identity.name',
        'Give it a name before deploying.',
      ),
    );
  }
  if (!entity.schemaVersion) {
    out.push(issue('error', 'invalid-schema', 'Missing schema version.', 'schemaVersion'));
  }
  if (!sizeById[entity.classification.sizeId]) {
    out.push(
      issue(
        'error',
        'unknown-registry-id',
        `Unknown size "${entity.classification.sizeId}".`,
        'classification.sizeId',
        'Pick a size from the registry.',
      ),
    );
  }
  for (const roleId of entity.classification.roleIds) {
    if (!roleById[roleId]) {
      out.push(
        issue(
          'error',
          'unknown-registry-id',
          `Unknown creature role "${roleId}".`,
          'classification.roleIds',
        ),
      );
    }
  }
  if (d.hitPoints <= 0) {
    out.push(
      issue(
        'error',
        'no-hp',
        'The entity has no hit points.',
        'defenses',
        'Set a hit dice count or a manual hit-point value.',
      ),
    );
  }
  if (!Number.isFinite(entity.progression.threatRating) || entity.progression.threatRating < 0) {
    out.push(
      issue(
        'error',
        'invalid-threat',
        'Threat Rating must be zero or greater.',
        'progression.threatRating',
      ),
    );
  }

  const resourceIds = new Set(entity.resources.map((r) => r.id));
  for (const action of every) {
    for (const effect of action.effects) {
      if (effect.kind === 'resource' && !resourceIds.has(effect.value)) {
        out.push(
          issue(
            'error',
            'action-missing-resource',
            `Action "${action.name}" spends unknown resource "${effect.value}".`,
            `actions.${action.id}`,
            'Add the resource, or change the effect.',
          ),
        );
      }
    }
  }

  const actionIds = new Set(every.map((a) => a.id));
  for (const phase of entity.boss?.phases ?? []) {
    for (const id of [...phase.addedActions, ...phase.removedActions]) {
      if (!actionIds.has(id)) {
        out.push(
          issue(
            'error',
            'phase-missing-action',
            `Phase "${phase.name}" references unknown action "${id}".`,
            `boss.phases.${phase.id}`,
          ),
        );
      }
    }
  }
  for (const action of every) {
    if (action.multiattackOf?.some((id) => !actionIds.has(id))) {
      out.push(
        issue(
          'error',
          'action-missing-resource',
          `Multiattack "${action.name}" references an action that does not exist.`,
          `actions.${action.id}`,
        ),
      );
    }
  }

  for (const [barName, bar] of [
    ['bar1', entity.token.bar1],
    ['bar2', entity.token.bar2],
    ['bar3', entity.token.bar3],
  ] as const) {
    if (!TOKEN_BAR_COMPUTED.has(bar.computed)) {
      out.push(
        issue(
          'error',
          'token-bar-missing-computed',
          `Token ${barName} points at unknown computed value "${bar.computed}".`,
          `token.${barName}`,
        ),
      );
    }
    if (bar.computed === 'crucible_aether' && d.aether <= 0) {
      out.push(
        issue(
          'warning',
          'token-bar-empty',
          `Token ${barName} shows Aether, but this creature has none.`,
          `token.${barName}`,
          'Point the bar at Action Points instead.',
        ),
      );
    }
  }

  // -------------------------------------------------------------- warnings --
  if (isCombatant && !every.some((a) => a.roll.type === 'attack')) {
    out.push(
      issue(
        'warning',
        'no-primary-attack',
        'No attack action - this creature cannot threaten anyone.',
        'actions',
        'Add a Core Action with an attack roll.',
      ),
    );
  }
  if (
    isCombatant &&
    entity.movement.ground === 0 &&
    entity.movement.fly === 0 &&
    entity.movement.swim === 0 &&
    entity.movement.burrow === 0 &&
    entity.movement.climb === 0 &&
    entity.kind !== 'hazard' &&
    entity.kind !== 'trap' &&
    entity.kind !== 'encounterObject'
  ) {
    out.push(
      issue(
        'warning',
        'no-speed',
        'No movement speed of any kind.',
        'movement',
        'Set a ground speed.',
      ),
    );
  }

  const isBoss = entity.kind === 'boss' || entity.kind === 'mythicBoss';
  if (isBoss) {
    const offTurn =
      entity.reactions.length + entity.apexActions.length + entity.overtureActions.length;
    if (offTurn === 0) {
      out.push(
        issue(
          'warning',
          'boss-no-off-turn',
          'A boss with no Reactions, Apex, or Overture Actions will be stun-locked by a full party.',
          'apexActions',
          'Add Apex Actions so it acts between PC turns.',
        ),
      );
    }
    if (!entity.boss?.phases.length) {
      out.push(
        issue(
          'warning',
          'boss-no-phases',
          'Boss has no phases - the fight will be one long health bar.',
          'boss.phases',
          'Add a phase at 50% hit points.',
        ),
      );
    }
    if (
      !entity.defenses.vulnerabilities.length &&
      !entity.monster?.weaknessClues.length &&
      entity.progression.threatRating >= 8
    ) {
      out.push(
        issue(
          'warning',
          'no-weakness',
          'High-threat boss with no vulnerability or weakness clue - players have nothing to discover.',
          'defenses.vulnerabilities',
        ),
      );
    }
  }
  if (entity.kind === 'mythicBoss' && !entity.overtureActions.length) {
    out.push(
      issue(
        'warning',
        'mythic-no-overture',
        'A Mythic Boss with no Overture Actions is just a boss.',
        'overtureActions',
      ),
    );
  }

  if (entity.reactions.length > 3) {
    out.push(
      issue(
        'warning',
        'too-many-reactions',
        `${entity.reactions.length} reactions is more than one creature can realistically use (1 per round).`,
        'reactions',
        'Trim to 1-2, or make the extras Apex Actions.',
      ),
    );
  }

  if (d.aether > 0 && !entity.magic.knownArteIds.length && !entity.magic.innateNote.trim()) {
    out.push(
      issue(
        'warning',
        'unspendable-aether',
        `${d.aether} Aether with no Artes to spend it on.`,
        'magic.knownArteIds',
        'Add Artes, or clear the Caster role.',
      ),
    );
  }

  if (entity.kind === 'npc' && !(entity.npc?.motivation ?? '').trim()) {
    out.push(
      issue(
        'warning',
        'npc-no-motivation',
        'This NPC wants nothing, so they cannot be played.',
        'npc.motivation',
        'Pick a motivation from the registry.',
      ),
    );
  }
  if (
    (entity.kind === 'monster' || isBoss) &&
    !(entity.monster?.combatProfile.standardTurn ?? '').trim()
  ) {
    out.push(
      issue(
        'warning',
        'monster-no-behavior',
        'No behaviour notes - you will have to improvise its turns.',
        'monster.combatProfile',
      ),
    );
  }

  const isMinion = entity.kind === 'minion' || entity.classification.roleIds.includes('minion');
  if (isMinion) {
    for (const [barName, bar] of [
      ['bar1', entity.token.bar1],
      ['bar2', entity.token.bar2],
      ['bar3', entity.token.bar3],
    ] as const) {
      if (bar.linked && bar.computed !== 'none') {
        out.push(
          issue(
            'warning',
            'minion-linked-hp',
            `Minion token ${barName} is linked - damaging one copy would damage every copy.`,
            `token.${barName}.linked`,
            'Unlink the bar.',
          ),
        );
      }
    }
    if (entity.token.identity === 'unique') {
      out.push(
        issue(
          'warning',
          'minion-unique-token',
          'Minions should use a generic token, not a unique one.',
          'token.identity',
          'Switch the token to generic.',
        ),
      );
    }
  }

  const conflicts = roleConflicts(entity.classification.roleIds);
  for (const c of conflicts) {
    out.push(
      issue(
        'warning',
        'role-conflict',
        `Roles "${roleById[c.a]?.name ?? c.a}" and "${
          roleById[c.b]?.name ?? c.b
        }" pull in opposite directions; their modifiers partly cancel.`,
        'classification.roleIds',
      ),
    );
  }

  // Difficulty check against the party this was built for.
  const target = entity.creationContext.partyTarget;
  if (target.size > 0 && entity.progression.threatRating > 0) {
    const budget = budgetForTarget(target);
    const count = Math.max(1, entity.creationContext.plannedCount);
    const total = entity.progression.threatRating * count;
    const difficulty = bandFor(total, budget.total, budget.size);
    if (difficulty === 'deadly') {
      out.push(
        issue(
          'warning',
          'deadly-for-party',
          `${count} of these is Deadly for ${budget.size} level-${target.averageLevel} PCs (threat ${total} vs budget ${budget.total}).`,
          'progression.threatRating',
        ),
      );
    }
  }

  // Stat sanity against the benchmark for its declared Threat Rating.
  const bench = benchmarkFor(entity.progression.threatRating);
  if (d.hitPoints > 0 && d.hitPoints < bench.hitPointsLow * 0.6) {
    out.push(
      issue(
        'info',
        'fragile-for-threat',
        `${d.hitPoints} HP is fragile for Threat Rating ${entity.progression.threatRating} (expected ${bench.hitPointsLow}-${bench.hitPointsHigh}).`,
        'defenses',
      ),
    );
  }
  if (d.hitPoints > bench.hitPointsHigh * 1.6) {
    out.push(
      issue(
        'info',
        'durable-for-threat',
        `${d.hitPoints} HP is well above the Threat Rating ${entity.progression.threatRating} band (${bench.hitPointsLow}-${bench.hitPointsHigh}); the fight will run long.`,
        'defenses',
      ),
    );
  }
  if (Math.abs(d.computedThreatRating - entity.progression.threatRating) >= 3) {
    out.push(
      issue(
        'warning',
        'threat-mismatch',
        `Declared Threat Rating ${entity.progression.threatRating}, but these stats compute to about ${d.computedThreatRating}.`,
        'progression.threatRating',
        `Set the Threat Rating to ${d.computedThreatRating}.`,
      ),
    );
  }

  // ------------------------------------------------------------------ info --
  const roleNames = entity.classification.roleIds.map((r) => roleById[r]?.name).filter(Boolean);
  if (roleNames.length) {
    out.push(
      issue(
        'info',
        'role-summary',
        `Optimised as ${roleNames.join(' / ')}.`,
        'classification.roleIds',
      ),
    );
  }
  if (isBoss && entity.apexActions.length) {
    out.push(
      issue(
        'info',
        'action-economy',
        `Acts ${
          1 + entity.apexActions.length
        } times a round including Apex Actions - this fight leans on action economy.`,
        'apexActions',
      ),
    );
  }
  const complexity = every.length + entity.traits.length + (entity.boss?.phases.length ?? 0) * 2;
  if (complexity >= 18) {
    out.push(
      issue(
        'info',
        'high-complexity',
        `${complexity} moving parts - high complexity for live play. Consider a GM cheat-sheet macro.`,
        undefined,
      ),
    );
  }
  if (entity.magic.knownArteIds.length) {
    out.push(
      issue(
        'info',
        'caster-summary',
        `Knows ${entity.magic.knownArteIds.length} Artes up to tier ${d.maxArteTier} with ${d.aether} Aether.`,
        'magic',
      ),
    );
  }

  return out;
}

/** True when nothing blocks deployment. */
export function canDeploy(issues: CrucibleValidationIssue[]): boolean {
  return !issues.some((i) => i.level === 'error');
}

export function countByLevel(issues: CrucibleValidationIssue[]) {
  return {
    error: issues.filter((i) => i.level === 'error').length,
    warning: issues.filter((i) => i.level === 'warning').length,
    info: issues.filter((i) => i.level === 'info').length,
  };
}
