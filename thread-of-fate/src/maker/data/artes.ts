import type { CasterType } from '@/maker/types';
import { GENERATED_ARTES } from './artes.generated';

/**
 * Artes (spells), the full list (~830) is parsed from
 * "Convergence Magic_ Spellcasting and Spell List.md" by scripts/parse-artes.mjs
 * into artes.generated.ts. Re-run that script if the source doc changes.
 *
 * Artes run Tier-0 (Cantrip) to Tier-15. Aether cost equals the Arte's Tier;
 * upcasting costs +2 Aether per Tier. Caster type (Low/Mid/High) gates access.
 */
export const ARTES = GENERATED_ARTES;

/** The four Sources of magic (from the Spellcasting overview). */
export const ARTE_SOURCES: { name: string; description: string }[] = [
  {
    name: 'Arcane',
    description:
      'Raw magical forces that permeate the Great Forest, the most versatile source, but the most susceptible to interference.',
  },
  {
    name: 'Divine',
    description:
      'Gifted celestial power, ancient and godlike, potent against the undead and creatures from beyond the material world.',
  },
  {
    name: 'Eldritch',
    description:
      'Borrowed power from an unknowable patron, capable of incredible feats and horror, bending will or breaking the natural order.',
  },
  {
    name: 'Paracausal',
    description:
      'Magic that acts upon reality, causality, and potentiality, strange, wondrous, and seldom stopped once started.',
  },
];

/** Artes-Schools (focused specializations). */
export const ARTE_SCHOOLS: { name: string; description: string }[] = [
  { name: 'Animus', description: 'Controls, creates, or interacts with objects and enchantments.' },
  { name: 'Chronomancy', description: 'Manipulates, views, or interacts with time.' },
  { name: 'Compulsion', description: 'Charms, frightens, or controls.' },
  {
    name: 'Elemental',
    description: 'Elemental forces (fire, ice, force, etc.), creation or control.',
  },
  { name: 'Enhancement', description: 'Grants buffs.' },
  { name: 'Fatebinding', description: 'Sees or controls fate.' },
  { name: 'Hexcraft', description: 'Uses or controls essence or condition.' },
  { name: 'Illusion', description: 'Creates illusions and mental trickery.' },
  {
    name: 'Manifestation',
    description: 'Summons existing creatures or creates magical constructs.',
  },
  { name: 'Necromancy', description: 'Animates or controls undead and negative energies.' },
  { name: 'Recovery', description: 'Heals, cures, or purifies.' },
  { name: 'Spatial', description: 'Manipulates space and teleportation.' },
  { name: 'Warding', description: 'Defends or counters.' },
];

/** Aether pool guidance by caster type (from the Spellcasting overview). */
export const CASTER_NOTE: Record<CasterType, string> = {
  'Non-Caster': 'This class does not gain Aether and cannot learn Artes by default.',
  'Low-Caster': 'Low-Casters gain 1 Aether every other level (Caster-Level = 1/3 Class Level).',
  'Mid-Caster': 'Mid-Casters gain 1 Aether every level (Caster-Level = 1/2 Class Level).',
  'High-Caster': 'High-Casters gain 2 Aether every level (Caster-Level = Class Level).',
};
