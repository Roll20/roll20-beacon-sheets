/**
 * Encounter store: parties, rosters, threat math, and deployment. Persisted to
 * localStorage and synced to Roll20 alongside the library.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type {
  CrucibleEncounter,
  EncounterAnalysis,
  EncounterRosterEntry,
} from '@/crucible/schemas/crucibleEncounter.schema';
import { createEncounter } from '@/crucible/schemas/crucibleEncounter.schema';
import type { PartyMemberThreatInput } from '@/crucible/schemas/crucibleCommon';
import {
  calculateEncounterDifficulty,
  type EncounterSide,
} from '@/crucible/engine/calculateEncounterDifficulty';
import {
  estimatedPcDamagePerRound,
  estimatedPcHitPoints,
} from '@/crucible/data/registries/threatBalance.registry';
import { environmentById } from '@/crucible/data/registries/encounterEnvironments.registry';
import { useCrucibleLibraryStore } from './crucibleLibrary.store';

const STORAGE_KEY = 'thread-of-fate:crucible-encounters';

function loadFromStorage(): CrucibleEncounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CrucibleEncounter[]) : [];
  } catch {
    return [];
  }
}

export const useCrucibleEncounterStore = defineStore('crucibleEncounter', () => {
  const library = useCrucibleLibraryStore();
  const encounters = ref<CrucibleEncounter[]>(loadFromStorage());
  const activeId = ref<string | null>(null);

  const active = computed(() => encounters.value.find((e) => e.id === activeId.value) ?? null);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encounters.value));
    } catch {
      console.warn('The Crucible: could not persist encounters to localStorage.');
    }
  };

  function create(): CrucibleEncounter {
    const encounter = createEncounter(uuidv4(), new Date().toISOString());
    encounters.value.push(encounter);
    activeId.value = encounter.id;
    save();
    return encounter;
  }

  function open(id: string) {
    if (encounters.value.some((e) => e.id === id)) activeId.value = id;
  }

  function remove(id: string) {
    encounters.value = encounters.value.filter((e) => e.id !== id);
    if (activeId.value === id) activeId.value = null;
    save();
  }

  function touch(encounter: CrucibleEncounter) {
    encounter.updatedAt = new Date().toISOString();
    save();
  }

  // --- Party -----------------------------------------------------------------

  function setParty(members: PartyMemberThreatInput[]) {
    if (!active.value) return;
    active.value.party = members;
    touch(active.value);
  }

  function addPartyMember(member: Partial<PartyMemberThreatInput> = {}) {
    if (!active.value) return;
    active.value.party.push({
      id: uuidv4(),
      name: member.name ?? `PC ${active.value.party.length + 1}`,
      level: member.level ?? 1,
      proficiencyBonus: member.proficiencyBonus,
      highestCurioRarity: member.highestCurioRarity,
      manualThreatBudgetOverride: member.manualThreatBudgetOverride,
    });
    touch(active.value);
  }

  function removePartyMember(id: string) {
    if (!active.value) return;
    active.value.party = active.value.party.filter((m) => m.id !== id);
    touch(active.value);
  }

  // --- Roster ----------------------------------------------------------------

  function addToRoster(entityId: string, side: EncounterRosterEntry['side'] = 'enemy', count = 1) {
    if (!active.value) return;
    const entity = library.byId(entityId);
    if (!entity) return;
    const existing = active.value.roster.find((r) => r.entityId === entityId && r.side === side);
    if (existing) {
      existing.count += count;
    } else {
      active.value.roster.push({
        id: uuidv4(),
        entityId,
        name: entity.identity.name || 'Unnamed',
        count,
        side,
        threatOverride: null,
        notes: '',
      });
    }
    touch(active.value);
  }

  function updateRosterEntry(id: string, value: Partial<EncounterRosterEntry>) {
    if (!active.value) return;
    const entry = active.value.roster.find((r) => r.id === id);
    if (entry) Object.assign(entry, value);
    touch(active.value);
  }

  function removeFromRoster(id: string) {
    if (!active.value) return;
    active.value.roster = active.value.roster.filter((r) => r.id !== id);
    touch(active.value);
  }

  function setEnvironment(environmentId: string | null) {
    if (!active.value) return;
    active.value.environmentId = environmentId;
    const env = environmentId ? environmentById[environmentId] : null;
    active.value.environmentModifiers = env
      ? [{ id: env.id, label: env.name, value: env.threatModifier, reason: env.threatReason }]
      : [];
    touch(active.value);
  }

  // --- Math ------------------------------------------------------------------

  const sides = (
    encounter: CrucibleEncounter,
    side: EncounterRosterEntry['side'],
  ): EncounterSide[] => {
    const out: EncounterSide[] = [];
    for (const r of encounter.roster) {
      if (r.side !== side) continue;
      const entity = library.byId(r.entityId);
      if (entity) out.push({ entity, count: r.count, threatOverride: r.threatOverride });
    }
    return out;
  };

  const result = computed(() => {
    const encounter = active.value;
    if (!encounter) return null;
    const threat = calculateEncounterDifficulty({
      party: encounter.party,
      enemies: sides(encounter, 'enemy'),
      alliedCreatures: sides(encounter, 'ally'),
      hazards: sides(encounter, 'hazard'),
      environmentModifiers: encounter.environmentModifiers,
    });
    encounter.lastResult = threat;
    return threat;
  });

  /** The deeper report: action economy, durability, expected length, risk flags. */
  const analysis = computed<EncounterAnalysis | null>(() => {
    const encounter = active.value;
    const threat = result.value;
    if (!encounter || !threat) return null;

    const enemies = sides(encounter, 'enemy');
    const enemyAp = enemies.reduce((s, e) => s + e.entity.derived.actionPoints * e.count, 0);
    const enemyApexActs = enemies.reduce(
      (s, e) =>
        s + (e.entity.apexActions.length ? e.entity.boss?.apexActionsPerRound ?? 2 : 0) * e.count,
      0,
    );
    const partyAp = encounter.party.length * 3;
    const enemyHp = enemies.reduce((s, e) => s + e.entity.derived.hitPoints * e.count, 0);
    const enemyDpr = enemies.reduce((s, e) => s + e.entity.derived.damagePerRound * e.count, 0);

    const partyDpr = encounter.party.reduce(
      (acc, m) => {
        const est = estimatedPcDamagePerRound(m.level);
        return { low: acc.low + est.low, high: acc.high + est.high };
      },
      { low: 0, high: 0 },
    );
    const partyHp = encounter.party.reduce((s, m) => s + estimatedPcHitPoints(m.level), 0);

    const midPartyDpr = (partyDpr.low + partyDpr.high) / 2;
    const roundsToClear = midPartyDpr > 0 ? Math.ceil(enemyHp / midPartyDpr) : 99;
    const roundsToDrop = enemyDpr > 0 ? Math.ceil(partyHp / enemyDpr) : 99;

    const apRatio = partyAp > 0 ? (enemyAp + enemyApexActs) / partyAp : 0;
    const controlHeavy = enemies.reduce(
      (s, e) => s + (e.entity.classification.roleIds.includes('controller') ? e.count : 0),
      0,
    );
    const fastEnemies = enemies.filter((e) => {
      const m = e.entity.movement;
      return Math.max(m.ground, m.fly, m.swim, m.burrow, m.climb) >= 50;
    }).length;
    const phaseBosses = enemies.filter((e) => e.entity.boss?.phases.length).length;

    const warnings: string[] = [...threat.warnings];
    const suggestions: string[] = [];
    if (apRatio < 0.5 && enemies.length) {
      warnings.push(
        'Enemies are badly outnumbered in actions per round; the fight may fold early.',
      );
      suggestions.push('Add minions, hazards, or Apex Actions to close the action-economy gap.');
    }
    if (apRatio > 1.6) {
      warnings.push('Enemies act far more often than the party each round.');
      suggestions.push('Trim enemy count or downgrade some to minions.');
    }
    if (roundsToClear > 6) {
      warnings.push(
        `Roughly ${roundsToClear} rounds to clear at expected damage - the fight may drag.`,
      );
      suggestions.push('Lower total enemy hit points or add a vulnerability to exploit.');
    }
    if (roundsToDrop <= 2 && threat.difficulty !== 'deadly') {
      warnings.push(
        'Enemy damage could down the party inside 2 rounds despite the difficulty label.',
      );
    }

    return {
      threat,
      actionEconomy: {
        enemyActionPoints: enemyAp + enemyApexActs,
        partyActionPoints: partyAp,
        ratio: Math.round(apRatio * 100) / 100,
        verdict:
          apRatio > 1.3
            ? 'Enemies dominate the turn order'
            : apRatio < 0.7
            ? 'The party dominates the turn order'
            : 'Balanced action economy',
      },
      durability: {
        enemyTotalHitPoints: enemyHp,
        partyEstimatedDprLow: partyDpr.low,
        partyEstimatedDprHigh: partyDpr.high,
        estimatedRoundsToClear: roundsToClear,
      },
      lethality: {
        enemyTotalDpr: enemyDpr,
        partyEstimatedHitPoints: partyHp,
        estimatedRoundsToDropParty: roundsToDrop,
      },
      expectedRounds: Math.min(roundsToClear, Math.max(2, roundsToDrop)),
      controlRisk: controlHeavy >= 2 ? 'high' : controlHeavy === 1 ? 'medium' : 'low',
      mobilityRisk: fastEnemies >= 2 ? 'high' : fastEnemies === 1 ? 'medium' : 'low',
      bossPhaseRisk: phaseBosses >= 2 ? 'high' : phaseBosses === 1 ? 'medium' : 'none',
      warnings,
      suggestions,
    };
  });

  // --- Beacon sync -----------------------------------------------------------

  function dehydrate(): CrucibleEncounter[] {
    return encounters.value;
  }
  function hydrate(stored?: unknown) {
    if (!Array.isArray(stored)) return;
    encounters.value = stored as CrucibleEncounter[];
  }

  return {
    encounters,
    activeId,
    active,
    result,
    analysis,
    create,
    open,
    remove,
    setParty,
    addPartyMember,
    removePartyMember,
    addToRoster,
    updateRosterEntry,
    removeFromRoster,
    setEnvironment,
    save,
    dehydrate,
    hydrate,
  };
});
