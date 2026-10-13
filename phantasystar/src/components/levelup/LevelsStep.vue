<script setup>
import { computed, ref } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { gainedFeatures, levelUpChoices, hpGain, hpRolls, newLevels, abilitiesAfter, MAX_LEVEL } from '@/builder/levelUp.js'
import { formatModifier } from '@/rules/index.js'
import getRollResult from '@/utility/getRollResult.js'
import postToChat from '@/utility/postToChat.js'
import PendingChoice from '@/components/builder/PendingChoice.vue'
import StepFlag from '@/components/builder/StepFlag.vue'

const { store, ctx, paths, maxTp } = useLevelUp()
const sheet = useCharacterStore()
const meta = useMetaStore()

const lu = computed(() => store.lu)
const profession = computed(() => ctx.value.profession)

const setTo = (value) => {
  const n = Math.trunc(Number(value)) || lu.value.from + 1
  lu.value.to = Math.min(MAX_LEVEL, Math.max(lu.value.from + 1, n))
}

const hp = computed(() => hpGain(ctx.value, lu.value, paths.value))
const con = computed(() => abilitiesAfter(ctx.value, lu.value, paths.value).constitution)
const perLevel = computed(() => Number(ctx.value.species?.payload?.hpPerLevel) || 0)
const rolls = computed(() => hpRolls(lu.value))
const missing = computed(() => Math.max(0, newLevels(lu.value).length - rolls.value.length))
const maxBefore = computed(() => Number(sheet.hp.max) || 0)

const METHODS = [{ id: 'average', label: 'Take Average' }, { id: 'roll', label: 'Roll' }]
const setMethod = (id) => { lu.value.hp = { ...lu.value.hp, method: id } }

const rolling = ref(false)
const rollError = ref('')

const roll = async (again = false) => {
  const hitDie = hp.value.hitDie
  if (rolling.value || !hitDie) return
  const kept = again ? [] : rolls.value.slice(0, newLevels(lu.value).length)
  const needed = newLevels(lu.value).length - kept.length
  if (needed <= 0) return
  rolling.value = true
  rollError.value = ''
  try {
    const result = await getRollResult([{ key: 'hp', count: needed, sides: hitDie }])
    const faces = result.hp?.faces ?? []
    lu.value.hp = { method: 'roll', rolled: [...kept, ...faces].join('|') }
    const first = lu.value.from + 1 + kept.length
    await postToChat('chat', {
      characterName: meta.name || 'Character',
      title: 'Hit Points',
      subtitle: first === lu.value.to ? `Level ${first} (d${hitDie})` : `Levels ${first}–${lu.value.to} (${needed}d${hitDie})`,
      keyValues: { Rolls: faces.join(', ') },
    })
  } catch (error) {
    rollError.value = `The roll failed: ${error?.message ?? error}`
  } finally {
    rolling.value = false
  }
}

const choices = computed(() => levelUpChoices(ctx.value, lu.value, paths.value))
const features = computed(() => gainedFeatures(ctx.value, lu.value, paths.value))

const setChoice = (key, value) => {
  if (key === 'path') {
    lu.value.path = value
    return
  }
  const next = { ...lu.value.choices }
  if (value) next[key] = value
  else delete next[key]
  lu.value.choices = next
}

const open = ref({})
const toggle = (key) => { open.value = { ...open.value, [key]: !open.value[key] } }
</script>

<template>
  <div v-if="profession" class="levels">
    <header class="head">
      <div class="head__title">
        <h2 class="head__name">{{ profession.pageName }}</h2>
        <p v-if="profession.payload?.tagline" class="tagline">{{ profession.payload.tagline }}</p>
      </div>
      <div class="level">
        <span class="section-title">Level</span>
        <span class="level__from">{{ lu.from }} →</span>
        <div class="stepper">
          <button type="button" :disabled="lu.to <= lu.from + 1" aria-label="Lower" @click="setTo(lu.to - 1)">−</button>
          <input type="number" :min="lu.from + 1" :max="MAX_LEVEL" :value="lu.to" aria-label="New level" @change="setTo($event.target.value)" />
          <button type="button" :disabled="lu.to >= MAX_LEVEL" aria-label="Raise" @click="setTo(lu.to + 1)">+</button>
        </div>
      </div>
    </header>

    <section class="hp">
      <StepFlag :done="hp.ready" />
      <span class="hp__title">Hit Points</span>
      <div class="hp__methods">
        <button
          v-for="m in METHODS"
          :key="m.id"
          type="button"
          class="tab"
          :class="{ 'tab--on': lu.hp.method === m.id }"
          @click="setMethod(m.id)"
        >{{ m.label }}</button>
      </div>

      <div v-if="lu.hp.method === 'roll'" class="hp__rolls">
        <button v-if="missing" type="button" class="roll" :disabled="rolling" @click="roll()">
          {{ rolling ? 'Rolling…' : `Roll ${missing}d${hp.hitDie}` }}
        </button>
        <button v-else type="button" class="link" :disabled="rolling" @click="roll(true)">Roll Again</button>
        <span v-if="rollError" class="hp__error">{{ rollError }}</span>
      </div>

      <ul class="hp__levels">
        <li v-for="l in hp.levels" :key="l.level">
          <span class="hp__level">Level {{ l.level }}</span>
          <template v-if="l.value != null">
            <span class="hp__sum">
              <template v-if="l.die != null">{{ l.die }} (d{{ hp.hitDie }})</template>
              <template v-else>d{{ hp.hitDie }} average</template>
              + CON {{ formatModifier(con) }}<template v-if="perLevel"> + {{ perLevel }}</template>
            </span>
            <strong>+{{ l.value }}</strong>
          </template>
          <span v-else class="hp__sum">Not rolled</span>
        </li>
        <li v-if="hp.flat">
          <span class="hp__level">Features</span>
          <span class="hp__sum" />
          <strong>+{{ hp.flat }}</strong>
        </li>
        <li v-if="hp.earlier">
          <span class="hp__level">CON Raise</span>
          <span class="hp__sum">{{ lu.from === 1 ? 'Level 1' : `Levels 1–${lu.from}` }}, +{{ hp.earlier / lu.from }} each</span>
          <strong>+{{ hp.earlier }}</strong>
        </li>
      </ul>

      <p v-if="hp.total != null" class="hp__total">
        Max HP {{ maxBefore }} → <strong>{{ maxBefore + hp.total }}</strong>
      </p>
    </section>

    <section v-if="maxTp.before || maxTp.after" class="tp">
      <h3 class="tp__title">Technique Points</h3>
      <p class="hp__total">
        Max TP {{ maxTp.before }} → <strong>{{ maxTp.after }}</strong>
      </p>
    </section>

    <h3 class="section-title">Pending Choices</h3>
    <div class="pending">
      <PendingChoice
        v-for="c in choices"
        :key="c.key"
        :number="c.level"
        :choice="c"
        :model-value="c.key === 'path' ? lu.path : lu.choices[c.key] ?? ''"
        @update:model-value="setChoice(c.key, $event)"
      />
      <p v-if="!choices.length" class="clear">No choices at these levels.</p>
    </div>

    <h3 class="section-title">Features</h3>
    <ul class="features">
      <li v-for="f in features" :key="`${f.source}:${f.id}:${f.level}`" class="feature">
        <button type="button" class="feature__head" :aria-expanded="!!open[`${f.source}:${f.id}`]" @click="toggle(`${f.source}:${f.id}`)">
          <span class="caret" :class="{ turned: open[`${f.source}:${f.id}`] }">&#9656;</span>
          <span class="badge">{{ f.level }}</span>
          <span class="feature__name">{{ f.name }}</span>
          <span v-if="f.source === 'path'" class="feature__source">{{ lu.path || ctx.pathName }}</span>
        </button>
        <div v-if="open[`${f.source}:${f.id}`]" class="feature__text">
          <p v-for="(para, i) in f.text" :key="i">{{ para }}</p>
        </div>
      </li>
      <li v-if="!features.length" class="clear">No new features at these levels.</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ps-line);
}

.head__name { @include ps-heading(22px); margin: 0; }
.tagline { margin: 2px 0 0; font-size: 13px; font-style: italic; color: var(--ps-text); }

.level { display: flex; align-items: center; gap: 8px; }
.level__from { font-size: 14px; font-weight: 700; color: var(--ps-text-muted); }

.section-title {
  @include ps-heading(15px);
  display: block;
  margin: 14px 0 4px;

  .level & { margin: 0; }
}

.stepper {
  display: inline-flex;
  align-items: center;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  overflow: hidden;

  button {
    width: 26px;
    height: 26px;
    border: none;
    background: var(--ps-panel);
    color: var(--ps-heading);
    font-weight: 800;
    cursor: pointer;
    &:disabled { opacity: 0.4; cursor: default; }
  }

  input {
    width: 40px;
    height: 26px;
    border: none;
    border-left: var(--ps-border-thin);
    border-right: var(--ps-border-thin);
    background: var(--ps-field);
    color: var(--ps-text);
    text-align: center;
    font-family: inherit;
    font-weight: 700;
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  }
}

.hp {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 6px 10px;
  margin-top: 12px;
}

.hp__title { @include ps-heading(15px); }

.tp {
  display: grid;
  grid-template-columns: 18px auto;
  column-gap: 10px;
  margin-top: 14px;

  .tp__title { @include ps-heading(15px); grid-column: 2; margin: 0 0 4px; }
  .hp__total { grid-column: 2; margin: 0; font-size: 12px; }
}
.hp__methods { display: flex; gap: 4px; }

.hp__rolls,
.hp__levels,
.hp__total {
  grid-column: 2 / -1;
  margin: 0;
  font-size: 12px;
}

.hp__rolls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.hp__error { color: var(--ps-red); }

.hp__levels {
  list-style: none;
  padding: 0;
  max-width: 420px;

  li {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    gap: 8px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);
  }
}

.hp__level { @include ps-caption; align-self: center; }
.hp__sum { color: var(--ps-text-muted); }
.hp__total strong { @include ps-heading(16px); }

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

.clear { margin: 4px; font-size: 12px; color: var(--ps-text-muted); }

.features { list-style: none; margin: 0; padding: 0; }

.feature { border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.28); }

.feature__head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 2px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.caret {
  font-size: 9px;
  color: var(--ps-heading-soft);
  transition: transform 0.15s;
  &.turned { transform: rotate(90deg); }
}

.badge {
  @include ps-chip;
  min-width: 22px;
  justify-content: center;
}

.feature__name { font-weight: 700; color: var(--ps-heading); font-size: 13px; }
.feature__source { @include ps-chip; margin-left: auto; }

.feature__text {
  padding: 0 8px 8px 46px;
  font-size: 12px;
  color: var(--ps-text);
  p { margin: 0 0 6px; line-height: 1.45; }
}
</style>
