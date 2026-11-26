<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Stats <span class="tof-hourglass" aria-hidden="true" /></h2>
      <p class="tof-muted">
        Roll <strong>{{ STAT_CONFIG.rollFormula }}</strong> six times and assign the totals, or
        build your scores by hand. Each modifier is <code>floor((score - 10) / 2)</code>, and
        updates live in the sidebar.
      </p>

      <div class="methodtabs">
        <button
          v-for="m in methods"
          :key="m.id"
          class="tof-btn tof-btn--ghost"
          :class="{ 'tof-btn--primary': store.draft.stats.method === m.id }"
          @click="setMethod(m.id)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- ROLLING -->
    <div class="tof-panel" v-if="method === 'rolling'">
      <div class="rollmode">
        <label class="tof-card" :class="{ 'tof-card--selected': rollMode === 'bestOfThree' }">
          <input type="radio" value="bestOfThree" v-model="rollMode" /> Best of 3, roll three
          arrays, pick one
        </label>
        <label class="tof-card" :class="{ 'tof-card--selected': rollMode === 'oneChance' }">
          <input type="radio" value="oneChance" v-model="rollMode" /> One Chance, a single array, no
          reroll
        </label>
      </div>
      <button class="tof-btn tof-btn--primary" @click="store.rollArrays()">
        🎲 Roll {{ rollMode === 'bestOfThree' ? 'Three Arrays' : 'an Array' }}
      </button>

      <div
        class="tof-grid tof-grid--3"
        style="margin-top: 1rem"
        v-if="store.draft.stats.rollSets.length"
      >
        <div
          v-for="set in store.draft.stats.rollSets"
          :key="set.id"
          class="tof-card"
          :class="{ 'tof-card--selected': set.id === store.draft.stats.chosenRollSetId }"
        >
          <div class="rollvals">
            <span v-for="(v, i) in set.values" :key="i" class="rollval">{{ v }}</span>
          </div>
          <div class="tof-small tof-muted">Average {{ avg(set.values) }}</div>
          <button
            class="tof-btn tof-btn--ghost"
            style="margin-top: 0.5rem; width: 100%"
            @click="chooseSet(set.id)"
          >
            {{
              set.id === store.draft.stats.chosenRollSetId ? '✦ Chosen Fate' : 'Choose This Fate?'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- ARRAY -->
    <div class="tof-panel" v-if="method === 'array'">
      <p class="tof-muted">Pick one standard array, then assign its values below.</p>
      <div class="tof-grid tof-grid--2">
        <div
          v-for="arr in STAT_ARRAYS"
          :key="arr.id"
          class="tof-card"
          :class="{ 'tof-card--selected': arr.id === store.draft.stats.chosenRollSetId }"
          @click="chooseArray(arr)"
        >
          <strong>{{ arr.label }}</strong>
          <div class="rollvals">
            <span v-for="(v, i) in arr.values" :key="i" class="rollval">{{ v }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ATTRIBUTE CHOICE BOXES (shared across methods) -->
    <div class="tof-panel" v-if="showBoxes">
      <h3 class="tof-h3" style="margin-top: 0">
        {{
          method === 'pointBuy'
            ? 'Spend Your Points'
            : method === 'manual'
            ? 'Enter Your Scores'
            : 'Assign Your Values'
        }}
      </h3>
      <p class="tof-small tof-muted" v-if="needsAssignment">
        Each rolled value can be used once. Hover the moon for what each attribute governs.
      </p>
      <p class="tof-small tof-muted" v-else-if="method === 'pointBuy'">
        Each attribute starts at {{ STAT_CONFIG.pointBuyBase }} (max {{ STAT_CONFIG.pointBuyMax }}).
        Hover the moon for details.
      </p>
      <p class="tof-small tof-muted" v-else>
        Enter each score directly ({{ STAT_CONFIG.minScore }}-{{ STAT_CONFIG.maxScoreAtCreation }}).
      </p>

      <div class="attrgrid">
        <div v-for="attr in ATTRIBUTES" :key="attr.key" class="attrbox">
          <span class="attrbox__moon" :title="attr.description" />
          <span class="attrbox__name">{{ attr.label }}</span>
          <span class="attrbox__score">{{ displayScore(attr.key) }}</span>
          <span class="attrbox__mod">{{ formatModifier(store.modifiers[attr.key]) }}</span>

          <div class="attrbox__ctrl">
            <div v-if="method === 'pointBuy'" class="choicepill">
              <button @click="adjust(attr.key, -1)" aria-label="Decrease">-</button>
              <button @click="adjust(attr.key, 1)" aria-label="Increase">+</button>
            </div>
            <input
              v-else-if="method === 'manual'"
              class="tof-input attrbox__input"
              type="number"
              :min="STAT_CONFIG.minScore"
              :max="STAT_CONFIG.maxScoreAtCreation"
              :value="store.draft.stats.assigned[attr.key] ?? ''"
              @input="manualSet(attr.key, ($event.target as HTMLInputElement).value)"
            />
            <select
              v-else
              class="tof-select attrbox__select"
              :value="store.draft.stats.assigned[attr.key] ?? ''"
              @change="assignSlot(attr.key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">,</option>
              <option v-for="(v, i) in optionsFor(attr.key)" :key="i" :value="v">{{ v }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="totalbox">
        <span class="totalbox__label">{{
          method === 'pointBuy' ? 'Points Remaining' : 'Assigned'
        }}</span>
        <span class="totalbox__val" :class="{ 'tof-warn': method === 'pointBuy' && remaining < 0 }">
          {{
            method === 'pointBuy'
              ? `${remaining} / ${STAT_CONFIG.pointBuyPoints}`
              : `${assignedCount} / 6`
          }}
        </span>
      </div>
      <p v-if="racialNote" class="tof-small tof-ok" style="margin-top: 0.6rem">{{ racialNote }}</p>
    </div>

    <StepWarnings step="stats" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { ATTRIBUTES } from '@/maker/data/attributes';
import { STAT_CONFIG, STAT_ARRAYS } from '@/maker/data/constants';
import { formatModifier, pointBuyRemaining } from '@/maker/rules/stats';
import { draftRacialBonuses } from '@/maker/rules/selectors';
import type { AttributeKey, StatMethod } from '@/maker/types';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();

const methods: { id: StatMethod; label: string }[] = [
  { id: 'rolling', label: 'Rolling' },
  { id: 'pointBuy', label: 'Point Buy' },
  { id: 'array', label: 'Standard Array' },
  { id: 'manual', label: 'Manual' },
];

const method = computed(() => store.draft.stats.method);
const rollMode = computed({
  get: () => store.draft.stats.rollMode,
  set: (v) => (store.draft.stats.rollMode = v),
});
const needsAssignment = computed(() => method.value === 'rolling' || method.value === 'array');

/** Show the attribute boxes once there's something to edit/assign. */
const showBoxes = computed(
  () =>
    method.value === 'pointBuy' ||
    method.value === 'manual' ||
    (needsAssignment.value && pool.value.length > 0),
);
const assignedCount = computed(
  () => ATTRIBUTES.filter((a) => typeof store.draft.stats.assigned[a.key] === 'number').length,
);
function displayScore(key: AttributeKey): number | string {
  const v = store.draft.stats.assigned[key];
  if (method.value === 'pointBuy') return v ?? STAT_CONFIG.pointBuyBase;
  return typeof v === 'number' ? v : ', ';
}

const pool = computed<number[]>(() => {
  if (method.value === 'array' || method.value === 'rolling') {
    const set = store.draft.stats.rollSets.find((s) => s.id === store.draft.stats.chosenRollSetId);
    return set ? set.values : [];
  }
  return [];
});

const remaining = computed(() => pointBuyRemaining(baseRecord()));

function baseRecord() {
  return ATTRIBUTES.reduce((acc, a) => {
    acc[a.key] = store.draft.stats.assigned[a.key] ?? STAT_CONFIG.pointBuyBase;
    return acc;
  }, {} as Record<AttributeKey, number>);
}

function setMethod(m: StatMethod) {
  store.draft.stats.method = m;
  store.clearAssigned();
  store.draft.stats.chosenRollSetId = null;
  if (m === 'pointBuy') {
    ATTRIBUTES.forEach((a) => store.assign(a.key, STAT_CONFIG.pointBuyBase));
  }
}

function chooseSet(id: string) {
  store.chooseRollSet(id);
  store.clearAssigned();
}
function chooseArray(arr: { id: string; values: number[] }) {
  // Reuse rollSets to hold the chosen array's values.
  store.draft.stats.rollSets = [{ id: arr.id, values: [...arr.values] }];
  store.chooseRollSet(arr.id);
  store.clearAssigned();
}

const avg = (vals: number[]) => (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);

/** Multiset-aware options for an attribute (pool minus values used by others). */
function optionsFor(attr: AttributeKey): number[] {
  const counts = new Map<number, number>();
  pool.value.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  ATTRIBUTES.forEach((a) => {
    if (a.key === attr) return;
    const v = store.draft.stats.assigned[a.key];
    if (typeof v === 'number') counts.set(v, (counts.get(v) ?? 0) - 1);
  });
  const opts = [...counts.entries()].filter(([, c]) => c > 0).map(([v]) => v);
  const current = store.draft.stats.assigned[attr];
  if (typeof current === 'number' && !opts.includes(current)) opts.push(current);
  return opts.sort((a, b) => b - a);
}

function assignSlot(attr: AttributeKey, raw: string) {
  store.assign(attr, raw === '' ? null : Number(raw));
}
function manualSet(attr: AttributeKey, raw: string) {
  store.assign(attr, raw === '' ? null : Number(raw));
}
function adjust(attr: AttributeKey, delta: number) {
  const cur = store.draft.stats.assigned[attr] ?? STAT_CONFIG.pointBuyBase;
  const next = Math.min(STAT_CONFIG.pointBuyMax, Math.max(STAT_CONFIG.pointBuyMin, cur + delta));
  if (delta > 0 && remaining.value <= 0) return;
  store.assign(attr, next);
}

const racialNote = computed(() => {
  const bonuses = draftRacialBonuses(store.draft);
  const parts = ATTRIBUTES.filter((a) => bonuses[a.key]).map(
    (a) => `${a.label} ${formatModifier(bonuses[a.key])}`,
  );
  return parts.length ? `Racial bonuses applied: ${parts.join(', ')}` : '';
});
</script>

<style scoped lang="scss">
.methodtabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}
.rollmode {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.rollvals {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin: 0.4rem 0;
}
.rollval {
  font-weight: 700;
  color: var(--tof-gold);
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  padding: 0.15rem 0.5rem;
}
/* Attribute choice-box grid ,  each box uses the official chamfered frame. */
.attrgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 0.75rem 0 1.1rem;
}
@media (max-width: 720px) {
  .attrgrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.attrbox {
  position: relative;
  min-height: 158px;
  padding: 1.1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  text-align: center;
}
.attrbox::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ui-attr-box) center / 100% 100% no-repeat;
  filter: var(--ui-tint) drop-shadow(0 0 1px rgba(235, 167, 46, 0.35));
  opacity: 0.9;
  pointer-events: none;
}
.attrbox > * {
  position: relative;
  z-index: 1;
}
.attrbox__moon {
  position: absolute;
  top: 0.6rem;
  right: 0.7rem;
  width: 15px;
  height: 15px;
  background: var(--ui-moon) center / contain no-repeat;
  filter: var(--ui-tint);
  opacity: 0.85;
  cursor: help;
  z-index: 2;
}
.attrbox__name {
  font-family: var(--tof-font-subheading);
  font-size: 0.95rem;
}
.attrbox__score {
  font-family: var(--tof-font-heading);
  font-size: 2rem;
  line-height: 1;
  color: var(--tof-gold);
}
.attrbox__mod {
  color: var(--tof-accent-blue);
  font-size: 0.9rem;
}
.attrbox__ctrl {
  margin-top: 0.5rem;
}
.attrbox__input,
.attrbox__select {
  max-width: 96px;
  text-align: center;
}

/* Choice-button pill for point-buy +/- */
.choicepill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 1.4rem;
  padding: 0.3rem 1.4rem;
}
.choicepill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ui-attr-button) center / 100% 100% no-repeat;
  filter: var(--ui-tint);
  opacity: 0.9;
  pointer-events: none;
}
.choicepill button {
  position: relative;
  z-index: 1;
  background: none;
  border: none;
  color: var(--tof-cream);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}
.choicepill button:hover {
  color: var(--tof-gold);
  text-shadow: 0 0 8px var(--tof-gold);
}

/* Total box (open-top frame) */
.totalbox {
  position: relative;
  margin: 0.25rem auto 0;
  max-width: 320px;
  padding: 1.1rem 2rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.totalbox::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ui-total-box) center / 100% 100% no-repeat;
  filter: var(--ui-tint);
  opacity: 0.9;
  pointer-events: none;
}
.totalbox > * {
  position: relative;
  z-index: 1;
}
.totalbox__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c9c3da;
}
.totalbox__val {
  font-family: var(--tof-font-heading);
  font-size: 1.5rem;
  color: var(--tof-gold);
}
</style>
