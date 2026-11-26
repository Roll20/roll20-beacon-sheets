/** Encounter packages: a party target, a roster, an environment, and the resulting math. */

import type {
  EncounterDifficulty,
  OfficialStatus,
  PartyMemberThreatInput,
  ThreatModifier,
} from './crucibleCommon';
import type { EncounterThreatResult } from './crucibleThreat.schema';

export interface EncounterRosterEntry {
  id: string;
  entityId: string;
  /** Snapshot of the name so the roster still reads correctly if the entity is deleted. */
  name: string;
  count: number;
  side: 'enemy' | 'ally' | 'hazard';
  /** Per-encounter Threat Rating override. */
  threatOverride: number | null;
  notes: string;
}

export interface CrucibleEncounter {
  schemaVersion: string;
  id: string;
  name: string;
  summary: string;
  gmNotes: string;
  createdAt: string;
  updatedAt: string;
  officialStatus: OfficialStatus;

  party: PartyMemberThreatInput[];
  roster: EncounterRosterEntry[];
  environmentId: string | null;
  environmentModifiers: ThreatModifier[];
  objective: string;
  desiredDifficulty: EncounterDifficulty | 'any';

  /** Cached last computation; recomputed on open. */
  lastResult: EncounterThreatResult | null;

  /** Deployment state. */
  deployed: boolean;
  deployedCharacterIds: string[];
}

export interface EncounterAnalysis {
  threat: EncounterThreatResult;
  /** Enemy action points per round vs party action points per round. */
  actionEconomy: {
    enemyActionPoints: number;
    partyActionPoints: number;
    ratio: number;
    verdict: string;
  };
  durability: {
    enemyTotalHitPoints: number;
    partyEstimatedDprLow: number;
    partyEstimatedDprHigh: number;
    estimatedRoundsToClear: number;
  };
  lethality: {
    enemyTotalDpr: number;
    partyEstimatedHitPoints: number;
    estimatedRoundsToDropParty: number;
  };
  expectedRounds: number;
  controlRisk: 'low' | 'medium' | 'high';
  mobilityRisk: 'low' | 'medium' | 'high';
  bossPhaseRisk: 'none' | 'low' | 'medium' | 'high';
  warnings: string[];
  suggestions: string[];
}

export function createEncounter(id: string, now: string): CrucibleEncounter {
  return {
    schemaVersion: '1.0.0',
    id,
    name: 'New Encounter',
    summary: '',
    gmNotes: '',
    createdAt: now,
    updatedAt: now,
    officialStatus: 'homebrew',
    party: [],
    roster: [],
    environmentId: null,
    environmentModifiers: [],
    objective: '',
    desiredDifficulty: 'any',
    lastResult: null,
    deployed: false,
    deployedCharacterIds: [],
  };
}
