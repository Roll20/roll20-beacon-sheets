<template>
  <div v-if="entity" class="cru-review">
    <div class="cru-review__cols">
      <div class="cru-review__main">
        <CrucibleStatblockPreview :entity="entity" :player-safe="playerView" />
        <label class="tof-small cru-review__toggle">
          <input type="checkbox" v-model="playerView" />
          Preview what players would see
        </label>
        <CrucibleSourceTrace :traces="entity.derived.traces" />
      </div>
      <div class="cru-review__side">
        <CrucibleThreatPanel
          :party-check="builder.partyCheck"
          :recommendation="builder.recommendation"
        />
        <CrucibleAssumptionsPanel
          :assumptions="entity.assumptions"
          @accept="builder.acceptAssumption"
          @dismiss="builder.dismissAssumption"
        />
        <CrucibleValidationPanel :issues="entity.validation" />

        <div class="tof-panel">
          <h3 class="tof-h2">Tune This</h3>
          <div class="cru-review__tune">
            <label class="tof-label"
              >Threat Rating
              <input
                class="tof-input"
                type="number"
                min="0"
                :value="entity.progression.threatRating"
                @input="setThreat($event)"
              />
            </label>
            <label class="tof-label"
              >Level
              <input
                class="tof-input"
                type="number"
                min="0"
                max="60"
                :value="entity.progression.level"
                @input="setLevel($event)"
              />
            </label>
            <label class="tof-label"
              >Planned count
              <input
                class="tof-input"
                type="number"
                min="1"
                :value="entity.creationContext.plannedCount"
                @input="setCount($event)"
              />
            </label>
          </div>
          <div class="cru-review__actions">
            <button v-if="builder.prompt" class="tof-btn tof-btn--ghost" @click="builder.reroll()">
              Reroll (same prompt)
            </button>
            <button class="tof-btn tof-btn--ghost" @click="builder.goTo('concept')">
              Open Full Editor
            </button>
          </div>
        </div>

        <div class="tof-panel">
          <h3 class="tof-h2">Save &amp; Export</h3>
          <div class="cru-review__actions">
            <button class="tof-btn" @click="save">Save to Library</button>
            <button class="tof-btn tof-btn--ghost" @click="copy('json')">Copy JSON</button>
            <button class="tof-btn tof-btn--ghost" @click="copy('text')">Copy Statblock</button>
            <button class="tof-btn tof-btn--ghost" @click="copy('markdown')">Copy Markdown</button>
          </div>
          <p v-if="notice" class="tof-ok tof-small">{{ notice }}</p>
        </div>

        <div v-if="builder.generationNotes.length" class="tof-panel">
          <h3 class="tof-h2">Forge Notes</h3>
          <p v-for="(note, i) in builder.generationNotes" :key="i" class="tof-small tof-muted">
            {{ note }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCrucibleBuilderStore } from '@/crucible/store/crucibleBuilder.store';
import { formatStatblockText, formatStatblockMarkdown } from '@/crucible/engine/formatStatblock';
import CrucibleStatblockPreview from './CrucibleStatblockPreview.vue';
import CrucibleAssumptionsPanel from './CrucibleAssumptionsPanel.vue';
import CrucibleValidationPanel from './CrucibleValidationPanel.vue';
import CrucibleThreatPanel from './CrucibleThreatPanel.vue';
import CrucibleSourceTrace from './CrucibleSourceTrace.vue';

const emit = defineEmits<{ (e: 'saved', id: string): void }>();

const builder = useCrucibleBuilderStore();
const entity = computed(() => builder.working);
const playerView = ref(false);
const notice = ref('');

const num = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;

function setThreat(e: Event) {
  builder.patch('progression', { threatRating: Math.max(0, num(e)) });
}
function setLevel(e: Event) {
  builder.patch('progression', { level: Math.max(0, Math.min(60, num(e))) });
}
function setCount(e: Event) {
  builder.patch('creationContext', { plannedCount: Math.max(1, num(e)) });
}

function save() {
  const saved = builder.saveToLibrary();
  if (saved) {
    flash('Saved to the library.');
    emit('saved', saved.id);
  }
}

async function copy(kind: 'json' | 'text' | 'markdown') {
  if (!entity.value) return;
  const content =
    kind === 'json'
      ? JSON.stringify(entity.value, null, 2)
      : kind === 'text'
      ? formatStatblockText(entity.value)
      : formatStatblockMarkdown(entity.value);
  try {
    await navigator.clipboard.writeText(content);
    flash(`Copied ${kind} to the clipboard.`);
  } catch {
    flash('Clipboard unavailable - use Export from the library instead.');
  }
}

function flash(text: string) {
  notice.value = text;
  window.setTimeout(() => {
    if (notice.value === text) notice.value = '';
  }, 2500);
}
</script>

<style scoped lang="scss">
.cru-review__cols {
  display: grid;
  grid-template-columns: minmax(320px, 1.2fr) minmax(280px, 1fr);
  gap: 0.9rem;
  align-items: start;
}
.cru-review__main,
.cru-review__side {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.cru-review__toggle {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.cru-review__tune {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.cru-review__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
@media (max-width: 900px) {
  .cru-review__cols {
    grid-template-columns: 1fr;
  }
}
</style>
