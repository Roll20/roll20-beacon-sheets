/** Hazards and traps: environmental entities that take turns or trigger on conditions. */

import type { AreaRule } from './crucibleAction.schema';
import type { SaveId } from './crucibleCommon';

export type HazardTriggerKind =
  | 'proximity'
  | 'touch'
  | 'weight'
  | 'sight'
  | 'sound'
  | 'magic'
  | 'timed'
  | 'roundStart'
  | 'manual';

export interface CrucibleHazardBlock {
  hazardTypeId: string;
  trigger: {
    kind: HazardTriggerKind;
    description: string;
    /** Perception DC to notice it before it triggers. */
    noticeDc: number | null;
    /** Save to avoid when triggered. */
    avoidSave: SaveId | null;
    avoidDc: number | null;
  };
  area: AreaRule | null;
  /** How it is disarmed or shut down. */
  disable: {
    method: string;
    talent: string;
    dc: number | null;
    /** Failing by 5+ triggers it. */
    failureTriggers: boolean;
  };
  /** Escalates each round it remains active. */
  escalation: {
    enabled: boolean;
    perRound: string;
    maxRounds: number | null;
  };
  /** Does it roll initiative and act on its own turn? */
  takesTurns: boolean;
  initiativeCount: number | null;
  /** One-shot, or repeats until disabled. */
  reusable: boolean;
  /** Hazards contribute their Threat Rating to the encounter total. */
  countsTowardThreat: boolean;
}

export function createHazardBlock(partial: Partial<CrucibleHazardBlock> = {}): CrucibleHazardBlock {
  return {
    hazardTypeId: partial.hazardTypeId ?? '',
    trigger: {
      kind: partial.trigger?.kind ?? 'proximity',
      description: partial.trigger?.description ?? '',
      noticeDc: partial.trigger?.noticeDc ?? null,
      avoidSave: partial.trigger?.avoidSave ?? 'body',
      avoidDc: partial.trigger?.avoidDc ?? null,
    },
    area: partial.area ?? null,
    disable: {
      method: partial.disable?.method ?? '',
      talent: partial.disable?.talent ?? 'Sleight of Hand',
      dc: partial.disable?.dc ?? null,
      failureTriggers: partial.disable?.failureTriggers ?? true,
    },
    escalation: {
      enabled: partial.escalation?.enabled ?? false,
      perRound: partial.escalation?.perRound ?? '',
      maxRounds: partial.escalation?.maxRounds ?? null,
    },
    takesTurns: partial.takesTurns ?? false,
    initiativeCount: partial.initiativeCount ?? null,
    reusable: partial.reusable ?? false,
    countsTowardThreat: partial.countsTowardThreat ?? true,
  };
}
