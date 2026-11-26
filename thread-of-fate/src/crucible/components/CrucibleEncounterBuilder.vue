<template>
  <div class="cru-enc">
    <div class="cru-enc__bar">
      <select class="tof-select" :value="store.activeId ?? ''" @change="openEncounter($event)">
        <option value="">Select an encounter...</option>
        <option v-for="e in store.encounters" :key="e.id" :value="e.id">{{ e.name }}</option>
      </select>
      <button class="tof-btn tof-btn--ghost" @click="store.create()">New Encounter</button>
      <button v-if="store.active" class="tof-btn tof-btn--danger tof-small" @click="removeActive">
        Delete
      </button>
    </div>

    <template v-if="encounter">
      <div class="cru-enc__cols">
        <div class="cru-enc__left">
          <div class="tof-panel">
            <label class="tof-label"
              >Encounter name
              <input class="tof-input" :value="encounter.name" @input="rename($event)" />
            </label>
            <label class="tof-label"
              >Objective
              <input
                class="tof-input"
                :value="encounter.objective"
                @input="setObjective($event)"
                placeholder="e.g. hold the bridge for 5 rounds"
              />
            </label>
            <label class="tof-label"
              >Environment
              <select
                class="tof-select"
                :value="encounter.environmentId ?? ''"
                @change="setEnvironment($event)"
              >
                <option value="">No specific environment</option>
                <option v-for="env in ENCOUNTER_ENVIRONMENTS" :key="env.id" :value="env.id">
                  {{ env.name }} ({{ env.threatModifier >= 0 ? '+' : ''
                  }}{{ env.threatModifier }} TR)
                </option>
              </select>
            </label>
          </div>

          <div class="tof-panel">
            <h4 class="tof-h2 tof-small">Party ({{ encounter.party.length }})</h4>
            <div v-for="member in encounter.party" :key="member.id" class="cru-enc__member">
              <input
                class="tof-input"
                :value="member.name"
                @input="patchMember(member.id, 'name', $event)"
              />
              <label class="tof-small"
                >L
                <input
                  class="tof-input cru-enc__lvl"
                  type="number"
                  min="0"
                  max="60"
                  :value="member.level"
                  @input="patchMemberLevel(member.id, $event)"
                />
              </label>
              <select
                class="tof-select"
                :value="member.highestCurioRarity ?? ''"
                @change="patchMemberCurio(member.id, $event)"
              >
                <option value="">No Curio</option>
                <option v-for="r in CURIO_RARITIES" :key="r" :value="r">{{ r }}</option>
              </select>
              <button
                class="tof-btn tof-btn--ghost tof-small"
                @click="store.removePartyMember(member.id!)"
              >
                x
              </button>
            </div>
            <button class="tof-btn tof-btn--ghost tof-small" @click="store.addPartyMember()">
              + Party member
            </button>
          </div>

          <div class="tof-panel">
            <h4 class="tof-h2 tof-small">Roster</h4>
            <div v-for="entry in encounter.roster" :key="entry.id" class="cru-enc__member">
              <span class="cru-enc__rostername">{{ entry.name }}</span>
              <select
                class="tof-select cru-enc__side"
                :value="entry.side"
                @change="patchRosterSide(entry.id, $event)"
              >
                <option value="enemy">Enemy</option>
                <option value="ally">Ally</option>
                <option value="hazard">Hazard</option>
              </select>
              <label class="tof-small"
                >x
                <input
                  class="tof-input cru-enc__lvl"
                  type="number"
                  min="1"
                  :value="entry.count"
                  @input="patchRosterCount(entry.id, $event)"
                />
              </label>
              <button
                class="tof-btn tof-btn--ghost tof-small"
                @click="store.removeFromRoster(entry.id)"
              >
                x
              </button>
            </div>
            <div class="cru-enc__addrow">
              <select v-model="addPick" class="tof-select">
                <option value="">Add from the library...</option>
                <option v-for="e in library.filtered" :key="e.id" :value="e.id">
                  {{ e.identity.name }} (TR {{ e.progression.threatRating }})
                </option>
              </select>
              <button
                class="tof-btn tof-btn--ghost tof-small"
                :disabled="!addPick"
                @click="addFromLibrary"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div class="cru-enc__right">
          <div v-if="result" class="tof-panel">
            <h4 class="tof-h2">
              Difficulty:
              <span :class="`cru-enc__diff--${result.difficulty}`">{{
                DIFFICULTY_LABELS[result.difficulty]
              }}</span>
            </h4>
            <p class="tof-small">{{ result.reason }}</p>
            <div class="cru-enc__figures tof-small">
              <div><span class="tof-muted">Party budget</span> {{ result.partyBudget.total }}</div>
              <div><span class="tof-muted">Enemy total</span> {{ result.enemyThreatTotal }}</div>
              <div>
                <span class="tof-muted">Outnumbering</span>
                {{ result.outnumberingModifier >= 0 ? '+' : '' }}{{ result.outnumberingModifier }}
              </div>
            </div>
            <details class="tof-small">
              <summary>Show the math</summary>
              <div v-for="(line, i) in result.lines" :key="i" class="cru-enc__mathline">
                <strong>{{ line.label }}: {{ line.value }}</strong>
                <span class="tof-muted"> - {{ line.rule }}</span>
                <div v-for="(d, j) in line.detail ?? []" :key="j" class="tof-muted cru-enc__detail">
                  {{ d }}
                </div>
              </div>
            </details>
            <p v-for="(w, i) in result.warnings" :key="i" class="tof-warn tof-small">{{ w }}</p>
          </div>

          <div v-if="analysis" class="tof-panel tof-small">
            <h4 class="tof-h2 tof-small">Deeper Read</h4>
            <p>
              <strong>Action economy:</strong> {{ analysis.actionEconomy.verdict }} ({{
                analysis.actionEconomy.enemyActionPoints
              }}
              enemy AP vs {{ analysis.actionEconomy.partyActionPoints }} party AP)
            </p>
            <p>
              <strong>Durability:</strong> ~{{ analysis.durability.estimatedRoundsToClear }} rounds
              for the party to clear {{ analysis.durability.enemyTotalHitPoints }} enemy HP.
            </p>
            <p>
              <strong>Lethality:</strong> enemy output ~{{ analysis.lethality.enemyTotalDpr }}/round
              could drop the party in ~{{ analysis.lethality.estimatedRoundsToDropParty }} rounds.
            </p>
            <p>
              <strong>Expected length:</strong> ~{{ analysis.expectedRounds }} rounds. Control risk
              {{ analysis.controlRisk }}, mobility risk {{ analysis.mobilityRisk }}, phase tracking
              {{ analysis.bossPhaseRisk }}.
            </p>
            <p v-for="(s, i) in analysis.suggestions" :key="i" class="tof-muted">
              Suggestion: {{ s }}
            </p>
          </div>

          <div class="tof-panel cru-enc__deploy">
            <button class="tof-btn" :disabled="!result" @click="whisperReport">
              Whisper Report to GM
            </button>
            <button
              class="tof-btn tof-btn--ghost"
              :disabled="!encounter.roster.length"
              @click="exportEncounter"
            >
              Export Encounter JSON
            </button>
          </div>
        </div>
      </div>
    </template>
    <p v-else class="tof-small tof-muted">Create an encounter to start balancing.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCrucibleEncounterStore } from '@/crucible/store/crucibleEncounter.store';
import { useCrucibleLibraryStore } from '@/crucible/store/crucibleLibrary.store';
import {
  CURIO_RARITIES,
  DIFFICULTY_LABELS,
  type CurioRarity,
} from '@/crucible/schemas/crucibleCommon';
import type { EncounterRosterEntry } from '@/crucible/schemas/crucibleEncounter.schema';
import { ENCOUNTER_ENVIRONMENTS } from '@/crucible/data/registries/encounterEnvironments.registry';
import { formatThreatReport } from '@/crucible/engine/calculateEncounterDifficulty';
import { crucibleThreatReport } from '@/crucible/engine/crucibleRolls';

const store = useCrucibleEncounterStore();
const library = useCrucibleLibraryStore();
const addPick = ref('');

const encounter = computed(() => store.active);
const result = computed(() => store.result);
const analysis = computed(() => store.analysis);

const strVal = (e: Event) => (e.target as HTMLInputElement).value;
const numVal = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;

function openEncounter(e: Event) {
  const id = strVal(e);
  if (id) store.open(id);
}
function removeActive() {
  if (store.activeId && window.confirm('Delete this encounter?')) store.remove(store.activeId);
}
function rename(e: Event) {
  if (encounter.value) {
    encounter.value.name = strVal(e);
    store.save();
  }
}
function setObjective(e: Event) {
  if (encounter.value) {
    encounter.value.objective = strVal(e);
    store.save();
  }
}
function setEnvironment(e: Event) {
  store.setEnvironment(strVal(e) || null);
}

function patchMember(id: string | undefined, key: 'name', e: Event) {
  const member = encounter.value?.party.find((m) => m.id === id);
  if (member) {
    member[key] = strVal(e);
    store.save();
  }
}
function patchMemberLevel(id: string | undefined, e: Event) {
  const member = encounter.value?.party.find((m) => m.id === id);
  if (member) {
    member.level = Math.max(0, numVal(e));
    store.save();
  }
}
function patchMemberCurio(id: string | undefined, e: Event) {
  const member = encounter.value?.party.find((m) => m.id === id);
  if (member) {
    member.highestCurioRarity = (strVal(e) || undefined) as CurioRarity | undefined;
    store.save();
  }
}

function addFromLibrary() {
  if (addPick.value) {
    store.addToRoster(addPick.value, 'enemy', 1);
    addPick.value = '';
  }
}
function patchRosterSide(id: string, e: Event) {
  store.updateRosterEntry(id, { side: strVal(e) as EncounterRosterEntry['side'] });
}
function patchRosterCount(id: string, e: Event) {
  store.updateRosterEntry(id, { count: Math.max(1, numVal(e)) });
}

async function whisperReport() {
  if (!result.value) return;
  const first = encounter.value?.roster[0];
  const entity = first ? library.byId(first.entityId) : null;
  if (entity) await crucibleThreatReport(entity, formatThreatReport(result.value));
}

function exportEncounter() {
  if (!encounter.value) return;
  const payload = {
    ...encounter.value,
    entities: encounter.value.roster.map((r) => library.byId(r.entityId)).filter(Boolean),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${encounter.value.name.replace(/[^\w-]+/g, '-')}.encounter.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped lang="scss">
.cru-enc__bar {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.7rem;
  .tof-select {
    min-width: 220px;
  }
}
.cru-enc__cols {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr);
  gap: 0.8rem;
  align-items: start;
}
.cru-enc__left,
.cru-enc__right {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.cru-enc__member {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
  .tof-input {
    max-width: 150px;
  }
}
.cru-enc__lvl {
  max-width: 64px;
}
.cru-enc__side {
  max-width: 110px;
}
.cru-enc__rostername {
  min-width: 10rem;
  font-weight: 600;
}
.cru-enc__addrow {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
  .tof-select {
    flex: 1;
  }
}
.cru-enc__figures {
  display: flex;
  gap: 1.1rem;
  margin: 0.4rem 0;
  span.tof-muted {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
  }
}
.cru-enc__mathline {
  padding: 0.2rem 0;
  border-bottom: 1px dashed var(--tof-panel-border);
}
.cru-enc__detail {
  padding-left: 0.9rem;
}
.cru-enc__diff--easy {
  color: #9fd89f;
}
.cru-enc__diff--medium {
  color: var(--tof-gold);
}
.cru-enc__diff--hard {
  color: #f0a05a;
}
.cru-enc__diff--deadly {
  color: #f07070;
}
.cru-enc__deploy {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
@media (max-width: 950px) {
  .cru-enc__cols {
    grid-template-columns: 1fr;
  }
}
</style>
