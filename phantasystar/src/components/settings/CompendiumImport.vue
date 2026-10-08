<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { initValues, dispatchRef } from '@/relay/relay.js'
import { NPC, CREATURE, NPC_SHIP } from '@/sheetTypes.js'
import { parseEntry, previewEntry, mapEntry } from '@/compendium/mapEntry.js'
import { fetchEntry, pageLabel } from '@/compendium/fetchEntry.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'

const app = useAppStore()
const meta = useMetaStore()
const npc = useNpcStore()
const npcShip = useNpcShipStore()

const text = ref('')
const kind = ref('')
const done = ref('')

const fetching = ref(false)
const fetchError = ref('')
const matches = ref([])

const parsed = computed(() => (text.value.trim() ? parseEntry(text.value) : null))

const preview = computed(() => {
  if (!parsed.value?.ok) return null
  return previewEntry(parsed.value.entry, kind.value || undefined)
})

const PENDING_LABELS = {
  specialActions: 'Special Actions',
  legendaryActions: 'Legendary Actions',
  bossActions: 'Boss Actions',
  techniques: 'Techniques',
  techniqueLinks: 'Technique links',
}
const pendingRows = computed(() =>
  Object.entries(preview.value?.pending ?? {}).map(([key, n]) => `${PENDING_LABELS[key] ?? key}: ${n}`),
)

const chosenKind = computed(() => kind.value || preview.value?.kind || CREATURE)

const pendingDrop = computed(() => initValues.compendiumDrop)

const choose = (page) => {
  text.value = JSON.stringify(page, null, 2)
  kind.value = ''
  done.value = ''
}

const fetchDrop = async () => {
  if (!pendingDrop.value || fetching.value) return
  fetching.value = true
  fetchError.value = ''
  matches.value = []
  const result = await fetchEntry(dispatchRef.value, pendingDrop.value)
  fetching.value = false
  if (!result.ok) {
    fetchError.value = result.error
    return
  }
  matches.value = result.pages
  choose(result.pages[0])
}

onMounted(() => {
  if (pendingDrop.value) fetchDrop()
})

const apply = () => {
  if (!parsed.value?.ok) return
  const mapped = mapEntry(parsed.value.entry, chosenKind.value)
  if (mapped.error) return

  if (mapped.name) meta.name = mapped.name

  app.setSheetType(NPC)
  app.setNpcMode(chosenKind.value === 'ship' ? NPC_SHIP : CREATURE)
  ;(chosenKind.value === 'ship' ? npcShip : npc).importEntry(mapped)

  done.value = `Imported ${mapped.name || 'the entry'} as ${chosenKind.value === 'ship' ? 'a ship' : 'a creature'}.`
  text.value = ''
  kind.value = ''
}
</script>

<template>
  <SheetPanel title="Stat Block Import">
    <p class="hint">
      Convert JSON data pasted below into a stat block. Does not overwrite existing features.
    </p>

    <div v-if="pendingDrop" class="drop">
      <p>
        A compendium drop arrived:
        <strong>{{ pendingDrop.pageName }}</strong>
        <span v-if="pendingDrop.categoryName"> &middot; {{ pendingDrop.categoryName }}</span>.
        <template v-if="fetching">Fetching it&hellip;</template>
        <template v-else-if="fetchError">{{ fetchError }}</template>
        <template v-else-if="matches.length">
          Fetched &mdash; check it below, then Import.
        </template>
      </p>

      <div v-if="matches.length > 1" class="matches">
        <span>{{ matches.length }} versions:</span>
        <button v-for="page in matches" :key="page.id" type="button" @click="choose(page)">
          {{ pageLabel(page) }}
        </button>
      </div>

      <button v-if="!fetching" type="button" class="refetch" @click="fetchDrop">
        {{ fetchError ? 'Try again' : 'Fetch again' }}
      </button>
    </div>

    <textarea v-model="text" rows="4" spellcheck="false" />

    <p v-if="parsed && !parsed.ok" class="bad">{{ parsed.error }}</p>
    <p v-if="preview?.error" class="bad">{{ preview.error }}</p>

    <template v-if="preview && !preview.error">
      <div v-if="preview.fixed" class="kind">
        <em class="guessed">Compendium page &middot; {{ preview.kind === 'ship' ? 'NPC ship' : 'creature' }}.</em>
      </div>
      <div v-else class="kind">
        <span>Import as</span>
        <label>
          <input v-model="kind" type="radio" value="creature" />
          <small>Creature</small>
        </label>
        <label>
          <input v-model="kind" type="radio" value="ship" />
          <small>Ship</small>
        </label>
        <em v-if="preview.guessed" class="guessed">
          Nothing in the entry says which &mdash; pick one.
        </em>
        <em v-else class="guessed">Read as a {{ preview.kind }}.</em>
      </div>

      <dl class="rows">
        <template v-if="preview.name"><dt>name</dt><dd>{{ preview.name }}</dd></template>
        <template v-for="row in preview.rows" :key="row.field">
          <dt>{{ row.field }}</dt><dd>{{ row.value }}</dd>
        </template>
      </dl>

      <p class="counts">
        Skills: {{ preview.counts.skills }}<template v-if="preview.kind === 'ship'"> &middot; Saves: {{ preview.counts.saves }}</template>
        &middot; Traits: {{ preview.counts.traits }} &middot; Actions: {{ preview.counts.actions }}
        &middot; Reactions: {{ preview.counts.reactions }}<template v-if="preview.counts.specialActions"> &middot; Special Actions: {{ preview.counts.specialActions }}</template><template v-if="preview.counts.legendary"> &middot; Legendary Actions: {{ preview.counts.legendary }}</template><template v-if="preview.counts.boss"> &middot; Boss Actions: {{ preview.counts.boss }}</template><template v-if="preview.counts.techniques"> &middot; Techniques: {{ preview.counts.techniques }}</template>
        &mdash; added to whatever is already there.
      </p>

      <p v-if="pendingRows.length" class="counts">
        Not on the stat block yet, so not imported: {{ pendingRows.join(' · ') }}.
      </p>

      <ul v-if="preview.warnings?.length" class="warnings">
        <li v-for="(w, i) in preview.warnings" :key="i">{{ w }}</li>
      </ul>

      <button type="button" class="go" @click="apply">Import</button>
    </template>

    <p v-if="done" class="done">{{ done }}</p>
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.hint { margin: 0 0 6px; font-size: 10px; color: var(--ps-text-muted); line-height: 1.5; }

textarea {
  @include ps-well;
  width: 100%;
  font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
  font-size: 10.5px;
  line-height: 1.45;
  padding: 4px 5px;
  resize: vertical;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.drop {
  margin: 0 0 6px;
  padding: 5px 7px;

  p { margin: 0; }
  background: var(--ps-gold-light);
  border: 1px solid var(--ps-gold-dark);
  border-radius: var(--ps-radius-sm);
  color: var(--ps-on-gold-fill, var(--ps-text));
  font-size: 10px;
  line-height: 1.5;

  code { font-family: ui-monospace, Consolas, monospace; text-transform: none; }
}

.bad { margin: 5px 0 0; font-size: 10.5px; color: var(--ps-red); line-height: 1.5; }

.matches {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 4px;

  span { @include ps-caption; font-size: 9px; }
}

.matches button, .refetch {
  @include ps-caption;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 1px 7px;
  font-size: 9px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.refetch { margin-top: 5px; }

.kind {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  @include ps-caption;

  label { display: flex; align-items: center; gap: 3px; cursor: pointer; }
  input { @include ps-pip-radio; }
  small { font-size: 10px; }
  .guessed {
    @include ps-caption;
    font-style: normal;
    text-transform: none;
    letter-spacing: 0;
    color: var(--ps-text-muted);
    font-size: 9.5px;
  }
}

.rows {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1px 10px;
  margin: 6px 0 0;
  font-size: 10.5px;
  max-height: 180px;
  overflow-y: auto;

  dt { @include ps-caption; font-size: 9px; }
  dd { margin: 0; word-break: break-word; }
}

.counts { margin: 6px 0 0; font-size: 10px; color: var(--ps-text-muted); }

.warnings {
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 10px;
  line-height: 1.45;
  color: var(--ps-red);
}

.go {
  @include ps-heading(12px);
  margin-top: 7px;
  background: var(--ps-fill);
  border: 1px solid var(--ps-line);
  border-radius: var(--ps-radius-sm);
  color: var(--ps-on-fill);
  padding: 3px 14px;
  cursor: pointer;

  &:hover { background: var(--ps-fill); }
}

.done { margin: 6px 0 0; font-size: 10.5px; color: var(--ps-heading); font-weight: 700; }
</style>
