<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Background Points</h2>
      <p class="tof-muted">
        Your background is the life you led before the story began. Spend your
        <strong>{{ BACKGROUND_CONFIG.startingBP }}</strong> Background Points on the traits below,
        most are narrative, but a few sharpen your edge in play.
      </p>
      <div class="bpcounter">
        <div>
          <span class="bpcounter__num">{{ BACKGROUND_CONFIG.startingBP }}</span
          ><span>Starting</span>
        </div>
        <div>
          <span class="bpcounter__num">{{ spent }}</span
          ><span>Spent</span>
        </div>
        <div>
          <span class="bpcounter__num" :class="{ 'tof-warn': remaining < 0 }">{{ remaining }}</span>
          <span>Remaining</span>
        </div>
      </div>
    </div>

    <div class="tof-panel">
      <h3 class="tof-h3" style="margin-top: 0">Traits</h3>
      <input
        class="tof-input"
        v-model="filter"
        placeholder="Search traits..."
        style="margin-bottom: 0.75rem"
      />
      <div class="tof-grid tof-grid--2">
        <div v-for="trait in filtered" :key="trait.id" class="tof-card" style="cursor: default">
          <strong>{{ trait.name }}</strong>
          <span v-if="trait.affectsCombat" class="tof-tag">combat</span>
          <p class="tof-small tof-muted">{{ trait.summary }}</p>
          <div class="costbtns">
            <button
              v-for="opt in trait.costOptions"
              :key="opt.cost + opt.label"
              class="tof-btn tof-btn--ghost tof-small"
              :disabled="!canBuy(trait.id) || remaining - opt.cost < 0"
              :title="opt.label"
              @click="add(trait, opt.cost)"
            >
              +{{ opt.cost }} BP
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="tof-panel" v-if="selected.length">
      <h3 class="tof-h3" style="margin-top: 0">Chosen Background</h3>
      <div v-for="sel in selected" :key="sel.uid" class="selrow">
        <div class="selrow__head">
          <strong>{{ traitName(sel.traitId) }}</strong>
          <span class="tof-tag">{{ sel.cost }} BP</span>
          <button class="tof-btn tof-btn--danger tof-small" @click="store.removeTrait(sel.uid)">
            Remove
          </button>
        </div>
        <component
          :is="detailKind(sel.traitId) === 'select' ? 'select' : 'input'"
          v-if="needsDetail(sel.traitId)"
          class="tof-input"
          :class="{ 'tof-select': detailKind(sel.traitId) === 'select' }"
          :placeholder="detailHint(sel.traitId)"
          :value="sel.detail"
          @input="store.updateTraitDetail(sel.uid, ($event.target as HTMLInputElement).value)"
          @change="store.updateTraitDetail(sel.uid, ($event.target as HTMLSelectElement).value)"
        >
          <template v-if="detailKind(sel.traitId) === 'select'">
            <option value="">{{ detailHint(sel.traitId) }}</option>
            <option v-for="o in detailOptions(sel.traitId)" :key="o" :value="o">{{ o }}</option>
          </template>
        </component>
      </div>
    </div>

    <StepWarnings step="background" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useDraftStore } from '@/maker/store/draftStore';
import { BACKGROUND_CONFIG } from '@/maker/data/constants';
import {
  BACKGROUND_TRAITS,
  LANGUAGES,
  TOOLS,
  DISCIPLINES,
  backgroundTraitById,
} from '@/maker/data';
import { bpRemaining, bpSpent, canPurchase } from '@/maker/rules/backgroundPoints';
import type { BackgroundTraitDef } from '@/maker/types';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const filter = ref('');

const selected = computed(() => store.draft.background.selectedTraits);
const spent = computed(() => bpSpent(selected.value));
const remaining = computed(() => bpRemaining(selected.value));

const filtered = computed(() =>
  BACKGROUND_TRAITS.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.value.toLowerCase()) ||
      t.summary.toLowerCase().includes(filter.value.toLowerCase()),
  ),
);

const canBuy = (id: string) => canPurchase(selected.value, id);
const traitName = (id: string) => backgroundTraitById[id]?.name ?? id;

function add(trait: BackgroundTraitDef, cost: number) {
  if (!canBuy(trait.id) || remaining.value - cost < 0) return;
  store.addTrait({ uid: uuidv4(), traitId: trait.id, cost, detail: '' });
}

const needsDetail = (id: string) => {
  const r = backgroundTraitById[id]?.requires;
  return r && r !== 'none';
};
const detailKind = (id: string) => {
  const r = backgroundTraitById[id]?.requires;
  return r === 'language' || r === 'tool' || r === 'discipline' ? 'select' : 'input';
};
const detailOptions = (id: string) => {
  const r = backgroundTraitById[id]?.requires;
  if (r === 'language') return LANGUAGES;
  if (r === 'tool') return TOOLS;
  if (r === 'discipline')
    return DISCIPLINES.map(
      (d) => `${d.name} (${d.cost} BP${d.prerequisite ? ', ' + d.prerequisite : ''})`,
    );
  return [];
};
const detailHint = (id: string) => {
  const r = backgroundTraitById[id]?.requires;
  switch (r) {
    case 'skills':
      return 'Which talents? e.g. Athletics, Stealth';
    case 'weapon':
      return 'Which weapons?';
    case 'armor':
      return 'Which armor / shield?';
    case 'discipline':
      return 'Which Discipline?';
    case 'language':
      return 'Choose a language';
    case 'tool':
      return 'Choose a tool';
    default:
      return 'Add a detail (name, group, etc.)';
  }
};
</script>

<style scoped lang="scss">
.bpcounter {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
}
.bpcounter > div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bpcounter__num {
  font-family: var(--tof-font-heading);
  font-size: 1.6rem;
  color: var(--tof-gold);
}
.costbtns {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.selrow {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.selrow__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.selrow__head strong {
  flex: 1;
}
</style>
