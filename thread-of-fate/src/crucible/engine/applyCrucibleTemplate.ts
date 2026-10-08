/**
 * Apply a creature template (Undead Risen, Blackstone-Fused, Kaiju-Sized, ...) as an
 * overlay on an existing entity. Templates are additive and are recorded in
 * creationContext.appliedTemplateIds so the Review step can show what changed.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleTraitInstance, ModifierDefinition } from '@/crucible/schemas/crucibleCommon';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import { createAction } from '@/crucible/schemas/crucibleAction.schema';
import { CREATURE_SIZES, sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import {
  templateById,
  type CreatureTemplateDef,
} from '@/crucible/data/registries/creatureTemplates.registry';
import { traitById } from '@/crucible/data/registries/creatureTraits.registry';
import { actionTemplateById } from '@/crucible/data/registries/creatureActions.registry';
import { computeCrucibleDerived } from './computeCrucibleDerived';

type AnyRecord = Record<string, unknown>;

/**
 * Apply a ModifierDefinition to a dot path on the entity. Only numeric leaves are
 * touched; an unknown or non-numeric path is reported rather than silently ignored.
 */
export function applyModifier(
  entity: CrucibleEntitySchema,
  mod: ModifierDefinition,
): { applied: boolean; note: string } {
  const parts = mod.target.split('.');
  let cursor: AnyRecord = entity as unknown as AnyRecord;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cursor[parts[i]];
    if (!next || typeof next !== 'object') {
      return { applied: false, note: `Unknown path "${mod.target}"` };
    }
    cursor = next as AnyRecord;
  }
  const leaf = parts[parts.length - 1];
  const current = cursor[leaf];
  if (typeof current !== 'number') {
    return { applied: false, note: `"${mod.target}" is not a number` };
  }

  let next = current;
  switch (mod.op) {
    case 'add':
      next = current + mod.value;
      break;
    case 'multiply':
      next = Math.round(current * mod.value);
      break;
    case 'set':
      next = mod.value;
      break;
    case 'min':
      next = Math.max(current, mod.value);
      break;
    case 'max':
      next = Math.min(current, mod.value);
      break;
  }
  cursor[leaf] = next;
  return {
    applied: true,
    note: `${mod.target}: ${current} -> ${next}${mod.reason ? ` (${mod.reason})` : ''}`,
  };
}

/** Move a size id N steps along the size ladder. */
export function stepSize(sizeId: string, steps: number): string {
  const current = sizeOrDefault(sizeId);
  const idx = Math.min(CREATURE_SIZES.length - 1, Math.max(0, current.order + steps));
  return CREATURE_SIZES[idx].id;
}

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))];

export interface ApplyTemplateResult {
  entity: CrucibleEntitySchema;
  notes: string[];
  /** Trait/action ids the template referenced that do not exist in the registries. */
  unresolved: string[];
}

export function applyCrucibleTemplate(
  source: CrucibleEntitySchema,
  templateOrId: CreatureTemplateDef | string,
): ApplyTemplateResult {
  const template = typeof templateOrId === 'string' ? templateById[templateOrId] : templateOrId;
  const notes: string[] = [];
  const unresolved: string[] = [];

  if (!template) {
    return {
      entity: source,
      notes: [`Unknown template "${String(templateOrId)}" - nothing applied.`],
      unresolved: [String(templateOrId)],
    };
  }

  // Deep-enough clone: every branch the template can touch is replaced wholesale.
  const entity: CrucibleEntitySchema = {
    ...source,
    identity: { ...source.identity },
    classification: { ...source.classification, tagIds: [...source.classification.tagIds] },
    creationContext: {
      ...source.creationContext,
      appliedTemplateIds: [...source.creationContext.appliedTemplateIds, template.id],
    },
    progression: { ...source.progression },
    attributes: { ...source.attributes },
    defenses: {
      ...source.defenses,
      vulnerabilities: [...source.defenses.vulnerabilities],
      resistances: [...source.defenses.resistances],
      immunities: [...source.defenses.immunities],
      conditionImmunities: [...source.defenses.conditionImmunities],
      wards: [...source.defenses.wards],
    },
    movement: { ...source.movement, other: { ...source.movement.other } },
    senses: { ...source.senses, entries: [...source.senses.entries] },
    traits: [...source.traits],
    actions: [...source.actions],
    quickActions: [...source.quickActions],
    reactions: [...source.reactions],
    apexActions: [...source.apexActions],
    overtureActions: [...source.overtureActions],
  };

  // --- Name --------------------------------------------------------------
  if (template.namePattern && entity.identity.name) {
    // Skip the rename when the name already carries the template's words
    // ("Blackstone Reaver" + pattern "Blackstone-Fused {{name}}" would otherwise
    // yield "Blackstone-Fused Blackstone Reaver").
    const literalWords = template.namePattern
      .replace(/\{\{\s*name\s*\}\}/g, ' ')
      .split(/[^A-Za-z]+/)
      .filter((w) => w.length > 2)
      .map((w) => w.toLowerCase());
    const nameWords = new Set(entity.identity.name.split(/[^A-Za-z]+/).map((w) => w.toLowerCase()));
    const overlaps = literalWords.some((w) => nameWords.has(w));
    const next = template.namePattern.replace(/\{\{\s*name\s*\}\}/g, entity.identity.name);
    if (!overlaps && next !== entity.identity.name) {
      notes.push(`Renamed "${entity.identity.name}" to "${next}".`);
      entity.identity.name = next;
    }
  }

  // --- Threat / level -----------------------------------------------------
  if (template.threatRatingDelta) {
    entity.progression.threatRating = Math.max(
      0,
      entity.progression.threatRating + template.threatRatingDelta,
    );
    notes.push(
      `Threat Rating ${template.threatRatingDelta > 0 ? '+' : ''}${template.threatRatingDelta} -> ${
        entity.progression.threatRating
      }.`,
    );
  }
  if (template.levelDelta) {
    entity.progression.level = Math.max(0, entity.progression.level + template.levelDelta);
    notes.push(`Level ${template.levelDelta > 0 ? '+' : ''}${template.levelDelta}.`);
  }

  // --- Attributes ---------------------------------------------------------
  for (const [key, delta] of Object.entries(template.attributeDeltas)) {
    if (!delta) continue;
    const k = key as keyof typeof entity.attributes;
    entity.attributes[k] = Math.max(1, entity.attributes[k] + delta);
    notes.push(`${key} ${delta > 0 ? '+' : ''}${delta} -> ${entity.attributes[k]}.`);
  }

  // --- Size ---------------------------------------------------------------
  if (template.sizeSteps) {
    const before = entity.classification.sizeId;
    entity.classification.sizeId = stepSize(before, template.sizeSteps);
    const after = sizeOrDefault(entity.classification.sizeId);
    entity.token = {
      ...entity.token,
      gridWidth: after.gridWidth,
      gridHeight: after.gridHeight,
    };
    notes.push(`Size ${sizeOrDefault(before).name} -> ${after.name} (hit die ${after.hitDie}).`);
  }

  // --- Defensive lists ----------------------------------------------------
  entity.defenses.resistances = uniq([...entity.defenses.resistances, ...template.addsResistances]);
  entity.defenses.immunities = uniq([...entity.defenses.immunities, ...template.addsImmunities]);
  entity.defenses.conditionImmunities = uniq([
    ...entity.defenses.conditionImmunities,
    ...template.addsConditionImmunities,
  ]);
  entity.defenses.vulnerabilities = uniq([
    ...entity.defenses.vulnerabilities,
    ...template.addsVulnerabilities,
  ]);
  entity.senses.entries = uniq([...entity.senses.entries, ...template.addsSenses]);
  entity.classification.tagIds = uniq([...entity.classification.tagIds, ...template.addsTagNames]);

  // --- Numeric modifiers --------------------------------------------------
  for (const mod of template.modifiers) {
    const result = applyModifier(entity, mod);
    notes.push(result.applied ? result.note : `Skipped modifier: ${result.note}`);
    if (!result.applied) unresolved.push(mod.target);
  }

  // --- Granted traits -----------------------------------------------------
  const existingTraitIds = new Set(entity.traits.map((t) => t.registryId).filter(Boolean));
  for (const traitId of template.grantsTraitIds) {
    if (existingTraitIds.has(traitId)) continue;
    const def = traitById[traitId];
    if (!def) {
      unresolved.push(traitId);
      notes.push(`Template referenced unknown trait "${traitId}" - skipped.`);
      continue;
    }
    const instance: CrucibleTraitInstance = {
      id: `${entity.id}-trait-${traitId}`,
      registryId: def.id,
      name: def.name,
      description: def.description,
      uses: def.uses,
      threatCost: def.threatCost,
      origin: 'templateApplied',
    };
    entity.traits.push(instance);
    notes.push(`Gained trait "${def.name}".`);
  }

  // --- Granted actions ----------------------------------------------------
  for (const actionId of template.grantsActionIds) {
    const def = actionTemplateById[actionId];
    if (!def) {
      unresolved.push(actionId);
      notes.push(`Template referenced unknown action "${actionId}" - skipped.`);
      continue;
    }
    const list = listForCategory(entity, def.category);
    if (list.some((a) => a.registryId === def.id)) continue;
    const instance: CrucibleActionInstance = createAction({
      ...def,
      id: `${entity.id}-action-${def.id}`,
      registryId: def.id,
      origin: 'templateApplied',
    });
    list.push(instance);
    notes.push(`Gained ${def.category} action "${def.name}".`);
  }

  entity.derived = computeCrucibleDerived(entity);
  return { entity, notes, unresolved: uniq(unresolved) };
}

function listForCategory(entity: CrucibleEntitySchema, category: string): CrucibleActionInstance[] {
  switch (category) {
    case 'quick':
      return entity.quickActions;
    case 'reaction':
      return entity.reactions;
    case 'apex':
      return entity.apexActions;
    case 'overture':
      return entity.overtureActions;
    default:
      return entity.actions;
  }
}

/** Apply several templates in order. */
export function applyTemplates(source: CrucibleEntitySchema, ids: string[]): ApplyTemplateResult {
  let entity = source;
  const notes: string[] = [];
  const unresolved: string[] = [];
  for (const id of ids) {
    const result = applyCrucibleTemplate(entity, id);
    entity = result.entity;
    notes.push(...result.notes);
    unresolved.push(...result.unresolved);
  }
  return { entity, notes, unresolved: uniq(unresolved) };
}
