<script setup>
import { computed } from 'vue'
import { useBuilder } from '@/composables/useBuilder.js'
import { useBuilderPages } from '@/composables/useBuilderPages.js'
import { useBuildPreview } from '@/composables/useBuildPreview.js'
import { openItems } from '@/builder/review.js'
import { formatModifier } from '@/rules/index.js'
import StepFlag from './StepFlag.vue'

const { builder, steps, unfinished, isDone, go } = useBuilder()
const { pages, techniques, feats } = useBuilderPages()
const { summary, status } = useBuildPreview(() => builder.reviewing)

const open = computed(() => openItems({ draft: builder.draft, pages: pages.value, techniques: techniques.value, feats: feats.value }))
const itemsFor = (id) => (isDone(steps.value.find((s) => s.id === id)) ? [] : open.value.filter((i) => i.step === id))

const goTo = (id) => go(steps.value.findIndex((s) => s.id === id))
</script>

<template>
  <section class="review">
    <p class="review__count" :class="{ 'review__count--clear': !unfinished.length }">
      <template v-if="unfinished.length">
        {{ unfinished.length }} unfinished {{ unfinished.length === 1 ? 'step' : 'steps' }}
      </template>
      <template v-else>Every step is completed.</template>
    </p>
    <ul class="review__list">
      <li v-for="(step, i) in steps" :key="step.id" class="review__row">
        <div class="review__head">
          <StepFlag :done="isDone(step)" :mark="i + 1" />
          <button type="button" class="link review__step" @click="go(i)">{{ step.label }}</button>
        </div>
        <ul v-if="itemsFor(step.id).length" class="review__open">
          <li v-for="(item, j) in itemsFor(step.id)" :key="j">
            {{ item.text }}<small v-if="item.source" class="review__source">{{ item.source }}</small>
          </li>
        </ul>
      </li>
    </ul>

    <p v-if="status === 'loading'" class="status">Working out the character…</p>
    <p v-else-if="status !== 'ok'" class="status status--error">{{ status }}</p>
    <template v-else-if="summary">
      <p v-if="summary.failed.length" class="status status--error">Not applied: {{ summary.failed.join(' ') }}</p>

      <div class="panels">
        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('concept')">Character</button></h3>
          <dl class="pairs">
            <template v-for="[label, value] in summary.identity" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </template>
          </dl>
        </article>

        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('abilities')">Abilities</button></h3>
          <div class="abilities">
            <div v-for="a in summary.abilities" :key="a.id" class="ability">
              <span class="ability__name">{{ a.id.slice(0, 3).toUpperCase() }}</span>
              <strong class="ability__value">{{ formatModifier(a.value) }}</strong>
              <small class="ability__save" :class="{ 'ability__save--proficient': a.proficient }">Save {{ formatModifier(a.save) }}</small>
            </div>
          </div>
        </article>

        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('profession')">Combat</button></h3>
          <dl class="pairs">
            <template v-for="[label, value, kind] in summary.stats" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ kind === 'modifier' ? formatModifier(value) : value }}</dd>
            </template>
          </dl>
        </article>

        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('skills')">Skills</button></h3>
          <ul v-if="summary.skills.length" class="rows">
            <li v-for="s in summary.skills" :key="s.id">
              <span>{{ s.name }}</span>
              <span class="rows__aside">Rank {{ s.ranks }}</span>
              <strong>{{ formatModifier(s.total) }}</strong>
            </li>
          </ul>
          <p v-else class="none">None</p>
          <dl v-if="summary.proficiencies.length" class="pairs pairs--stacked">
            <template v-for="[label, list] in summary.proficiencies" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ list.join(', ') }}</dd>
            </template>
          </dl>
        </article>

        <article class="panel">
          <h3>Features</h3>
          <template v-if="summary.features.length">
            <div v-for="g in summary.features" :key="g.name" class="group">
              <h4>{{ g.name }}</h4>
              <p>{{ g.features.join(', ') }}</p>
            </div>
          </template>
          <p v-else class="none">None</p>
        </article>

        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('techniques')">Techniques</button></h3>
          <ul v-if="summary.techniques.length" class="rows">
            <li v-for="t in summary.techniques" :key="t.name">
              <span>{{ t.name }}</span>
              <span class="rows__aside">{{ t.source ?? (t.rank === 0 ? 'Prime' : `Rank ${t.rank}`) }}</span>
            </li>
          </ul>
          <p v-else class="none">None</p>
        </article>

        <article class="panel">
          <h3><button type="button" class="link" @click="goTo('equipment')">Equipment</button></h3>
          <p v-if="summary.equipment.length" class="list">{{ summary.equipment.join(', ') }}</p>
          <p v-else class="none">None</p>
          <dl class="pairs">
            <dt>Meseta</dt>
            <dd>{{ summary.meseta }}</dd>
          </dl>
        </article>
      </div>
    </template>
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
  padding: 6px 4px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
}

.review__head { display: flex; align-items: center; gap: 8px; }
.review__step { font-size: 13px; }

.review__open {
  margin: 4px 0 0 26px;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: var(--ps-text);

  li { padding: 1px 0; }
}

.review__source {
  margin-left: 6px;
  color: var(--ps-text-muted);
  font-size: 10px;
}

.status { margin: 0 0 12px; font-size: 12px; color: var(--ps-text-muted); }
.status--error { color: var(--ps-red); }

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

  &--stacked {
    margin-top: 8px;
    dd { font-weight: 400; }
  }
}

.abilities {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.ability {
  @include ps-well;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px;

  &__name { @include ps-caption; font-size: 10px; }
  &__value { font-size: 16px; color: var(--ps-text); }
  &__save { font-size: 9px; color: var(--ps-text-muted); }
  &__save--proficient { color: var(--ps-blue); font-weight: 700; }
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 12px;

  li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);

    > span:first-child { flex: 1; min-width: 0; }
  }

  &__aside { color: var(--ps-text-muted); font-size: 10px; white-space: nowrap; }
}

.group {
  h4 { @include ps-caption; font-size: 10px; margin: 4px 0 1px; }
  p { margin: 0; font-size: 12px; line-height: 1.45; }
}

.list { margin: 0 0 8px; font-size: 12px; line-height: 1.45; }
.none { margin: 0; font-size: 12px; color: var(--ps-text-muted); }
</style>
