<script setup>
import { reactive, ref, computed } from 'vue'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { ABILITIES, COMBO_MIN_LEVEL, parseLevels, formatModifier } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  combo: { type: Object, required: true },
})

const store = useTechniqueStore()
const sheet = useCharacterStore()
const rolls = useSheetRolls()

const entry = computed(() => store.combos.find((c) => c._id === props.combo._id) ?? props.combo)

const editing = computed(() => store.isRowEditing(props.combo._id))
const toggleEditing = () =>
  store.setRowUI(props.combo._id, { open: !editing.value, editing: !editing.value })

const mode = ref(null)
const form = reactive({ others: '', mod: 0, tp: null, joinTp: 0 })

const open = (next) => {
  mode.value = mode.value === next ? null : next
  form.tp = null
}

const plan = computed(() =>
  rolls.comboPlan(props.combo, { otherLevels: parseLevels(form.others), tpShare: form.tp }),
)

const tpShown = computed({
  get: () => form.tp ?? plan.value.tier?.tp ?? 0,
  set: (v) => { form.tp = v === '' ? null : Number(v) },
})

const levelOk = computed(() => (Number(sheet.effectiveLevel) || 0) >= COMBO_MIN_LEVEL)

const blocked = computed(() => {
  const p = plan.value
  if (!p.levelOk) return `Needs level ${COMBO_MIN_LEVEL}`
  if (!p.avgOk) return `Needs an average level of ${Math.max(COMBO_MIN_LEVEL, props.combo.level)}`
  if (!p.fateOk) return `Needs ${p.fateCost} fate points`
  if (!p.tpOk) return `Needs ${p.tpShare} TP`
  return null
})

const direct = async () => {
  const done = await rolls.directCombo(props.combo, {
    otherLevels: parseLevels(form.others),
    participantMods: [form.mod],
    tpShare: form.tp,
  })
  if (done) mode.value = null
}

const join = async () => {
  const done = await rolls.joinCombo(props.combo, form.joinTp)
  if (done != null) mode.value = null
}

const damageTier = computed(() => rolls.comboDamageTier(props.combo))
</script>

<template>
  <div class="combo" :class="{ open: editing || mode }">
    <div class="combo__main">
      <button type="button" class="combo__name" :title="editing ? 'Close' : 'Edit'" @click="toggleEditing()">
        <span class="disclose">{{ editing ? '▾' : '▸' }}</span>
        {{ combo.name || 'Untitled Combo' }}
      </button>
      <span class="combo__req">Level {{ combo.level }}</span>

      <div class="combo__actions">
        <button type="button" class="mini" :class="{ on: mode === 'direct' }" :disabled="!levelOk" @click="open('direct')">
          Direct
        </button>
        <button type="button" class="mini" :class="{ on: mode === 'join' }" :disabled="!levelOk" @click="open('join')">
          Join
        </button>
        <button type="button" class="mini" :disabled="!damageTier" @click="rolls.rollComboDamage(combo)">
          Damage<template v-if="damageTier"> ({{ damageTier.damage }})</template>
        </button>
        <ConfirmDelete class="mini mini--danger" title="Remove this combo" @confirm="store.removeCombo(combo._id)" />
      </div>
    </div>

    <div v-if="mode === 'direct'" class="combo__form">
      <label class="wide">
        <span>Other Levels</span>
        <input v-model="form.others" placeholder="7, 8" />
      </label>
      <div class="readout">
        <span>Average</span>
        <b>{{ plan.average || '—' }}</b>
      </div>
      <label v-if="combo.saveAbility">
        <span>Highest Tech Mod</span>
        <input v-model.number="form.mod" type="number" />
      </label>
      <label>
        <span>TP<template v-if="plan.tier"> of {{ plan.tier.tp }}</template></span>
        <input v-model="tpShown" type="number" min="0" />
      </label>
      <div class="buttons">
        <button type="button" class="mini mini--go" :disabled="!!blocked" :title="blocked ?? ''" @click="direct()">
          Cast
        </button>
        <button type="button" class="mini" @click="mode = null">Cancel</button>
      </div>
    </div>

    <div v-if="mode === 'join'" class="combo__form">
      <label>
        <span>TP</span>
        <input v-model.number="form.joinTp" type="number" min="0" />
      </label>
      <div class="buttons">
        <button
          type="button"
          class="mini mini--go"
          :disabled="form.joinTp > sheet.tp.current"
          @click="join()"
        >
          Spend
        </button>
        <button type="button" class="mini" @click="mode = null">Cancel</button>
      </div>
    </div>

    <div v-if="editing" class="combo__edit">
      <label class="wide">
        <span>Name</span>
        <input v-model="entry.name" placeholder="Combo name" />
      </label>
      <label>
        <span>Level</span>
        <input v-model.number="entry.level" type="number" :min="COMBO_MIN_LEVEL" max="20" />
      </label>
      <label>
        <span>Saving Throw</span>
        <select v-model="entry.saveAbility">
          <option :value="null">None</option>
          <option v-for="a in ABILITIES" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </label>
      <label>
        <span>Damage Type</span>
        <input v-model="entry.damageType" />
      </label>
      <label class="full">
        <span>Notes</span>
        <textarea v-model="entry.note" rows="2" />
      </label>
      <div v-if="combo.saveAbility" class="readout">
        <span>Your Tech Save DC</span>
        <b>{{ sheet.techSaveDCValue ?? '—' }}</b>
      </div>
      <div class="readout">
        <span>Your Tech Mod</span>
        <b>{{ formatModifier(sheet.techAbilityMod ?? 0) }}</b>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.combo {
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

  &__req { font-size: 10px; color: var(--ps-text-muted); }

  &__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; }

  &__form, &__edit {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    align-items: end;
    gap: 5px 7px;
    padding: 6px 8px 6px 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    min-width: 0;

    > span { @include ps-caption; font-size: 8.5px; margin-bottom: 1px; }

    &.wide { grid-column: span 2; }
    &.full { grid-column: 1 / -1; }
  }

  input, select, textarea {
    @include ps-well;
    height: 22px;
    font-size: 11.5px;
    text-align: left;
    padding: 0 4px;
    min-width: 0;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  input[type='number'] { text-align: center; }

  textarea { height: auto; padding: 4px; line-height: 1.4; resize: vertical; }
}

.readout {
  display: flex;
  flex-direction: column;

  > span { @include ps-caption; font-size: 8.5px; margin-bottom: 1px; }
  > b { font-size: 13px; line-height: 22px; color: var(--ps-heading); }
}

.buttons { display: flex; gap: 4px; align-items: center; padding-bottom: 2px; }

.disclose { color: var(--ps-heading-soft); font-size: 10px; }

.mini {
  @include ps-caption;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 6px;
  cursor: pointer;
  font-size: 9px;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &.on, &--go { background: var(--ps-fill); color: var(--ps-on-fill); }
  &.on:hover:not(:disabled), &--go:hover:not(:disabled) { background: var(--ps-blue); }
  &--danger:hover { background: var(--ps-red); color: var(--ps-on-fill); border-color: var(--ps-red); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
</style>
