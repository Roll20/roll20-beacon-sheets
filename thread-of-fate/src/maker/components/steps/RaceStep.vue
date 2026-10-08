<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Choosing Your Race</h2>
      <p class="tof-muted">
        Your race is the kind of creature you are, your senses, your lifespan, your innate gifts.
        Choose a race, and a subrace if it has them.
      </p>
      <div class="tof-grid tof-grid--3">
        <div class="tof-label">Race</div>
        <div class="tof-label" v-if="race && race.subraces.length">Subrace</div>
        <div class="tof-label" v-if="race?.skillChoices">Talent Proficiencies</div>
      </div>
      <div class="tof-grid tof-grid--3">
        <select class="tof-select" :value="raceId || ''" @change="selectRace($event)">
          <option value="">, Choose,</option>
          <option v-for="r in RACES" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select
          v-if="race && race.subraces.length"
          class="tof-select"
          :value="subraceId || ''"
          @change="selectSubrace($event)"
        >
          <option value="">, Choose,</option>
          <option v-for="s in race.subraces" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <div v-if="race?.skillChoices" class="tof-small tof-muted">
          Choose {{ race.skillChoices.count }} ({{ race.selectedSkillsCount }} chosen)
        </div>
      </div>
    </div>

    <div class="tof-panel" v-if="race">
      <h3 class="tof-h3" style="margin-top: 0">{{ race.name }}</h3>
      <p class="tof-muted">{{ race.bio }}</p>
      <div class="tof-grid tof-grid--2 racefacts">
        <div>
          <span class="tof-label">Classification</span> {{ race.classificationTags.join(', ') }}
        </div>
        <div><span class="tof-label">Lifespan</span> {{ race.averageLifespan }}</div>
        <div><span class="tof-label">Size</span> {{ race.sizeClass }}</div>
        <div><span class="tof-label">Senses</span> {{ race.senses }}</div>
        <div><span class="tof-label">Movement</span> {{ race.movementSpeed }}</div>
        <div><span class="tof-label">Needs</span> {{ race.biologicalNeeds }}</div>
      </div>

      <h4 class="tof-h3">Racial Traits</h4>
      <div v-for="t in race.traits" :key="t.name" class="feature">
        <strong>{{ t.name }}</strong>
        <p class="tof-small tof-muted">{{ t.description }}</p>
      </div>

      <template v-if="race.skillChoices">
        <h4 class="tof-h3">Choose {{ race.skillChoices.count }} Talent Proficiencies</h4>
        <div class="chips">
          <label
            v-for="sk in race.skillChoices.options"
            :key="sk"
            class="tof-tag skillpick"
            :class="{ 'skillpick--on': skills.includes(sk) }"
          >
            <input type="checkbox" :checked="skills.includes(sk)" @change="toggleSkill(sk)" />
            {{ sk }}
          </label>
        </div>
      </template>
    </div>

    <div class="tof-panel" v-if="subrace">
      <h3 class="tof-h3" style="margin-top: 0">{{ subrace.name }}</h3>
      <span v-if="subrace.todo" class="tof-tag tof-tag--todo">in development</span>
      <div v-for="t in subrace.traits" :key="t.name" class="feature">
        <strong>{{ t.name }}</strong>
        <p class="tof-small tof-muted">{{ t.description }}</p>
      </div>
      <p v-if="bonusNote" class="tof-ok tof-small">{{ bonusNote }}</p>
    </div>

    <StepWarnings step="race" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { RACES, raceById } from '@/maker/data';
import { ATTRIBUTE_LABELS } from '@/maker/data/attributes';
import { formatModifier } from '@/maker/rules/stats';
import { selectedSubrace } from '@/maker/rules/selectors';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const raceId = computed(() => store.draft.race.selectedRaceId);
const subraceId = computed(() => store.draft.race.selectedSubraceId);
const skills = computed(() => store.draft.race.selectedSkills);

const race = computed(() => {
  if (!raceId.value) return null;
  const r = raceById[raceId.value];
  return r ? { ...r, selectedSkillsCount: skills.value.length } : null;
});
const subrace = computed(() => selectedSubrace(store.draft));

const bonusNote = computed(() => {
  if (!subrace.value) return '';
  const parts = subrace.value.attributeBonuses.map(
    (b) => `${ATTRIBUTE_LABELS[b.attribute]} ${formatModifier(b.bonus)}`,
  );
  return parts.length ? `Attribute bonuses: ${parts.join(', ')}` : '';
});

function selectRace(e: Event) {
  const v = (e.target as HTMLSelectElement).value || null;
  store.patch('race', { selectedRaceId: v, selectedSubraceId: null, selectedSkills: [] });
}
function selectSubrace(e: Event) {
  store.patch('race', { selectedSubraceId: (e.target as HTMLSelectElement).value || null });
}
function toggleSkill(sk: string) {
  const max = race.value?.skillChoices?.count ?? 0;
  let next = skills.value.includes(sk)
    ? skills.value.filter((s) => s !== sk)
    : [...skills.value, sk];
  if (next.length > max) next = next.slice(next.length - max);
  store.patch('race', { selectedSkills: next });
}
</script>

<style scoped lang="scss">
.racefacts > div {
  font-size: 0.9rem;
}
.racefacts .tof-label {
  display: inline;
  margin-right: 0.4rem;
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
</style>
