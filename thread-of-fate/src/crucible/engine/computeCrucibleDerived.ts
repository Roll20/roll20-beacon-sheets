/**
 * The Crucible rules engine: everything derived from a CrucibleEntitySchema.
 *
 * Formulas are verified against the exemplar statblocks in
 * Design/Convergence TTRPG Rules/Convergence Bestiary.md and against the character
 * maker's own rules (src/maker/rules/character.ts, casting.ts) so a monster and a PC
 * are never computed two different ways.
 *
 *   Natural Armor    = 10 + Instinct mod                          (Bestiary L94)
 *   Toughened Hide   = 10 + Instinct mod + Conviction mod         (Bestiary L96)
 *   Worn armor AC    = 10 + Instinct mod + floor(PB/2) + armor + shield
 *   Hit Points       = floor(N x (die+1)/2) + N x Conviction mod
 *                      (verified: Bandit Veteran 112 = 15d8+45, Conviction +3)
 *   Initiative       = Instinct mod                               (verified: Bandit +2)
 *   Body/Mind/Soul   = the two paired attribute mods, +PB if proficient
 *   Effect Save DC   = 8 + PB + attribute mod
 *                      (verified: PB +3, Might +4 -> "DC 15 Body Saving Throw")
 *   Talent bonus     = attribute mod + PB x tier multiplier
 */

import type { AttributeKey } from '@/maker/types';
import { modifier } from '@/maker/rules/stats';
import { SKILLS } from '@/maker/data/attributes';
import { casterLevelOf, maxTierOf, aetherOf } from '@/maker/rules/casting';

import type {
  CrucibleEntitySchema,
  CrucibleDerivedBlock,
} from '@/crucible/schemas/crucibleEntity.schema';
import { createEmptyDerived, allActions } from '@/crucible/schemas/crucibleEntity.schema';
import type { FieldTrace, SaveId, TalentTier } from '@/crucible/schemas/crucibleCommon';
import { SAVE_IDS, TALENT_TIER_MULTIPLIER } from '@/crucible/schemas/crucibleCommon';
import type {
  CrucibleActionInstance,
  DamageFormula,
} from '@/crucible/schemas/crucibleAction.schema';
import { sizeOrDefault, stepHitDie } from '@/crucible/data/registries/creatureSizes.registry';
import { rolesOf, type RoleEffect } from '@/crucible/data/registries/creatureRoles.registry';
import {
  proficiencyBonusForLevel,
  KIND_SCALING,
} from '@/crucible/data/registries/threatBalance.registry';

const SAVE_PAIRS: Record<SaveId, [AttributeKey, AttributeKey]> = {
  body: ['might', 'instinct'],
  mind: ['focus', 'conviction'],
  soul: ['resonance', 'presence'],
};

const SKILL_ATTRIBUTE = new Map<string, AttributeKey>(
  SKILLS.map((s) => [s.name.toLowerCase(), s.attribute as AttributeKey]),
);

/** Resolve the attribute a talent keys off; unknown talents fall back to Instinct. */
export function talentAttribute(talentId: string): AttributeKey {
  return SKILL_ATTRIBUTE.get(talentId.trim().toLowerCase()) ?? 'instinct';
}

/** Resolve a PB fraction: floor(PB x fraction), then apply min/max. */
function pbPortion(effect: RoleEffect, pb: number): number {
  let value = effect.flat ?? 0;
  if (effect.pbFraction != null) value = Math.floor(pb * effect.pbFraction);
  if (effect.min != null) value = Math.max(effect.min, value);
  if (effect.max != null) value = Math.min(effect.max, value);
  return value;
}

/** Accumulated numeric effects of the entity's creature roles. */
export interface RoleBonuses {
  hitDieSteps: number;
  hitDiceAdd: number;
  damageBonus: number;
  aetherAdd: number;
  speedAdd: number;
  attackBonus: number;
  effectDcBonus: number;
  healingBonus: number;
  commandActionPoints: number;
  rangeMultiplier: number;
  talentTierBumps: Record<string, number>;
  isMinion: boolean;
  notes: string[];
}

export function roleBonuses(roleIds: string[], pb: number): RoleBonuses {
  const out: RoleBonuses = {
    hitDieSteps: 0,
    hitDiceAdd: 0,
    damageBonus: 0,
    aetherAdd: 0,
    speedAdd: 0,
    attackBonus: 0,
    effectDcBonus: 0,
    healingBonus: 0,
    commandActionPoints: 0,
    rangeMultiplier: 1,
    talentTierBumps: {},
    isMinion: false,
    notes: [],
  };

  for (const role of rolesOf(roleIds)) {
    for (const effect of role.effects) {
      const amount = pbPortion(effect, pb);
      switch (effect.kind) {
        case 'hitDieStep':
          out.hitDieSteps += effect.flat ?? 0;
          break;
        case 'hitDiceAdd':
          out.hitDiceAdd += amount;
          break;
        case 'damageBonus':
          out.damageBonus += amount;
          break;
        case 'aetherAdd':
          out.aetherAdd += amount;
          break;
        case 'speedAdd':
          // "5 ft. per quarter PB" is expressed as pbFraction 0.25 with detail 'x5'.
          out.speedAdd += effect.detail === 'x5' ? amount * 5 : amount;
          break;
        case 'attackBonus':
          out.attackBonus += amount;
          break;
        case 'effectDcBonus':
          out.effectDcBonus += amount;
          break;
        case 'healingBonus':
          out.healingBonus += amount;
          break;
        case 'commandActionPoints':
          out.commandActionPoints += amount;
          break;
        case 'rangeMultiplier':
          out.rangeMultiplier += effect.flat ?? 0;
          break;
        case 'talentBonus':
          if (effect.detail) {
            out.talentTierBumps[effect.detail] =
              (out.talentTierBumps[effect.detail] ?? 0) + (effect.flat ?? 1);
          }
          break;
        case 'minionRules':
          out.isMinion = true;
          break;
      }
      out.notes.push(`${role.name}: ${effect.description}`);
    }
  }
  return out;
}

/** True average of a die. Convergence prints monster HP from this, then floors. */
export function trueDieAverage(die: number): number {
  return (die + 1) / 2;
}

/** Bump a talent tier by N steps along none -> proficient -> expert -> masterful -> mythical. */
const TIER_ORDER: TalentTier[] = ['none', 'proficient', 'expert', 'masterful', 'mythical'];
function bumpTier(tier: TalentTier, steps: number): TalentTier {
  const idx = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.min(TIER_ORDER.length - 1, Math.max(0, idx + steps))];
}

/** Average damage of one damage formula, including its ability bonus. */
export function averageDamage(
  formula: DamageFormula,
  mods: Record<AttributeKey, number>,
  extraFlat = 0,
): number {
  const dice = formula.count * trueDieAverage(formula.die);
  const ability = formula.abilityBonus ? mods[formula.abilityBonus] ?? 0 : 0;
  return Math.max(0, dice + formula.flat + ability + extraFlat);
}

/** Total average damage of a single action across all its damage formulas. */
export function actionAverageDamage(
  action: CrucibleActionInstance,
  mods: Record<AttributeKey, number>,
  extraFlat = 0,
): number {
  const base = (action.damage ?? []).reduce((sum, d) => sum + averageDamage(d, mods, extraFlat), 0);
  // Recharge / limited-use actions do not land every round.
  if (action.recharge) {
    const chance = (action.recharge.die - action.recharge.min + 1) / action.recharge.die;
    return base * Math.min(1, chance + 0.25);
  }
  return base;
}

/**
 * Estimated damage per round: spend the creature's Action Points on its most
 * damaging affordable Core Actions, then add one Quick Action if AP remains.
 */
export function estimateDamagePerRound(
  entity: CrucibleEntitySchema,
  mods: Record<AttributeKey, number>,
  actionPoints: number,
  damageBonus: number,
): number {
  const scored = entity.actions
    .filter((a) => (a.damage?.length ?? 0) > 0)
    .map((a) => ({
      action: a,
      cost: Math.max(1, a.actionPointCost ?? 2),
      damage: actionAverageDamage(a, mods, damageBonus),
    }))
    .sort((a, b) => b.damage / b.cost - a.damage / a.cost);

  if (!scored.length) return 0;

  // A Multiattack action stands in for the whole turn.
  const multi = entity.actions.find((a) => a.multiattackOf?.length);
  if (multi) {
    const byId = new Map(allActions(entity).map((a) => [a.id, a]));
    const total = (multi.multiattackOf ?? []).reduce((sum, id) => {
      const target = byId.get(id);
      return target ? sum + actionAverageDamage(target, mods, damageBonus) : sum;
    }, 0);
    if (total > 0) return Math.round(total);
  }

  let remaining = actionPoints;
  let total = 0;
  const best = scored[0];
  while (remaining >= best.cost) {
    total += best.damage;
    remaining -= best.cost;
  }
  const filler = scored.find((s) => s.cost <= remaining);
  if (filler) total += filler.damage;
  return Math.round(total);
}

/**
 * Threat Rating the engine would assign these stats. Compared against the entity's
 * declared Threat Rating so the Review step can flag a mismatch.
 *
 * Offensive rating and defensive rating are averaged, the same shape the Bestiary
 * exemplars follow (a TR 5 creature sits near AC 16 / HP 112 / ~22 DPR).
 */
export function computeThreatRating(
  hitPoints: number,
  armorClass: number,
  damagePerRound: number,
  effectSaveDc: number,
  traitThreat: number,
  actionThreat: number,
): number {
  // Defensive: HP is the dominant term; AC shifts it by roughly one TR per 2 points off 15.
  const defensive = hitPoints / 21 + (armorClass - 15) / 2;
  // Offensive: DPR is the dominant term; save DC shifts it off a baseline of 14.
  const offensive = damagePerRound / 4.2 + (effectSaveDc - 14) / 2;
  const base = (defensive + offensive) / 2;
  return Math.max(0, Math.round(base + traitThreat * 0.5 + actionThreat * 0.5));
}

// ---------------------------------------------------------------------------
// The main entry point
// ---------------------------------------------------------------------------

export function computeCrucibleDerived(entity: CrucibleEntitySchema): CrucibleDerivedBlock {
  const derived = createEmptyDerived();
  const traces: FieldTrace[] = [];
  const trace = (fieldPath: string, detail: string) =>
    traces.push({ fieldPath, origin: 'rulesCalculated', detail });

  // --- Proficiency Bonus -----------------------------------------------------
  const level = Math.max(0, entity.progression.level);
  const pb = entity.progression.proficiencyBonusOverride ?? proficiencyBonusForLevel(level);
  derived.proficiencyBonus = pb;
  trace(
    'derived.proficiencyBonus',
    entity.progression.proficiencyBonusOverride != null
      ? 'Manual override'
      : `1 + floor((${level} - 1) / 3)`,
  );

  // --- Modifiers -------------------------------------------------------------
  const mods = {
    might: modifier(entity.attributes.might),
    instinct: modifier(entity.attributes.instinct),
    focus: modifier(entity.attributes.focus),
    conviction: modifier(entity.attributes.conviction),
    resonance: modifier(entity.attributes.resonance),
    presence: modifier(entity.attributes.presence),
  };
  derived.modifiers = mods;

  const roles = roleBonuses(entity.classification.roleIds, pb);

  // --- Saves -----------------------------------------------------------------
  for (const id of SAVE_IDS) {
    const override = entity.saves.override[id];
    if (override != null) {
      derived.saves[id] = override;
      trace(`derived.saves.${id}`, 'Manual override');
      continue;
    }
    const [a, b] = SAVE_PAIRS[id];
    const proficient = entity.saves.proficient[id];
    derived.saves[id] = mods[a] + mods[b] + (proficient ? pb : 0) + (entity.saves.bonus[id] ?? 0);
    trace(
      `derived.saves.${id}`,
      `${a} ${mods[a]} + ${b} ${mods[b]}${proficient ? ` + PB ${pb}` : ''}`,
    );
  }

  // --- Armour Class ----------------------------------------------------------
  const misc = entity.defenses.miscAcBonus;
  switch (entity.defenses.armorMode) {
    case 'toughenedHide':
      derived.armorClass = 10 + mods.instinct + mods.conviction + misc;
      derived.armorClassSource = entity.defenses.armorDescriptor || 'Toughened Hide';
      trace('derived.armorClass', `10 + Instinct ${mods.instinct} + Conviction ${mods.conviction}`);
      break;
    case 'armor':
      derived.armorClass =
        10 +
        mods.instinct +
        Math.floor(pb / 2) +
        entity.defenses.armorBonus +
        entity.defenses.shieldBonus +
        misc;
      derived.armorClassSource = entity.defenses.armorDescriptor || 'Armor';
      trace(
        'derived.armorClass',
        `10 + Instinct ${mods.instinct} + floor(PB/2) ${Math.floor(pb / 2)} + armor ${
          entity.defenses.armorBonus
        } + shield ${entity.defenses.shieldBonus}`,
      );
      break;
    case 'manual':
      derived.armorClass = entity.defenses.manualArmorClass + misc;
      derived.armorClassSource = entity.defenses.armorDescriptor || 'Manual';
      trace('derived.armorClass', 'Manual value');
      break;
    case 'natural':
    default:
      derived.armorClass = 10 + mods.instinct + misc;
      derived.armorClassSource = entity.defenses.armorDescriptor || 'Natural Armor';
      trace('derived.armorClass', `10 + Instinct ${mods.instinct}`);
      break;
  }

  // --- Hit Dice and Hit Points ----------------------------------------------
  const size = sizeOrDefault(entity.classification.sizeId);
  const baseDie = entity.defenses.hitDieOverride ?? size.hitDieSize;
  const die = roles.hitDieSteps ? stepHitDie(baseDie, roles.hitDieSteps) : baseDie;
  const baseCount = entity.defenses.hitDiceCount ?? Math.max(1, level);
  const count = Math.max(1, baseCount + roles.hitDiceAdd);

  derived.hitDieSize = die;
  derived.hitDiceCount = count;
  derived.hitDice = `${count}d${die}`;

  const conBonus = count * mods.conviction;
  const computedHp = Math.max(1, Math.floor(count * trueDieAverage(die)) + conBonus);
  derived.hitPoints = entity.defenses.manualHitPoints ?? computedHp;
  derived.hitPointsFormula =
    conBonus === 0 ? `${count}d${die}` : `${count}d${die}${conBonus > 0 ? '+' : ''}${conBonus}`;
  trace(
    'derived.hitPoints',
    entity.defenses.manualHitPoints != null
      ? 'Manual override'
      : `floor(${count} x ${trueDieAverage(die)}) + ${count} x Conviction ${mods.conviction}`,
  );

  // --- Initiative, Action Points, Perception ---------------------------------
  derived.initiative = mods.instinct;
  trace('derived.initiative', `Instinct ${mods.instinct}`);

  const kindScaling =
    KIND_SCALING[
      entity.kind === 'boss'
        ? 'boss'
        : entity.kind === 'mythicBoss'
        ? 'mythic'
        : entity.kind === 'minion'
        ? 'minion'
        : entity.kind === 'swarm'
        ? 'swarm'
        : 'standard'
    ];
  derived.actionPoints = kindScaling.actionPoints + roles.commandActionPoints;
  trace(
    'derived.actionPoints',
    `${kindScaling.label} baseline ${kindScaling.actionPoints}${
      roles.commandActionPoints ? ` + command ${roles.commandActionPoints}` : ''
    }`,
  );

  // --- Talents ---------------------------------------------------------------
  const talentBonuses: Record<string, number> = {};
  for (const entry of entity.talents.entries) {
    if (entry.override != null) {
      talentBonuses[entry.talentId] = entry.override;
      continue;
    }
    const bump = roles.talentTierBumps[entry.talentId.toLowerCase()] ?? 0;
    const tier = bump ? bumpTier(entry.tier, bump) : entry.tier;
    const attr = talentAttribute(entry.talentId);
    talentBonuses[entry.talentId] = mods[attr] + pb * TALENT_TIER_MULTIPLIER[tier];
  }
  derived.talentBonuses = talentBonuses;

  const perceptionEntry = Object.keys(talentBonuses).find((k) => k.toLowerCase() === 'perception');
  derived.passivePerception =
    entity.talents.passivePerceptionOverride ??
    entity.senses.passivePerception ??
    10 + (perceptionEntry ? talentBonuses[perceptionEntry] : mods.instinct);
  trace('derived.passivePerception', '10 + Perception bonus');

  // --- Effect save DC --------------------------------------------------------
  const bestMod = Math.max(
    mods.might,
    mods.instinct,
    mods.focus,
    mods.conviction,
    mods.resonance,
    mods.presence,
  );
  derived.effectSaveDc = 8 + pb + bestMod + roles.effectDcBonus;
  trace(
    'derived.effectSaveDc',
    `8 + PB ${pb} + best attribute ${bestMod}${
      roles.effectDcBonus ? ` + role ${roles.effectDcBonus}` : ''
    }`,
  );

  // --- Magic -----------------------------------------------------------------
  if (entity.magic.isCaster && entity.magic.casterType !== 'Non-Caster') {
    const casterLevel =
      entity.magic.casterLevelOverride ?? casterLevelOf(level, entity.magic.casterType);
    derived.casterLevel = casterLevel;
    derived.maxArteTier = entity.magic.maxTierOverride ?? maxTierOf(casterLevel);
    derived.aether =
      entity.magic.aetherOverride ?? aetherOf(level, entity.magic.casterType) + roles.aetherAdd;
    const attrMod = entity.magic.castingAttribute ? mods[entity.magic.castingAttribute] : 0;
    derived.arteSaveDc = entity.magic.saveDcOverride ?? 6 + attrMod + pb + mods.resonance;
    derived.arteAttack = entity.magic.arteAttackOverride ?? attrMod + pb + mods.focus;
    trace(
      'derived.arteSaveDc',
      `6 + casting attr ${attrMod} + PB ${pb} + Resonance ${mods.resonance}`,
    );
    trace('derived.arteAttack', `casting attr ${attrMod} + PB ${pb} + Focus ${mods.focus}`);
  } else if (roles.aetherAdd) {
    // A Caster-role creature with no caster class still gets the role's Aether pool.
    derived.aether = roles.aetherAdd;
  }

  // --- Damage per round and computed Threat Rating ---------------------------
  derived.damagePerRound = estimateDamagePerRound(
    entity,
    mods,
    derived.actionPoints,
    roles.damageBonus,
  );
  trace('derived.damagePerRound', 'Best affordable Core Actions within the Action Point budget');

  const traitThreat = entity.traits.reduce((s, t) => s + (t.threatCost ?? 0), 0);
  const actionThreat = allActions(entity).reduce((s, a) => s + (a.threatCost ?? 0), 0);
  derived.computedThreatRating = computeThreatRating(
    derived.hitPoints,
    derived.armorClass,
    derived.damagePerRound,
    derived.effectSaveDc,
    traitThreat,
    actionThreat,
  );
  trace(
    'derived.computedThreatRating',
    'Average of defensive and offensive ratings, plus feature cost',
  );

  derived.traces = traces;
  return derived;
}

/** Recompute and attach derived stats, returning a new entity. */
export function withDerived(entity: CrucibleEntitySchema): CrucibleEntitySchema {
  return { ...entity, derived: computeCrucibleDerived(entity) };
}

/** Effect save DC keyed off a specific attribute, for per-action DCs. */
export function effectDcFor(entity: CrucibleEntitySchema, attribute: AttributeKey): number {
  const pb = entity.derived.proficiencyBonus;
  return 8 + pb + (entity.derived.modifiers[attribute] ?? 0);
}

/** Movement including role speed bonuses. */
export function effectiveSpeeds(entity: CrucibleEntitySchema): Record<string, number> {
  const roles = roleBonuses(entity.classification.roleIds, entity.derived.proficiencyBonus);
  const bump = (v: number) => (v > 0 ? v + roles.speedAdd : 0);
  return {
    ground: entity.movement.ground > 0 ? entity.movement.ground + roles.speedAdd : 0,
    climb: bump(entity.movement.climb),
    swim: bump(entity.movement.swim),
    fly: bump(entity.movement.fly),
    burrow: bump(entity.movement.burrow),
    ...entity.movement.other,
  };
}
