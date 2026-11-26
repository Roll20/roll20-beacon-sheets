<script setup>
import { computed, ref } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useCatalog, loadCategory } from '@/composables/useCatalog.js'
import { formatModifier } from '@/rules/index.js'
import { averageHpPerLevel } from '@/rules/derived.js'
import { finalAbilities } from '@/builder/abilities.js'
import { HP_METHODS, hpRolls, hpReady, levelsPastFirst, maxHp } from '@/builder/hp.js'
import { featuresOf } from '@/builder/choices.js'
import getRollResult from '@/utility/getRollResult.js'
import postToChat from '@/utility/postToChat.js'
import StepFlag from './StepFlag.vue'

const props = defineProps({
  profession: { type: Object, required: true },
  path: { type: Object, default: null },
})

const builder = useBuilderStore()
const meta = useMetaStore()
const { lists } = useCatalog()
loadCategory('Species')

const hp = computed(() => builder.draft.hp)
const level = computed(() => builder.draft.level)
const hitDie = computed(() => props.profession.payload?.professionStats?.hitDie ?? null)
const count = computed(() => levelsPastFirst(level.value))
const rolls = computed(() => (Number(hp.value.die) === hitDie.value ? hpRolls(hp.value) : []))
const missing = computed(() => Math.max(0, count.value - rolls.value.length))
const ready = computed(() => hpReady(hp.value, level.value, hitDie.value))

const con = computed(() => finalAbilities(builder.draft.abilities).constitution ?? null)
const species = computed(() => (lists.Species?.options ?? []).find((o) => o.pageName === builder.draft.species?.pageName))
const flat = computed(() => [props.profession, props.path].filter(Boolean)
  .flatMap((o) => featuresOf(o, level.value))
  .reduce((sum, f) => sum + (Number.isInteger(f.entry.maxHp) ? f.entry.maxHp : 0), 0))
const total = computed(() => (con.value == null ? null : maxHp({
  hitDie: hitDie.value,
  con: con.value,
  level: level.value,
  hp: { ...hp.value, die: hitDie.value, rolled: rolls.value.join('|') },
  hpPerLevel: species.value?.payload?.hpPerLevel ?? 0,
  flat: flat.value,
})))

const setMethod = (id) => {
  hp.value.method = id
}

const rolling = ref(false)
const rollError = ref('')

const roll = async (again = false) => {
  if (rolling.value || !hitDie.value) return
  const kept = again ? [] : rolls.value.slice(0, count.value)
  const needed = count.value - kept.length
  if (needed <= 0) return
  rolling.value = true
  rollError.value = ''
  try {
    const result = await getRollResult([{ key: 'hp', count: needed, sides: hitDie.value }])
    const faces = result.hp?.faces ?? []
    builder.draft.hp = { method: 'roll', rolled: [...kept, ...faces].join('|'), die: hitDie.value }
    const first = kept.length + 2
    await postToChat('chat', {
      characterName: builder.draft.concept.name || meta.name || 'New Character',
      title: 'Hit Points',
      subtitle: `Levels ${first}–${level.value} (${needed}d${hitDie.value})`,
      keyValues: { Rolls: faces.join(', ') },
    })
  } catch (error) {
    rollError.value = `The roll failed: ${error?.message ?? error}`
  } finally {
    rolling.value = false
  }
}
</script>

<template>
  <div class="hp">
    <StepFlag :done="ready" />
    <span class="hp__title">Hit Points</span>
    <div class="hp__methods">
      <button
        v-for="m in HP_METHODS"
        :key="m.id"
        type="button"
        class="tab"
        :class="{ 'tab--on': hp.method === m.id }"
        @click="setMethod(m.id)"
      >{{ m.label }}</button>
    </div>

    <p class="hp__line">
      Level 1: d{{ hitDie }} + CON.
      <template v-if="hp.method === 'average'">Levels 2–{{ level }}: {{ averageHpPerLevel(hitDie, 0) }} + CON each.</template>
      <template v-else>Levels 2–{{ level }}: a d{{ hitDie }} + CON each, at least 1.</template>
    </p>

    <div v-if="hp.method === 'roll'" class="hp__rolls">
      <button v-if="missing" type="button" class="roll" :disabled="rolling" @click="roll()">
        {{ rolling ? 'Rolling…' : `Roll ${missing}d${hitDie}` }}
      </button>
      <span v-for="(f, i) in rolls.slice(0, count)" :key="i" class="chip" :title="`Level ${i + 2}`">{{ f }}</span>
      <button v-if="rolls.length && !missing" type="button" class="link" :disabled="rolling" @click="roll(true)">Roll Again</button>
      <span v-if="rollError" class="hp__error">{{ rollError }}</span>
    </div>

    <p v-if="total != null" class="hp__total">
      Max HP <strong>{{ total }}</strong> <small>(CON {{ formatModifier(con) }})</small>
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.hp {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 6px 10px;
  margin-top: 10px;
}

.hp__title { @include ps-heading(15px); }
.hp__methods { display: flex; gap: 4px; }

.hp__line,
.hp__rolls,
.hp__total {
  grid-column: 2 / -1;
  margin: 0;
  font-size: 12px;
}

.hp__line { color: var(--ps-text-muted); }
.hp__rolls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.hp__total strong { @include ps-heading(16px); }
.hp__total small { color: var(--ps-text-muted); }
.hp__error { color: var(--ps-red); }

.tab {
  @include ps-heading(11px);
  padding: 3px 10px;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  background: var(--ps-panel);
  color: var(--ps-heading);
  cursor: pointer;

  &--on { background: var(--ps-fill); color: var(--ps-on-fill); }
}

.roll {
  @include ps-button;
  padding: 4px 12px;
  &:disabled { opacity: 0.6; cursor: default; }
}

.chip { @include ps-chip; font-size: 11px; }

.link {
  border: none;
  background: none;
  padding: 0 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ps-heading);

  &:hover { text-decoration: underline; }
}

</style>
