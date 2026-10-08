/**
 * Zod shape-validation and migration for imported Crucible entities.
 *
 * Two jobs, deliberately separated:
 * - `crucibleEntityZ` rejects data that is structurally *wrong* (bad kind, non-numeric
 *    attributes) so a corrupt import cannot poison the store.
 * - `migrateEntity()` merges anything structurally *incomplete* onto a fresh entity, the
 *    same forgiving pattern draftStore.migrate() uses, so older saves upgrade instead of
 *    crashing. Unrecognised keys survive under `_unrecognized`.
 */

import { z } from 'zod';
import type { AttributeKey } from '@/maker/types';
import {
  CRUCIBLE_SCHEMA_VERSION,
  createEmptyEntity,
  createEmptyDerived,
  type CrucibleEntitySchema,
} from './crucibleEntity.schema';
import { ENTITY_KINDS, type CrucibleEntityKind } from './crucibleCommon';
import { createNpcBlock } from './crucibleNpc.schema';
import { createMonsterBlock } from './crucibleMonster.schema';
import { createHazardBlock } from './crucibleHazard.schema';
import { createVehicleBlock } from './crucibleVehicle.schema';

const attributeRecordZ = z.object({
  might: z.number(),
  instinct: z.number(),
  focus: z.number(),
  conviction: z.number(),
  resonance: z.number(),
  presence: z.number(),
});

const saveRecordZ = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ body: inner, mind: inner, soul: inner });

/**
 * Structural gate for imports. Everything beyond these fields is merged leniently
 * by migrateEntity(), so this stays intentionally small and stable across versions.
 */
export const crucibleEntityZ = z
  .object({
    id: z.string().min(1),
    kind: z.enum(ENTITY_KINDS as [CrucibleEntityKind, ...CrucibleEntityKind[]]),
    schemaVersion: z.string().optional(),
    identity: z.object({ name: z.string() }).passthrough().optional(),
    attributes: attributeRecordZ.optional(),
    progression: z
      .object({
        level: z.number(),
        threatRating: z.number(),
      })
      .passthrough()
      .optional(),
    saves: z
      .object({
        proficient: saveRecordZ(z.boolean()).optional(),
        bonus: saveRecordZ(z.number()).optional(),
        override: saveRecordZ(z.number().nullable()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type CrucibleEntityImport = z.infer<typeof crucibleEntityZ>;

/** Keys the migrator knows about; anything else is preserved under `_unrecognized`. */
const KNOWN_KEYS = new Set<string>([
  'schemaVersion',
  'id',
  'kind',
  'meta',
  'identity',
  'classification',
  'creationContext',
  'progression',
  'attributes',
  'saves',
  'talents',
  'defenses',
  'movement',
  'senses',
  'resources',
  'traits',
  'actions',
  'quickActions',
  'reactions',
  'apexActions',
  'overtureActions',
  'magic',
  'equipment',
  'loot',
  'npc',
  'monster',
  'hazard',
  'vehicle',
  'boss',
  'roll20',
  'token',
  'assumptions',
  'validation',
  'derived',
  '_unrecognized',
  // accepted import aliases
  'challengeRating',
]);

const ATTRIBUTE_KEYS: AttributeKey[] = [
  'might',
  'instinct',
  'focus',
  'conviction',
  'resonance',
  'presence',
];

type AnyRecord = Record<string, unknown>;

const asRecord = (v: unknown): AnyRecord => (v && typeof v === 'object' ? (v as AnyRecord) : {});
const asArray = <T>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);

/** Older exports used a different label for parser-deduced values; normalize it. */
const LEGACY_ORIGIN = 'ai' + 'Inferred';
const normalizeOrigins = <T extends { origin?: string }>(items: T[]): T[] =>
  items.map((item) =>
    item && item.origin === LEGACY_ORIGIN ? { ...item, origin: 'inferred' } : item,
  );

/**
 * Merge a partial/older entity onto a complete fresh one. Never throws; the worst
 * case is an entity with default values and the user's data where it was readable.
 */
export function migrateEntity(
  partial: Partial<CrucibleEntitySchema> | AnyRecord | null | undefined,
  now = new Date().toISOString(),
  idFallback = 'crucible-entity',
): CrucibleEntitySchema {
  const p = asRecord(partial);
  const kind = (ENTITY_KINDS as string[]).includes(String(p.kind))
    ? (p.kind as CrucibleEntityKind)
    : 'monster';
  const base = createEmptyEntity(String(p.id ?? idFallback), kind, now);

  const unrecognized: AnyRecord = { ...asRecord(p._unrecognized) };
  for (const key of Object.keys(p)) {
    if (!KNOWN_KEYS.has(key)) unrecognized[key] = p[key];
  }

  const progression = asRecord(p.progression);
  // "Challenge Rating" is the Bestiary statblocks' name for Threat Rating.
  const threatRating =
    typeof progression.threatRating === 'number'
      ? progression.threatRating
      : typeof p.challengeRating === 'number'
      ? (p.challengeRating as number)
      : base.progression.threatRating;

  const attributes = { ...base.attributes };
  const inAttrs = asRecord(p.attributes);
  for (const k of ATTRIBUTE_KEYS) {
    if (typeof inAttrs[k] === 'number') attributes[k] = inAttrs[k] as number;
  }

  const savesIn = asRecord(p.saves);
  const merged: CrucibleEntitySchema = {
    ...base,
    schemaVersion: CRUCIBLE_SCHEMA_VERSION,
    kind,
    meta: { ...base.meta, ...asRecord(p.meta), updatedAt: now },
    identity: { ...base.identity, ...asRecord(p.identity) },
    classification: { ...base.classification, ...asRecord(p.classification) },
    creationContext: {
      ...base.creationContext,
      ...asRecord(p.creationContext),
      partyTarget: {
        ...base.creationContext.partyTarget,
        ...asRecord(asRecord(p.creationContext).partyTarget),
      },
    },
    progression: { ...base.progression, ...progression, threatRating },
    attributes,
    saves: {
      proficient: { ...base.saves.proficient, ...asRecord(savesIn.proficient) },
      bonus: { ...base.saves.bonus, ...asRecord(savesIn.bonus) },
      override: { ...base.saves.override, ...asRecord(savesIn.override) },
    },
    talents: { ...base.talents, ...asRecord(p.talents) },
    defenses: { ...base.defenses, ...asRecord(p.defenses) },
    movement: { ...base.movement, ...asRecord(p.movement) },
    senses: { ...base.senses, ...asRecord(p.senses) },
    resources: asArray(p.resources, base.resources),
    traits: normalizeOrigins(asArray(p.traits, base.traits)),
    actions: normalizeOrigins(asArray(p.actions, base.actions)),
    quickActions: normalizeOrigins(asArray(p.quickActions, base.quickActions)),
    reactions: normalizeOrigins(asArray(p.reactions, base.reactions)),
    apexActions: normalizeOrigins(asArray(p.apexActions, base.apexActions)),
    overtureActions: normalizeOrigins(asArray(p.overtureActions, base.overtureActions)),
    magic: { ...base.magic, ...asRecord(p.magic) },
    equipment: { ...base.equipment, ...asRecord(p.equipment) },
    loot: { ...base.loot, ...asRecord(p.loot) },
    roll20: { ...base.roll20, ...asRecord(p.roll20) },
    token: { ...base.token, ...asRecord(p.token) },
    assumptions: asArray(p.assumptions, base.assumptions),
    validation: [],
    derived: { ...createEmptyDerived(), ...asRecord(p.derived) },
  };

  if (p.npc) merged.npc = createNpcBlock(asRecord(p.npc));
  if (p.monster) merged.monster = createMonsterBlock(asRecord(p.monster));
  if (p.hazard) merged.hazard = createHazardBlock(asRecord(p.hazard));
  if (p.vehicle) merged.vehicle = createVehicleBlock(asRecord(p.vehicle));
  if (p.boss) {
    const b = asRecord(p.boss);
    merged.boss = {
      phases: asArray(b.phases, []),
      activePhaseId: (b.activePhaseId as string) ?? null,
      apexActionsPerRound: typeof b.apexActionsPerRound === 'number' ? b.apexActionsPerRound : 3,
      overtureUnlocksAtPhase:
        typeof b.overtureUnlocksAtPhase === 'number' ? b.overtureUnlocksAtPhase : null,
      legendaryResistances: typeof b.legendaryResistances === 'number' ? b.legendaryResistances : 0,
      lairInitiative: typeof b.lairInitiative === 'number' ? b.lairInitiative : null,
      lairDescription: typeof b.lairDescription === 'string' ? b.lairDescription : '',
    };
  }

  if (Object.keys(unrecognized).length) merged._unrecognized = unrecognized;
  return merged;
}

export interface ParseResult {
  ok: boolean;
  entity: CrucibleEntitySchema | null;
  errors: string[];
}

/** Validate then migrate. Used by import and by the library's JSON paste box. */
export function parseCrucibleEntity(input: unknown, now?: string): ParseResult {
  const result = crucibleEntityZ.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      entity: null,
      errors: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    };
  }
  return { ok: true, entity: migrateEntity(result.data as AnyRecord, now), errors: [] };
}
