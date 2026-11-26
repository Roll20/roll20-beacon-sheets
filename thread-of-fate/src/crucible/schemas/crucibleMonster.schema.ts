/** Monster-specific data: ecology, tactics, loot, harvesting. */

export type MonsterOrigin =
  | 'natural'
  | 'created'
  | 'summoned'
  | 'divine'
  | 'eldritch'
  | 'paracausal'
  | 'machine'
  | 'undead'
  | 'unknown';

export type MonsterIntelligence =
  | 'mindless'
  | 'animal'
  | 'low'
  | 'average'
  | 'high'
  | 'genius'
  | 'cosmic';

export interface HarvestEntry {
  id: string;
  name: string;
  /** Talent check DC to harvest cleanly. */
  dc: number;
  talent: string;
  quantity: string;
  use: string;
  value: string;
}

export interface MonsterCombatProfile {
  preferredRange: 'melee' | 'close' | 'mid' | 'long' | 'variable';
  openingMove?: string;
  standardTurn?: string;
  bloodiedBehavior?: string;
  retreatBehavior?: string;
  /** 1 (flees instantly) ... 10 (fights to the last). */
  morale?: number;
}

export interface CrucibleMonsterBlock {
  creatureTypeIds: string[];
  subtypeIds: string[];
  roleIds: string[];
  environmentIds: string[];
  origin: MonsterOrigin;
  habitat?: string;
  dietOrEnergySource?: string;
  intelligence: MonsterIntelligence;
  combatProfile: MonsterCombatProfile;
  weaknessClues: string[];
  harvesting: HarvestEntry[];
  /** Ecology / lore paragraph. */
  ecology: string;
  /** How the creature behaves outside combat. */
  instincts: string[];
}

export interface CrucibleLootEntry {
  id: string;
  name: string;
  /** 0-100 drop chance. */
  chance: number;
  quantity: string;
  rarity: string;
  notes?: string;
}

export interface CrucibleLootBlock {
  currency: string;
  entries: CrucibleLootEntry[];
  /** Free-form GM loot notes. */
  notes: string;
}

export interface CrucibleEquipmentBlock {
  /** Maker weapon ids, or free-form names. */
  weapons: string[];
  armor: string;
  shield: string;
  items: string[];
  /** Curios carried; raises Threat Rating by rarity steps above Common. */
  curios: { id: string; name: string; rarity: string }[];
}

export function createMonsterBlock(
  partial: Partial<CrucibleMonsterBlock> = {},
): CrucibleMonsterBlock {
  return {
    creatureTypeIds: partial.creatureTypeIds ?? [],
    subtypeIds: partial.subtypeIds ?? [],
    roleIds: partial.roleIds ?? [],
    environmentIds: partial.environmentIds ?? [],
    origin: partial.origin ?? 'natural',
    habitat: partial.habitat ?? '',
    dietOrEnergySource: partial.dietOrEnergySource ?? '',
    intelligence: partial.intelligence ?? 'animal',
    combatProfile: {
      preferredRange: partial.combatProfile?.preferredRange ?? 'melee',
      openingMove: partial.combatProfile?.openingMove ?? '',
      standardTurn: partial.combatProfile?.standardTurn ?? '',
      bloodiedBehavior: partial.combatProfile?.bloodiedBehavior ?? '',
      retreatBehavior: partial.combatProfile?.retreatBehavior ?? '',
      morale: partial.combatProfile?.morale ?? 5,
    },
    weaknessClues: partial.weaknessClues ?? [],
    harvesting: partial.harvesting ?? [],
    ecology: partial.ecology ?? '',
    instincts: partial.instincts ?? [],
  };
}
