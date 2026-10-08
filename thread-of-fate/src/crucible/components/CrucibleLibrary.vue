<template>
  <div class="cru-library">
    <div class="tof-panel cru-library__filters">
      <input
        v-model="library.filters.search"
        class="tof-input"
        placeholder="Search the library..."
      />
      <select v-model="library.filters.kind" class="tof-select">
        <option value="all">All kinds</option>
        <option v-for="k in ENTITY_KINDS" :key="k" :value="k">{{ ENTITY_KIND_LABELS[k] }}</option>
      </select>
      <select v-model="library.filters.roleId" class="tof-select">
        <option value="all">Any role</option>
        <option v-for="r in CREATURE_ROLES" :key="r.id" :value="r.id">{{ r.name }}</option>
      </select>
      <select v-model="library.filters.sizeId" class="tof-select">
        <option value="all">Any size</option>
        <option v-for="s in CREATURE_SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <label class="tof-small"
        ><input type="checkbox" v-model="library.filters.onlyBosses" /> bosses</label
      >
      <label class="tof-small"
        ><input type="checkbox" v-model="library.filters.onlyCasters" /> casters</label
      >
      <label class="tof-small"
        ><input type="checkbox" v-model="library.filters.includeArchived" /> archived</label
      >
    </div>

    <div class="cru-library__list">
      <div v-for="e in library.filtered" :key="e.id" class="tof-card cru-library__row">
        <div class="cru-library__title">
          <strong>{{ e.identity.name || 'Unnamed' }}</strong>
          <span class="tof-tag">{{ ENTITY_KIND_LABELS[e.kind] }}</span>
          <span class="tof-small tof-muted">
            TR {{ e.progression.threatRating }} - L{{ e.progression.level }} -
            {{ e.derived.hitPoints }} HP - AC {{ e.derived.armorClass }}
          </span>
          <span v-if="e.meta.archived" class="tof-tag tof-tag--todo">archived</span>
          <span v-if="errorCount(e)" class="tof-warn tof-small">{{ errorCount(e) }} errors</span>
        </div>
        <div class="cru-library__actions">
          <button
            class="tof-btn tof-small"
            title="Bind this entity to the currently open Roll20 character (the NPC-sheet workflow)"
            @click="$emit('deploy', e.id)"
          >
            Deploy to Sheet
          </button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="$emit('open', e.id)">
            Edit
          </button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="$emit('play', e.id)">Run</button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="library.duplicate(e.id)">
            Duplicate
          </button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="scalePrompt(e.id)">Scale</button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="$emit('addToEncounter', e.id)">
            + Encounter
          </button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="exportEntity(e.id)">
            Export
          </button>
          <button
            class="tof-btn tof-btn--ghost tof-small"
            @click="library.archive(e.id, !e.meta.archived)"
          >
            {{ e.meta.archived ? 'Restore' : 'Archive' }}
          </button>
          <button class="tof-btn tof-btn--danger tof-small" @click="confirmRemove(e.id)">
            Delete
          </button>
        </div>
      </div>
      <p v-if="!library.filtered.length" class="tof-small tof-muted">
        Nothing in the library matches. Forge something from the prompt above, or import JSON below.
      </p>
    </div>

    <details class="tof-panel cru-library__import">
      <summary>Import JSON</summary>
      <textarea
        v-model="importText"
        class="tof-textarea"
        rows="4"
        placeholder="Paste a Crucible entity JSON export..."
      />
      <div class="cru-library__importrow">
        <button class="tof-btn tof-btn--ghost" :disabled="!importText.trim()" @click="doImport">
          Import
        </button>
        <span v-if="importMessage" class="tof-small" :class="importOk ? 'tof-ok' : 'tof-warn'">{{
          importMessage
        }}</span>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCrucibleLibraryStore } from '@/crucible/store/crucibleLibrary.store';
import { ENTITY_KINDS, ENTITY_KIND_LABELS } from '@/crucible/schemas/crucibleCommon';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { CREATURE_ROLES } from '@/crucible/data/registries/creatureRoles.registry';
import { CREATURE_SIZES } from '@/crucible/data/registries/creatureSizes.registry';

defineEmits<{
  (e: 'open', id: string): void;
  (e: 'play', id: string): void;
  (e: 'deploy', id: string): void;
  (e: 'addToEncounter', id: string): void;
}>();

const library = useCrucibleLibraryStore();
const importText = ref('');
const importMessage = ref('');
const importOk = ref(false);

const errorCount = (e: CrucibleEntitySchema) =>
  e.validation.filter((v) => v.level === 'error').length;

function scalePrompt(id: string) {
  const entity = library.byId(id);
  if (!entity) return;
  const raw = window.prompt(
    `Scale "${entity.identity.name}" to which Threat Rating?`,
    String(entity.progression.threatRating),
  );
  if (raw == null) return;
  const target = Number(raw);
  if (Number.isFinite(target) && target >= 0) library.scale(id, Math.round(target));
}

function exportEntity(id: string) {
  const json = library.exportJson(id);
  if (!json) return;
  const entity = library.byId(id);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(entity?.identity.name || 'crucible-entity').replace(/[^\w-]+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function confirmRemove(id: string) {
  const entity = library.byId(id);
  if (
    window.confirm(
      `Delete "${entity?.identity.name || 'this entity'}" from the library? This cannot be undone.`,
    )
  ) {
    library.remove(id);
  }
}

function doImport() {
  const result = library.importJson(importText.value);
  importOk.value = Boolean(result.entity);
  importMessage.value = result.entity
    ? `Imported "${result.entity.identity.name || 'entity'}".`
    : result.errors.join('; ');
  if (result.entity) importText.value = '';
}
</script>

<style scoped lang="scss">
.cru-library__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 0.7rem;
  .tof-input {
    flex: 1;
    min-width: 160px;
  }
  .tof-select {
    max-width: 160px;
  }
}
.cru-library__row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.45rem;
}
.cru-library__title {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.cru-library__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.cru-library__import {
  margin-top: 0.7rem;
}
.cru-library__importrow {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-top: 0.4rem;
}
</style>
