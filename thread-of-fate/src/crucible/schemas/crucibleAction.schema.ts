/**
 * Structured actions. Every Crucible action is data, never prose - so it can be
 * rolled from the sheet, turned into a Roll20 token macro, and costed for Threat.
 */

import type { AttributeKey } from '@/maker/types';
import type { FieldOrigin, LimitedUseRule, RechargeRule, SaveId } from './crucibleCommon';

export type ActionCategory =
  | 'core'
  | 'quick'
  | 'reaction'
  | 'apex'
  | 'overture'
  | 'lair'
  | 'hazard'
  | 'phase'
  | 'death';

export const ACTION_CATEGORIES: ActionCategory[] = [
  'core',
  'quick',
  'reaction',
  'apex',
  'overture',
  'lair',
  'hazard',
  'phase',
  'death',
];

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  core: 'Core Actions',
  quick: 'Quick Actions',
  reaction: 'Reactions',
  apex: 'Apex Actions',
  overture: 'Overture Actions',
  lair: 'Lair Actions',
  hazard: 'Hazard Actions',
  phase: 'Phase Transition Actions',
  death: 'Death Actions',
};

export interface TargetingRule {
  mode: 'self' | 'oneTarget' | 'multipleTargets' | 'area' | 'allInRange' | 'ally' | 'none';
  count?: number;
  /** Free-form restriction, e.g. "a creature it can see". */
  restriction?: string;
}

export interface RangeRule {
  kind: 'melee' | 'ranged' | 'self' | 'touch' | 'unlimited';
  /** Reach for melee, normal range for ranged. */
  value: number;
  /** Long range for ranged weapon attacks. */
  long?: number;
  unit: 'ft' | 'mi';
}

export interface AreaRule {
  shape: 'cone' | 'line' | 'sphere' | 'cube' | 'cylinder' | 'emanation';
  size: number;
  width?: number;
  unit: 'ft';
  origin?: 'self' | 'point';
}

export type DamageDeliveryOnSave = 'half' | 'none' | 'full';

export interface DamageFormula {
  id: string;
  /** Dice count. */
  count: number;
  /** Die size. */
  die: number;
  /** Flat bonus; when `abilityBonus` is set this is added on top. */
  flat: number;
  /** Adds this attribute's modifier to the damage. */
  abilityBonus?: AttributeKey | null;
  damageType: string;
  /** Applies only when this condition holds, e.g. "the target is Grappled". */
  condition?: string;
  onSave?: DamageDeliveryOnSave;
}

export interface HealingFormula {
  id: string;
  count: number;
  die: number;
  flat: number;
  /** Convergence healing adds the Conviction modifier by default. */
  abilityBonus?: AttributeKey | null;
  /** Temporary hit points rather than healing. */
  temporary?: boolean;
}

export type CrucibleEffectKind =
  | 'condition'
  | 'movement'
  | 'summon'
  | 'buff'
  | 'debuff'
  | 'terrain'
  | 'resource'
  | 'phase'
  | 'narrative';

export interface CrucibleEffect {
  id: string;
  kind: CrucibleEffectKind;
  /** Condition name, resource id, phase id, etc. depending on kind. */
  value: string;
  /** e.g. "until the end of its next turn". */
  duration?: string;
  /** Save that ends or avoids the effect. */
  save?: SaveId | null;
  description?: string;
}

export type ActionRoll =
  | { type: 'attack'; ability: AttributeKey; bonusFormula: string; melee?: boolean }
  | { type: 'save'; save: SaveId; dcFormula: string }
  | { type: 'automatic' }
  | { type: 'opposed'; attackerTalent: string; defenderTalent: string };

export interface CrucibleActionDefinition {
  id: string;
  name: string;
  category: ActionCategory;
  actionPointCost?: number;
  recharge?: RechargeRule | null;
  uses?: LimitedUseRule | null;
  targeting: TargetingRule;
  range?: RangeRule | null;
  area?: AreaRule | null;
  roll: ActionRoll;
  effects: CrucibleEffect[];
  damage?: DamageFormula[];
  healing?: HealingFormula[];
  description: string;
  /** Name of the Crucible roll template used when this is posted to chat. */
  roll20Template: string;
  threatCost: number;
}

/** An action as it exists on a specific entity (registry-linked or bespoke). */
export interface CrucibleActionInstance extends CrucibleActionDefinition {
  registryId: string | null;
  origin: FieldOrigin;
  gmOnly?: boolean;
  /** Only available while these phase ids are active; empty = always. */
  phaseIds: string[];
  /** Multiattack: this action instead invokes these action ids. */
  multiattackOf?: string[];
}

export const EMPTY_TARGETING: TargetingRule = { mode: 'oneTarget', count: 1 };

export function createAction(
  partial: Partial<CrucibleActionInstance> = {},
): CrucibleActionInstance {
  return {
    id: partial.id ?? '',
    name: partial.name ?? 'New Action',
    category: partial.category ?? 'core',
    actionPointCost: partial.actionPointCost ?? 2,
    recharge: partial.recharge ?? null,
    uses: partial.uses ?? null,
    targeting: partial.targeting ?? { ...EMPTY_TARGETING },
    range: partial.range ?? { kind: 'melee', value: 5, unit: 'ft' },
    area: partial.area ?? null,
    roll: partial.roll ?? { type: 'attack', ability: 'might', bonusFormula: 'attr+pb' },
    effects: partial.effects ?? [],
    damage: partial.damage ?? [],
    healing: partial.healing ?? [],
    description: partial.description ?? '',
    roll20Template: partial.roll20Template ?? 'convergence-action',
    threatCost: partial.threatCost ?? 0,
    registryId: partial.registryId ?? null,
    origin: partial.origin ?? 'userProvided',
    gmOnly: partial.gmOnly ?? false,
    phaseIds: partial.phaseIds ?? [],
    multiattackOf: partial.multiattackOf,
  };
}
