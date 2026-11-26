<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Choosing Your Class</h2>
      <p class="tof-muted">
        Your class determines your hit dice, hit points, party roles, and the Aspects you may grow
        into at level {{ LEVEL_CONFIG.aspectUnlock }}. Multiclassing unlocks at level
        {{ LEVEL_CONFIG.multiclassUnlock }} (up to {{ LEVEL_CONFIG.maxClasses }} classes,
        {{ LEVEL_CONFIG.maxAspects }} aspects).
      </p>
      <label class="tof-label"
        >Starting Level ({{ LEVEL_CONFIG.min }}-{{ LEVEL_CONFIG.max }})</label
      >
      <input
        class="tof-input"
        type="number"
        style="max-width: 120px"
        :min="LEVEL_CONFIG.min"
        :max="LEVEL_CONFIG.max"
        :value="cb.startingLevel"
        @input="setStartingLevel($event)"
      />
      <label class="tof-checkline">
        <input
          type="checkbox"
          :checked="cb.useAverageHp"
          @change="patch({ useAverageHp: ($event.target as HTMLInputElement).checked })"
        />
        Use average HP for levels beyond the first (uncheck to take max each level)
      </label>
    </div>

    <div class="tof-panel" v-if="cb.startingLevel === 0">
      <h3 class="tof-h3" style="margin-top: 0">Level 0, Unclassed</h3>
      <p class="tof-muted">
        Level 0 characters have no class yet. Your Health, Quick Rest healing, and Stamina are
        derived directly from your Might and Conviction. Set a level of 1+ to choose a class.
      </p>
      <div class="tof-grid tof-grid--3">
        <div><span class="tof-label">Health</span> {{ store.derived.health }}</div>
        <div><span class="tof-label">Quick Rest Heal</span> {{ store.derived.quickRestHeal }}</div>
        <div><span class="tof-label">Stamina</span> {{ store.derived.stamina }}</div>
      </div>
    </div>

    <div class="tof-panel" v-else>
      <h3 class="tof-h3" style="margin-top: 0">Classes</h3>
      <div v-for="(c, idx) in cb.classes" :key="idx" class="classrow">
        <span class="classrow__tag">{{ idx === 0 ? 'Primary' : 'Multiclass ' + idx }}</span>
        <select class="tof-select" :value="c.classId" @change="setClassId(idx, $event)">
          <option value="">, Choose a class,</option>
          <option v-for="cl in CLASSES" :key="cl.id" :value="cl.id">
            {{ cl.name }}{{ cl.todo ? ', preview' : '' }} ({{ cl.roles.map(roleName).join('/') }})
          </option>
        </select>
        <input
          class="tof-input"
          type="number"
          style="max-width: 80px"
          min="1"
          :value="c.level"
          @input="setClassLevel(idx, $event)"
        />
        <button class="tof-btn tof-btn--danger tof-small" @click="removeClass(idx)">x</button>
      </div>
      <button
        class="tof-btn tof-btn--ghost"
        style="margin-top: 0.5rem"
        :disabled="!canAddClass"
        @click="addClass"
      >
        + Add Class
      </button>
      <p class="tof-small tof-muted">
        Total class levels: {{ totalClassLevels }} (character level {{ store.level }})
      </p>
    </div>

    <!-- Class detail -->
    <div class="tof-panel" v-for="cl in selectedClasses" :key="cl.id">
      <h3 class="tof-h3" style="margin-top: 0">
        {{ cl.name }}
        <span v-if="cl.todo" class="tof-tag tof-tag--todo">preview, full rules pending</span>
      </h3>
      <div class="tof-grid tof-grid--3">
        <div><span class="tof-label">Roles</span> {{ cl.roles.map(roleName).join(', ') }}</div>
        <div><span class="tof-label">Hit Die</span> 1d{{ cl.hitDie }}</div>
        <div><span class="tof-label">Magic</span> {{ cl.casterType }}</div>
        <div v-if="cl.idealRange">
          <span class="tof-label">Ideal Range</span> {{ cl.idealRange }}
        </div>
        <div v-if="cl.saves"><span class="tof-label">Saves</span> {{ cl.saves.join(', ') }}</div>
        <div v-if="cl.skillChoices">
          <span class="tof-label">Talents</span> Choose {{ cl.skillChoices.count }}
        </div>
      </div>
      <div
        class="tof-small tof-muted"
        v-if="cl.weaponProficiencies || cl.armorProficiencies"
        style="margin-top: 0.35rem"
      >
        <span v-if="cl.weaponProficiencies"
          ><strong>Weapons:</strong> {{ cl.weaponProficiencies.join(', ') }}.</span
        >
        <span v-if="cl.armorProficiencies">
          <strong>Armor:</strong> {{ cl.armorProficiencies.join(', ') }}.</span
        >
      </div>
      <div v-if="cl.traits" style="margin: 0.35rem 0">
        <span v-for="t in cl.traits" :key="t" class="tof-tag">{{ t }}</span>
      </div>
      <p class="tof-muted">{{ cl.summary }}</p>

      <details v-if="cl.features.length" class="features">
        <summary class="tof-label" style="cursor: pointer">
          Class Features ({{ cl.features.length }})
        </summary>
        <div v-for="f in sortedFeatures(cl)" :key="f.id" class="feature">
          <strong>{{ f.level ? `Lv ${f.level}, ` : '' }}{{ f.name }}</strong>
          <span v-if="f.todo" class="tof-tag tof-tag--todo">confirm wording</span>
          <p class="tof-small tof-muted">{{ f.description }}</p>
        </div>
      </details>
    </div>

    <!-- Growth (Attribute Score Increases) -->
    <div class="tof-panel" v-if="growthAvail > 0">
      <h3 class="tof-h3" style="margin-top: 0">Growth, Attribute Score Increases</h3>
      <p class="tof-small tof-muted">
        At levels {{ GROWTH_MILESTONES.join(', ') }} you gain +2 to one attribute (or +1 to two).
        You have
        <strong :class="{ 'tof-warn': growthRemaining < 0 }">{{ growthRemaining }}</strong> of
        {{ growthAvail }} points left to allocate. (You may instead take feats/Disciplines for some,
        track those separately.)
      </p>
      <div v-for="attr in ATTRIBUTES" :key="attr.key" class="stepper">
        <span class="stepper__label">{{ attr.label }}</span>
        <button class="tof-btn tof-btn--ghost" @click="adjustGrowth(attr.key, -1)">-</button>
        <span class="stepper__val">+{{ cb.growth[attr.key] || 0 }}</span>
        <button class="tof-btn tof-btn--ghost" @click="adjustGrowth(attr.key, 1)">+</button>
        <span class="stepper__final">-> {{ store.finalScores[attr.key] }}</span>
      </div>
    </div>

    <!-- Class skills -->
    <div class="tof-panel" v-if="primaryClass?.skillChoices">
      <h3 class="tof-h3" style="margin-top: 0">Class Talent Proficiencies</h3>
      <p class="tof-small tof-muted">
        Choose {{ primaryClass.skillChoices.count }} from {{ primaryClass.name }}'s list ({{
          cb.classSkills.length
        }}
        chosen).
      </p>
      <div class="chips">
        <label
          v-for="sk in primaryClass.skillChoices.options"
          :key="sk"
          class="tof-tag skillpick"
          :class="{ 'skillpick--on': cb.classSkills.includes(sk) }"
        >
          <input
            type="checkbox"
            :checked="cb.classSkills.includes(sk)"
            @change="toggleClassSkill(sk)"
          />
          {{ sk }}
        </label>
      </div>
    </div>

    <!-- Aspects -->
    <div
      class="tof-panel"
      v-if="cb.startingLevel >= LEVEL_CONFIG.aspectUnlock && cb.classes.length"
    >
      <h3 class="tof-h3" style="margin-top: 0">Aspects</h3>
      <p class="tof-small tof-muted">Available aspects are drawn from your classes' roles.</p>
      <div v-for="(a, idx) in cb.aspects" :key="idx" class="classrow">
        <span class="classrow__tag">Aspect {{ idx + 1 }}</span>
        <select class="tof-select" :value="a.aspectId" @change="setAspect(idx, $event)">
          <option value="">, Choose an aspect,</option>
          <option v-for="asp in availableAspects" :key="asp.id" :value="asp.id">
            {{ asp.name }}
          </option>
        </select>
        <button class="tof-btn tof-btn--danger tof-small" @click="removeAspect(idx)">x</button>
      </div>
      <button
        class="tof-btn tof-btn--ghost"
        style="margin-top: 0.5rem"
        :disabled="cb.aspects.length >= LEVEL_CONFIG.maxAspects"
        @click="addAspect"
      >
        + Add Aspect
      </button>

      <div v-for="asp in chosenAspectDefs" :key="asp.id" class="aspectdetail">
        <strong class="tof-h3" style="display: block; margin: 0.5rem 0 0">{{ asp.name }}</strong>
        <div v-if="asp.prerequisite" class="tof-small tof-warn--soft">
          Prerequisite: {{ asp.prerequisite }}
        </div>
        <div class="tof-small">
          <span class="tof-label" style="display: inline">Available to</span>
          {{ asp.availableTo.join(', ') }}
        </div>
        <p class="tof-small tof-muted" style="font-style: italic">{{ asp.flavor }}</p>
        <details>
          <summary class="tof-label" style="cursor: pointer">
            Aspect Features ({{ asp.features.length }})
          </summary>
          <div v-for="(f, i) in asp.features" :key="i" class="feature">
            <strong>Lv {{ f.level }}, {{ f.name }}</strong>
            <div
              v-if="f.quote"
              class="tof-small"
              style="color: var(--tof-accent-blue); font-style: italic"
            >
              {{ f.quote }}
            </div>
            <p class="tof-small tof-muted">{{ f.description }}</p>
          </div>
        </details>
      </div>
    </div>

    <StepWarnings step="class" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { LEVEL_CONFIG } from '@/maker/data/constants';
import { CLASSES, classById, roleById, aspectsForClass, aspectById } from '@/maker/data';
import { ATTRIBUTES } from '@/maker/data/attributes';
import { GROWTH_MILESTONES, growthPointsAvailable, growthAllocated } from '@/maker/rules/selectors';
import type { ClassDef, AttributeKey } from '@/maker/types';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const cb = computed(() => store.draft.classBuild);
const patch = (v: Partial<typeof cb.value>) => store.patch('classBuild', v);

const roleName = (id: string) => roleById[id]?.name ?? id;
const sortedFeatures = (cl: ClassDef) =>
  [...cl.features].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

const primaryClass = computed(() =>
  cb.value.classes[0]?.classId ? classById[cb.value.classes[0].classId] : null,
);
function toggleClassSkill(sk: string) {
  const max = primaryClass.value?.skillChoices?.count ?? 0;
  let next = cb.value.classSkills.includes(sk)
    ? cb.value.classSkills.filter((s) => s !== sk)
    : [...cb.value.classSkills, sk];
  if (next.length > max) next = next.slice(next.length - max);
  patch({ classSkills: next });
}

const growthAvail = computed(() => growthPointsAvailable(store.level));
const growthRemaining = computed(() => growthAvail.value - growthAllocated(store.draft));
function adjustGrowth(attr: AttributeKey, delta: number) {
  const cur = cb.value.growth[attr] || 0;
  if (delta > 0 && growthRemaining.value <= 0) return;
  if (delta > 0 && store.finalScores[attr] >= 30) return; // cap attributes at 30
  const next = Math.max(0, cur + delta);
  patch({ growth: { ...cb.value.growth, [attr]: next } });
}
const totalClassLevels = computed(() => cb.value.classes.reduce((s, c) => s + (c.level || 0), 0));
const selectedClasses = computed(() =>
  cb.value.classes.map((c) => classById[c.classId]).filter(Boolean),
);

const canAddClass = computed(() => {
  if (cb.value.classes.length === 0) return true;
  if (cb.value.classes.length >= LEVEL_CONFIG.maxClasses) return false;
  return store.level >= LEVEL_CONFIG.multiclassUnlock;
});

const chosenAspectDefs = computed(() =>
  cb.value.aspects.map((a) => aspectById[a.aspectId]).filter(Boolean),
);

const availableAspects = computed(() => {
  const set = new Map<string, ReturnType<typeof aspectsForClass>[number]>();
  cb.value.classes.forEach((c) => aspectsForClass(c.classId).forEach((a) => set.set(a.id, a)));
  return [...set.values()];
});

function setStartingLevel(e: Event) {
  let v = Number((e.target as HTMLInputElement).value);
  v = Math.max(LEVEL_CONFIG.min, Math.min(LEVEL_CONFIG.max, v || 0));
  const next: Partial<typeof cb.value> = { startingLevel: v };
  if (v === 0) {
    next.classes = [];
    next.aspects = [];
  } else if (cb.value.classes.length === 1) {
    // Keep a single class's level in sync with the character level.
    next.classes = [{ ...cb.value.classes[0], level: v }];
  }
  patch(next);
}
function addClass() {
  const remaining = Math.max(1, cb.value.startingLevel - totalClassLevels.value);
  patch({
    classes: [
      ...cb.value.classes,
      { classId: '', level: cb.value.classes.length === 0 ? cb.value.startingLevel : remaining },
    ],
  });
}
function removeClass(idx: number) {
  patch({ classes: cb.value.classes.filter((_, i) => i !== idx) });
}
function setClassId(idx: number, e: Event) {
  const classes = cb.value.classes.map((c, i) =>
    i === idx ? { ...c, classId: (e.target as HTMLSelectElement).value } : c,
  );
  patch({ classes });
}
function setClassLevel(idx: number, e: Event) {
  const lvl = Math.max(1, Number((e.target as HTMLInputElement).value) || 1);
  const classes = cb.value.classes.map((c, i) => (i === idx ? { ...c, level: lvl } : c));
  patch({ classes });
}
function addAspect() {
  patch({ aspects: [...cb.value.aspects, { aspectId: '' }] });
}
function removeAspect(idx: number) {
  patch({ aspects: cb.value.aspects.filter((_, i) => i !== idx) });
}
function setAspect(idx: number, e: Event) {
  const aspects = cb.value.aspects.map((a, i) =>
    i === idx ? { aspectId: (e.target as HTMLSelectElement).value } : a,
  );
  patch({ aspects });
}
</script>

<style scoped lang="scss">
.classrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.classrow__tag {
  width: 6.5rem;
  font-size: 0.8rem;
  color: var(--tof-accent-blue);
}
.classrow select {
  flex: 1;
}
.checkline,
.tof-checkline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.feature {
  padding: 0.4rem 0;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.skillpick {
  cursor: pointer;
}
.skillpick--on {
  background: rgba(235, 167, 46, 0.25);
  border-color: var(--tof-gold);
}
.stepper {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0;
}
.stepper__label {
  width: 7rem;
  font-family: var(--tof-font-subheading);
}
.stepper__val {
  min-width: 2.5rem;
  text-align: center;
  font-weight: 700;
  color: var(--tof-gold);
}
.stepper__final {
  color: var(--tof-accent-blue);
  font-size: 0.9rem;
}
</style>
