<script setup>
import { computed } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import {
  gainedFeatures, levelUpChoices, improvementSlots, abilitiesAfter, hpGain,
  levelUpAllotments, levelUpSkillRows, levelUpProficiencies, levelUpPools,
} from '@/builder/levelUp.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import StepFlag from '@/components/builder/StepFlag.vue'

const { store, ctx, paths, steps, unfinished, isDone, go, maxTp } = useLevelUp()
const sheet = useCharacterStore()
const lu = computed(() => store.lu)

const goTo = (id) => go(steps.value.findIndex((s) => s.id === id))
const has = (id) => steps.value.some((s) => s.id === id)
const split = (value) => String(value ?? '').split('|').filter(Boolean)

const hp = computed(() => hpGain(ctx.value, lu.value, paths.value))
const maxBefore = computed(() => Number(sheet.hp.max) || 0)

const features = computed(() => gainedFeatures(ctx.value, lu.value, paths.value))
const choices = computed(() => levelUpChoices(ctx.value, lu.value, paths.value)
  .map((c) => ({ label: c.label, level: c.level, picks: c.key === 'path' ? split(lu.value.path) : split(lu.value.choices[c.key]) })))

const after = computed(() => abilitiesAfter(ctx.value, lu.value, paths.value))
const abilityChanges = computed(() => ABILITIES
  .filter((a) => after.value[a.id] !== (Number(ctx.value.abilities[a.id]) || 0))
  .map((a) => `${a.name} ${formatModifier(Number(ctx.value.abilities[a.id]) || 0)} → ${formatModifier(after.value[a.id])}`))
const featsTaken = computed(() => improvementSlots(ctx.value, lu.value, paths.value)
  .map((s) => lu.value.improvements[s.key])
  .filter((c) => c?.kind === 'feat' && c.feat)
  .map((c) => c.feat))

const skillChanges = computed(() => levelUpSkillRows(ctx.value, lu.value, levelUpAllotments(ctx.value, lu.value, paths.value))
  .filter((r) => r.placed > 0)
  .map((r) => `${r.name} ${r.before} → ${r.total}`))
const proficiencyPicks = computed(() => levelUpProficiencies(ctx.value, lu.value, paths.value)
  .flatMap((c) => split(lu.value.skills.picks[c.key]).map((v) => c.options.find((o) => o.value === v)?.name ?? v)))

const techniquesTaken = computed(() => levelUpPools(ctx.value, lu.value, paths.value)
  .flatMap((p) => split(lu.value.techniques.picks[p.key])))
</script>

<template>
  <section class="review">
    <p class="review__count" :class="{ 'review__count--clear': !unfinished.length }">
      <template v-if="unfinished.length">
        {{ unfinished.length }} unfinished {{ unfinished.length === 1 ? 'step' : 'steps' }}
      </template>
      <template v-else>Every step is done.</template>
    </p>
    <ul class="review__list">
      <li v-for="(step, i) in steps" :key="step.id" class="review__row">
        <StepFlag :done="isDone(step)" :mark="i + 1" />
        <button type="button" class="link review__step" @click="go(i)">{{ step.label }}</button>
      </li>
    </ul>

    <div class="panels">
      <article class="panel">
        <h3><button type="button" class="link" @click="goTo('levels')">Levels</button></h3>
        <dl class="pairs">
          <dt>Level</dt>
          <dd>{{ lu.from }} → {{ lu.to }}</dd>
          <dt>Max HP</dt>
          <dd v-if="hp.total != null">{{ maxBefore }} → {{ maxBefore + hp.total }} <small>(+{{ hp.total }})</small></dd>
          <dd v-else class="open">Hit dice to roll</dd>
          <template v-if="maxTp.before || maxTp.after">
            <dt>Max TP</dt>
            <dd>{{ maxTp.before }} → {{ maxTp.after }} <small v-if="maxTp.after > maxTp.before">(+{{ maxTp.after - maxTp.before }})</small></dd>
          </template>
          <template v-for="c in choices" :key="c.label">
            <dt>{{ c.label }}</dt>
            <dd v-if="c.picks.length">{{ c.picks.join(', ') }}</dd>
            <dd v-else class="open">Not chosen</dd>
          </template>
        </dl>
      </article>

      <article class="panel">
        <h3><button type="button" class="link" @click="goTo('levels')">New Features</button></h3>
        <ul v-if="features.length" class="rows">
          <li v-for="f in features" :key="`${f.source}:${f.id}:${f.level}`">
            <span class="badge">{{ f.level }}</span>
            <span>{{ f.name }}</span>
          </li>
        </ul>
        <p v-else class="none">None</p>
      </article>

      <article v-if="has('abilities')" class="panel">
        <h3><button type="button" class="link" @click="goTo('abilities')">Abilities</button></h3>
        <p v-if="abilityChanges.length" class="list">{{ abilityChanges.join(', ') }}</p>
        <p v-if="featsTaken.length" class="list">Feats: {{ featsTaken.join(', ') }}</p>
        <p v-if="!abilityChanges.length && !featsTaken.length" class="none">Not chosen</p>
      </article>

      <article v-if="has('skills')" class="panel">
        <h3><button type="button" class="link" @click="goTo('skills')">Skills</button></h3>
        <p v-if="skillChanges.length" class="list">{{ skillChanges.join(', ') }}</p>
        <p v-if="proficiencyPicks.length" class="list">{{ proficiencyPicks.join(', ') }}</p>
        <p v-if="!skillChanges.length && !proficiencyPicks.length" class="none">None placed</p>
      </article>

      <article v-if="has('techniques')" class="panel">
        <h3><button type="button" class="link" @click="goTo('techniques')">Techniques</button></h3>
        <p v-if="techniquesTaken.length" class="list">{{ techniquesTaken.join(', ') }}</p>
        <p v-else class="none">None chosen</p>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.link {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ps-heading);
  white-space: nowrap;

  &:hover { text-decoration: underline; }
}

.review__count {
  @include ps-heading(15px);
  margin: 0 0 10px;
  color: var(--ps-blue);

  &--clear { color: var(--ps-green); }
}

.review__list { list-style: none; margin: 0 0 16px; padding: 0; }

.review__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
}

.review__step { font-size: 13px; }

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--ps-gap);
  align-items: start;
}

.panel {
  @include ps-panel;
  padding: 8px 10px 10px;
  min-width: 0;

  h3 {
    @include ps-heading(14px);
    margin: 0 0 6px;
    padding-bottom: 3px;
    border-bottom: 1px solid var(--ps-line-soft);

    .link { font-size: inherit; }
  }
}

.pairs {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 3px 10px;
  margin: 0;
  font-size: 12px;

  dt { @include ps-caption; font-size: 10px; align-self: center; }
  dd { margin: 0; font-weight: 700; color: var(--ps-text); overflow-wrap: anywhere; }
  small { font-weight: 400; color: var(--ps-text-muted); }
  .open { font-weight: 400; color: var(--ps-blue); }
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 12px;

  li { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
}

.badge { @include ps-chip; min-width: 22px; justify-content: center; }
.list { margin: 0 0 6px; font-size: 12px; line-height: 1.45; }
.none { margin: 0; font-size: 12px; color: var(--ps-text-muted); }
</style>
