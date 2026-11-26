/**
 * The Crucible Library: every entity the GM has forged, persisted to localStorage
 * standalone and synced to Roll20 through the master sheet store
 * (character.attributes.crucible) exactly like the character draft is.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { createEmptyEntity } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleEntityKind } from '@/crucible/schemas/crucibleCommon';
import { migrateEntity, parseCrucibleEntity } from '@/crucible/schemas/crucibleValidation';
import { computeCrucibleDerived } from '@/crucible/engine/computeCrucibleDerived';
import { validateCrucibleEntity } from '@/crucible/engine/validateCrucibleEntity';
import { scaleCrucibleEntity } from '@/crucible/engine/scaleCrucibleEntity';
import { applyCrucibleTemplate } from '@/crucible/engine/applyCrucibleTemplate';
import { formatStatblockText, formatStatblockMarkdown } from '@/crucible/engine/formatStatblock';
import { convertEntityToRoll20 } from '@/crucible/engine/convertEntityToRoll20';

const STORAGE_KEY = 'thread-of-fate:crucible-library';

export interface CrucibleLibraryState {
  entities: CrucibleEntitySchema[];
}

export interface LibraryFilters {
  kind: CrucibleEntityKind | 'all';
  search: string;
  minThreat: number | null;
  maxThreat: number | null;
  sizeId: string | 'all';
  roleId: string | 'all';
  tag: string;
  officialStatus: string | 'all';
  onlyCasters: boolean;
  onlyBosses: boolean;
  onlyWithPhases: boolean;
  onlyWithLoot: boolean;
  includeArchived: boolean;
}

export const EMPTY_FILTERS: LibraryFilters = {
  kind: 'all',
  search: '',
  minThreat: null,
  maxThreat: null,
  sizeId: 'all',
  roleId: 'all',
  tag: '',
  officialStatus: 'all',
  onlyCasters: false,
  onlyBosses: false,
  onlyWithPhases: false,
  onlyWithLoot: false,
  includeArchived: false,
};

function loadFromStorage(): CrucibleEntitySchema[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e) => migrateEntity(e));
  } catch {
    return [];
  }
}

export const useCrucibleLibraryStore = defineStore('crucibleLibrary', () => {
  const entities = ref<CrucibleEntitySchema[]>(loadFromStorage());
  const filters = ref<LibraryFilters>({ ...EMPTY_FILTERS });
  const storageFull = ref(false);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entities.value));
      storageFull.value = false;
    } catch {
      storageFull.value = true;
      console.warn('The Crucible: could not persist the library to localStorage (quota?).');
    }
  };

  const byId = (id: string) => entities.value.find((e) => e.id === id) ?? null;

  /** Recompute derived + validation and store (insert or replace). */
  function upsert(entity: CrucibleEntitySchema): CrucibleEntitySchema {
    const finished: CrucibleEntitySchema = {
      ...entity,
      meta: { ...entity.meta, updatedAt: new Date().toISOString() },
    };
    finished.derived = computeCrucibleDerived(finished);
    finished.validation = validateCrucibleEntity(finished);
    const idx = entities.value.findIndex((e) => e.id === finished.id);
    if (idx >= 0) entities.value.splice(idx, 1, finished);
    else entities.value.push(finished);
    save();
    return finished;
  }

  function create(kind: CrucibleEntityKind): CrucibleEntitySchema {
    const entity = createEmptyEntity(uuidv4(), kind, new Date().toISOString());
    return upsert(entity);
  }

  function duplicate(id: string): CrucibleEntitySchema | null {
    const source = byId(id);
    if (!source) return null;
    const copy: CrucibleEntitySchema = JSON.parse(JSON.stringify(source));
    copy.id = uuidv4();
    copy.identity = { ...copy.identity, name: `${copy.identity.name || 'Unnamed'} (Copy)` };
    copy.meta = {
      ...copy.meta,
      createdAt: new Date().toISOString(),
      contentVersion: 1,
    };
    copy.roll20.characterId = null;
    return upsert(copy);
  }

  function archive(id: string, archived = true) {
    const entity = byId(id);
    if (entity) upsert({ ...entity, meta: { ...entity.meta, archived } });
  }

  function remove(id: string) {
    entities.value = entities.value.filter((e) => e.id !== id);
    save();
  }

  function scale(id: string, targetThreatRating: number): CrucibleEntitySchema | null {
    const entity = byId(id);
    if (!entity) return null;
    const result = scaleCrucibleEntity(entity, { targetThreatRating });
    return upsert(result.entity);
  }

  function applyTemplate(id: string, templateId: string): CrucibleEntitySchema | null {
    const entity = byId(id);
    if (!entity) return null;
    const result = applyCrucibleTemplate(entity, templateId);
    return upsert(result.entity);
  }

  /** Convert an NPC into a combat monster (or back) without losing the other block. */
  function convertKind(id: string, kind: CrucibleEntityKind): CrucibleEntitySchema | null {
    const entity = byId(id);
    if (!entity) return null;
    return upsert({ ...entity, kind });
  }

  // --- Import / export -------------------------------------------------------

  function exportJson(id: string): string | null {
    const entity = byId(id);
    return entity ? JSON.stringify(entity, null, 2) : null;
  }

  function exportText(id: string, playerSafe = false): string | null {
    const entity = byId(id);
    return entity ? formatStatblockText(entity, { playerSafe }) : null;
  }

  function exportMarkdown(id: string, playerSafe = false): string | null {
    const entity = byId(id);
    return entity ? formatStatblockMarkdown(entity, { playerSafe }) : null;
  }

  function exportRoll20Payload(id: string) {
    const entity = byId(id);
    return entity ? convertEntityToRoll20(entity) : null;
  }

  function importJson(raw: string): { entity: CrucibleEntitySchema | null; errors: string[] } {
    try {
      const parsed = JSON.parse(raw);
      const result = parseCrucibleEntity(parsed);
      if (!result.ok || !result.entity) return { entity: null, errors: result.errors };
      // Never clobber an existing entity on import; give the copy a fresh id.
      if (byId(result.entity.id)) result.entity.id = uuidv4();
      return { entity: upsert(result.entity), errors: [] };
    } catch (e) {
      return { entity: null, errors: [`Not valid JSON: ${(e as Error).message}`] };
    }
  }

  // --- Filtering -------------------------------------------------------------

  const filtered = computed(() => {
    const f = filters.value;
    const search = f.search.trim().toLowerCase();
    return entities.value
      .filter((e) => {
        if (!f.includeArchived && e.meta.archived) return false;
        if (f.kind !== 'all' && e.kind !== f.kind) return false;
        if (f.sizeId !== 'all' && e.classification.sizeId !== f.sizeId) return false;
        if (f.roleId !== 'all' && !e.classification.roleIds.includes(f.roleId)) return false;
        if (f.officialStatus !== 'all' && e.meta.officialStatus !== f.officialStatus) return false;
        if (f.minThreat != null && e.progression.threatRating < f.minThreat) return false;
        if (f.maxThreat != null && e.progression.threatRating > f.maxThreat) return false;
        if (f.onlyCasters && !e.magic.isCaster) return false;
        if (f.onlyBosses && e.kind !== 'boss' && e.kind !== 'mythicBoss') return false;
        if (f.onlyWithPhases && !e.boss?.phases.length) return false;
        if (f.onlyWithLoot && !e.loot.entries.length && !e.loot.currency) return false;
        if (
          f.tag &&
          !e.classification.tagIds.some((t) => t.toLowerCase().includes(f.tag.toLowerCase())) &&
          !e.meta.libraryTags.some((t) => t.toLowerCase().includes(f.tag.toLowerCase()))
        )
          return false;
        if (search) {
          const haystack = [
            e.identity.name,
            e.identity.concept,
            e.kind,
            ...e.classification.tagIds,
            ...e.meta.libraryTags,
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt));
  });

  const count = computed(() => entities.value.filter((e) => !e.meta.archived).length);

  // --- Beacon sync (master store calls these) --------------------------------

  function dehydrate(): CrucibleEntitySchema[] {
    return entities.value;
  }
  function hydrate(stored?: unknown) {
    if (!Array.isArray(stored)) return;
    entities.value = stored.map((e) => migrateEntity(e as Record<string, unknown>));
  }

  return {
    entities,
    filters,
    filtered,
    count,
    storageFull,
    byId,
    upsert,
    create,
    duplicate,
    archive,
    remove,
    scale,
    applyTemplate,
    convertKind,
    exportJson,
    exportText,
    exportMarkdown,
    exportRoll20Payload,
    importJson,
    save,
    dehydrate,
    hydrate,
  };
});
