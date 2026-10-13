<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import {
  METHODS, FLOOR, CREATION_CAP,
  rolledFaces, rolledValue, poolOf, poolLeft, pointsLeft, pointAllowed, bonusShape, abilityRows, limitedIncrease,
} from '@/builder/abilities.js'
import { abilityPoints } from '@/builder/steps.js'
import { FEAT_PENDING } from '@/builder/feats.js'
import { featPrefix } from '@/builder/featChoices.js'
import { useBuilderPages } from '@/composables/useBuilderPages.js'
import FeatPicker from '@/components/builder/FeatPicker.vue'
import getRollResult from '@/utility/getRollResult.js'
import postToChat from '@/utility/postToChat.js'

const builder = useBuilderStore()
const meta = useMetaStore()
const { pages, abilitySlots, blocks, feats, featPickOf } = useBuilderPages()

const a = computed(() => builder.draft.abilities)

const methods = computed(() => METHODS.filter((m) => m.id !== 'roll' || sharedSettings.abilityRolling || a.value.method === 'roll'))

watchEffect(() => {
  if (!a.value.method) a.value.method = 'values'
  if (a.value.bonusMode === 'one' && !sharedSettings.abilityBonusSingle) {
    a.value.bonusMode = 'two'
    a.value.bonuses = {}
  }
})

const setMethod = (id) => {
  if (id === a.value.method) return
  a.value.method = id
  a.value.values = {}
}

const rows = computed(() => abilityRows(a.value, limitedIncrease(builder.draft)))
const nameOf = (id) => ABILITIES.find((x) => x.id === id)?.name ?? id

const left = computed(() => poolLeft(a.value))
const faces = computed(() => rolledFaces(a.value))

const chips = computed(() => {
  const pool = poolOf(a.value) ?? []
  const remaining = [...(left.value ?? [])]
  return pool.map((value, i) => {
    const at = remaining.indexOf(value)
    if (at >= 0) remaining.splice(at, 1)
    return { key: i, value, used: at < 0, face: faces.value[i] }
  }).sort((x, y) => y.value - x.value)
})

const offered = (id) => {
  const own = a.value.values[id]
  const values = [...(left.value ?? [])]
  if (own !== undefined && own !== '') values.push(Number(own))
  return [...new Set(values)].sort((x, y) => y - x)
}

const setBase = (id, value) => {
  const next = { ...a.value.values }
  if (value === '' || value == null) delete next[id]
  else next[id] = Number(value)
  a.value.values = next
}

const points = computed(() => (a.value.method === 'points' ? pointsLeft(a.value) : null))
const pointValue = (id) => Number(a.value.values[id] ?? 0)
const stepPoint = (id, by) => {
  const value = pointValue(id) + by
  if (pointAllowed(a.value, id, value)) setBase(id, value)
}

watchEffect(() => {
  if (a.value.method !== 'points') return
  const missing = ABILITIES.filter((x) => a.value.values[x.id] === undefined)
  if (missing.length) a.value.values = { ...Object.fromEntries(missing.map((x) => [x.id, 0])), ...a.value.values }
})

const rolling = ref(false)
const rollError = ref('')

const roll = async () => {
  if (rolling.value) return
  rolling.value = true
  rollError.value = ''
  try {
    const result = await getRollResult([{ key: 'abilities', count: 6, sides: 10 }])
    const rolled = result.abilities?.faces ?? []
    a.value.rolled = rolled.join('|')
    a.value.values = {}
    await postToChat('chat', {
      characterName: builder.draft.concept.name || meta.name || 'New Character',
      title: 'Ability Rolls',
      subtitle: 'Rolling Ability Scores (6d10)',
      keyValues: {
        Rolls: rolled.join(', '),
        Values: rolled.map((f) => formatModifier(rolledValue(f))).join(', '),
      },
    })
  } catch (error) {
    rollError.value = `The roll failed: ${error?.message ?? error}`
  } finally {
    rolling.value = false
  }
}

const shape = computed(() => bonusShape(a.value))
const bonusPlaced = computed(() => rows.value.filter((r) => r.bonus > 0).length)

const setBonusMode = (mode) => {
  if (mode === a.value.bonusMode) return
  a.value.bonusMode = mode
  a.value.bonuses = {}
}

const toggleBonus = (id) => {
  const { count, amount } = shape.value
  const next = { ...a.value.bonuses }
  if (next[id]) delete next[id]
  else {
    if (count === 1) for (const key of Object.keys(next)) delete next[key]
    else if (Object.keys(next).length >= count) return
    next[id] = amount
  }
  a.value.bonuses = next
}

const improvementPoints = computed(() => abilityPoints(builder.draft))
const pooled = (id) => Number(a.value.improvements[id] ?? 0)
const improvementsSpent = computed(() => ABILITIES.reduce((sum, x) => sum + pooled(x.id), 0))

const stepImprovement = (id, by) => {
  const now = Number(a.value.improvements[id] ?? 0)
  const value = now + by
  if (value < 0 || improvementsSpent.value + by > improvementPoints.value) return
  const next = { ...a.value.improvements }
  if (value) next[id] = value
  else delete next[id]
  a.value.improvements = next
}

watchEffect(() => {
  let over = improvementsSpent.value - improvementPoints.value
  if (over <= 0) return
  const next = { ...a.value.improvements }
  for (const x of [...ABILITIES].reverse()) {
    const cut = Math.min(over, Number(next[x.id] ?? 0))
    if (!cut) continue
    over -= cut
    if (next[x.id] - cut) next[x.id] -= cut
    else delete next[x.id]
  }
  a.value.improvements = next
})

const featSlots = computed(() => (feats.value.length ? abilitySlots.value.filter((s) => s.feat) : []))
const featOf = (slot) => a.value.feats?.[slot.key] ?? ''

const listedSlots = computed(() => abilitySlots.value.filter((s) => featSlots.value.includes(s) || s.from))

const limitedOf = (slot) => a.value.limited?.[slot.key] ?? ''
const setLimited = (slot, id) => {
  const next = { ...(a.value.limited ?? {}) }
  if (next[slot.key] === id) delete next[slot.key]
  else next[slot.key] = id
  a.value.limited = next
}
const abbr = (id) => id.slice(0, 3).toUpperCase()

const takenAt = (slot) => pages.value.feats.find((f) => f.slotKey === slot.key) ?? null

const setFeatPick = (slot, value) => {
  const taken = takenAt(slot)
  if (!taken) return
  const key = featPrefix(slot.key, taken.option.pageName)
  const next = { ...(a.value.featPicks ?? {}) }
  if (value) next[key] = value
  else delete next[key]
  a.value.featPicks = next
}

const setFeat = (slot, name) => {
  const next = { ...(a.value.feats ?? {}) }
  if (name === null) delete next[slot.key]
  else next[slot.key] = name || FEAT_PENDING
  a.value.feats = next
}
</script>

<template>
  <div class="abilities">
    <div class="tabs" role="tablist">
      <button
        v-for="m in methods"
        :key="m.id"
        type="button"
        role="tab"
        class="tab"
        :class="{ 'tab--on': a.method === m.id }"
        :aria-selected="a.method === m.id"
        @click="setMethod(m.id)"
      >{{ m.label }}</button>
    </div>

    <div class="status">
      <template v-if="a.method === 'values'">
        <span class="status__label">Values</span>
        <span v-for="c in chips" :key="c.key" class="chip" :class="{ 'chip--used': c.used }">{{ formatModifier(c.value) }}</span>
        <span class="status__left">{{ left.length }} left to assign</span>
      </template>
      <template v-else-if="a.method === 'points'">
        <span class="status__label">Points Left</span>
        <span class="points" :class="{ 'points--over': points < 0 }">{{ points }}</span>
        <span class="status__note">0 to {{ CREATION_CAP }} each; one may drop to {{ FLOOR }} for a point</span>
      </template>
      <template v-else>
        <button type="button" class="roll" :disabled="rolling" @click="roll">
          {{ rolling ? 'Rolling…' : faces.length ? 'Roll Again' : 'Roll 6d10' }}
        </button>
        <template v-if="faces.length">
          <span v-for="c in chips" :key="c.key" class="chip" :class="{ 'chip--used': c.used }" :title="`Rolled ${c.face}`">{{ formatModifier(c.value) }}</span>
          <span class="status__left">{{ left.length }} left to assign</span>
        </template>
        <span v-if="rollError" class="status__error">{{ rollError }}</span>
      </template>
    </div>

    <div v-if="sharedSettings.abilityBonusSingle" class="bonus-mode">
      <span class="status__label">Bonus</span>
      <button type="button" class="tab tab--small" :class="{ 'tab--on': a.bonusMode !== 'one' }" @click="setBonusMode('two')">+1 to Two</button>
      <button type="button" class="tab tab--small" :class="{ 'tab--on': a.bonusMode === 'one' }" @click="setBonusMode('one')">+2 to One</button>
    </div>

    <table class="grid">
      <thead>
        <tr>
          <th class="grid__name">Ability</th>
          <th>Base</th>
          <th>Bonus <span class="count">{{ bonusPlaced }}/{{ shape.count }}</span></th>
          <th v-if="improvementPoints">Level <span class="count">{{ improvementsSpent }}/{{ improvementPoints }}</span></th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="grid__name">{{ nameOf(r.id) }}</td>
          <td>
            <div v-if="a.method === 'points'" class="stepper">
              <button type="button" :aria-label="`Lower ${nameOf(r.id)}`" :disabled="!pointAllowed(a, r.id, pointValue(r.id) - 1)" @click="stepPoint(r.id, -1)">−</button>
              <span>{{ formatModifier(pointValue(r.id)) }}</span>
              <button type="button" :aria-label="`Raise ${nameOf(r.id)}`" :disabled="!pointAllowed(a, r.id, pointValue(r.id) + 1)" @click="stepPoint(r.id, 1)">+</button>
            </div>
            <select
              v-else
              class="pick"
              :value="r.base ?? ''"
              :disabled="a.method === 'roll' && !faces.length"
              :aria-label="`${nameOf(r.id)} base value`"
              @change="setBase(r.id, $event.target.value)"
            >
              <option value="">—</option>
              <option v-for="v in offered(r.id)" :key="v" :value="v">{{ formatModifier(v) }}</option>
            </select>
          </td>
          <td>
            <button
              type="button"
              class="bonus"
              :class="{ 'bonus--on': r.bonus > 0 }"
              :aria-pressed="r.bonus > 0"
              :aria-label="`Bonus to ${nameOf(r.id)}`"
              @click="toggleBonus(r.id)"
            >+{{ shape.amount }}</button>
          </td>
          <td v-if="improvementPoints">
            <div class="stepper">
              <button type="button" :aria-label="`Remove an improvement from ${nameOf(r.id)}`" :disabled="!pooled(r.id)" @click="stepImprovement(r.id, -1)">−</button>
              <span>{{ pooled(r.id) ? `+${pooled(r.id)}` : '0' }}</span>
              <button
                type="button"
                :aria-label="`Improve ${nameOf(r.id)}`"
                :disabled="improvementsSpent >= improvementPoints"
                @click="stepImprovement(r.id, 1)"
              >+</button>
            </div>
          </td>
          <td>
            <span class="total" :class="{ 'total--over': r.overCap }" :title="r.overCap ? 'Over the cap' : ''">
              {{ r.total == null ? '—' : formatModifier(r.total) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <section v-if="listedSlots.length" class="improvements">
      <h3 class="section-title">Ability Improvements</h3>
      <div v-for="slot in listedSlots" :key="slot.key" class="slot">
        <span class="slot__label">Level {{ slot.level }}: {{ slot.name }}</span>
        <div v-if="slot.from" class="slot__kinds">
          <button
            v-for="id in slot.from"
            :key="id"
            type="button"
            class="tab tab--small"
            :class="{ 'tab--on': limitedOf(slot) === id }"
            :aria-pressed="limitedOf(slot) === id"
            :title="nameOf(id)"
            @click="setLimited(slot, id)"
          >{{ abbr(id) }} +{{ slot.points }}</button>
        </div>
        <div v-else class="slot__kinds">
          <button
            type="button"
            class="tab tab--small"
            :class="{ 'tab--on': !featOf(slot) }"
            :aria-pressed="!featOf(slot)"
            @click="setFeat(slot, null)"
          >Ability +{{ slot.points }}</button>
          <button
            type="button"
            class="tab tab--small"
            :class="{ 'tab--on': !!featOf(slot) }"
            :aria-pressed="!!featOf(slot)"
            @click="featOf(slot) || setFeat(slot, '')"
          >Feat</button>
        </div>
        <FeatPicker
          v-if="featOf(slot)"
          class="slot__feat"
          :feats="feats"
          :value="featOf(slot) === FEAT_PENDING ? '' : featOf(slot)"
          :blocked="blocks[slot.key] ?? {}"
          :option="takenAt(slot)?.choices.option ?? null"
          :pick="takenAt(slot) ? featPickOf(takenAt(slot)) : ''"
          @change="setFeat(slot, $event)"
          @pick="setFeatPick(slot, $event)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }

.tab {
  @include ps-heading(12px);
  padding: 5px 14px;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  background: var(--ps-panel);
  color: var(--ps-heading);
  cursor: pointer;

  &--on { background: var(--ps-fill); color: var(--ps-on-fill); }
  &--small { padding: 3px 10px; font-size: 11px; }
}

.status,
.bonus-mode {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 30px;
  margin-bottom: 8px;
}

.status__label { @include ps-caption; margin-right: 4px; }
.status__left,
.status__note { font-size: 11.5px; color: var(--ps-text-muted); margin-left: 6px; }
.status__error { font-size: 12px; color: var(--ps-red); }

.chip {
  @include ps-chip;
  font-size: 11px;

  &--used { opacity: 0.4; text-decoration: line-through; }
}

.points {
  @include ps-heading(18px);
  min-width: 24px;
  text-align: center;

  &--over { color: var(--ps-red); }
}

.roll {
  @include ps-button;
  padding: 5px 14px;
  &:disabled { opacity: 0.6; cursor: default; }
}

.grid {
  width: 100%;
  max-width: 560px;
  border-collapse: collapse;

  th {
    @include ps-caption;
    text-align: center;
    padding: 4px 6px;
    border-bottom: 2px solid var(--ps-line);
  }

  td {
    text-align: center;
    padding: 5px 6px;
    border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
  }

  .grid__name { text-align: left; font-weight: 700; color: var(--ps-heading); font-size: 13px; }
}

.count { font-weight: 400; color: var(--ps-text-muted); }

.pick {
  @include ps-control(26px);
  width: 64px;
  cursor: pointer;
}

.stepper {
  display: inline-flex;
  align-items: center;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  overflow: hidden;

  button {
    width: 24px;
    height: 24px;
    border: none;
    background: var(--ps-panel);
    color: var(--ps-heading);
    font-weight: 800;
    cursor: pointer;
    &:disabled { opacity: 0.35; cursor: default; }
  }

  span {
    min-width: 30px;
    height: 24px;
    line-height: 24px;
    background: var(--ps-field);
    border-left: var(--ps-border-thin);
    border-right: var(--ps-border-thin);
    font-weight: 700;
    font-size: 12px;
  }
}

.bonus {
  @include ps-chip(true);
  cursor: pointer;
  font-size: 11px;
  padding: 3px 9px;

  &--on { background: var(--ps-blue); color: #fff; border-color: var(--ps-blue); }
}

.improvements { max-width: 560px; margin-top: 16px; }

.section-title {
  @include ps-heading(15px);
  margin: 0 0 6px;
}

.slot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
}

.slot__label { font-weight: 700; color: var(--ps-heading); font-size: 13px; }
.slot__kinds { display: flex; gap: 4px; margin-left: auto; }
.slot__feat { flex-basis: 100%; }

.total {
  @include ps-heading(17px);
  display: inline-block;
  min-width: 34px;

  &--over { color: var(--ps-red); }
}
</style>
