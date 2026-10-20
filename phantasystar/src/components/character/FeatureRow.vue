<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import {
  FEATURE_GROUPS, RECOVERIES, ABILITIES, featureColumnValues, featurePicks, resourceMax,
  normalizeFeatureRoll, rollActs, pickAllows, featureSaveDC, diceAt, featureReached, atLevel,
} from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  id: { type: String, required: true },
  open: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-open', 'toggle-editing'])

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const feature = computed(() => sheet.features.find((f) => f._id === props.id) ?? null)

const split = (text) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

const picks = computed(() => featurePicks(feature.value))
const picked = computed(() =>
  feature.value?.optionMode === 'add'
    ? null
    : feature.value?.options?.find((o) => o.name === picks.value[0]) ?? null,
)
const paragraphs = computed(() => (picked.value ? split(picked.value.text) : split(feature.value?.text)))
const added = computed(() => {
  if (feature.value?.optionMode !== 'add') return []
  const chosen = feature.value.options.filter((o) => picks.value.includes(o.name))
  return chosen.length ? chosen : feature.value.options
})

const slots = computed(() => Array.from({ length: feature.value?.pickCount ?? 1 }, (_, i) => i))
const pickAt = (i) => picks.value[i] ?? ''
const setPick = (i, name) => {
  const next = [...picks.value]
  next[i] = name
  feature.value.pick = next.filter(Boolean).join('|')
}
const offered = (i) => feature.value.options.filter((o) => !picks.value.some((p, j) => j !== i && p === o.name))

const values = computed(() =>
  feature.value?.source?.startsWith('profession:')
    ? featureColumnValues(sheet.professionStats, sheet.effectiveLevel, feature.value.ref)
    : [],
)

const uses = computed(() => sheet.resources.filter((r) => r.feature === props.id))
const ruleMax = (row) =>
  resourceMax({ ...row, maxOverride: null }, {
    level: sheet.effectiveLevel, abilities: sheet.abilities, professionStats: sheet.professionStats,
    extra: sheet.extraUsesOf(row),
  })
const setMaxOverride = (row, value) => {
  const n = Number(value)
  row.maxOverride = value === '' || !Number.isFinite(n) ? null : Math.max(0, Math.trunc(n))
}

const roll = computed(() => feature.value?.roll ?? null)
const acts = computed(() => !!feature.value && rollActs(roll.value) && pickAllows(roll.value, feature.value))
const rollsDice = computed(() => !!roll.value && (!!roll.value.dice || roll.value.plus.length > 0 || roll.value.lines.length > 0))
const abbr = (id) => ABILITIES.find((a) => a.id === id)?.abbr ?? id

const dcLabel = computed(() => {
  if (!acts.value || !roll.value?.save) return ''
  const dc = featureSaveDC(roll.value.save, { ...sheet.diceContext(), techSaveDC: sheet.techSaveDCValue })
  return [roll.value.save.ability ? abbr(roll.value.save.ability) : '', `DC ${dc ?? '-'}`].filter(Boolean).join(' ')
})

const setRoll = (patch) => {
  feature.value.roll = normalizeFeatureRoll({ ...(feature.value.roll ?? {}), ...patch })
}

const fateByLevel = computed(() => typeof feature.value.fate === 'object' && feature.value.fate !== null)
const fateText = computed(() => (fateByLevel.value
  ? atLevel(feature.value.fate, sheet.effectiveLevel)
  : feature.value.fate || ''))
const setFate = (value) => {
  const n = parseInt(value, 10)
  feature.value.fate = Number.isFinite(n) ? n : 0
}

const bookDice = computed(() => !!roll.value && (typeof roll.value.dice === 'object' || roll.value.lines.length > 0))
const diceText = computed(() => {
  if (!roll.value) return ''
  if (roll.value.lines.length) return roll.value.lines.map((l) => l.label).join(' / ')
  return typeof roll.value.dice === 'object' ? diceAt(roll.value.dice, sheet.diceContext()) : roll.value.dice
})

const PLUS = [
  { id: 'level', name: 'Level' },
  { id: 'halfLevel', name: 'Half Level' },
  ...ABILITIES.map((a) => ({ id: a.id, name: a.name })),
]
const plusAt = (i) => roll.value?.plus?.[i] ?? ''
const setPlus = (i, value) => {
  const next = [...(roll.value?.plus ?? [])]
  next[i] = value
  setRoll({ plus: next.filter(Boolean) })
}

const saveChoice = computed(() => (roll.value?.save ? roll.value.save.ability || 'any' : ''))
const setSave = (choice) => setRoll({
  save: choice ? { ability: choice === 'any' ? '' : choice, dc: roll.value?.save?.dc || 'tech' } : null,
})
const dcKind = computed(() => {
  const dc = roll.value?.save?.dc ?? ''
  return /^\d+$/.test(dc) ? 'number' : dc
})
const setDcKind = (kind) => setRoll({ save: { ...roll.value.save, dc: kind === 'number' ? '13' : kind } })
const setDcNumber = (value) => {
  const n = Math.trunc(Number(value))
  if (n > 0) setRoll({ save: { ...roll.value.save, dc: String(n) } })
}

const spendable = computed(() => sheet.features
  .filter((f) => f._id !== props.id && featureReached(f, sheet.effectiveLevel) && sheet.usesLeftFor(f._id) !== null)
  .map((f) => ({ value: f.ref || f._id, name: f.name || 'Unnamed feature' })))

const levelInput = computed({
  get: () => feature.value?.level ?? '',
  set: (value) => {
    const n = Number(value)
    feature.value.level = value === '' || !Number.isInteger(n) || n < 1 || n > 20 ? null : n
  },
})
</script>

<template>
  <div v-if="feature" class="feature" :class="{ open }">
    <div class="line">
      <button
        type="button"
        class="name"
        :title="open ? 'Hide description' : 'Show description'"
        @click="emit('toggle-open')"
      >
        <span class="caret" :class="{ turned: open }">&#9656;</span>
        {{ feature.name || 'Unnamed feature' }}
      </button>
      <span v-for="v in values" :key="v.id" class="value">{{ v.label ? `${v.label} ` : '' }}{{ v.value }}</span>
      <template v-if="feature.options.length">
        <select
          v-for="i in slots"
          :key="i"
          :value="pickAt(i)"
          class="pick"
          :class="{ unpicked: !pickAt(i) }"
          :title="`${feature.name} benefit`"
          @change="setPick(i, $event.target.value)"
        >
          <option value="">&mdash;</option>
          <option v-for="o in offered(i)" :key="o.name" :value="o.name">{{ o.name }}</option>
        </select>
      </template>
      <span v-if="dcLabel" class="value">{{ dcLabel }}</span>
      <span v-if="feature.level" class="level">Level {{ feature.level }}</span>
      <button
        v-if="acts"
        type="button"
        class="act"
        :disabled="!rolls.canUseFeature(feature)"
        :title="`${rollsDice ? 'Roll' : 'Use'} ${feature.name || 'this feature'}`"
        @click="rolls.useFeature(feature)"
      >{{ rollsDice ? 'Roll' : 'Use' }}</button>
      <ConfirmDelete class="del" title="Remove" @confirm="sheet.removeFeature(feature._id)" />
    </div>

    <div v-if="open && editing" class="editor">
      <label class="f f--wide">
        <span>Name</span>
        <input v-model="feature.name" />
      </label>
      <label class="f">
        <span>Group</span>
        <select v-model="feature.group">
          <option v-for="g in FEATURE_GROUPS" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>
      <label class="f f--narrow">
        <span>Level</span>
        <input v-model="levelInput" type="number" min="1" max="20" />
      </label>
      <label class="f f--narrow">
        <span>Fate</span>
        <input type="number" :value="fateText" :disabled="fateByLevel" @change="setFate($event.target.value)" />
      </label>
      <label class="f f--full">
        <span>Description</span>
        <textarea v-model="feature.text" rows="4" />
      </label>
      <div class="uses f--full">
        <div v-for="row in uses" :key="row._id" class="use">
          <label class="f">
            <span>Uses</span>
            <input v-model="row.name" :placeholder="feature.name" />
          </label>
          <label class="f f--narrow">
            <span>Max</span>
            <input
              type="number"
              min="0"
              :value="row.maxOverride ?? ''"
              :placeholder="ruleMax(row)"
              @change="setMaxOverride(row, $event.target.value)"
            />
          </label>
          <label class="f">
            <span>Recovery</span>
            <select v-model="row.recovery">
              <option v-for="r in RECOVERIES" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </label>
          <ConfirmDelete class="del" title="Remove uses" @confirm="sheet.removeResource(row._id)" />
        </div>
        <button type="button" class="mini" @click="sheet.addResource(feature._id)">+ Uses</button>
      </div>
      <div class="roll f--full">
        <label class="f">
          <span>Dice</span>
          <input
            :value="diceText"
            :disabled="bookDice"
            placeholder="1d8"
            @change="setRoll({ dice: $event.target.value.trim() })"
          />
        </label>
        <label v-for="i in [0, 1]" :key="i" class="f">
          <span>Plus</span>
          <select :value="plusAt(i)" @change="setPlus(i, $event.target.value)">
            <option value="">&mdash;</option>
            <option v-for="p in PLUS" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </label>
        <label class="f">
          <span>Effect</span>
          <select :value="roll?.heal ?? ''" @change="setRoll({ heal: $event.target.value })">
            <option value="">Roll</option>
            <option value="self">Heal Self</option>
            <option value="target">Heal Target</option>
          </select>
        </label>
        <label v-if="!roll?.heal" class="f">
          <span>Type</span>
          <input :value="roll?.type ?? ''" placeholder="Fire" @change="setRoll({ type: $event.target.value.trim() })" />
        </label>
        <label class="f">
          <span>Save</span>
          <select :value="saveChoice" @change="setSave($event.target.value)">
            <option value="">&mdash;</option>
            <option value="any">Any</option>
            <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </label>
        <label v-if="roll?.save" class="f">
          <span>Save DC</span>
          <select :value="dcKind" @change="setDcKind($event.target.value)">
            <option value="tech">Tech Save DC</option>
            <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.name }}</option>
            <option value="strength|dexterity">Strength or Dexterity</option>
            <option value="number">Number</option>
          </select>
        </label>
        <label v-if="dcKind === 'number'" class="f f--narrow">
          <span>DC</span>
          <input type="number" min="1" :value="roll.save.dc" @change="setDcNumber($event.target.value)" />
        </label>
        <label v-if="!uses.length && spendable.length" class="f">
          <span>Spends</span>
          <select :value="roll?.spends ?? ''" @change="setRoll({ spends: $event.target.value })">
            <option value="">&mdash;</option>
            <option v-for="s in spendable" :key="s.value" :value="s.value">{{ s.name }}</option>
          </select>
        </label>
      </div>
    </div>

    <div v-else-if="open" class="body">
      <p v-if="picked" class="picked">{{ picked.name }}</p>
      <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
      <p v-for="o in added" :key="o.name"><strong>{{ o.name }}.</strong> {{ o.text }}</p>
    </div>

    <div v-if="open" class="editbar">
      <button type="button" class="mini" title="Post the feature to chat" @click="rolls.postFeature(feature)">
        Show
      </button>
      <button
        type="button"
        class="mini"
        :title="editing ? 'Stop editing' : 'Edit this feature'"
        @click="emit('toggle-editing')"
      >
        {{ editing ? 'Done' : 'Edit' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.feature {
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.28);
  padding: 0 2px;

  &:last-child { border-bottom: none; }
  &.open { background: var(--ps-row-open); }
}

.line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
}

.name {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--ps-fs-body);
  font-weight: 700;
  color: var(--ps-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover { color: var(--ps-blue); }
}

.caret {
  display: inline-block;
  font-size: 9px;
  color: var(--ps-heading-soft);
  transition: transform 0.12s ease;

  &.turned { transform: rotate(90deg); }
}

.level {
  @include ps-caption;
  flex: 0 0 auto;
  font-size: 9px;
}

.value {
  flex: 0 0 auto;
  font-size: 10px;
  font-weight: 700;
  color: var(--ps-heading);
  white-space: nowrap;
}

.pick {
  @include ps-control(18px);
  flex: 0 1 auto;
  max-width: 130px;
  font-size: 10px;
  text-align: left;
  padding: 0 2px;

  &.unpicked { border-color: var(--ps-gold-dark); }
}

.picked { font-weight: 700; }

.act {
  @include ps-caption;
  flex: 0 0 auto;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 1px 6px;
  font-size: 9px;
  cursor: pointer;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); color: var(--ps-blue); }
  &:disabled { opacity: 0.45; cursor: default; }
}

.roll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 5px 8px;
  padding-top: 4px;
  border-top: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
}

.uses {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.use {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 56px minmax(0, 1fr) auto;
  gap: 5px 8px;
  align-items: end;
  width: 100%;
}

.del {
  @include ps-icon-button(13px, var(--ps-red));
  color: var(--ps-red);
  padding: 0;
}

.body {
  padding: 0 4px 4px 13px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--ps-text);

  p { margin: 0 0 4px; white-space: pre-line; }
}

.editor {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 56px;
  gap: 5px 8px;
  padding: 3px 4px 4px 13px;
}

.f {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; }

  input, select, textarea { @include ps-control(22px); }
  input { text-align: left; }

  textarea {
    height: auto;
    padding: 3px 4px;
    resize: vertical;
    text-align: left;
    line-height: 1.35;
  }

  &--narrow input { text-align: center; }
  &--full { grid-column: 1 / -1; }
}

.editbar {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 4px 3px;
}

.mini {
  @include ps-caption;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 6px;
  cursor: pointer;
  font-size: 9px;

  &:hover { background: var(--ps-panel-alt); }
}

@container (max-width: 260px) {
  .editor { grid-template-columns: minmax(0, 1fr) 56px; }
  .f--wide { grid-column: 1 / -1; }
}
</style>
