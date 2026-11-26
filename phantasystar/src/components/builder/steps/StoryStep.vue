<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { dispatchRef } from '@/relay/relay.js'
import { fetchEntry } from '@/compendium/fetchEntry.js'
import { compendiumUrl } from '@/builder/catalog.js'
import { STORY_BONDS_PAGE, storyBondRows, addBond, bondLine } from '@/builder/storyBonds.js'
import { openCompendium } from '@/utility/openCompendium.js'
import getRollResult from '@/utility/getRollResult.js'
import postToChat from '@/utility/postToChat.js'
import D20Icon from '@/components/shared/D20Icon.vue'

const builder = useBuilderStore()
const meta = useMetaStore()
const story = computed(() => builder.draft.story)

const FIELDS = [
  { key: 'history', label: 'History', rows: 5 },
  { key: 'appearance', label: 'Appearance', rows: 3 },
]

const expansionId = computed(() => builder.draft.profession?.expansionId || builder.draft.species?.expansionId || '')
const pageUrl = computed(() => compendiumUrl({ ...STORY_BONDS_PAGE, expansionId: expansionId.value }))

const rows = ref([])
onMounted(async () => {
  try {
    const fetched = await fetchEntry(dispatchRef.value, { ...STORY_BONDS_PAGE, expansionId: expansionId.value })
    rows.value = fetched.ok ? storyBondRows(fetched.pages[0]?.content) : []
  } catch {
    rows.value = []
  }
})

const showTable = ref(false)
const rolled = ref(null)

const has = (row) => String(story.value.storyBonds ?? '').split('\n')
  .some((l) => l.trim() === bondLine(row) || l.trim().startsWith(`${row.bond}:`))
const take = (row) => {
  story.value.storyBonds = addBond(story.value.storyBonds, row)
}

const rolling = ref(false)
const rollError = ref('')

const roll = async () => {
  if (rolling.value || !rows.value.length) return
  rolling.value = true
  rollError.value = ''
  try {
    const result = await getRollResult([{ key: 'bond', count: 1, sides: 20 }])
    const face = result.bond?.faces?.[0]
    const row = rows.value.find((r) => r.roll === face)
    if (!row) return
    rolled.value = row.roll
    showTable.value = true
    take(row)
    await postToChat('chat', {
      characterName: builder.draft.concept.name || meta.name || 'New Character',
      title: 'Story Bond',
      subtitle: `d20: ${face}`,
      keyValues: { Bond: row.bond },
    })
  } catch (error) {
    rollError.value = `The roll failed: ${error?.message ?? error}`
  } finally {
    rolling.value = false
  }
}
</script>

<template>
  <div class="fields">
    <div class="field">
      <label for="story-bonds" class="field__label">Story Bonds</label>
      <div v-if="rows.length" class="bonds-tools">
        <button type="button" class="toggle" :aria-expanded="showTable" @click="showTable = !showTable">
          {{ showTable ? 'Hide' : 'Show' }} Story Bonds Table
        </button>
        <button type="button" class="roll" :disabled="rolling" @click="roll">
          <D20Icon class="roll__die" /> {{ rolling ? 'Rolling…' : 'Roll d20' }}
        </button>
        <a
          class="book"
          :href="pageUrl"
          target="_blank"
          rel="noopener"
          title="Story Bonds"
          aria-label="Open Story Bonds in the Compendium"
          @click.prevent="openCompendium(pageUrl)"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
        </a>
        <span v-if="rollError" class="error">{{ rollError }}</span>
      </div>

      <table v-if="showTable && rows.length" class="bonds">
        <thead>
          <tr><th class="bonds__roll">d20</th><th>Bond</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="r in rows"
            :key="r.roll"
            class="bonds__row"
            :class="{ 'bonds__row--rolled': r.roll === rolled, 'bonds__row--taken': has(r) }"
            tabindex="0"
            role="button"
            :aria-pressed="has(r)"
            @click="take(r)"
            @keydown.enter.prevent="take(r)"
            @keydown.space.prevent="take(r)"
          >
            <td class="bonds__roll">{{ r.roll }}</td>
            <td class="bonds__bond">{{ r.bond }}</td>
            <td>{{ r.text }}</td>
          </tr>
        </tbody>
      </table>

      <textarea id="story-bonds" v-model="story.storyBonds" class="field__input" rows="2" />
    </div>

    <label v-for="f in FIELDS" :key="f.key" class="field">
      <span class="field__label">{{ f.label }}</span>
      <textarea v-model="story[f.key]" class="field__input" :rows="f.rows" />
    </label>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.fields { display: flex; flex-direction: column; gap: 10px; }

.field { display: flex; flex-direction: column; gap: 3px; }

.field__label { @include ps-caption; }

.field__input {
  @include ps-well;
  text-align: left;
  padding: 6px 8px;
  font-size: 12px;
  resize: vertical;
}

.bonds-tools {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 2px 0 4px;
}

.toggle {
  @include ps-button(var(--ps-panel), var(--ps-panel-alt));
  color: var(--ps-heading);
  padding: 4px 12px;
}

.roll {
  @include ps-button;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;

  &:disabled { opacity: 0.6; cursor: default; }
  &__die { font-size: 14px; }
}

.book {
  display: inline-flex;
  color: var(--ps-heading);
  opacity: 0.8;

  &:hover { opacity: 1; }
}

.error { font-size: 11px; color: var(--ps-red); }

.bonds {
  width: 100%;
  border-collapse: collapse;
  margin: 2px 0 6px;
  font-size: 12px;

  th {
    @include ps-caption;
    text-align: left;
    padding: 4px 6px;
    border-bottom: 2px solid var(--ps-line);
  }

  td {
    padding: 4px 6px;
    border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
    color: var(--ps-text);
    vertical-align: top;
  }

  th.bonds__roll, td.bonds__roll { width: 36px; text-align: center; font-weight: 700; }
  td.bonds__bond { font-weight: 700; color: var(--ps-heading); white-space: nowrap; }

  &__row {
    cursor: pointer;

    &:hover td { background: var(--ps-panel-alt); }
    &:focus-visible { outline: 2px solid var(--ps-blue); outline-offset: -2px; }

    &--taken td { background: var(--ps-row-open, var(--ps-panel-alt)); }
    &--taken td.bonds__roll { color: var(--ps-blue); }
    &--rolled td { box-shadow: inset 0 2px 0 var(--ps-blue), inset 0 -2px 0 var(--ps-blue); }
  }
}
</style>
