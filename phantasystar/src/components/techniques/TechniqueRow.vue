<script setup>
import { reactive, computed } from 'vue'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import {
  rankLabel, MAX_RANK, ABILITIES, canRankBoost,
  freeCastsLeft, freeCastLabel, COMPONENT_TYPES, componentsLabel,
} from '@/rules/index.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import TechniqueRollFields from './TechniqueRollFields.vue'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  technique: { type: Object, required: true },
})

const store = useTechniqueStore()
const sheet = useCharacterStore()
const rolls = useSheetRolls()
const open = computed(() => store.isRowOpen(props.technique._id))
const editing = computed(() => store.isRowEditing(props.technique._id))
const toggleOpen = () => store.setRowUI(props.technique._id, { open: !open.value, editing: false })
const toggleEditing = () =>
  store.setRowUI(props.technique._id, { open: !editing.value, editing: !editing.value })

const castOptions = computed(() => {
  const out = []
  const top = canRankBoost(props.technique) ? MAX_RANK : props.technique.rank
  for (let rank = props.technique.rank; rank <= top; rank += 1) {
    const plan = store.castPlan(props.technique, rank)
    if (!plan) break
    if (!plan.allowed && !plan.rankSpent) {
      if (rank === props.technique.rank) out.push({ key: `${rank}`, rank, plan, useFree: true })
      break
    }
    out.push({ key: `${rank}`, rank, plan, useFree: true })

    if (plan.free) {
      const paid = store.castPlan(props.technique, rank, { useFree: false })
      if (paid && paid.cost > 0) out.push({ key: `${rank}-tp`, rank, plan: paid, useFree: false })
    }
  }
  return out
})

const canBreach = (opt) =>
  sharedSettings.forceBreach &&
  opt.plan.rankSpent &&
  !!opt.plan.forceBreach &&
  opt.plan.affordable

const castTitle = (opt) => {
  const { plan, rank } = opt
  if (canBreach(opt)) {
    return (
      `Force breach: already cast at ${rankLabel(rank)} this long rest, so casting ` +
      `again needs a DC ${plan.forceBreach.dc} save, and costs ` +
      `${plan.forceBreach.damage} psychic damage on a failure`
    )
  }
  if (!plan.allowed && plan.rankSpent) {
    return (
      `Already cast at ${rankLabel(rank)} since your last long rest` +
      (plan.forceBreach ? ` - a force breach needs a DC ${plan.forceBreach.dc} save` : '')
    )
  }
  if (!plan.allowed) return 'Beyond your max tech rank'
  if (!plan.affordable) return `Needs ${plan.cost} TP`
  if (plan.free) {
    return (
      `Cast at ${rankLabel(rank)} for 0 TP` +
      (Number.isFinite(plan.freeLeft) ? ` - ${plan.freeLeft} of ${freeMax.value} left` : ' - at will')
    )
  }
  return `Cast at ${rankLabel(rank)} for ${plan.cost} TP`
}

const castOrBreach = (opt) =>
  canBreach(opt)
    ? rolls.rollForceBreach(props.technique, opt.rank)
    : rolls.castTechnique(props.technique, opt.rank, { useFree: opt.useFree })

const boostedTo = computed(() => {
  const rank = store.lastCastRank(props.technique)
  return rank > props.technique.rank ? rank : null
})

const wantsSave = computed(() => props.technique.saveAbility ?? null)
const wantsAttack = computed(() => !!props.technique.attack)

const entry = computed(() => store.known.find((e) => e._id === props.technique._id))

const EDITABLE = [
  'name', 'rank', 'castingTime', 'range', 'duration',
  'concentration', 'attack', 'saveAbility', 'components',
]

const setField = (name, value) => {
  const e = entry.value
  if (!e) return
  if (!e.fields) e.fields = {}
  e.fields[name] = value === undefined ? null : value
}

const f = reactive(
  Object.fromEntries(
    EDITABLE.map((name) => [
      name,
      computed({
        get: () => props.technique[name],
        set: (value) => setField(name, value),
      }),
    ]),
  ),
)

const setComponents = (patch) => {
  const next = { type: '', text: '', ...(props.technique.components ?? {}), ...patch }
  setField('components', next.type ? { type: next.type, text: next.text } : null)
}

const showEditor = computed(() => editing.value)

const description = computed(() => (props.technique.text?.length ? props.technique.text : null))
const scaling = computed(() => (props.technique.boost?.length ? props.technique.boost : null))

const customText = computed({
  get: () => (description.value ?? []).join('\n\n'),
  set: (value) => {
    const paragraphs = value
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
    setField('text', paragraphs.length ? paragraphs : null)
  },
})

const freeCasts = computed(() => props.technique.freeCasts ?? null)
const limitedFree = computed(() => !!freeCasts.value && freeCasts.value.per !== 'atWill')
const freeLeft = computed(() => freeCastsLeft(freeCasts.value))
const freeMax = computed(() => Math.max(1, Number(freeCasts.value?.max) || 1))

const setFreePer = (per) =>
  store.setFreeCasts(props.technique._id, per ? { ...freeCasts.value, per } : null)
const setFreeMax = (value) =>
  store.setFreeCasts(props.technique._id, {
    ...freeCasts.value,
    max: Math.max(1, Number(value) || 1),
  })

const RANKS = Array.from({ length: MAX_RANK + 1 }, (_, i) => i)

const entryLine = computed(() =>
  [
    props.technique.castingTime,
    props.technique.range,
    props.technique.duration,
  ]
    .filter(Boolean)
    .join(' · '),
)

const componentsLine = computed(() =>
  componentsLabel(props.technique.components, { short: true }),
)
</script>

<template>
  <div class="tech" :class="{ open }">
    <div class="tech__main">
      <button
        type="button"
        class="tech__name"
        :title="open ? 'Hide description' : 'Show description'"
        @click="toggleOpen()"
      >
        <span class="disclose">{{ open ? '▾' : '▸' }}</span>
        {{ technique.name }}
        <span v-if="technique.concentration" class="badge" title="Concentration">C</span>
      </button>

      <div class="tech__entry">
        {{ entryLine }}<template v-if="componentsLine"><template v-if="entryLine"> · </template><span class="tech__comp">{{ componentsLine }}</span></template>
      </div>


      <div class="tech__actions">
        <button
          v-if="wantsAttack || technique.damage || technique.damage2"
          type="button"
          class="mini"
          :disabled="!technique.damage && !technique.damage2"
          @click="rolls.rollTechniqueDamage(technique)"
        >
          Damage<template v-if="boostedTo"> ({{ rankLabel(boostedTo) }})</template>
        </button>
        <span
          v-if="wantsSave"
          class="mini mini--static"
          :title="`The target makes a ${wantsSave} saving throw against your tech save DC`"
        >
          DC {{ sheet.techSaveDCValue ?? '-' }}
        </span>

        <button type="button" class="mini" title="Post the entry to chat without spending TP"
                @click="rolls.postTechnique(technique)">
          Show
        </button>
        <ConfirmDelete class="mini mini--danger" title="Forget this technique" @confirm="store.forget(technique._id)" />
      </div>
    </div>

    <div class="tech__casts">
      <button
        v-for="opt in castOptions"
        :key="opt.key"
        type="button"
        class="cast"
        :class="{
          'cast--advanced': opt.plan.advanced,
          'cast--free': opt.plan.free,
          'cast--breach': canBreach(opt),
          'cast--blocked': (!opt.plan.allowed && !canBreach(opt)) || !opt.plan.affordable,
        }"
        :disabled="(!opt.plan.allowed && !canBreach(opt)) || !opt.plan.affordable"
        :title="castTitle(opt)"
        @click="castOrBreach(opt)"
      >
        <span class="cast__rank">{{ opt.rank === 0 ? 'P' : opt.rank }}</span>
        <span class="cast__cost">{{ opt.plan.cost }}</span>
      </button>
    </div>

    <div v-if="open && showEditor && entry" class="tech__edit">
      <div class="grid">
        <label class="wide">
          <span>Name</span>
          <input v-model="f.name" placeholder="Technique name" />
        </label>
        <label>
          <span>Rank</span>
          <select v-model.number="f.rank">
            <option v-for="r in RANKS" :key="r" :value="r">{{ rankLabel(r) }}</option>
          </select>
        </label>
        <label>
          <span>Casting Time</span>
          <input v-model="f.castingTime" placeholder="Action" />
        </label>
        <label>
          <span>Range</span>
          <input v-model="f.range" placeholder="Self" />
        </label>
        <label>
          <span>Duration</span>
          <input v-model="f.duration" placeholder="Instant" />
        </label>
        <label class="check">
          <input v-model="f.concentration" type="checkbox" />
          <span>Concentration</span>
        </label>
        <label class="check">
          <input v-model="f.attack" type="checkbox" />
          <span>Tech attack</span>
        </label>
        <label>
          <span>Saving Throw</span>
          <select v-model="f.saveAbility">
            <option :value="null">&mdash;</option>
            <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </label>
        <label>
          <span>Components</span>
          <select
            :value="technique.components?.type ?? ''"
            @change="setComponents({ type: $event.target.value })"
          >
            <option value="">None</option>
            <option v-for="t in COMPONENT_TYPES" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </label>
        <label class="wide">
          <span>Component</span>
          <input
            :value="technique.components?.text ?? ''"
            :disabled="!technique.components?.type"
            @input="setComponents({ text: $event.target.value })"
          />
        </label>
      </div>

      <label class="stacked">
        <span>Description &mdash; blank line between paragraphs</span>
        <textarea v-model="customText" rows="4" placeholder="What the technique does…" />
      </label>

      <TechniqueRollFields :id="technique._id" class="rolls" />

      <div class="grant">
        <label>
          <span>Casts at 0 TP</span>
          <select
            :value="freeCasts?.per ?? ''"
            title="An origin or profession feature that lets you cast this at 0 TP"
            @change="setFreePer($event.target.value)"
          >
            <option value="">None</option>
            <option value="atWill">At will</option>
            <option value="long">Per long rest</option>
            <option value="short">Per short rest</option>
          </select>
        </label>
        <label v-if="limitedFree">
          <span>Uses</span>
          <input
            type="number"
            min="1"
            :value="freeMax"
            @input="setFreeMax($event.target.value)"
          />
        </label>
        <label class="check">
          <input
            type="checkbox"
            :checked="technique.countsAsKnown"
            @change="store.setCountsAsKnown(technique._id, $event.target.checked)"
          />
          <span>Counts toward techniques known</span>
        </label>
        <label v-if="store.isOffensive(technique)" class="check">
          <input
            type="checkbox"
            :checked="technique.showInAttacks"
            @change="store.setShowInAttacks(technique._id, $event.target.checked)"
          />
          <span>Show in Attacks</span>
        </label>
      </div>
    </div>

    <div v-else-if="open" class="tech__body">
      <p v-for="(para, i) in description || []" :key="i">{{ para }}</p>
      <div v-if="technique.components" class="components">
        <strong>Components ({{ technique.components.type }}).</strong>
        {{ technique.components.text }}
      </div>
      <div v-if="scaling?.length" class="boost">
        <strong>{{ technique.rank === 0 ? 'Prime Upgrade.' : 'Rank Boosting.' }}</strong>
        <span v-for="(para, i) in scaling" :key="i"> {{ para }}</span>
      </div>
    </div>

    <div v-if="open && freeCasts" class="tech__free">
      <template v-if="limitedFree">
        <span class="tech__free-count">{{ freeLeft }} / {{ freeMax }}</span>
        <span>0 TP casts &middot; {{ freeCastLabel(freeCasts.per).toLowerCase() }}</span>
        <button
          type="button"
          class="mini"
          :disabled="freeLeft >= freeMax"
          title="Hand back a 0 TP cast"
          @click="store.restoreFreeCast(technique._id)"
        >
          Restore
        </button>
      </template>
      <span v-else>0 TP casts &middot; at will</span>
    </div>

    <label v-if="open && entry && (showEditor || entry.note)" class="tech__notes">
      <span>Additional Notes</span>
      <textarea v-model="entry.note" rows="2" />
    </label>

    <div v-if="open" class="tech__editbar">
      <button type="button" class="mini" :title="editing ? 'Stop editing' : 'Edit this technique'"
              @click="toggleEditing()">
        {{ editing ? 'Done' : 'Edit' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.tech {
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.28);
  padding: 4px 2px;

  &:last-child { border-bottom: none; }
  &.open { background: var(--ps-row-open); }

  &__main {
    display: grid;
    grid-template-columns: minmax(140px, max-content) minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }

  &__name {
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    color: var(--ps-heading);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;

    &:hover { text-decoration: underline; }
  }

  &__entry {
    font-size: 10px;
    color: var(--ps-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__comp { color: var(--ps-gold-dark); }

  &__notes {
    display: flex;
    flex-direction: column;
    padding: 0 8px 6px 16px;

    > span { @include ps-caption; font-size: 8.5px; margin-bottom: 1px; }

    textarea {
      @include ps-well;
      height: auto;
      font-size: 11.5px;
      text-align: left;
      padding: 4px;
      line-height: 1.4;
      resize: vertical;

      &::placeholder { color: var(--ps-disabled); }
      &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
    }
  }

  &__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; }

  &__edit {
    padding: 6px 8px 8px 16px;

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
      gap: 5px 7px;
    }

    label {
      display: flex;
      flex-direction: column;
      min-width: 0;

      > span { @include ps-caption; font-size: 8.5px; margin-bottom: 1px; }

      &.wide { grid-column: span 2; }

      &.check {
        flex-direction: row;
        align-items: center;
        gap: 4px;
        align-self: end;
        padding-bottom: 3px;

        > span { margin: 0; }
      }
    }

    input:not([type='checkbox']), select, textarea {
      @include ps-well;
      height: 22px;
      font-size: 11.5px;
      text-align: left;
      padding: 0 4px;
      min-width: 0;

      &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
    }

    textarea {
      height: auto;
      padding: 4px;
      line-height: 1.4;
      resize: vertical;
    }

    input[type='checkbox'] { @include ps-pip-check; }

    .stacked {
      margin-top: 6px;

      > span { @include ps-caption; font-size: 8.5px; margin-bottom: 1px; }
    }

    .rolls {
      margin-top: 8px;
      padding-top: 7px;
      border-top: var(--ps-border-thin);
    }

    .grant {
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 5px 10px;
      margin-top: 8px;
      padding-top: 7px;
      border-top: var(--ps-border-thin);

      label { min-width: 118px; }
      label.check { min-width: 0; }
      input[type="number"] { width: 56px; }
    }
  }

  &__free {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 8px 4px 16px;
    font-size: 10.5px;
    color: var(--ps-text-muted);
  }

  &__free-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--ps-gold-dark);
  }


  &__editbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 8px 6px 16px;
  }

  &__casts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px 0 2px 16px;
  }

  &__body {
    padding: 4px 8px 8px 16px;
    font-size: 11.5px;

    p { margin: 0 0 5px; }
    .components, .boost { margin-top: 4px; font-size: 11px; }
    .boost { color: var(--ps-gold-dark); }
  }
}

.disclose { color: var(--ps-heading-soft); font-size: 10px; }

.badge {
  font-size: 8.5px;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 8px;
  background: var(--ps-blue);
  color: var(--ps-on-fill);
}

.mini {
  @include ps-caption;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 6px;
  cursor: pointer;
  font-size: 9px;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &--danger:hover { background: var(--ps-red); color: var(--ps-on-fill); border-color: var(--ps-red); }
  &--static { cursor: default; background: var(--ps-panel-alt); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.cast {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--ps-line);
  border-radius: var(--ps-radius-sm);
  background: var(--ps-field);
  padding: 1px 6px 1px 4px;
  cursor: pointer;
  color: var(--ps-heading);

  &__rank {
    font-size: 11px;
    font-weight: 700;
    background: var(--ps-fill);
    color: var(--ps-on-fill);
    border-radius: 3px;
    padding: 0 4px;
  }

  &__cost { font-size: 10.5px; font-weight: 700; }
  &__cost::after { content: ' TP'; font-size: 8px; font-weight: 400; }

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }

  &--advanced {
    border-color: var(--ps-breach);
    .cast__rank { background: var(--ps-breach); }
  }

  &--breach {
    border-color: var(--ps-red);
    .cast__rank { background: var(--ps-red); }
  }

  &--free {
    border-color: var(--ps-gold-dark);

    .cast__rank { background: var(--ps-gold-dark); }
    .cast__cost { color: var(--ps-gold-dark); font-weight: 700; }
  }

  &--blocked, &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

@media (max-width: 720px) {
  .tech__main { grid-template-columns: 1fr auto; }
  .tech__entry { grid-column: 1 / -1; white-space: normal; }
}
</style>
