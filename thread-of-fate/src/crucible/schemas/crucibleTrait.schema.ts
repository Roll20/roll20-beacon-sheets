/** Registry-side trait definitions. Instances live in crucibleCommon.CrucibleTraitInstance. */

import type { LimitedUseRule, ModifierDefinition } from './crucibleCommon';
import type { CrucibleEntityKind } from './crucibleCommon';

export interface CrucibleTraitDefinition {
  id: string;
  name: string;
  /** Text with {{placeholders}} the engine fills: {{dc}}, {{pb}}, {{name}}, {{tr}}. */
  description: string;
  /** Grouping for the trait picker. */
  category:
    | 'offense'
    | 'defense'
    | 'mobility'
    | 'utility'
    | 'social'
    | 'swarm'
    | 'boss'
    | 'undead'
    | 'construct'
    | 'magic';
  /** Threat Rating cost when applied. */
  threatCost: number;
  uses?: LimitedUseRule;
  /** Mechanical modifiers the rules engine applies alongside the text. */
  modifiers?: ModifierDefinition[];
  /** Kinds this trait suits; empty means any. */
  suitedTo?: CrucibleEntityKind[];
  /** Creature-role ids this trait is recommended for. */
  recommendedRoles?: string[];
  /** Keywords the intent parser matches on. */
  keywords?: string[];
  source: string;
}
