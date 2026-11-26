/** Boss phases: staged transformations triggered during play. */

import type { ModifierDefinition } from './crucibleCommon';
import type { CrucibleTokenBlock } from './crucibleRoll20.schema';

export type PhaseTrigger =
  | { type: 'hpThreshold'; value: number }
  | { type: 'roundStart'; round: number }
  | { type: 'resourceEmpty'; resourceId: string }
  | { type: 'manual' }
  | { type: 'death' };

export type PhaseHpBehavior = 'sharedPool' | 'newPool' | 'restorePercent' | 'temporaryPool';

export interface CruciblePhase {
  id: string;
  name: string;
  order: number;
  trigger: PhaseTrigger;
  hpBehavior: PhaseHpBehavior;
  /** Amount for newPool / restorePercent / temporaryPool. */
  hpValue?: number;
  addedTraits: string[];
  removedTraits: string[];
  addedActions: string[];
  removedActions: string[];
  defenseChanges: ModifierDefinition[];
  resourceChanges: ModifierDefinition[];
  tokenChanges?: Partial<CrucibleTokenBlock>;
  transitionText: string;
  gmOnlyNotes?: string;
}

export interface CrucibleBossBlock {
  phases: CruciblePhase[];
  /** Currently active phase id during live play. */
  activePhaseId: string | null;
  /** Apex (legendary) actions available per round. */
  apexActionsPerRound: number;
  /** Overture (mythic) actions unlock at this phase order; null = never. */
  overtureUnlocksAtPhase: number | null;
  /** Bosses resist being locked down. */
  legendaryResistances: number;
  lairInitiative: number | null;
  lairDescription: string;
}

export function createPhase(partial: Partial<CruciblePhase> = {}): CruciblePhase {
  return {
    id: partial.id ?? '',
    name: partial.name ?? 'New Phase',
    order: partial.order ?? 1,
    trigger: partial.trigger ?? { type: 'hpThreshold', value: 50 },
    hpBehavior: partial.hpBehavior ?? 'sharedPool',
    hpValue: partial.hpValue,
    addedTraits: partial.addedTraits ?? [],
    removedTraits: partial.removedTraits ?? [],
    addedActions: partial.addedActions ?? [],
    removedActions: partial.removedActions ?? [],
    defenseChanges: partial.defenseChanges ?? [],
    resourceChanges: partial.resourceChanges ?? [],
    tokenChanges: partial.tokenChanges,
    transitionText: partial.transitionText ?? '',
    gmOnlyNotes: partial.gmOnlyNotes,
  };
}
