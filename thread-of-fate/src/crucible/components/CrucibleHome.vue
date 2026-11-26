<template>
  <div class="cru-home">
    <!-- Player view: this character is a Crucible entity shared with the table. -->
    <template v-if="!gm">
      <CrucibleEntitySheet v-if="characterStore.isBound" :bound="true" :gm="false" />
      <p v-else class="tof-panel tof-small tof-muted">The Storyteller has not shared this sheet.</p>
    </template>

    <template v-else>
      <header class="cru-home__head">
        <h2 class="cru-home__title">The Crucible</h2>
        <p class="tof-small tof-muted">
          The Storyteller's forge - NPCs, monsters, bosses, hazards, and whole encounters, balanced
          against your party by the Convergence threat rules.
        </p>
        <nav class="cru-home__nav">
          <button
            v-for="tab in visibleTabs"
            :key="tab.id"
            class="tof-small cru-home__tab"
            :class="{ on: view === tab.id }"
            @click="view = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </header>

      <!-- ============================ This Sheet =========================== -->
      <template v-if="view === 'sheet'">
        <div v-if="characterStore.isBound" class="tof-panel cru-home__boundbar">
          <span class="tof-small">
            This Roll20 character is
            <strong>{{ characterStore.bound?.identity.name }}</strong> - rolls and bars run from
            this sheet, exactly like an NPC sheet in other systems.
          </span>
          <div class="cru-home__workingbtns">
            <button class="tof-btn tof-btn--ghost tof-small" @click="editBound">
              Edit Statblock
            </button>
            <button class="tof-btn tof-btn--ghost tof-small" @click="redeployTokens">
              Re-apply Token Defaults
            </button>
            <button class="tof-btn tof-btn--danger tof-small" @click="unbind">Unbind</button>
          </div>
        </div>
        <CrucibleEntitySheet v-if="characterStore.isBound" :bound="true" :gm="true" />
        <div v-else class="tof-panel">
          <p class="tof-small tof-muted">
            No entity is bound to this Roll20 character yet. Deploy one from the Library (the Roll20
            workflow: Journal &gt; Add Character &gt; open its sheet &gt; Crucible &gt; Library &gt;
            Deploy), or forge something new first.
          </p>
        </div>
      </template>

      <!-- =============================== Forge ============================== -->
      <template v-else-if="view === 'forge'">
        <CruciblePrompt @forge="onForge" />

        <div class="cru-home__cards">
          <button
            v-for="card in QUICK_STARTS"
            :key="card.kind"
            class="tof-card cru-home__card"
            @click="startBlank(card.kind)"
          >
            <strong>{{ card.label }}</strong>
            <span class="tof-small tof-muted">{{ card.hint }}</span>
          </button>
        </div>

        <div v-if="builder.working" class="cru-home__working tof-panel">
          <span>
            On the anvil: <strong>{{ builder.working.identity.name || 'Unnamed' }}</strong>
            <span class="tof-tag">{{ ENTITY_KIND_LABELS[builder.working.kind] }}</span>
          </span>
          <div class="cru-home__workingbtns">
            <button class="tof-btn tof-btn--ghost tof-small" @click="view = 'builder'">
              Continue Editing
            </button>
            <button class="tof-btn tof-btn--ghost tof-small" @click="builder.discard()">
              Discard
            </button>
          </div>
        </div>
      </template>

      <!-- ============================== Builder ============================= -->
      <template v-else-if="view === 'builder'">
        <CrucibleBuilderShell v-if="builder.working" @saved="onSaved" />
        <div v-else class="tof-panel">
          <p class="tof-small tof-muted">
            Nothing on the anvil. Forge from a prompt or start blank:
          </p>
          <div class="cru-home__cards">
            <button
              v-for="card in QUICK_STARTS"
              :key="card.kind"
              class="tof-card cru-home__card"
              @click="startBlank(card.kind)"
            >
              <strong>{{ card.label }}</strong>
            </button>
          </div>
        </div>
      </template>

      <!-- ============================== Library ============================= -->
      <CrucibleLibrary
        v-else-if="view === 'library'"
        @open="openForEdit"
        @play="openForPlay"
        @deploy="deployToCharacter"
        @add-to-encounter="addToEncounter"
      />

      <!-- ================================ Run =============================== -->
      <template v-else-if="view === 'run'">
        <div class="cru-home__runbar tof-panel" v-if="!runId">
          <span class="tof-small tof-muted">Preview-run something from the library:</span>
          <select class="tof-select" @change="pickRun($event)">
            <option value="">Choose an entity...</option>
            <option v-for="e in library.filtered" :key="e.id" :value="e.id">
              {{ e.identity.name }}
            </option>
          </select>
        </div>
        <template v-if="runId">
          <button class="tof-btn tof-btn--ghost tof-small cru-home__back" @click="runId = null">
            Back to pick
          </button>
          <CrucibleEntitySheet :entity-id="runId" />
        </template>
      </template>

      <!-- ============================= Encounters =========================== -->
      <CrucibleEncounterBuilder v-else-if="view === 'encounters'" />

      <p v-if="deployNotice" class="tof-ok tof-small cru-home__notice">{{ deployNotice }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCrucibleBuilderStore } from '@/crucible/store/crucibleBuilder.store';
import { useCrucibleLibraryStore } from '@/crucible/store/crucibleLibrary.store';
import { useCrucibleEncounterStore } from '@/crucible/store/crucibleEncounter.store';
import { useCrucibleCharacterStore } from '@/crucible/store/crucibleCharacter.store';
import { ENTITY_KIND_LABELS, type CrucibleEntityKind } from '@/crucible/schemas/crucibleCommon';
import { deployTokenAndActions } from '@/crucible/engine/deployToCharacter';
import { dispatchRef, initValues } from '@/relay/relay';
import CruciblePrompt from './CruciblePrompt.vue';
import CrucibleBuilderShell from './CrucibleBuilderShell.vue';
import CrucibleLibrary from './CrucibleLibrary.vue';
import CrucibleEntitySheet from './CrucibleEntitySheet.vue';
import CrucibleEncounterBuilder from './CrucibleEncounterBuilder.vue';

type HomeView = 'sheet' | 'forge' | 'builder' | 'library' | 'run' | 'encounters';

withDefaults(defineProps<{ gm?: boolean }>(), { gm: true });

const QUICK_STARTS: { kind: CrucibleEntityKind; label: string; hint: string }[] = [
  { kind: 'npc', label: 'NPC', hint: 'Persona, secrets, knowledge - stats optional' },
  { kind: 'monster', label: 'Monster', hint: 'A standard creature, benchmarked to your party' },
  { kind: 'boss', label: 'Boss', hint: 'Phases and Apex Actions' },
  { kind: 'mythicBoss', label: 'Mythic Boss', hint: 'Overture Actions; campaign-enders' },
  { kind: 'minion', label: 'Minion', hint: 'Dies on the first hit; fielded in numbers' },
  { kind: 'swarm', label: 'Swarm', hint: 'One statblock, many bodies' },
  { kind: 'summon', label: 'Summon', hint: 'Conjured helpers' },
  { kind: 'companion', label: 'Companion', hint: 'A PC-aligned creature' },
  { kind: 'hazard', label: 'Hazard', hint: 'Environmental danger with initiative' },
  { kind: 'trap', label: 'Trap', hint: 'Trigger, notice DC, disable method' },
  { kind: 'vehicle', label: 'Vehicle', hint: 'Stations, crew, hull' },
];

const builder = useCrucibleBuilderStore();
const library = useCrucibleLibraryStore();
const encounters = useCrucibleEncounterStore();
const characterStore = useCrucibleCharacterStore();

// A bound character opens on its sheet - the NPC-statblock-first experience.
const view = ref<HomeView>(characterStore.isBound ? 'sheet' : 'forge');
const runId = ref<string | null>(null);
const deployNotice = ref('');

const visibleTabs = computed<{ id: HomeView; label: string }[]>(() => [
  { id: 'sheet', label: characterStore.isBound ? 'This Sheet *' : 'This Sheet' },
  { id: 'forge', label: 'Forge' },
  { id: 'builder', label: 'Builder' },
  { id: 'library', label: 'Library' },
  { id: 'run', label: 'Run' },
  { id: 'encounters', label: 'Encounters' },
]);

function onForge(prompt: string) {
  builder.generateFromPrompt(prompt);
  view.value = 'builder';
}

function startBlank(kind: CrucibleEntityKind) {
  builder.startNew(kind);
  view.value = 'builder';
}

function onSaved(id: string) {
  runId.value = id;
}

function openForEdit(id: string) {
  if (builder.open(id)) view.value = 'builder';
}

function openForPlay(id: string) {
  runId.value = id;
  view.value = 'run';
}

function addToEncounter(id: string) {
  if (!encounters.active) encounters.create();
  encounters.addToRoster(id, 'enemy', 1);
  view.value = 'encounters';
}

function pickRun(e: Event) {
  const id = (e.target as HTMLSelectElement).value;
  if (id) runId.value = id;
}

function flash(text: string) {
  deployNotice.value = text;
  window.setTimeout(() => {
    if (deployNotice.value === text) deployNotice.value = '';
  }, 4000);
}

/**
 * Deploy: bind the entity to THIS Roll20 character (attributes sync through the
 * master store) and push token defaults + token actions to the host.
 */
async function deployToCharacter(id: string) {
  const entity = library.byId(id);
  if (!entity) return;
  characterStore.bind(entity);
  view.value = 'sheet';
  const result = await pushTokenSetup();
  flash(
    result
      ? `Deployed "${entity.identity.name}" to this character. ${result}`
      : `Deployed "${entity.identity.name}" to this character.`,
  );
}

async function pushTokenSetup(): Promise<string> {
  const entity = characterStore.bound;
  const characterId = initValues.character.id;
  if (!entity || !characterId || !dispatchRef.value) return '';
  const result = await deployTokenAndActions(dispatchRef.value, characterId, entity);
  return [...result.steps, ...result.warnings].join(' ');
}

async function redeployTokens() {
  flash((await pushTokenSetup()) || 'No Roll20 host connected (standalone mode).');
}

function editBound() {
  const bound = characterStore.bound;
  if (!bound) return;
  // Edit through the builder; saving updates both the library and the binding.
  const inLibrary = library.byId(bound.id);
  if (!inLibrary) library.upsert(JSON.parse(JSON.stringify(bound)));
  if (builder.open(bound.id)) view.value = 'builder';
}

function unbind() {
  if (window.confirm('Unbind this entity from the Roll20 character? The library copy remains.')) {
    characterStore.unbind();
    view.value = 'library';
  }
}
</script>

<style scoped lang="scss">
.cru-home__head {
  margin-bottom: 0.8rem;
}
.cru-home__title {
  font-family: var(--tof-font-heading);
  color: var(--tof-gold);
  margin: 0 0 0.2rem;
}
.cru-home__nav {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.55rem;
  flex-wrap: wrap;
}
.cru-home__tab {
  background: transparent;
  border: 1px solid var(--tof-panel-border);
  color: var(--tof-cream);
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  cursor: pointer;
  &.on {
    background: linear-gradient(180deg, var(--tof-gold), #c4861a);
    color: #2a1d05;
    font-weight: 700;
  }
}
.cru-home__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  margin: 0.8rem 0;
}
.cru-home__card {
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--tof-cream);
}
.cru-home__working,
.cru-home__boundbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
}
.cru-home__workingbtns {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.cru-home__runbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  .tof-select {
    min-width: 240px;
  }
}
.cru-home__back {
  margin-bottom: 0.5rem;
}
.cru-home__notice {
  position: sticky;
  bottom: 0.5rem;
}
</style>
