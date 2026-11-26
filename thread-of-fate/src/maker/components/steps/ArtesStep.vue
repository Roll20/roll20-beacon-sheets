<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Choosing Your Artes</h2>
      <p class="tof-muted">
        Artes are the shapes your Aether takes, divided from Tier-0 to Tier-15 and drawn from your
        class's source of magic. Casters progress as Low-, Mid-, or High-Casters.
      </p>
      <div v-if="!store.isCaster" class="tof-panel" style="margin-top: 0.75rem; text-align: center">
        <p class="tof-warn--soft">You aren't familiar with any Artes yet!</p>
        <p class="tof-small tof-muted">
          None of your chosen classes grant Aether. You can move on, Artes aren't required for
          non-casters.
        </p>
      </div>
    </div>

    <template v-if="store.isCaster">
      <div class="tof-panel casterbar">
        <div>
          <span class="bignum">{{ caster.aether }}</span
          ><span>Aether</span>
        </div>
        <div>
          <span class="bignum">{{ caster.casterLevel }}</span
          ><span>Caster Lvl</span>
        </div>
        <div>
          <span class="bignum">{{ caster.maxTier }}</span
          ><span>Max Tier</span>
        </div>
        <div>
          <span class="bignum">{{ fmt(caster.arteSaveDC) }}</span
          ><span>Save DC</span>
        </div>
        <div>
          <span class="bignum">{{ fmt(caster.arteAttack) }}</span
          ><span>Arte Attack</span>
        </div>
        <div class="casterbar__src">
          <span class="tof-label" style="display: inline">Source</span>
          {{ caster.sources.join(' / ') || ', ' }}
          <span v-if="caster.castingAttribute" class="tof-small tof-muted">
            - casts with {{ attrLabel(caster.castingAttribute) }}</span
          >
        </div>
      </div>

      <div class="tof-panel">
        <input
          class="tof-input"
          v-model="search"
          placeholder="Search Artes..."
          style="margin-bottom: 0.5rem"
        />
        <div class="filters">
          <div>
            <label class="tof-label">Tier</label>
            <select class="tof-select" v-model="tierFilter">
              <option value="">All accessible</option>
              <option v-for="t in tiers" :key="t" :value="t">
                {{ t === 0 ? 'Cantrip' : 'Tier-' + t }}
              </option>
            </select>
          </div>
          <div>
            <label class="tof-label">School</label>
            <select class="tof-select" v-model="schoolFilter">
              <option value="">All</option>
              <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <label class="tof-checkline" style="align-self: flex-end">
            <input type="checkbox" v-model="showAll" /> Show all sources/tiers
          </label>
        </div>
        <p class="tof-small tof-muted" style="margin-top: 0.4rem">
          {{ filtered.length }} available - {{ selected.length }} selected
          <span v-if="!showAll">
            (filtered to {{ caster.sources.join('/') }}, up to Tier-{{ caster.maxTier }})</span
          >
        </p>
      </div>

      <div class="tof-panel">
        <h3 class="tof-h3" style="margin-top: 0">Available Artes</h3>
        <div class="tof-grid tof-grid--2 artelist">
          <label
            v-for="arte in capped"
            :key="arte.id"
            class="tof-card"
            :class="{ 'tof-card--selected': selected.includes(arte.id) }"
          >
            <div class="artehead">
              <input
                type="checkbox"
                :checked="selected.includes(arte.id)"
                @change="toggle(arte.id)"
              />
              <strong>{{ arte.name }}</strong>
              <span class="tof-tag">{{ arte.tier === 0 ? 'Cantrip' : 'Tier-' + arte.tier }}</span>
            </div>
            <p class="tof-small tof-muted">
              {{ arte.school }} - {{ arte.sources.join('/') }} - {{ arte.castingTime }} -
              {{ arte.range }}
            </p>
            <p class="tof-small tof-muted">{{ truncate(arte.description) }}</p>
          </label>
        </div>
        <p v-if="filtered.length > capped.length" class="tof-small tof-muted">
          Showing first {{ capped.length }}, refine filters to see more.
        </p>
      </div>

      <div class="tof-panel">
        <details>
          <summary class="tof-h3" style="cursor: pointer; margin: 0">
            Mana Confluxes ({{ store.draft.artes.selectedConfluxIds.length }} known)
          </summary>
          <p class="tof-small tof-muted" style="margin-top: 0.5rem">
            Extra Aether-fueled effects you can apply when casting. Casters gain Conflux options
            from features like the Arcanist's Aether Conflux, tick the ones you've gained.
          </p>
          <div class="tof-grid tof-grid--2">
            <label
              v-for="cf in MANA_CONFLUXES"
              :key="cf.id"
              class="tof-card"
              :class="{
                'tof-card--selected': store.draft.artes.selectedConfluxIds.includes(cf.id),
              }"
            >
              <div class="artehead">
                <input
                  type="checkbox"
                  :checked="store.draft.artes.selectedConfluxIds.includes(cf.id)"
                  @change="toggleConflux(cf.id)"
                />
                <strong>{{ cf.name }}</strong>
              </div>
              <p class="tof-small tof-muted">{{ cf.description }}</p>
            </label>
          </div>
        </details>
      </div>
    </template>

    <StepWarnings step="artes" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { ARTES, MANA_CONFLUXES } from '@/maker/data';
import { ATTRIBUTE_LABELS } from '@/maker/data/attributes';
import { casterInfo } from '@/maker/rules/casting';
import { formatModifier } from '@/maker/rules/stats';
import type { AttributeKey } from '@/maker/types';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const tierFilter = ref<string | number>('');
const schoolFilter = ref('');
const search = ref('');
const showAll = ref(false);
const CAP = 60;

const caster = computed(() => casterInfo(store.draft));
const fmt = formatModifier;
const attrLabel = (k: AttributeKey) => ATTRIBUTE_LABELS[k];

const selected = computed(() => store.draft.artes.selectedArteIds);
const tiers = computed(() => [...new Set(ARTES.map((a) => a.tier))].sort((a, b) => a - b));
const schools = computed(() => [...new Set(ARTES.map((a) => a.school))].sort());

/** Artes the character can actually learn: matching source list and <= max tier. */
const accessible = computed(() => {
  if (showAll.value) return ARTES;
  const srcs = caster.value.sources;
  const maxTier = caster.value.maxTier;
  return ARTES.filter(
    (a) => a.tier <= maxTier && (srcs.length === 0 || a.sources.some((s) => srcs.includes(s))),
  );
});

const filtered = computed(() =>
  accessible.value.filter(
    (a) =>
      (tierFilter.value === '' || a.tier === Number(tierFilter.value)) &&
      (schoolFilter.value === '' || a.school === schoolFilter.value) &&
      (search.value === '' || a.name.toLowerCase().includes(search.value.toLowerCase())),
  ),
);
/** Cap the rendered list (830 entries) for performance; filters narrow it. */
const capped = computed(() => filtered.value.slice(0, CAP));

const truncate = (s: string) => (s.length > 220 ? s.slice(0, 220) + '...' : s);

function toggle(id: string) {
  const list = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
  store.patch('artes', { selectedArteIds: list });
}
function toggleConflux(id: string) {
  const cur = store.draft.artes.selectedConfluxIds;
  const list = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  store.patch('artes', { selectedConfluxIds: list });
}
</script>

<style scoped lang="scss">
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}
.artehead {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.artelist {
  max-height: 560px;
  overflow-y: auto;
  padding-right: 0.25rem;
}
.casterbar {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.casterbar > div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.casterbar .bignum {
  font-family: var(--tof-font-heading);
  font-size: 1.5rem;
  color: var(--tof-gold);
}
.casterbar__src {
  align-items: flex-start !important;
  margin-left: auto;
}
.tof-checkline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}
</style>
