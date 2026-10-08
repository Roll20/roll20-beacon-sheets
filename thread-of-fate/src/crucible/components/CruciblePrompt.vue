<template>
  <div class="tof-panel cru-prompt">
    <h3 class="tof-h2">Spark the Forge</h3>
    <p class="tof-small tof-muted">
      Describe what you need in a sentence. The Crucible parses it offline - every number comes from
      the rules engine, every guess is shown, and the same sentence always forges the same creature.
    </p>
    <textarea
      v-model="text"
      class="tof-textarea"
      rows="3"
      placeholder='e.g. "Make me a level 8 blackstone war beast for 4 level 7 players" or "a suspicious merchant who secretly knows where the relic is"'
      @keydown.ctrl.enter.prevent="forge"
    />

    <div v-if="preview" class="cru-prompt__preview tof-small">
      <span v-for="chip in chips" :key="chip.label" class="tof-tag" :title="chip.evidence">
        {{ chip.label }}
      </span>
      <span v-if="missing.length" class="tof-muted"> Will assume: {{ missing.join(', ') }} </span>
    </div>

    <div class="cru-prompt__actions">
      <button class="tof-btn" :disabled="!text.trim()" @click="forge">Forge It</button>
      <span class="tof-small tof-muted">Ctrl+Enter to forge</span>
    </div>

    <div class="cru-prompt__examples tof-small">
      <span class="tof-muted">Try:</span>
      <button
        v-for="example in EXAMPLES"
        :key="example"
        class="tof-btn tof-btn--ghost tof-small"
        @click="text = example"
      >
        {{ example }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { parseCrucibleIntent } from '@/crucible/engine/parseCrucibleIntent';
import { unresolvedFields } from '@/crucible/engine/parseCrucibleIntent';
import { ENTITY_KIND_LABELS, type CrucibleEntityKind } from '@/crucible/schemas/crucibleCommon';

const emit = defineEmits<{ (e: 'forge', prompt: string): void }>();

const text = ref('');

const EXAMPLES = [
  'Make me a level 8 blackstone war beast for 4 level 7 players',
  'A terrifying cathedral monster',
  'A suspicious merchant who secretly knows where the Fallstar relic is',
  'A two-phase undead boss for 5 level 9 players, deadly',
  'A pack of 8 goblin minions for 4 level 3 players',
  'A collapsing ceiling trap for a level 6 party',
];

const preview = computed(() => (text.value.trim() ? parseCrucibleIntent(text.value) : null));

const chips = computed(() => {
  const p = preview.value;
  if (!p) return [];
  const out: { label: string; evidence: string }[] = [];
  if (p.kind)
    out.push({
      label: ENTITY_KIND_LABELS[p.kind.value as CrucibleEntityKind] ?? p.kind.value,
      evidence: p.kind.evidence,
    });
  if (p.level) out.push({ label: `Level ${p.level.value}`, evidence: p.level.evidence });
  if (p.threatRating)
    out.push({ label: `TR ${p.threatRating.value}`, evidence: p.threatRating.evidence });
  if (p.sizeId) out.push({ label: p.sizeId.value, evidence: p.sizeId.evidence });
  for (const r of p.roleIds) out.push({ label: r.value, evidence: r.evidence });
  if (p.partySize || p.partyLevel) {
    out.push({
      label: `Party ${p.partySize?.value ?? '?'} x L${p.partyLevel?.value ?? '?'}`,
      evidence: p.partySize?.evidence ?? p.partyLevel?.evidence ?? '',
    });
  }
  if (p.difficulty) out.push({ label: p.difficulty.value, evidence: p.difficulty.evidence });
  if (p.count) out.push({ label: `x${p.count.value}`, evidence: p.count.evidence });
  for (const t of p.templateIds) out.push({ label: `+${t.value}`, evidence: t.evidence });
  return out;
});

const missing = computed(() => (preview.value ? unresolvedFields(preview.value) : []));

function forge() {
  if (text.value.trim()) emit('forge', text.value.trim());
}
</script>

<style scoped lang="scss">
.cru-prompt__preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  margin: 0.5rem 0;
  min-height: 1.4rem;
}
.cru-prompt__actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0.4rem 0 0.7rem;
}
.cru-prompt__examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  border-top: 1px dashed var(--tof-panel-border);
  padding-top: 0.6rem;
}
</style>
