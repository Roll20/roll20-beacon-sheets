<script setup>
import { computed, ref, watch } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useCatalog } from '@/composables/useCatalog.js'
import { pagePointer, MAX_LEVEL } from '@/builder/draft.js'
import { pathsOf, compendiumUrl } from '@/builder/catalog.js'
import { openCompendium } from '@/utility/openCompendium.js'
import { choicesOf, needsOf, pathLevelOf } from '@/builder/choices.js'
import { STEPS } from '@/builder/steps.js'
import { builderSetting, inSetting, settingNames } from '@/builder/setting.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import OptionCard from '../OptionCard.vue'
import OptionFeatures from '../OptionFeatures.vue'
import PendingChoice from '../PendingChoice.vue'
import HitPoints from '../HitPoints.vue'

const props = defineProps({ step: { type: Object, required: true } })

const builder = useBuilderStore()
const { lists, loadCategory } = useCatalog()

const isProfession = computed(() => props.step.id === 'profession')
const kindName = computed(() => ({ species: 'Species', background: 'Background', profession: 'Profession' })[props.step.id])

const browsing = ref(false)
const previewing = ref(null)

watch(() => props.step.id, () => {
  loadCategory(props.step.category)
  if (isProfession.value) loadCategory('Paths')
  browsing.value = false
  previewing.value = null
}, { immediate: true })

const list = computed(() => lists[props.step.category])
const options = computed(() => list.value?.options ?? [])
const retry = () => loadCategory(props.step.category)

const pick = computed(() => builder.draft[props.step.id])
const chosen = computed(() => (pick.value ? options.value.find((o) => o.pageName === pick.value.pageName) ?? null : null))
const level = computed(() => (isProfession.value ? builder.draft.level : 1))

const paths = computed(() => (isProfession.value && chosen.value ? pathsOf(chosen.value, lists.Paths?.options ?? []) : []))
const pathPick = computed(() => builder.draft.path)
const chosenPath = computed(() => (pathPick.value ? paths.value.find((p) => p.pageName === pathPick.value.pageName) ?? null : null))
const pathLevel = computed(() => pathLevelOf(chosen.value))
const pathOpen = computed(() => isProfession.value && pathLevel.value != null && level.value >= pathLevel.value)

const choices = computed(() => (chosen.value ? choicesOf(chosen.value, level.value) : { now: [], later: [] }))
const pathChoices = computed(() => (chosenPath.value && pathOpen.value ? choicesOf(chosenPath.value, level.value) : { now: [], later: [] }))
const later = computed(() => [...choices.value.later, ...pathChoices.value.later])

const pathChoice = computed(() => ({
  key: 'path',
  label: 'Path',
  count: 1,
  options: paths.value.map((p) => ({ value: p.pageName, name: p.pageName })),
}))

const setting = computed(() => builderSetting(builder.draft, sharedSettings.setting))
const tagOf = (option) => (inSetting(option, setting.value) ? '' : settingNames(option))

const STEP_LABELS = Object.fromEntries(STEPS.map((s) => [s.id, s.label]))
const laterStep = (id) => STEP_LABELS[id] ?? 'Sheet'

const kindOf = (id) => (id === 'profession' ? 'profession' : '')

const showList = computed(() => !previewing.value && (!pick.value || browsing.value))

const choose = (option) => {
  const same = pick.value?.pageName === option.pageName
  builder.draft[props.step.id] = {
    ...pagePointer(option),
    choices: same ? { ...pick.value.choices } : {},
    needs: needsOf(option, level.value, { kind: kindOf(props.step.id) }),
  }
  if (isProfession.value && !same) {
    builder.draft.path = null
    builder.draft.hp = { ...builder.draft.hp, rolled: '', die: 0 }
  }
  previewing.value = null
  browsing.value = false
}

const remove = () => {
  builder.draft[props.step.id] = null
  if (isProfession.value) builder.draft.path = null
}

const choosePath = (name) => {
  const option = paths.value.find((p) => p.pageName === name)
  builder.draft.path = option
    ? { ...pagePointer(option), choices: {}, needs: needsOf(option, level.value) }
    : null
}

const setChoice = (target, key, value) => {
  const held = builder.draft[target]
  if (!held) return
  const next = { ...held.choices }
  if (value) next[key] = value
  else delete next[key]
  held.choices = next
}

const setLevel = (value) => {
  builder.draft.level = Math.min(MAX_LEVEL, Math.max(1, Math.trunc(Number(value)) || 1))
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
watch([chosen, chosenPath, level], () => {
  if (chosen.value && pick.value) {
    const needs = needsOf(chosen.value, level.value, { kind: kindOf(props.step.id) })
    if (!same(needs, pick.value.needs)) pick.value.needs = needs
  }
  if (isProfession.value && chosenPath.value && pathPick.value) {
    const needs = needsOf(chosenPath.value, level.value)
    if (!same(needs, pathPick.value.needs)) pathPick.value.needs = needs
  }
}, { immediate: true })
</script>

<template>
  <div class="option-step">
    <p v-if="!list || list.status === 'loading'" class="status">Loading {{ step.category }}…</p>
    <div v-else-if="list.status === 'error'" class="status status--error">
      <p>{{ list.error }}</p>
      <button type="button" class="link" @click="retry">Try Again</button>
    </div>

    <section v-else-if="previewing" class="preview">
      <button type="button" class="link" @click="previewing = null">← All {{ step.category }}</button>
      <div class="preview__body" :class="{ 'preview__body--art': step.cards }">
        <OptionCard v-if="step.cards" :option="previewing" :chosen="pick?.pageName === previewing.pageName" class="preview__card" />
        <div class="preview__text">
          <header class="head">
            <h2 class="head__name">{{ previewing.pageName }}</h2>
            <a
              class="book"
              :href="compendiumUrl(previewing)"
              target="_blank"
              rel="noopener"
              @click.prevent="openCompendium(compendiumUrl(previewing))"
              title="Open in the Compendium"
              aria-label="Open in the Compendium"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
            </a>
            <button type="button" class="choose" @click="choose(previewing)">Choose {{ kindName }}</button>
          </header>
          <p v-if="previewing.payload?.tagline" class="tagline">{{ previewing.payload.tagline }}</p>
          <p v-if="previewing.summary.length" class="summary">
            <span v-for="p in previewing.summary" :key="p.label"><strong>{{ p.label }}</strong> {{ p.value }}</span>
          </p>
          <OptionFeatures :option="previewing" :levelled="isProfession" />
        </div>
      </div>
    </section>

    <section v-else-if="showList">
      <div v-if="pick" class="list-bar">
        <button type="button" class="link" @click="browsing = false">← Back to {{ pick.pageName }}</button>
      </div>
      <div v-if="step.cards" class="cards">
        <OptionCard
          v-for="o in options"
          :key="o.pageName"
          :option="o"
          :chosen="pick?.pageName === o.pageName"
          :tag="tagOf(o)"
          @open="previewing = $event"
        />
      </div>
      <ul v-else class="rows">
        <li v-for="o in options" :key="o.pageName">
          <button type="button" class="row" :class="{ 'row--chosen': pick?.pageName === o.pageName }" @click="previewing = o">
            <span class="row__name">{{ o.pageName }}</span>
            <span class="row__summary">{{ o.summary.map((p) => p.value).join(' · ') }}</span>
            <span v-if="tagOf(o)" class="row__tag">{{ tagOf(o) }}</span>
            <span v-if="pick?.pageName === o.pageName" class="row__check">✓</span>
          </button>
        </li>
      </ul>
    </section>

    <section v-else class="chosen">
      <header class="chosen__head">
        <div v-if="step.cards && chosen?.art" class="thumb"><img :src="chosen.art" alt="" /></div>
        <div class="chosen__title">
          <h2 class="head__name">{{ pick.pageName }}</h2>
          <p v-if="chosen?.payload?.tagline" class="tagline">{{ chosen.payload.tagline }}</p>
          <p v-if="chosen?.summary.length" class="summary">
            <span v-for="p in chosen.summary" :key="p.label"><strong>{{ p.label }}</strong> {{ p.value }}</span>
          </p>
          <p v-if="!chosen" class="missing">Not found in this game's compendium.</p>
        </div>
        <div class="chosen__actions">
          <a
            v-if="chosen"
            class="book"
            :href="compendiumUrl(chosen)"
            target="_blank"
            rel="noopener"
            @click.prevent="openCompendium(compendiumUrl(chosen))"
            title="Open in the Compendium"
            aria-label="Open in the Compendium"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
          </a>
          <button type="button" class="link" @click="browsing = true">Change</button>
          <button type="button" class="link" @click="remove">Remove</button>
        </div>
      </header>

      <div v-if="isProfession" class="level">
        <span class="section-title">Starting Level</span>
        <div class="stepper">
          <button type="button" :disabled="builder.draft.level <= 1" aria-label="Lower" @click="setLevel(builder.draft.level - 1)">−</button>
          <input type="number" min="1" :max="MAX_LEVEL" :value="builder.draft.level" @change="setLevel($event.target.value)" />
          <button type="button" :disabled="builder.draft.level >= MAX_LEVEL" aria-label="Raise" @click="setLevel(builder.draft.level + 1)">+</button>
        </div>
      </div>
      <HitPoints v-if="isProfession && chosen && builder.draft.level > 1" :profession="chosen" :path="pathOpen ? chosenPath : null" />

      <template v-if="chosen">
        <h3 class="section-title">Pending Choices</h3>
        <div class="pending">
          <PendingChoice
            v-for="(c, n) in choices.now"
            :key="c.key"
            :number="n + 1"
            :choice="c"
            :model-value="pick.choices[c.key] ?? ''"
            @update:model-value="setChoice(step.id, c.key, $event)"
          />
          <PendingChoice
            v-if="pathOpen"
            :number="choices.now.length + 1"
            :choice="pathChoice"
            :model-value="pathPick?.pageName ?? ''"
            @update:model-value="choosePath"
          />
          <PendingChoice
            v-for="(c, n) in pathChoices.now"
            :key="`path-${c.key}`"
            :number="choices.now.length + (pathOpen ? 1 : 0) + n + 1"
            :choice="c"
            :model-value="pathPick?.choices[c.key] ?? ''"
            @update:model-value="setChoice('path', c.key, $event)"
          />
          <p v-if="!choices.now.length && !pathOpen" class="clear">No choices remain.</p>
        </div>

        <template v-if="later.length">
          <h3 class="section-title">On Later Steps</h3>
          <ul class="later">
            <li v-for="(c, i) in later" :key="i">
              <span>{{ c.label }}</span>
              <span class="later__step">{{ laterStep(c.step) }}</span>
            </li>
          </ul>
        </template>

        <h3 class="section-title">Features</h3>
        <OptionFeatures :option="chosen" :level="level" :levelled="isProfession" />
        <template v-if="chosenPath && pathOpen">
          <h4 class="path-title">{{ chosenPath.pageName }}</h4>
          <OptionFeatures :option="chosenPath" :level="level" levelled />
        </template>
      </template>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.status { margin: 0; padding: 24px 12px; text-align: center; color: var(--ps-text-muted); }
.status--error { color: var(--ps-red); p { margin: 0 0 8px; } }

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

.list-bar { margin-bottom: 10px; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.rows { list-style: none; margin: 0; padding: 0; }

.row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
  padding: 8px 6px;
  border: none;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  color: var(--ps-text);

  &:hover { background: var(--ps-panel); }
  &--chosen { background: var(--ps-panel-alt); }
}

.row__name { font-weight: 700; color: var(--ps-heading); font-size: 13px; min-width: 120px; }
.row__summary { font-size: 11.5px; color: var(--ps-text-muted); flex: 1; }
.row__check { color: var(--ps-blue); font-weight: 800; }
.row__tag { @include ps-chip; }

.preview__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 10px;

  &--art { grid-template-columns: 200px 1fr; }
}

.preview__card { pointer-events: none; align-self: start; }

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.head__name { @include ps-heading(22px); margin: 0; }

.book {
  display: inline-flex;
  color: var(--ps-heading);
  opacity: 0.8;

  &:hover { opacity: 1; }
}

.choose {
  @include ps-button;
  margin-left: auto;
  padding: 6px 16px;
}

.tagline {
  margin: -2px 0 6px;
  font-size: 13px;
  font-style: italic;
  color: var(--ps-text);
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0 0 10px;
  font-size: 12px;

  strong { color: var(--ps-heading); }
}

.chosen__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--ps-line);
}

.thumb {
  flex: 0 0 72px;
  aspect-ratio: 3 / 4;
  border: 2px solid var(--ps-line);
  border-radius: 6px;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
}

.chosen__title { flex: 1; min-width: 0; .summary { margin: 4px 0 0; } .tagline { margin: 2px 0 0; } }
.chosen__actions { display: flex; align-items: center; gap: 12px; }

.missing { margin: 4px 0 0; color: var(--ps-red); font-size: 12px; }

.section-title {
  @include ps-heading(15px);
  display: block;
  margin: 14px 0 4px;
}

.path-title { @include ps-heading(13px); margin: 10px 0 2px; color: var(--ps-heading-soft); }

.level { display: flex; align-items: center; gap: 12px; .section-title { margin: 14px 0 0; } }

.stepper {
  display: inline-flex;
  align-items: center;
  margin-top: 12px;
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

.clear { margin: 6px 4px; font-size: 12px; color: var(--ps-text-muted); }

.later {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 4px;
    font-size: 12px;
    border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);
  }
}

.later__step { @include ps-chip; margin-left: auto; }

@media (max-width: 560px) {
  .preview__body--art { grid-template-columns: 1fr; }
  .preview__card { max-width: 200px; }
  .chosen__head { flex-wrap: wrap; }
}
</style>
