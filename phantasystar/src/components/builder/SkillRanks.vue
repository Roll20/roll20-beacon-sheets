<script setup>
import { SKILLS } from '@/rules/skills.js'
import { placedIn, allotmentSpent } from '@/builder/skills.js'
import PendingChoice from './PendingChoice.vue'
import StepFlag from './StepFlag.vue'

const props = defineProps({
  allotments: { type: Array, required: true },
  rows: { type: Array, required: true },
  choices: { type: Array, required: true },
  model: { type: Object, required: true },
  fixedLabel: { type: String, default: 'from your origin' },
})

const abbr = (ability) => ability.slice(0, 3).toUpperCase()
const nameOf = (id) => SKILLS.find((s) => s.id === id)?.name ?? id

const placed = (a) => placedIn(props.model, a.key)
const spent = (a) => allotmentSpent(a, props.model)
const eligible = (a) => (a.from ? SKILLS.filter((s) => a.from.includes(s.id)) : SKILLS)
const rowOf = (id) => props.rows.find((r) => r.id === id)

const setPlaced = (a, next) => {
  props.model.ranks = { ...props.model.ranks, [a.key]: next }
}

const room = (id) => {
  const row = rowOf(id)
  return row ? row.cap - row.total : 0
}

const togglePick = (a, id) => {
  const next = { ...placed(a) }
  if (next[id]) delete next[id]
  else {
    if (Object.keys(next).length >= a.count || room(id) <= 0) return
    next[id] = Math.min(a.ranks, room(id))
  }
  setPlaced(a, next)
}

const canAdd = (a, id) => spent(a) < a.total && rowOf(id)?.total < rowOf(id)?.cap
const addPoint = (a, id) => {
  if (!canAdd(a, id)) return
  setPlaced(a, { ...placed(a), [id]: (placed(a)[id] ?? 0) + 1 })
}
const removePoint = (a, id) => {
  const next = { ...placed(a) }
  next[id] = (next[id] ?? 0) - 1
  if (next[id] <= 0) delete next[id]
  setPlaced(a, next)
}

const pickedIn = (key) => String(props.model.picks[key] ?? '').split('|').filter(Boolean)
const pickChoice = (c) => {
  const chosen = pickedIn(c.key)
  const elsewhere = c.doubling
    ? props.choices.filter((x) => x.doubling && x.key !== c.key).flatMap((x) => pickedIn(x.key))
    : []
  const options = c.options.filter((o) => {
    if (chosen.includes(o.value)) return true
    const row = rowOf(o.value.split(':')[1])
    if (c.ranked && !(row?.total > 0)) return false
    return !c.doubling || (!row?.doubled && !elsewhere.includes(o.value))
  })
  return {
    key: c.key,
    label: `${c.label.charAt(0).toUpperCase()}${c.label.slice(1)} (${c.source})`,
    count: Math.min(c.count, c.options.length),
    options,
  }
}

const setPick = (key, value) => {
  const next = { ...props.model.picks }
  if (value) next[key] = value
  else delete next[key]
  if (!key.endsWith(':fixed')) for (const k of Object.keys(next)) if (k.startsWith(`${key}:`)) delete next[k]
  props.model.picks = next
}
</script>

<template>
  <div class="layout">
    <section class="allotments">
      <h3 class="section-title">Skill Ranks</h3>
      <p v-if="!allotments.length" class="empty">No ranks to place yet.</p>
      <article v-for="(a, n) in allotments" :key="a.key" class="allotment">
        <header class="allotment__head">
          <StepFlag :done="spent(a) === a.total" :mark="n + 1" />
          <span class="allotment__label">{{ a.label }}</span>
          <span class="allotment__source">{{ a.source }}</span>
          <span class="allotment__count">{{ spent(a) }}/{{ a.total }}</span>
        </header>
        <div class="chips">
          <template v-for="s in eligible(a)" :key="s.id">
            <button
              v-if="a.mode === 'pick'"
              type="button"
              class="chip"
              :class="{ 'chip--on': placed(a)[s.id] }"
              :aria-pressed="!!placed(a)[s.id]"
              :disabled="!placed(a)[s.id] && room(s.id) <= 0"
              :title="!placed(a)[s.id] && room(s.id) <= 0 ? 'At the max skill rank' : undefined"
              @click="togglePick(a, s.id)"
            >{{ s.name }}<b v-if="placed(a)[s.id]"> +{{ placed(a)[s.id] }}</b></button>
            <span v-else class="chip-group" :class="{ 'chip-group--on': placed(a)[s.id] }">
              <button type="button" class="chip" :disabled="!canAdd(a, s.id)" :aria-label="`Add a rank to ${s.name}`" @click="addPoint(a, s.id)">
                {{ s.name }}<b v-if="placed(a)[s.id]"> +{{ placed(a)[s.id] }}</b>
              </button>
              <button v-if="placed(a)[s.id]" type="button" class="chip chip--minus" :aria-label="`Remove a rank from ${s.name}`" @click="removePoint(a, s.id)">−</button>
            </span>
          </template>
        </div>
      </article>

      <h3 class="section-title">Proficiencies</h3>
      <p v-if="!choices.length" class="empty">No proficiencies to choose yet.</p>
      <div class="pending">
        <template v-for="c in choices" :key="c.key">
          <PendingChoice
            v-if="c.options.length"
            :number="choices.filter((x) => x.options.length).indexOf(c) + 1"
            :choice="pickChoice(c)"
            :model-value="model.picks[c.key] ?? ''"
            @update:model-value="setPick(c.key, $event)"
          />
          <p v-else class="sheet-note">{{ c.label }} <span class="later__step">Sheet</span></p>
        </template>
      </div>
    </section>

    <aside class="table">
      <table>
        <thead>
          <tr><th class="table__name">Skill</th><th>Ranks</th><th>Max</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" :class="{ 'row--ranked': r.total }">
            <td class="table__name">{{ nameOf(r.id) }} <small>{{ abbr(r.ability) }}</small></td>
            <td>
              <span class="pips" :class="{ 'pips--over': r.overCap }" :title="r.fixed ? `${r.fixed} ${fixedLabel}` : ''">
                <i v-for="n in Math.max(r.cap, r.total)" :key="n" :class="{ fixed: n <= r.fixed, placed: n > r.fixed && n <= r.total, over: n > r.cap }" />
              </span>
            </td>
            <td class="table__cap">{{ r.cap }}</td>
          </tr>
        </tbody>
      </table>
    </aside>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.empty { margin: 4px; font-size: 12px; color: var(--ps-text-muted); }

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 18px;
  align-items: start;
}

.section-title {
  @include ps-heading(15px);
  margin: 10px 0 6px;

  &:first-child { margin-top: 0; }
}

.allotment {
  padding: 8px 0 10px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
}

.allotment__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.allotment__label { font-weight: 700; color: var(--ps-heading); font-size: 13px; }
.allotment__source { @include ps-chip; }
.allotment__count { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--ps-text-muted); }

.chips { display: flex; flex-wrap: wrap; gap: 4px; }

.chip {
  @include ps-chip(true);
  cursor: pointer;
  font-size: 10.5px;
  padding: 3px 8px;

  &:disabled { opacity: 0.4; cursor: default; }
  &--on { background: var(--ps-blue); color: #fff; border-color: var(--ps-blue); }
  b { font-weight: 800; }
}

.chip-group {
  display: inline-flex;

  &--on .chip:first-child { background: var(--ps-blue); color: #fff; border-color: var(--ps-blue); opacity: 1; }
  &--on .chip:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }
}

.chip--minus { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: none; padding: 3px 6px; }

.sheet-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 4px;
  font-size: 12px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
}

.later__step { @include ps-chip; margin-left: auto; }

.table {
  position: sticky;
  top: 8px;
  @include ps-panel;
  padding: 6px 8px;

  table { width: 100%; border-collapse: collapse; }

  th {
    @include ps-caption;
    padding: 2px 4px 4px;
    border-bottom: 1.5px solid var(--ps-line);
    text-align: center;
  }

  td { padding: 2px 4px; font-size: 11.5px; text-align: center; }

  .table__name {
    text-align: left;
    small { color: var(--ps-text-muted); font-size: 9px; }
  }

  .table__cap { color: var(--ps-text-muted); }
  .row--ranked .table__name { font-weight: 700; color: var(--ps-heading); }
}

.pips {
  display: inline-flex;
  gap: 2px;

  i {
    width: 8px;
    height: 8px;
    border: 1px solid var(--ps-line-soft);
    border-radius: 2px;
    background: var(--ps-field);

    &.fixed { background: var(--ps-heading-soft); border-color: var(--ps-heading-soft); }
    &.placed { background: var(--ps-blue); border-color: var(--ps-blue); }
    &.over { background: var(--ps-red); border-color: var(--ps-red); }
  }
}

@media (max-width: 640px) {
  .layout { grid-template-columns: 1fr; }
  .table { position: static; }
}
</style>
