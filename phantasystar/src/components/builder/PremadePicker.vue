<script setup>
import { computed, ref, watch } from 'vue'
import { useBuilder } from '@/composables/useBuilder.js'
import { levelRange } from '@/builder/premades.js'
import { ABILITIES, SKILLS, WEAPON_TYPES, formatModifier } from '@/rules/index.js'

const props = defineProps({ premades: { type: Array, default: () => [] } })
defineEmits(['back'])

const { startPremade, building } = useBuilder()

const search = ref('')
const shown = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.premades
  return props.premades.filter((p) => [p.name, p.profession, p.path, p.species, p.background]
    .some((v) => v.toLowerCase().includes(q)))
})

const picked = ref(props.premades[0]?.pageName ?? '')
const premade = computed(() => props.premades.find((p) => p.pageName === picked.value) ?? null)

const level = ref(1)
const choosing = ref(false)
watch(premade, (p) => {
  level.value = p?.levels[0] ?? 1
  choosing.value = false
})
if (premade.value) level.value = premade.value.levels[0]

const summary = computed(() => premade.value?.summaries[level.value] ?? {})
const skillName = (id) => SKILLS.find((s) => s.id === id)?.name ?? id
const skills = computed(() => Object.entries(summary.value.skills ?? {})
  .filter(([, n]) => n > 0)
  .map(([id, n]) => ({ id, name: skillName(id), ranks: n, doubled: (summary.value.doubled ?? []).includes(id) }))
  .sort((a, b) => a.name.localeCompare(b.name)))
const isWeapon = (name) => WEAPON_TYPES.some((w) => w.name === name)
const masteries = computed(() => (summary.value.proficiencies ?? []).filter(isWeapon))
const proficiencies = computed(() => (summary.value.proficiencies ?? []).filter((n) => !isWeapon(n)))
const techniques = computed(() => [...(summary.value.techniques ?? []), ...(summary.value.granted ?? [])])

const begin = (at) => {
  if (premade.value) startPremade(premade.value, at)
}
</script>

<template>
  <div class="picker">
    <div class="picker__bar">
      <button type="button" class="picker__back" @click="$emit('back')">&larr; Back</button>
      <h1 class="picker__title">Ready-to-Play Characters</h1>
    </div>

    <div class="picker__body">
      <div class="picker__list">
        <input v-model="search" class="picker__search" placeholder="Search Characters" aria-label="Search characters" />
        <button
          v-for="p in shown"
          :key="p.pageName"
          type="button"
          class="entry"
          :class="{ 'entry--on': p.pageName === picked }"
          @click="picked = p.pageName"
        >
          <img v-if="p.art" :src="p.art" alt="" class="entry__art" />
          <span v-else class="entry__art entry__art--none">{{ p.name.slice(0, 1) }}</span>
          <span class="entry__text">
            <strong>{{ p.name }}</strong>
            <small>{{ p.profession }}</small>
          </span>
          <span class="entry__levels">{{ levelRange(p) }}</span>
        </button>
      </div>

      <div v-if="premade" class="detail">
        <div class="detail__head">
          <img v-if="premade.art" :src="premade.art" alt="" class="detail__art" />
          <div>
            <h2 class="detail__name">{{ premade.name }}</h2>
            <p v-if="premade.concept" class="concept">{{ premade.concept }}</p>
            <p class="about">
              <span><b>Profession</b> {{ premade.profession }} ({{ premade.path }})</span>
              <span><b>Species</b> {{ premade.species }}</span>
              <span><b>Background</b> {{ premade.background }}</span>
              <span><b>Character Level</b> {{ levelRange(premade) }}</span>
            </p>
          </div>
        </div>
        <div class="detail__main">
          <section class="block">
            <h3>About</h3>
            <p>{{ premade.bio }}</p>
          </section>

          <section class="block">
            <h3>Abilities <small>Level {{ level }}</small></h3>
            <div class="abilities">
              <div v-for="a in ABILITIES" :key="a.id" class="ability">
                <b>{{ formatModifier(summary.abilities?.[a.id] ?? 0) }}</b>
                <small>{{ a.abbr }}</small>
              </div>
            </div>
          </section>

          <section class="block">
            <h3>Skills</h3>
            <div class="chips">
              <span v-for="s in skills" :key="s.id" class="chip">{{ s.name }} {{ s.ranks }}<template v-if="s.doubled"> &times;2</template></span>
            </div>
          </section>

          <section v-if="techniques.length" class="block">
            <h3>Techniques</h3>
            <div class="chips">
              <span v-for="t in techniques" :key="t" class="chip">{{ t }}</span>
            </div>
          </section>

          <section class="block">
            <h3>Features</h3>
            <div v-for="f in summary.features ?? []" :key="f.source" class="features">
              <b>{{ f.source }}</b>
              <span>{{ f.names.join(', ') }}</span>
            </div>
          </section>

          <section v-if="masteries.length" class="block">
            <h3>Weapon Mastery</h3>
            <p>{{ masteries.join(', ') }}</p>
          </section>

          <section v-if="proficiencies.length" class="block">
            <h3>Proficiencies</h3>
            <p>{{ proficiencies.join(', ') }}</p>
          </section>
        </div>
      </div>
    </div>

    <div v-if="premade" class="picker__foot">
      <div v-if="choosing" class="levels">
        <button
          v-for="n in premade.levels"
          :key="n"
          type="button"
          class="level"
          :aria-pressed="n === level ? 'true' : 'false'"
          @click="level = n"
        >{{ n }}</button>
      </div>
      <button v-if="!choosing && premade.levels.length > 1" type="button" class="picker__choose" @click="choosing = true">Choose a Level</button>
      <button type="button" class="picker__start" :disabled="building" @click="begin(level)">
        {{ building ? 'Building…' : `Start as Level ${level}` }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.picker {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.picker__bar { display: flex; align-items: center; gap: 12px; }
.picker__back { @include ps-icon-button(13px); }
.picker__title { @include ps-heading(22px); margin: 0; }

.picker__body {
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.picker__list { display: flex; flex-direction: column; gap: 6px; }
.picker__search { @include ps-control(28px); text-align: left; padding: 0 8px; }

.entry {
  @include ps-panel(var(--ps-panel));
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: var(--ps-text);

  &:hover { background: var(--ps-panel-alt); }
  &--on { outline: 2px solid var(--ps-gold); outline-offset: -2px; }

  &__art { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
  &__art--none {
    display: flex; align-items: center; justify-content: center;
    background: var(--ps-panel-alt); color: var(--ps-heading); font-weight: 700;
  }
  &__text { display: flex; flex-direction: column; min-width: 0; }
  &__text strong { color: var(--ps-heading); font-size: 13px; }
  &__text small { color: var(--ps-text-muted); font-size: 11px; }
  &__levels { @include ps-chip; font-size: 10px; padding: 1px 6px; }
}

.detail {
  @include ps-panel(var(--ps-panel));
  padding: 12px;
  min-width: 0;

  &__head { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
  &__art { width: 110px; height: 110px; flex: 0 0 auto; object-fit: contain; }
  &__name { @include ps-heading(22px); margin: 0 0 2px; }
}

.block {
  border-top: 1px solid var(--ps-line-soft);
  padding: 6px 0;
  font-size: var(--ps-fs-body);

  h3 { @include ps-caption; margin: 0 0 4px; display: flex; align-items: center; gap: 6px; }
  h3 small { color: var(--ps-text-muted); text-transform: none; }
  p { margin: 0 0 4px; }
}

.badge { @include ps-chip; font-size: 10px; padding: 1px 6px; }
.about { display: flex; flex-wrap: wrap; gap: 2px 14px; margin: 0; font-size: var(--ps-fs-body); }
.concept { font-style: italic; color: var(--ps-heading); margin: 0 0 4px; }

.abilities { display: grid; grid-template-columns: repeat(6, minmax(0, 56px)); gap: 6px; }
.ability {
  @include ps-well;
  display: flex; flex-direction: column; align-items: center; padding: 3px 0;
  b { font-size: 16px; }
  small { @include ps-caption; font-size: 9px; }
}

.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { @include ps-chip; font-size: 11px; padding: 2px 7px; }

.features { display: flex; flex-wrap: wrap; gap: 0 8px; margin-bottom: 3px; b { color: var(--ps-heading); } }

.picker__foot { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.levels { display: flex; gap: 4px; }
.level {
  @include ps-chip(true);
  min-width: 30px; justify-content: center;
  &[aria-pressed='true'] { background: var(--ps-blue); border-color: var(--ps-blue); color: var(--ps-on-fill, #fff); }
}
.picker__choose { @include ps-button(var(--ps-field), var(--ps-panel-alt)); padding: 7px 14px; color: var(--ps-heading); }
.picker__start { @include ps-button; padding: 8px 22px; font-size: 14px; }
.picker__start:disabled { opacity: 0.5; cursor: default; }

@media (max-width: 720px) {
  .picker__body { grid-template-columns: 1fr; }
}
</style>
