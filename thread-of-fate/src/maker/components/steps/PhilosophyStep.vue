<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Choosing Your Philosophy</h2>
      <p class="tof-muted">
        The world is not black and white. Your Philosophy reflects how your character engages with
        it, and grants talent proficiencies and features. It replaces traditional alignment, but it
        does not define your whole character.
      </p>
      <label class="tof-label">Philosophy</label>
      <select class="tof-select" :value="selectedId || ''" @change="select($event)">
        <option value="">, Choose a Philosophy,</option>
        <option value="__custom">✎ Create a Custom Philosophy</option>
        <option v-for="p in PHILOSOPHIES" :key="p.id" :value="p.id">
          {{ p.name }}, {{ p.title }}
        </option>
      </select>
    </div>

    <div class="tof-panel" v-if="current">
      <h3 class="tof-h3" style="margin-top: 0">
        {{ current.name }}, <em>{{ current.title }}</em>
      </h3>
      <blockquote class="quote">"{{ current.quote }}"</blockquote>
      <p class="tof-muted">{{ current.overview }}</p>
      <h4 class="tof-h3">Methodology Features</h4>
      <div v-for="f in current.features" :key="f.name" class="feature">
        <strong>{{ f.name }}</strong>
        <span v-if="f.todo" class="tof-tag tof-tag--todo">needs full text</span>
        <p class="tof-small tof-muted">{{ f.description }}</p>
      </div>
    </div>

    <div class="tof-panel" v-if="selectedId === '__custom'">
      <h3 class="tof-h3" style="margin-top: 0">Custom Philosophy</h3>
      <label class="tof-label">Name</label>
      <input class="tof-input" :value="custom.name" @input="patchCustom('name', $event)" />
      <label class="tof-label">Paradigm Overview</label>
      <textarea
        class="tof-textarea"
        :value="custom.overview"
        @input="patchCustom('overview', $event)"
      />
      <label class="tof-label">Feature Name</label>
      <input
        class="tof-input"
        :value="custom.featureName"
        @input="patchCustom('featureName', $event)"
      />
      <label class="tof-label">Feature Description</label>
      <textarea
        class="tof-textarea"
        :value="custom.featureDescription"
        @input="patchCustom('featureDescription', $event)"
      />
    </div>

    <StepWarnings step="philosophy" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { PHILOSOPHIES, philosophyById } from '@/maker/data';

const store = useDraftStore();
const selectedId = computed(() =>
  store.draft.philosophy.custom ? '__custom' : store.draft.philosophy.selectedPhilosophyId,
);
const current = computed(() =>
  store.draft.philosophy.selectedPhilosophyId
    ? philosophyById[store.draft.philosophy.selectedPhilosophyId]
    : null,
);
const custom = computed(
  () =>
    store.draft.philosophy.custom ?? {
      name: '',
      overview: '',
      featureName: '',
      featureDescription: '',
    },
);

function select(e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  if (v === '__custom') {
    store.patch('philosophy', {
      selectedPhilosophyId: null,
      custom: { name: '', overview: '', featureName: '', featureDescription: '' },
    });
  } else {
    store.patch('philosophy', { selectedPhilosophyId: v || null, custom: null });
  }
}
function patchCustom(field: string, e: Event) {
  const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  store.patch('philosophy', { custom: { ...custom.value, [field]: value } });
}
</script>

<style scoped lang="scss">
.quote {
  border-left: 3px solid var(--tof-gold);
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  font-style: italic;
  color: var(--tof-cream);
}
.feature {
  padding: 0.4rem 0;
}
</style>
